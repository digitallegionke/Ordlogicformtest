-- Add email column to farmers table
ALTER TABLE farmers
ADD COLUMN email VARCHAR(255);

-- Update the types/database.ts file after running this migration 