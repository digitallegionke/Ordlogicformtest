-- Begin transaction
BEGIN;

-- Ensure the delivery_schedules table exists with all required columns
CREATE TABLE IF NOT EXISTS delivery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL,
    produce_type TEXT NOT NULL,
    produce_nature TEXT NOT NULL,
    expected_quantity DECIMAL NOT NULL CHECK (expected_quantity > 0),
    expected_quality_grade TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    scheduled_delivery_date TIMESTAMPTZ NOT NULL,
    special_notes TEXT,
    packaging_type TEXT,
    payment_terms TEXT,
    delivery_frequency TEXT,
    contract_duration TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    certifications JSONB DEFAULT '[]'
);

-- Create index for certifications if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE indexname = 'idx_delivery_schedules_certifications'
    ) THEN
        CREATE INDEX idx_delivery_schedules_certifications ON delivery_schedules USING gin(certifications);
    END IF;
END $$;

-- Add comments for clarity
COMMENT ON COLUMN delivery_schedules.certifications IS 'Array of certification strings stored as JSONB';
COMMENT ON COLUMN delivery_schedules.contract_duration IS 'Duration of the delivery contract';
COMMENT ON COLUMN delivery_schedules.delivery_frequency IS 'Frequency of deliveries';
COMMENT ON COLUMN delivery_schedules.payment_terms IS 'Terms of payment';
COMMENT ON COLUMN delivery_schedules.packaging_type IS 'Type of packaging for the produce';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

COMMIT; 