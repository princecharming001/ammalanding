import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://nxibeiykcgxpbmkeadth.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aWJlaXlrY2d4cGJta2VhZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjA4MDcsImV4cCI6MjA4MTA5NjgwN30.0ViO1YkTQ2CEVjf1VoBun6cgVodu2u3DrcDipeWnr28"

export const supabase = createClient(supabaseUrl, supabaseKey)

