import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Please create a .env file in the root of the project with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Fallback to placeholder strings to prevent crash during initialization
export const supabase = createClient(
  supabaseUrl || 'https://your-project-id.supabase.co', 
  supabaseAnonKey || 'your-anon-key'
);
