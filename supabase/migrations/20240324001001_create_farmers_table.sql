-- Create farmers table if it doesn't exist
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_farmers_email ON farmers(email);

-- Add trigger for updated_at
CREATE TRIGGER update_farmers_updated_at
    BEFORE UPDATE ON farmers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Anyone can view farmers"
    ON farmers FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow insert access to all users
CREATE POLICY "Anyone can create farmers"
    ON farmers FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow update access to all users
CREATE POLICY "Anyone can update farmers"
    ON farmers FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true); 