-- Begin transaction
BEGIN;

-- Add constraints to delivery_schedules table
ALTER TABLE delivery_schedules
    ALTER COLUMN produce_type SET NOT NULL,
    ALTER COLUMN produce_nature SET NOT NULL,
    ALTER COLUMN expected_quantity SET NOT NULL,
    ALTER COLUMN expected_quality_grade SET NOT NULL,
    ALTER COLUMN dropoff_location SET NOT NULL,
    ALTER COLUMN scheduled_delivery_date SET NOT NULL,
    ALTER COLUMN status SET NOT NULL DEFAULT 'pending',
    ALTER COLUMN certifications SET DEFAULT '[]'::jsonb,
    ADD CONSTRAINT delivery_schedules_expected_quantity_check CHECK (expected_quantity > 0),
    ADD CONSTRAINT delivery_schedules_status_check CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_client_id ON delivery_schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_farmer_id ON delivery_schedules(farmer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_status ON delivery_schedules(status);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_scheduled_date ON delivery_schedules(scheduled_delivery_date);

-- Update RLS policies
ALTER TABLE delivery_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON delivery_schedules;
CREATE POLICY "Enable insert access for authenticated users" 
    ON delivery_schedules FOR INSERT 
    WITH CHECK (true);  -- Anyone can insert

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON delivery_schedules;
CREATE POLICY "Enable read access for authenticated users" 
    ON delivery_schedules FOR SELECT 
    USING (true);  -- Anyone can read

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON delivery_schedules;
CREATE POLICY "Enable update access for authenticated users" 
    ON delivery_schedules FOR UPDATE 
    USING (true)  -- Anyone can update for now
    WITH CHECK (true);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

COMMIT; 