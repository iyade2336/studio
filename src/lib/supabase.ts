import { createClient } from '@supabase/supabase-js'

// Hardcoded credentials to ensure connection stability.
const supabaseUrl = 'https://jstjuuepwyhkjodrjkdg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzdGp1dWVwd3loa2pvZHJqa2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzcwOTksImV4cCI6MjA3MTA1MzA5OX0.7L4QfKR9udnkaRHMTBhWasFESYc6AdX69Sgjh5xca94'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
