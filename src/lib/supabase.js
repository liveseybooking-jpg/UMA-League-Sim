import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mlgsmmkjlzskhknxuepd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZ3NtbWtqbHpza2hrbnh1ZXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTQwMTAsImV4cCI6MjA4ODEzMDAxMH0.dp8rzaDd6bjYUYUIDhz79ekBFLAoxNrXHa3k5HQWgO4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)