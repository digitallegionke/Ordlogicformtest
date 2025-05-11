-- Add contact fields to delivery_schedules table
ALTER TABLE delivery_schedules
ADD COLUMN contact_person VARCHAR(255),
ADD COLUMN contact_phone VARCHAR(50);

-- Add comment to the columns
COMMENT ON COLUMN delivery_schedules.contact_person IS 'Name of the contact person for this delivery';
COMMENT ON COLUMN delivery_schedules.contact_phone IS 'Phone number of the contact person'; 