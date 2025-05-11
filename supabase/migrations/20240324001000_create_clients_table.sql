-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Anyone can view clients"
    ON clients FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow insert access to all users
CREATE POLICY "Anyone can create clients"
    ON clients FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow update access to all users
CREATE POLICY "Anyone can update clients"
    ON clients FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true); 