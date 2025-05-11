import { createBrowserClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey } from '@/utils/env'

export const createClient = () => {
  const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )

  return supabase
}
