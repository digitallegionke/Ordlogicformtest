-- Begin transaction
BEGIN;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Check and add contract_duration
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'delivery_schedules' 
        AND column_name = 'contract_duration'
    ) THEN
        ALTER TABLE delivery_schedules ADD COLUMN contract_duration TEXT;
    END IF;

    -- Check and add delivery_frequency
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'delivery_schedules' 
        AND column_name = 'delivery_frequency'
    ) THEN
        ALTER TABLE delivery_schedules ADD COLUMN delivery_frequency TEXT;
    END IF;

    -- Check and add payment_terms
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'delivery_schedules' 
        AND column_name = 'payment_terms'
    ) THEN
        ALTER TABLE delivery_schedules ADD COLUMN payment_terms TEXT;
    END IF;

    -- Check and add packaging_type
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'delivery_schedules' 
        AND column_name = 'packaging_type'
    ) THEN
        ALTER TABLE delivery_schedules ADD COLUMN packaging_type TEXT;
    END IF;
END $$;

-- Add comments for clarity
COMMENT ON COLUMN delivery_schedules.contract_duration IS 'Duration of the delivery contract';
COMMENT ON COLUMN delivery_schedules.delivery_frequency IS 'Frequency of deliveries';
COMMENT ON COLUMN delivery_schedules.payment_terms IS 'Terms of payment';
COMMENT ON COLUMN delivery_schedules.packaging_type IS 'Type of packaging for the produce';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

COMMIT; 