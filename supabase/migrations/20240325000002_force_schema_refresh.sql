-- Begin transaction
BEGIN;

-- First verify the column exists
DO $$ 
DECLARE
    column_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'delivery_schedules' 
        AND column_name = 'contract_duration'
    ) INTO column_exists;

    IF NOT column_exists THEN
        -- If column doesn't exist, create it
        ALTER TABLE delivery_schedules ADD COLUMN contract_duration TEXT;
    END IF;
END $$;

-- Force a schema refresh by altering and then restoring the column comment
DO $$ 
BEGIN
    -- Remove the comment
    COMMENT ON COLUMN delivery_schedules.contract_duration IS NULL;
    
    -- Add the comment back
    COMMENT ON COLUMN delivery_schedules.contract_duration IS 'Duration of the delivery contract';
END $$;

-- Force cache invalidation
ALTER TABLE delivery_schedules ALTER COLUMN contract_duration SET DATA TYPE TEXT;

-- Explicitly grant permissions to ensure RLS is properly set
GRANT ALL ON delivery_schedules TO authenticated;
GRANT ALL ON delivery_schedules TO service_role;

-- Multiple cache refresh attempts
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');
NOTIFY pgrst, 'reload config';

-- Add a small delay to ensure notifications are processed
SELECT pg_sleep(1);

COMMIT; 