-- Drop existing tables if they exist
DROP TABLE IF EXISTS delivery_schedules CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS drop_off_locations CASCADE;

-- Create the tables with proper relationships
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drop_off_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    storage_type TEXT NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 1000,
    available_capacity INTEGER NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_capacity CHECK (available_capacity >= 0 AND available_capacity <= max_capacity)
);

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
    certifications JSONB DEFAULT '[]',
    delivery_frequency TEXT,
    contract_duration TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_client ON delivery_schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_farmer ON delivery_schedules(farmer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_date ON delivery_schedules(scheduled_delivery_date);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_off_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public order form)
CREATE POLICY "Public can view clients" ON clients
    FOR SELECT TO public USING (true);

CREATE POLICY "Public can create clients" ON clients
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public can update clients" ON clients
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can view farmers" ON farmers
    FOR SELECT TO public USING (true);

CREATE POLICY "Public can view locations" ON drop_off_locations
    FOR SELECT TO public USING (true);

CREATE POLICY "Public can view schedules" ON delivery_schedules
    FOR SELECT TO public USING (true);

CREATE POLICY "Public can create schedules" ON delivery_schedules
    FOR INSERT TO public WITH CHECK (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_farmers_updated_at
    BEFORE UPDATE ON farmers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON drop_off_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON delivery_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at(); 