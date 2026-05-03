import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jfywlsvcztiblcbiurzp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeXdsc3ZjenRpYmxjYml1cnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzc3MzQsImV4cCI6MjA5Mjk1MzczNH0.Yf0Dhup8HHdyW3L5X-AYlBMwBG_YrDYOjKOP5SF1e4A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
