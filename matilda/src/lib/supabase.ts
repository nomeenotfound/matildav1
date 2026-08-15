import { createClient } from '@supabase/supabase-js';

let supabaseUrl = '';
let supabaseKey = '';

try {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
} catch (e) {
  supabaseUrl = process.env.VITE_SUPABASE_URL as string;
  supabaseKey = process.env.VITE_SUPABASE_ANON_KEY as string;
}

export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
