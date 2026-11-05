import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null

export async function checkSupabaseClientAndSession() {
  if (!supabase) {
    return {
      configured: false,
      clientAvailable: false,
      sessionAuthenticated: false,
      sessionUserId: null,
      error: 'VITE_SUPABASE_URL atau VITE_SUPABASE_PUBLISHABLE_KEY belum diatur.',
    }
  }

  const { data, error } = await supabase.auth.getSession()
  return {
    configured: true,
    clientAvailable: true,
    sessionAuthenticated: Boolean(data?.session),
    sessionUserId: data?.session?.user?.id ?? null,
    error: error?.message ?? null,
  }
}
