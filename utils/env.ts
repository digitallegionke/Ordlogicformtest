const SUPABASE_URL = 'https://ddluvaghqujbtdspekgm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbHV2YWdocXVqYnRkc3Bla2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MTczNjYsImV4cCI6MjA2MjM5MzM2Nn0.W1JiBgAffa8mI8eUaiGtb7l5y_NCiS3yo8SIKi2bwL4'

export const supabaseUrl: string = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
export const supabaseAnonKey: string = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY

export const getEnvVar = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    if (typeof window !== 'undefined') {
      // We're in the browser, use the public URL and key
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        return supabaseUrl
      }
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
        return supabaseAnonKey
      }
    }
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
} 