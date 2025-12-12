import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://nxibeiykcgxpbmkeadth.supabase.co"
const supabaseKey = "sb_publishable_0XafzUO0oxkFE1hkKzKqsw_LvnBdMNz"

export const supabase = createClient(supabaseUrl, supabaseKey)

