-- AgriGenius Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    farm_name VARCHAR(200),
    location_region VARCHAR(100),
    preferred_units VARCHAR(20) DEFAULT 'METRIC' CHECK (preferred_units IN ('METRIC', 'IMPERIAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Advisory Records Table
CREATE TABLE IF NOT EXISTS advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    advisory_type VARCHAR(50) NOT NULL CHECK (advisory_type IN ('CROP', 'LIVESTOCK_WELFARE')),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    input_parameters JSONB NOT NULL,
    advisory_response JSONB NOT NULL,
    estimated_roi_percentage NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cattle Sanctuary & Resource Directory Table
CREATE TABLE IF NOT EXISTS cattle_sanctuaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(255),
    state_region VARCHAR(100) NOT NULL,
    capacity_status VARCHAR(50) DEFAULT 'OPEN' CHECK (capacity_status IN ('OPEN', 'LIMITED', 'FULL')),
    services_offered TEXT[] DEFAULT ARRAY['REHABILITATION', 'MEDICAL_CARE', 'FODDER_ASSISTANCE'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Farm Telemetry Log
CREATE TABLE IF NOT EXISTS farm_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value NUMERIC(10, 2) NOT NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_advisories_user_id ON advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_advisories_type ON advisories(advisory_type);
CREATE INDEX IF NOT EXISTS idx_cattle_sanctuaries_region ON cattle_sanctuaries(state_region);
