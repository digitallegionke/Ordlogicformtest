-- Create produce table
CREATE TABLE produce (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add updated_at trigger
CREATE TRIGGER update_produce_updated_at
  BEFORE UPDATE ON produce
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add some initial produce items
INSERT INTO produce (name, category, unit) VALUES
  ('Tomatoes', 'Vegetables', 'kg'),
  ('Potatoes', 'Vegetables', 'kg'),
  ('Onions', 'Vegetables', 'kg'),
  ('Carrots', 'Vegetables', 'kg'),
  ('Lettuce', 'Leafy Greens', 'kg'),
  ('Spinach', 'Leafy Greens', 'kg'),
  ('Apples', 'Fruits', 'kg'),
  ('Oranges', 'Fruits', 'kg'),
  ('Bananas', 'Fruits', 'kg'),
  ('Cucumbers', 'Vegetables', 'kg'),
  ('Bell Peppers', 'Vegetables', 'kg'),
  ('Broccoli', 'Vegetables', 'kg'),
  ('Cauliflower', 'Vegetables', 'kg'),
  ('Green Beans', 'Vegetables', 'kg'),
  ('Sweet Potatoes', 'Vegetables', 'kg'); 