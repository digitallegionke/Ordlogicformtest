-- Create produce table
CREATE TABLE IF NOT EXISTS public.produce (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- Add RLS policies
ALTER TABLE public.produce ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON public.produce
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated create"
  ON public.produce
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update"
  ON public.produce
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add some initial produce types
INSERT INTO public.produce (name, category, description) VALUES
  ('Tomatoes', 'Vegetables', 'Fresh, ripe tomatoes'),
  ('Potatoes', 'Vegetables', 'Clean, well-sized potatoes'),
  ('Onions', 'Vegetables', 'Fresh onions'),
  ('Carrots', 'Vegetables', 'Fresh carrots'),
  ('Cabbage', 'Vegetables', 'Fresh cabbage heads'),
  ('Apples', 'Fruits', 'Fresh apples'),
  ('Oranges', 'Fruits', 'Fresh oranges'),
  ('Bananas', 'Fruits', 'Fresh bananas'),
  ('Mangoes', 'Fruits', 'Fresh mangoes'),
  ('Maize', 'Grains', 'Dried maize'),
  ('Wheat', 'Grains', 'Wheat grains'),
  ('Rice', 'Grains', 'Rice grains'),
  ('Beans', 'Legumes', 'Dried beans'),
  ('Green Peas', 'Legumes', 'Fresh green peas');

-- Add foreign key to delivery_schedules
ALTER TABLE public.delivery_schedules 
  ADD COLUMN produce_id UUID REFERENCES public.produce(id),
  ADD COLUMN unit TEXT NOT NULL DEFAULT 'kg';

-- Update the existing records to use a default produce (you may want to map these correctly)
UPDATE public.delivery_schedules 
SET produce_id = (SELECT id FROM public.produce WHERE name = 'Tomatoes' LIMIT 1)
WHERE produce_id IS NULL; 