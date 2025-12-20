import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// 🔑 Supabase Client Configuration
// ------------------------------------------------------------------

// Helper to safely access environment variables in various environments
const getEnv = (key: string): string | undefined => {
  // 1. Try Vite standard (import.meta.env)
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    // Ignore errors accessing import.meta
  }

  // 2. Try Node/Webpack standard (process.env)
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors accessing process
  }

  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '🔴 [Supabase Warning] API keys are missing. Using mock connection to prevent crash. Please ensure your .env file exists and contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Fallback to placeholder values to prevent "supabaseUrl is required" error.
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
export const supabase = createClient(url, key);