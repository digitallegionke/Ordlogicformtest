-- Create receiving_records table
CREATE TABLE receiving_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) NOT NULL,
  order_date DATE NOT NULL,
  is_dropped BOOLEAN DEFAULT false,
  drop_time TIMESTAMP WITH TIME ZONE,
  drop_notes TEXT,
  has_returns BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create receiving_items table
CREATE TABLE receiving_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receiving_id UUID REFERENCES receiving_records(id) ON DELETE CASCADE NOT NULL,
  produce_id UUID REFERENCES produce(id),
  name TEXT NOT NULL,
  ordered_quantity NUMERIC(10, 2) NOT NULL,
  received_quantity NUMERIC(10, 2) NOT NULL,
  grade_a NUMERIC(10, 2) DEFAULT 0,
  grade_b NUMERIC(10, 2) DEFAULT 0,
  grade_c NUMERIC(10, 2) DEFAULT 0,
  returned_quantity NUMERIC(10, 2) DEFAULT 0,
  return_reason TEXT,
  return_notes TEXT,
  grading_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_receiving_records_updated_at
  BEFORE UPDATE ON receiving_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receiving_items_updated_at
  BEFORE UPDATE ON receiving_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 