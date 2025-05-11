import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { supabaseUrl, supabaseAnonKey } from '../utils/env'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateSchema() {
  try {
    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    // Apply each migration
    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      console.log(`Applying migration: ${file}`)
      const { error } = await supabase.rpc('apply_migration', { sql })
      if (error) throw error
    }

    console.log('Migrations applied successfully')

    // Refresh schema cache
    const { error: refreshError } = await supabase.rpc('refresh_schema_cache')
    if (refreshError) throw refreshError

    console.log('Schema cache refreshed')

  } catch (error) {
    console.error('Error updating schema:', error)
    process.exit(1)
  }
}

updateSchema() 