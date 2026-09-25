-- =====================================================================
-- Proper GYM — Client-Side SQLite Schema (OP-SQLite / Local Storage)
-- =====================================================================

CREATE TABLE IF NOT EXISTS local_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    fitness_level TEXT DEFAULT 'intermediate',
    preferred_unit TEXT DEFAULT 'metric_kg',
    default_rest_seconds INTEGER DEFAULT 90,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS local_exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    equipment TEXT NOT NULL,
    primary_muscle TEXT NOT NULL,
    secondary_muscles TEXT, -- JSON array
    is_compound INTEGER DEFAULT 0,
    is_custom INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS local_routines (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    notes TEXT,
    target_frequency INTEGER DEFAULT 7,
    version INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS local_routine_exercises (
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

CREATE TABLE IF NOT EXISTS local_workouts (
    id TEXT PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS local_workout_sets (
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

CREATE TABLE IF NOT EXISTS local_personal_records (
    id TEXT PRIMARY KEY,
    exercise_id TEXT NOT NULL,
    workout_set_id TEXT NOT NULL,
    record_type TEXT NOT NULL,
    value REAL NOT NULL,
    achieved_at INTEGER NOT NULL
);

-- The Append-Only Client Mutation Queue for Offline-First Sync
CREATE TABLE IF NOT EXISTS mutation_queue (
    mutation_id TEXT PRIMARY KEY,
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    payload TEXT NOT NULL,    -- JSON payload
    client_timestamp INTEGER NOT NULL,
    sync_status TEXT DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0
);
