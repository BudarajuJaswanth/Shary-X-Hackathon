-- ============================================================================
-- CITYVOICE AI - MUNICIPAL DATABASE SCHEMA FOR SUPABASE
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CITIZENS TABLE
CREATE TABLE IF NOT EXISTS citizens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    phone TEXT UNIQUE,
    email TEXT,
    language_preference TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL,
    landmark TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    ward_number TEXT,
    zone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CONVERSATION MESSAGES TABLE
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('CITIZEN', 'CITYVOICE_AI')),
    text TEXT NOT NULL,
    intent TEXT,
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CIVIC REQUESTS (PARENT TICKET TABLE)
CREATE TABLE IF NOT EXISTS civic_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT UNIQUE NOT NULL, -- e.g. 'CIV-2026-8942'
    citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('COMPLAINT', 'MOBILITY', 'EMERGENCY')),
    status TEXT NOT NULL DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. COMPLAINTS TABLE (HERO ENTITY)
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    civic_request_id UUID REFERENCES civic_requests(id) ON DELETE CASCADE,
    request_id TEXT NOT NULL, -- 'CIV-2026-8942' ticketId
    category TEXT NOT NULL CHECK (category IN ('POTHOLE', 'GARBAGE', 'STREETLIGHT', 'WATER_LEAKAGE', 'ROAD_DAMAGE', 'OTHER')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    landmark TEXT,
    status TEXT NOT NULL DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
    priority TEXT NOT NULL DEFAULT 'HIGH' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    assigned_department TEXT NOT NULL DEFAULT 'General Municipal Administration',
    estimated_resolution_hours INT NOT NULL DEFAULT 48,
    photo_url TEXT,
    citizen_phone TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MOBILITY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS mobility_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    civic_request_id UUID REFERENCES civic_requests(id) ON DELETE CASCADE,
    origin TEXT,
    destination TEXT NOT NULL,
    route_number TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. EMERGENCY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS emergency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    civic_request_id UUID REFERENCES civic_requests(id) ON DELETE CASCADE,
    emergency_type TEXT NOT NULL CHECK (emergency_type IN ('POLICE', 'AMBULANCE', 'FIRE', 'DISASTER', 'WOMEN_HELPLINE')),
    location TEXT,
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR FREQUENTLY QUERIED FIELDS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_complaints_request_id ON complaints(request_id);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_civic_requests_request_id ON civic_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_civic_requests_status ON civic_requests(status);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_conv_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);

-- ============================================================================
-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_citizens_timestamp BEFORE UPDATE ON citizens FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE OR REPLACE TRIGGER update_conversations_timestamp BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE OR REPLACE TRIGGER update_civic_requests_timestamp BEFORE UPDATE ON civic_requests FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE OR REPLACE TRIGGER update_complaints_timestamp BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR PUBLIC ACCESS IN DEV/MVP
-- ============================================================================
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobility_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for MVP development
CREATE POLICY "Allow public insert on complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on complaints" ON complaints FOR SELECT USING (true);
CREATE POLICY "Allow public update on complaints" ON complaints FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on civic_requests" ON civic_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on civic_requests" ON civic_requests FOR SELECT USING (true);
CREATE POLICY "Allow public update on civic_requests" ON civic_requests FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on conversations" ON conversations FOR SELECT USING (true);

CREATE POLICY "Allow public insert on conversation_messages" ON conversation_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on conversation_messages" ON conversation_messages FOR SELECT USING (true);
