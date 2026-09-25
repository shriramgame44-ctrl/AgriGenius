-- =====================================================================
-- Proper GYM — Production PostgreSQL 16 Schema
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Domain Enums
DO $$ BEGIN
    CREATE TYPE unit_preference AS ENUM ('metric_kg', 'imperial_lbs');
    CREATE TYPE fitness_level AS ENUM ('beginner', 'intermediate', 'advanced', 'elite');
    CREATE TYPE set_type_enum AS ENUM ('normal', 'warmup', 'drop', 'failure', 'myorep');
    CREATE TYPE workout_status_enum AS ENUM ('in_progress', 'completed', 'discarded');
    CREATE TYPE equipment_category AS ENUM ('barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'smith_machine', 'band', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    fitness_level fitness_level DEFAULT 'intermediate',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 2. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preferred_unit unit_preference DEFAULT 'metric_kg' NOT NULL,
    default_rest_timer_seconds INT DEFAULT 90 NOT NULL CHECK (default_rest_timer_seconds >= 10),
    sound_effects_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    audio_ducking_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    vibration_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    keep_screen_awake BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Muscle Groups
CREATE TABLE IF NOT EXISTS muscle_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    is_major BOOLEAN DEFAULT TRUE NOT NULL
);

-- 4. Exercises
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    instructions TEXT,
    equipment equipment_category NOT NULL,
    primary_muscle_id INT NOT NULL REFERENCES muscle_groups(id),
    secondary_muscles INT[] DEFAULT '{}',
    is_compound BOOLEAN DEFAULT FALSE NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Routines
CREATE TABLE IF NOT EXISTS routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    notes TEXT,
    target_frequency_days INT DEFAULT 7,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    version INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 6. Routine Exercises
CREATE TABLE IF NOT EXISTS routine_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    order_index INT NOT NULL,
    target_sets INT NOT NULL CHECK (target_sets > 0),
    target_reps_min INT NOT NULL CHECK (target_reps_min >= 0),
    target_reps_max INT NOT NULL CHECK (target_reps_max >= target_reps_min),
    target_rpe NUMERIC(3, 1) CHECK (target_rpe BETWEEN 1.0 AND 10.0),
    rest_timer_seconds INT DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Workouts (Sessions)
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    status workout_status_enum DEFAULT 'completed' NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INT,
    total_volume_kg NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    client_mutation_id UUID UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 8. Supersets
CREATE TABLE IF NOT EXISTS supersets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    group_order INT NOT NULL
);

-- 9. Workout Sets
CREATE TABLE IF NOT EXISTS workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    superset_id UUID REFERENCES supersets(id) ON DELETE SET NULL,
    set_index INT NOT NULL,
    set_type set_type_enum DEFAULT 'normal' NOT NULL,
    weight_kg NUMERIC(6, 2) NOT NULL CHECK (weight_kg >= 0.0),
    reps INT NOT NULL CHECK (reps >= 0),
    rpe NUMERIC(3, 1) CHECK (rpe BETWEEN 1.0 AND 10.0),
    rir INT CHECK (rir BETWEEN 0 AND 10),
    is_completed BOOLEAN DEFAULT TRUE NOT NULL,
    rest_seconds_actual INT,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    client_mutation_id UUID UNIQUE
);

-- 10. Personal Records
CREATE TABLE IF NOT EXISTS personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    workout_set_id UUID NOT NULL REFERENCES workout_sets(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_exercise_record UNIQUE (user_id, exercise_id, record_type)
);

-- 11. User Metrics
CREATE TABLE IF NOT EXISTS user_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
    bodyweight_kg NUMERIC(5, 2),
    body_fat_percentage NUMERIC(4, 2),
    waist_cm NUMERIC(5, 2),
    chest_cm NUMERIC(5, 2),
    arms_cm NUMERIC(5, 2),
    photo_storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_started ON workouts(user_id, started_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_exercise ON workout_sets(workout_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_completed ON workout_sets(exercise_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_records_lookup ON personal_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_date ON user_metrics(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_order ON routine_exercises(routine_id, order_index ASC);
