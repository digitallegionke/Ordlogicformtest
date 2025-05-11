-- Begin transaction
BEGIN;

-- Force schema cache refresh for delivery_schedules table
ALTER TABLE delivery_schedules ALTER COLUMN contract_duration SET DATA TYPE TEXT;
ALTER TABLE delivery_schedules ALTER COLUMN delivery_frequency SET DATA TYPE TEXT;
ALTER TABLE delivery_schedules ALTER COLUMN payment_terms SET DATA TYPE TEXT;
ALTER TABLE delivery_schedules ALTER COLUMN packaging_type SET DATA TYPE TEXT;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Add explicit grant statements
GRANT ALL ON delivery_schedules TO authenticated;
GRANT ALL ON delivery_schedules TO service_role;

COMMIT; 