import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key] as string;
    }
  } catch (e) {
    // ignore
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // ignore
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 
                   getEnv('NEXT_PUBLIC_SUPABASE_URL') || 
                   getEnv('SUPABASE_URL') || 
                   getEnv('REACT_APP_SUPABASE_URL');

const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || 
                   getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
                   getEnv('SUPABASE_ANON_KEY') || 
                   getEnv('SUPABASE_SERVICE_ROLE_KEY') || 
                   getEnv('REACT_APP_SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
