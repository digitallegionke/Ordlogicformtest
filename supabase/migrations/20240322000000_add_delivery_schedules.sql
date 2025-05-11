-- Create delivery schedules table
CREATE TABLE IF NOT EXISTS delivery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    delivery_date TIMESTAMPTZ NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    certifications JSONB DEFAULT '[]',
    driver_id UUID,
    vehicle_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for better query performance
CREATE INDEX idx_delivery_schedules_order ON delivery_schedules(order_id);

-- Add trigger for updated_at
CREATE TRIGGER update_delivery_schedules_updated_at
    BEFORE UPDATE ON delivery_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add delivery_schedule_id to orders table
ALTER TABLE orders
ADD COLUMN delivery_schedule_id UUID REFERENCES delivery_schedules(id);

-- Add index for the new column
CREATE INDEX idx_orders_delivery_schedule ON orders(delivery_schedule_id); 