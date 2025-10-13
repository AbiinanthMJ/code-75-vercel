import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.error('Supabase env vars missing or empty', {
    hasUrl: Boolean(supabaseUrl),
    hasKey: Boolean(supabaseKey)
  })
  throw new Error('Supabase env vars not set. Check .env.local and restart dev server.')
}
export const supabase = createClient(supabaseUrl, supabaseKey)