"""
Proper GYM — Local Backend & Sync Reconciliation Server
Built for zero-dependency execution with Python 3.13 standard library.
"""

import http.server
import socketserver
import json
import sqlite3
import os
import sys
import time
import urllib.parse
from datetime import datetime

PORT = 8080
DB_FILE = os.path.join(os.path.dirname(__file__), "proper_gym.db")
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "public")


def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Enable WAL mode for high concurrency
    cursor.execute("PRAGMA journal_mode=WAL;")
    
    # Tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        fitness_level TEXT DEFAULT 'intermediate',
        preferred_unit TEXT DEFAULT 'metric_kg',
        default_rest_seconds INTEGER DEFAULT 90,
        updated_at INTEGER NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        equipment TEXT NOT NULL,
        primary_muscle TEXT NOT NULL,
        secondary_muscles TEXT,
        is_compound INTEGER DEFAULT 0,
        is_custom INTEGER DEFAULT 0
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        notes TEXT,
        target_frequency INTEGER DEFAULT 7,
        version INTEGER DEFAULT 1,
        is_deleted INTEGER DEFAULT 0,
        updated_at INTEGER NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS routine_exercises (
        id TEXT PRIMARY KEY,
        routine_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        target_sets INTEGER NOT NULL,
        target_reps_min INTEGER NOT NULL,
        target_reps_max INTEGER NOT NULL,
        target_rpe REAL,
        rest_timer_seconds INTEGER DEFAULT 90
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        routine_id TEXT,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'completed',
        started_at INTEGER NOT NULL,
        completed_at INTEGER,
        duration_seconds INTEGER,
        total_volume_kg REAL DEFAULT 0.0,
        notes TEXT,
        is_deleted INTEGER DEFAULT 0,
        updated_at INTEGER NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workout_sets (
        id TEXT PRIMARY KEY,
        workout_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        set_index INTEGER NOT NULL,
        set_type TEXT DEFAULT 'normal',
        weight_kg REAL NOT NULL,
        reps INTEGER NOT NULL,
        rpe REAL,
        rir INTEGER,
        is_completed INTEGER DEFAULT 1,
        rest_seconds_actual INTEGER,
        completed_at INTEGER NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS personal_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        workout_set_id TEXT NOT NULL,
        record_type TEXT NOT NULL,
        value REAL NOT NULL,
        achieved_at INTEGER NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_metrics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        logged_at TEXT NOT NULL,
        bodyweight_kg REAL,
        body_fat_percentage REAL,
        notes TEXT,
        updated_at INTEGER NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sync_audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_mutation_id TEXT UNIQUE,
        entity_name TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        applied_at INTEGER NOT NULL
    );
    """)

    conn.commit()

    # Seed Default User
    cursor.execute("SELECT COUNT(*) FROM users WHERE id = 'user_default'")
    if cursor.fetchone()[0] == 0:
        now = int(time.time() * 1000)
        cursor.execute("""
        INSERT INTO users (id, email, display_name, fitness_level, preferred_unit, default_rest_seconds, updated_at)
        VALUES ('user_default', 'athlete@propergym.app', 'Alex Rivera', 'intermediate', 'metric_kg', 90, ?)
        """, (now,))

    # Seed Exercises if empty
    cursor.execute("SELECT COUNT(*) FROM exercises")
    if cursor.fetchone()[0] == 0:
        seed_exercises(cursor)

    # Seed Default Routines if empty
    cursor.execute("SELECT COUNT(*) FROM routines")
    if cursor.fetchone()[0] == 0:
        seed_routines(cursor)

    conn.commit()
    conn.close()


def seed_exercises(cursor):
    exercises = [
        # Chest
        ("ex_bench_press", "Barbell Bench Press", "barbell", "Chest", '["Triceps", "Front Delts"]', 1),
        ("ex_incline_db_press", "Incline Dumbbell Press", "dumbbell", "Chest", '["Triceps", "Front Delts"]', 1),
        ("ex_cable_fly", "Cable Chest Fly", "cable", "Chest", '[]', 0),
        ("ex_dips", "Chest Dips", "bodyweight", "Chest", '["Triceps"]', 1),
        ("ex_pushup", "Push-ups", "bodyweight", "Chest", '["Triceps", "Core"]', 1),
        # Back
        ("ex_deadlift", "Barbell Deadlift", "barbell", "Back", '["Hamstrings", "Glutes", "Forearms"]', 1),
        ("ex_barbell_row", "Bent-Over Barbell Row", "barbell", "Back", '["Biceps", "Rear Delts"]', 1),
        ("ex_pullup", "Pull-up", "bodyweight", "Back", '["Biceps"]', 1),
        ("ex_lat_pulldown", "Lat Pulldown", "cable", "Back", '["Biceps"]', 1),
        ("ex_seated_cable_row", "Seated Cable Row", "cable", "Back", '["Biceps", "Rear Delts"]', 1),
        ("ex_chest_supported_row", "Chest-Supported Dumbbell Row", "dumbbell", "Back", '["Rear Delts"]', 0),
        # Shoulders
        ("ex_overhead_press", "Overhead Barbell Press", "barbell", "Shoulders", '["Triceps", "Upper Chest"]', 1),
        ("ex_lateral_raise", "Dumbbell Lateral Raise", "dumbbell", "Shoulders", '[]', 0),
        ("ex_cable_lateral_raise", "Cable Lateral Raise", "cable", "Shoulders", '[]', 0),
        ("ex_face_pull", "Cable Face Pull", "cable", "Shoulders", '["Upper Traps"]', 0),
        # Legs
        ("ex_squat", "Barbell Back Squat", "barbell", "Quads", '["Glutes", "Hamstrings", "Core"]', 1),
        ("ex_front_squat", "Barbell Front Squat", "barbell", "Quads", '["Upper Back", "Core"]', 1),
        ("ex_leg_press", "Leg Press", "machine", "Quads", '["Glutes"]', 1),
        ("ex_romanian_deadlift", "Romanian Deadlift (RDL)", "barbell", "Hamstrings", '["Glutes", "Lower Back"]', 1),
        ("ex_leg_curl", "Lying Leg Curl", "machine", "Hamstrings", '[]', 0),
        ("ex_leg_extension", "Leg Extension", "machine", "Quads", '[]', 0),
        ("ex_standing_calf_raise", "Standing Calf Raise", "machine", "Calves", '[]', 0),
        ("ex_bulgarian_split_squat", "Bulgarian Split Squat", "dumbbell", "Quads", '["Glutes"]', 1),
        # Arms
        ("ex_barbell_curl", "Barbell Bicep Curl", "barbell", "Biceps", '["Forearms"]', 0),
        ("ex_incline_db_curl", "Incline Dumbbell Curl", "dumbbell", "Biceps", '[]', 0),
        ("ex_hammer_curl", "Dumbbell Hammer Curl", "dumbbell", "Biceps", '["Brachialis", "Forearms"]', 0),
        ("ex_tricep_rope_pushdown", "Tricep Rope Pushdown", "cable", "Triceps", '[]', 0),
        ("ex_skull_crusher", "Barbell Skull Crusher", "barbell", "Triceps", '[]', 0),
        ("ex_overhead_cable_tricep", "Overhead Cable Tricep Extension", "cable", "Triceps", '[]', 0),
        # Core
        ("ex_hanging_leg_raise", "Hanging Leg Raise", "bodyweight", "Core", '["Hip Flexors"]', 0),
        ("ex_cable_woodchopper", "Cable Woodchopper", "cable", "Core", '["Obliques"]', 0),
        ("ex_plank", "Plank", "bodyweight", "Core", '[]', 0)
    ]
    for ex in exercises:
        cursor.execute("""
        INSERT INTO exercises (id, name, equipment, primary_muscle, secondary_muscles, is_compound, is_custom)
        VALUES (?, ?, ?, ?, ?, ?, 0)
        """, ex)


def seed_routines(cursor):
    now = int(time.time() * 1000)
    
    # 1. Push / Pull / Legs (PPL) - Push Day
    cursor.execute("""
    INSERT INTO routines (id, user_id, title, notes, target_frequency, version, updated_at)
    VALUES ('rot_ppl_push', 'user_default', 'PPL: Push Hypertrophy', 'Focus on progressive overload on Barbell Bench and Incline DB.', 7, 1, ?)
    """, (now,))

    push_exercises = [
        ("rot_ex_1", "rot_ppl_push", "ex_bench_press", 1, 3, 6, 8, 8.0, 180),
        ("rot_ex_2", "rot_ppl_push", "ex_incline_db_press", 2, 3, 8, 10, 8.5, 120),
        ("rot_ex_3", "rot_ppl_push", "ex_overhead_press", 3, 3, 8, 10, 8.0, 120),
        ("rot_ex_4", "rot_ppl_push", "ex_lateral_raise", 4, 4, 12, 15, 9.0, 60),
        ("rot_ex_5", "rot_ppl_push", "ex_tricep_rope_pushdown", 5, 3, 10, 12, 9.0, 60)
    ]
    for re in push_exercises:
        cursor.execute("""
        INSERT INTO routine_exercises (id, routine_id, exercise_id, order_index, target_sets, target_reps_min, target_reps_max, target_rpe, rest_timer_seconds)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, re)

    # 2. Upper / Lower - Upper Day
    cursor.execute("""
    INSERT INTO routines (id, user_id, title, notes, target_frequency, version, updated_at)
    VALUES ('rot_upper_power', 'user_default', 'Upper Body Power', 'Heavy compound upper body session.', 7, 1, ?)
    """, (now,))

    upper_exercises = [
        ("rot_ex_6", "rot_upper_power", "ex_bench_press", 1, 4, 4, 6, 8.5, 180),
        ("rot_ex_7", "rot_upper_power", "ex_barbell_row", 2, 4, 6, 8, 8.0, 180),
        ("rot_ex_8", "rot_upper_power", "ex_overhead_press", 3, 3, 6, 8, 8.5, 120),
        ("rot_ex_9", "rot_upper_power", "ex_pullup", 4, 3, 8, 10, 9.0, 120),
        ("rot_ex_10", "rot_upper_power", "ex_barbell_curl", 5, 3, 10, 12, 8.5, 60)
    ]
    for ue in upper_exercises:
        cursor.execute("""
        INSERT INTO routine_exercises (id, routine_id, exercise_id, order_index, target_sets, target_reps_min, target_reps_max, target_rpe, rest_timer_seconds)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ue)

    # Seed an initial sample workout history for realistic ghosting and PR demonstration
    cursor.execute("""
    INSERT INTO workouts (id, user_id, routine_id, title, status, started_at, completed_at, duration_seconds, total_volume_kg, notes, updated_at)
    VALUES ('w_demo_1', 'user_default', 'rot_ppl_push', 'PPL: Push Hypertrophy', 'completed', ?, ?, 3420, 4850.0, 'Felt very explosive on bench. Set 3 was smooth.', ?)
    """, (now - 86400 * 3 * 1000, now - 86400 * 3 * 1000 + 3420 * 1000, now - 86400 * 3 * 1000))

    demo_sets = [
        ("ws_1", "w_demo_1", "ex_bench_press", 1, "warmup", 60.0, 10, 6.0, 0, 1, 90, now - 86400 * 3 * 1000 + 300 * 1000),
        ("ws_2", "w_demo_1", "ex_bench_press", 2, "normal", 100.0, 8, 7.5, 2, 1, 180, now - 86400 * 3 * 1000 + 600 * 1000),
        ("ws_3", "w_demo_1", "ex_bench_press", 3, "normal", 100.0, 8, 8.0, 2, 1, 180, now - 86400 * 3 * 1000 + 900 * 1000),
        ("ws_4", "w_demo_1", "ex_bench_press", 4, "normal", 100.0, 7, 9.0, 1, 1, 180, now - 86400 * 3 * 1000 + 1200 * 1000),
        ("ws_5", "w_demo_1", "ex_incline_db_press", 1, "normal", 34.0, 10, 8.0, 2, 1, 120, now - 86400 * 3 * 1000 + 1500 * 1000),
        ("ws_6", "w_demo_1", "ex_incline_db_press", 2, "normal", 34.0, 9, 8.5, 1, 1, 120, now - 86400 * 3 * 1000 + 1800 * 1000),
        ("ws_7", "w_demo_1", "ex_lateral_raise", 1, "normal", 12.0, 15, 8.5, 1, 1, 60, now - 86400 * 3 * 1000 + 2200 * 1000),
        ("ws_8", "w_demo_1", "ex_lateral_raise", 2, "normal", 12.0, 14, 9.0, 1, 1, 60, now - 86400 * 3 * 1000 + 2400 * 1000)
    ]
    for ds in demo_sets:
        cursor.execute("""
        INSERT INTO workout_sets (id, workout_id, exercise_id, set_index, set_type, weight_kg, reps, rpe, rir, is_completed, rest_seconds_actual, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ds)

    # Seed PR for bench press
    cursor.execute("""
    INSERT INTO personal_records (id, user_id, exercise_id, workout_set_id, record_type, value, achieved_at)
    VALUES ('pr_1', 'user_default', 'ex_bench_press', 'ws_3', 'e1rm', 124.0, ?)
    """, (now - 86400 * 3 * 1000,))


class ProperGymRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path.startswith("/api/"):
            self.handle_api_get(path, query)
        else:
            # Fallback to single page app
            file_path = os.path.join(PUBLIC_DIR, path.lstrip("/"))
            if not os.path.exists(file_path) or os.path.isdir(file_path):
                self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            body = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
            self.handle_api_post(path, body)
        else:
            self.send_error(404, "Endpoint Not Found")

    def send_json(self, data, status_code=200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def handle_api_get(self, path, query):
        conn = get_db()
        cursor = conn.cursor()

        try:
            if path == "/api/exercises":
                cursor.execute("SELECT * FROM exercises ORDER BY primary_muscle, name")
                rows = [dict(r) for r in cursor.fetchall()]
                for r in rows:
                    if r["secondary_muscles"]:
                        try:
                            r["secondary_muscles"] = json.loads(r["secondary_muscles"])
                        except:
                            r["secondary_muscles"] = []
                self.send_json(rows)

            elif path == "/api/routines":
                cursor.execute("SELECT * FROM routines WHERE is_deleted = 0 ORDER BY updated_at DESC")
                routines = [dict(r) for r in cursor.fetchall()]
                for routine in routines:
                    cursor.execute("""
                    SELECT re.*, e.name as exercise_name, e.equipment, e.primary_muscle, e.is_compound
                    FROM routine_exercises re
                    JOIN exercises e ON re.exercise_id = e.id
                    WHERE re.routine_id = ?
                    ORDER BY re.order_index ASC
                    """, (routine["id"],))
                    routine["exercises"] = [dict(r) for r in cursor.fetchall()]
                self.send_json(routines)

            elif path == "/api/workouts":
                cursor.execute("SELECT * FROM workouts WHERE is_deleted = 0 ORDER BY started_at DESC LIMIT 30")
                workouts = [dict(r) for r in cursor.fetchall()]
                for w in workouts:
                    cursor.execute("""
                    SELECT ws.*, e.name as exercise_name, e.primary_muscle, e.equipment
                    FROM workout_sets ws
                    JOIN exercises e ON ws.exercise_id = e.id
                    WHERE ws.workout_id = ?
                    ORDER BY ws.exercise_id, ws.set_index ASC
                    """, (w["id"],))
                    w["sets"] = [dict(r) for r in cursor.fetchall()]
                self.send_json(workouts)

            elif path == "/api/personal-records":
                cursor.execute("""
                SELECT pr.*, e.name as exercise_name
                FROM personal_records pr
                JOIN exercises e ON pr.exercise_id = e.id
                ORDER BY pr.achieved_at DESC
                """)
                self.send_json([dict(r) for r in cursor.fetchall()])

            elif path == "/api/metrics":
                cursor.execute("SELECT * FROM user_metrics ORDER BY logged_at DESC LIMIT 30")
                self.send_json([dict(r) for r in cursor.fetchall()])

            elif path == "/api/sync/pull":
                since = int(query.get("since", [0])[0])
                cursor.execute("SELECT * FROM workouts WHERE updated_at > ?", (since,))
                workouts = [dict(r) for r in cursor.fetchall()]
                for w in workouts:
                    cursor.execute("SELECT * FROM workout_sets WHERE workout_id = ?", (w["id"],))
                    w["sets"] = [dict(r) for r in cursor.fetchall()]

                cursor.execute("SELECT * FROM routines WHERE updated_at > ?", (since,))
                routines = [dict(r) for r in cursor.fetchall()]

                server_ts = int(time.time() * 1000)
                self.send_json({
                    "server_timestamp": server_ts,
                    "workouts": workouts,
                    "routines": routines
                })
            else:
                self.send_error(404, "API endpoint not found")
        finally:
            conn.close()

    def handle_api_post(self, path, body):
        conn = get_db()
        cursor = conn.cursor()

        try:
            if path == "/api/workouts":
                # Save a full workout payload
                now = int(time.time() * 1000)
                w_id = body.get("id") or f"w_{now}"
                user_id = body.get("user_id", "user_default")
                routine_id = body.get("routine_id")
                title = body.get("title", "Workout")
                status = body.get("status", "completed")
                started_at = body.get("started_at", now)
                completed_at = body.get("completed_at", now)
                duration_seconds = body.get("duration_seconds", 0)
                total_volume_kg = body.get("total_volume_kg", 0.0)
                notes = body.get("notes", "")

                cursor.execute("""
                INSERT OR REPLACE INTO workouts (id, user_id, routine_id, title, status, started_at, completed_at, duration_seconds, total_volume_kg, notes, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (w_id, user_id, routine_id, title, status, started_at, completed_at, duration_seconds, total_volume_kg, notes, now))

                # Delete existing sets for this workout in case of update
                cursor.execute("DELETE FROM workout_sets WHERE workout_id = ?", (w_id,))

                sets = body.get("sets", [])
                for s in sets:
                    s_id = s.get("id") or f"ws_{int(time.time()*1000)}_{s.get('set_index')}"
                    cursor.execute("""
                    INSERT INTO workout_sets (id, workout_id, exercise_id, set_index, set_type, weight_kg, reps, rpe, rir, is_completed, rest_seconds_actual, completed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (s_id, w_id, s["exercise_id"], s["set_index"], s.get("set_type", "normal"),
                          s["weight_kg"], s["reps"], s.get("rpe"), s.get("rir"),
                          1 if s.get("is_completed", True) else 0, s.get("rest_seconds_actual"),
                          s.get("completed_at", now)))

                # PR Checking
                for s in sets:
                    if s.get("is_completed", True) and s.get("reps", 0) > 0 and s.get("weight_kg", 0) > 0:
                        weight = float(s["weight_kg"])
                        reps = int(s["reps"])
                        # Epley e1RM
                        e1rm = weight * (1.0 + reps / 30.0) if reps > 1 else weight
                        cursor.execute("""
                        SELECT value FROM personal_records WHERE user_id = ? AND exercise_id = ? AND record_type = 'e1rm'
                        """, (user_id, s["exercise_id"]))
                        existing = cursor.fetchone()
                        if not existing or e1rm > existing[0]:
                            cursor.execute("""
                            INSERT OR REPLACE INTO personal_records (id, user_id, exercise_id, workout_set_id, record_type, value, achieved_at)
                            VALUES (?, ?, ?, ?, 'e1rm', ?, ?)
                            """, (f"pr_{s['exercise_id']}_e1rm", user_id, s["exercise_id"], s.get("id", "ws_pr"), round(e1rm, 1), now))

                conn.commit()
                self.send_json({"status": "ok", "workout_id": w_id, "server_timestamp": now})

            elif path == "/api/sync/push":
                # Offline-first mutation queue reconciliation
                mutations = body.get("mutations", [])
                ack_ids = []
                server_now = int(time.time() * 1000)

                for mut in mutations:
                    m_id = mut.get("mutation_id")
                    entity = mut.get("entity_name")
                    op = mut.get("operation")
                    payload = mut.get("payload")
                    if isinstance(payload, str):
                        payload = json.loads(payload)

                    # Deduplicate via audit log
                    cursor.execute("SELECT COUNT(*) FROM sync_audit_log WHERE client_mutation_id = ?", (m_id,))
                    if cursor.fetchone()[0] > 0:
                        ack_ids.append(m_id)
                        continue

                    # Apply mutation atomically
                    if entity == "workout_sets":
                        if op in ("INSERT", "UPDATE"):
                            cursor.execute("""
                            INSERT OR REPLACE INTO workout_sets (id, workout_id, exercise_id, set_index, set_type, weight_kg, reps, rpe, rir, is_completed, completed_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (payload["id"], payload["workout_id"], payload["exercise_id"], payload["set_index"],
                                  payload.get("set_type", "normal"), payload["weight_kg"], payload["reps"],
                                  payload.get("rpe"), payload.get("rir"), 1 if payload.get("is_completed", True) else 0,
                                  payload.get("completed_at", server_now)))
                        elif op == "DELETE":
                            cursor.execute("DELETE FROM workout_sets WHERE id = ?", (payload["id"],))

                    elif entity == "workouts":
                        if op in ("INSERT", "UPDATE"):
                            cursor.execute("""
                            INSERT OR REPLACE INTO workouts (id, user_id, routine_id, title, status, started_at, completed_at, duration_seconds, total_volume_kg, notes, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (payload["id"], payload.get("user_id", "user_default"), payload.get("routine_id"),
                                  payload["title"], payload.get("status", "completed"), payload["started_at"],
                                  payload.get("completed_at"), payload.get("duration_seconds", 0),
                                  payload.get("total_volume_kg", 0.0), payload.get("notes", ""), server_now))
                        elif op == "DELETE":
                            cursor.execute("UPDATE workouts SET is_deleted = 1, updated_at = ? WHERE id = ?", (server_now, payload["id"]))

                    # Record in audit log
                    cursor.execute("""
                    INSERT INTO sync_audit_log (client_mutation_id, entity_name, entity_id, operation, applied_at)
                    VALUES (?, ?, ?, ?, ?)
                    """, (m_id, entity, payload.get("id", "unknown"), op, server_now))

                    ack_ids.append(m_id)

                conn.commit()
                self.send_json({
                    "status": "ok",
                    "ack_mutation_ids": ack_ids,
                    "server_timestamp": server_now
                })

            elif path == "/api/routines":
                now = int(time.time() * 1000)
                r_id = body.get("id") or f"rot_{now}"
                user_id = body.get("user_id", "user_default")
                title = body.get("title", "New Routine")
                notes = body.get("notes", "")

                cursor.execute("""
                INSERT OR REPLACE INTO routines (id, user_id, title, notes, target_frequency, version, updated_at)
                VALUES (?, ?, ?, ?, 7, 1, ?)
                """, (r_id, user_id, title, notes, now))

                cursor.execute("DELETE FROM routine_exercises WHERE routine_id = ?", (r_id,))
                for idx, ex in enumerate(body.get("exercises", [])):
                    cursor.execute("""
                    INSERT INTO routine_exercises (id, routine_id, exercise_id, order_index, target_sets, target_reps_min, target_reps_max, target_rpe, rest_timer_seconds)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (f"re_{r_id}_{idx}", r_id, ex["exercise_id"], idx + 1, ex.get("target_sets", 3),
                          ex.get("target_reps_min", 8), ex.get("target_reps_max", 12), ex.get("target_rpe", 8.0),
                          ex.get("rest_timer_seconds", 90)))

                conn.commit()
                self.send_json({"status": "ok", "routine_id": r_id})

            else:
                self.send_error(404, "API endpoint not found")
        finally:
            conn.close()


def main():
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    init_db()
    print(f"==================================================")
    print(f" Proper GYM Core Server & Sync Engine Online")
    print(f" Local URL: http://localhost:{PORT}")
    print(f" Serving Static UI from: {PUBLIC_DIR}")
    print(f" Local SQLite Database: {DB_FILE}")
    print(f"==================================================")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), ProperGymRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down Proper GYM Server.")


if __name__ == "__main__":
    main()
