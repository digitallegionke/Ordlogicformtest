-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own client records" ON clients;

-- Create more permissive policies for the order form use case
CREATE POLICY "Anyone can create clients"
    ON clients FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone can view clients"
    ON clients FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Anyone can update clients"
    ON clients FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Add function to handle client updates
CREATE OR REPLACE FUNCTION handle_client_update()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 