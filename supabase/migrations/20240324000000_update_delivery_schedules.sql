-- Drop existing table if it exists
DROP TABLE IF EXISTS delivery_schedules CASCADE;

-- Create delivery schedules table with updated schema
CREATE TABLE delivery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    produce_type TEXT NOT NULL,
    produce_nature TEXT,
    expected_quantity DECIMAL NOT NULL,
    expected_quality_grade TEXT,
    dropoff_location TEXT,
    scheduled_delivery_date TIMESTAMPTZ NOT NULL,
    special_notes TEXT,
    packaging_type TEXT,
    payment_terms TEXT,
    certifications JSONB DEFAULT '[]',
    delivery_frequency TEXT,
    contract_duration TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX idx_delivery_schedules_client ON delivery_schedules(client_id);
CREATE INDEX idx_delivery_schedules_status ON delivery_schedules(status);
CREATE INDEX idx_delivery_schedules_date ON delivery_schedules(scheduled_delivery_date);

-- Add trigger for updated_at
CREATE TRIGGER update_delivery_schedules_updated_at
    BEFORE UPDATE ON delivery_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE delivery_schedules ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Authenticated users can view delivery schedules"
    ON delivery_schedules FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert access to authenticated users
CREATE POLICY "Authenticated users can create delivery schedules"
    ON delivery_schedules FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow update access to authenticated users for their own schedules
CREATE POLICY "Users can update their own delivery schedules"
    ON delivery_schedules FOR UPDATE
    TO authenticated
    USING (client_id IN (
        SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'
    )); 