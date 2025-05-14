-- Update the status type to include new values
ALTER TABLE public.delivery_schedules 
  DROP CONSTRAINT IF EXISTS delivery_schedules_status_check;

ALTER TABLE public.delivery_schedules
  ADD CONSTRAINT delivery_schedules_status_check 
  CHECK (status IN ('pending', 'confirmed', 'in_transit', 'assigned', 'in_progress', 'completed', 'cancelled')); 