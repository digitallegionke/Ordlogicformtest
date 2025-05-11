-- Begin transaction
BEGIN;

-- Ensure the delivery_schedules table exists
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop the certifications column if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'delivery_schedules' 
        AND column_name = 'certifications'
    ) THEN
        ALTER TABLE delivery_schedules DROP COLUMN certifications;
    END IF;
END $$;

-- Add the certifications column with proper type
ALTER TABLE delivery_schedules ADD COLUMN certifications JSONB DEFAULT '[]';

-- Create index for better performance if it doesn't exist
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

-- Update types and add comment
COMMENT ON COLUMN delivery_schedules.certifications IS 'Array of certification strings stored as JSONB';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

COMMIT; 