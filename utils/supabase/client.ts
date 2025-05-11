import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { supabaseUrl, supabaseAnonKey } from '@/utils/env'

const cookieHandler = {
  get(name: string) {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
    return cookie ? cookie.split('=')[1] : undefined
  },
  set(name: string, value: string, options: any) {
    let cookie = `${name}=${value}`
    if (options.maxAge) {
      cookie += `; Max-Age=${options.maxAge}`
    }
    if (options.path) {
      cookie += `; Path=${options.path}`
    }
    if (options.sameSite) {
      cookie += `; SameSite=${options.sameSite}`
    }
    if (options.domain) {
      cookie += `; Domain=${options.domain}`
    }
    if (options.secure) {
      cookie += '; Secure'
    }
    document.cookie = cookie
  },
  remove(name: string, options: any) {
    cookieHandler.set(name, '', { ...options, maxAge: -1 })
  }
}

export const createClient = () => {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: cookieHandler
    }
  )
}
