-- Create function to apply migrations
CREATE OR REPLACE FUNCTION apply_migration(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Create function to refresh schema cache
CREATE OR REPLACE FUNCTION refresh_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify the system to refresh its schema cache
  NOTIFY pgrst, 'reload schema';
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION apply_migration(text) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_schema_cache() TO authenticated; 