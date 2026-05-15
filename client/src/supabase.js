import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zwrhcxqfnshcgyfuuzbl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_WNQPxq4gUIRJV68DoS9Xpw_18mHngdR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
