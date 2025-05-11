-- Create delivery_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS delivery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    produce_type TEXT NOT NULL,
    produce_nature TEXT NOT NULL,
    expected_quantity NUMERIC NOT NULL,
    expected_quality_grade TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    scheduled_delivery_date TIMESTAMPTZ NOT NULL,
    special_notes TEXT,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'))
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_client_id ON delivery_schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_farmer_id ON delivery_schedules(farmer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_status ON delivery_schedules(status);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_delivery_date ON delivery_schedules(scheduled_delivery_date);

-- Add trigger for updated_at
CREATE TRIGGER update_delivery_schedules_updated_at
    BEFORE UPDATE ON delivery_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE delivery_schedules ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Anyone can view delivery schedules"
    ON delivery_schedules FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow insert access to all users
CREATE POLICY "Anyone can create delivery schedules"
    ON delivery_schedules FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow update access to all users
CREATE POLICY "Anyone can update delivery schedules"
    ON delivery_schedules FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true); 