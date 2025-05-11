-- Begin transaction
BEGIN;

-- Ensure columns exist
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

-- Force schema cache refresh
ALTER TABLE delivery_schedules ALTER COLUMN contract_duration SET DATA TYPE TEXT;
ALTER TABLE delivery_schedules ALTER COLUMN delivery_frequency SET DATA TYPE TEXT;
ALTER TABLE delivery_schedules ALTER COLUMN payment_terms SET DATA TYPE TEXT;
ALTER TABLE delivery_schedules ALTER COLUMN packaging_type SET DATA TYPE TEXT;

-- Add explicit grant statements
GRANT ALL ON delivery_schedules TO authenticated;
GRANT ALL ON delivery_schedules TO service_role;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

COMMIT; 