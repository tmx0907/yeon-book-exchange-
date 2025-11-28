
import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// 🛑 IMPORTANT: REPLACE THESE WITH YOUR KEYS FROM SUPABASE DASHBOARD
// Go to Settings -> API -> Project URL & anon/public key
// ------------------------------------------------------------------
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://snyfhftwyqcnqplbkcnw.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueWZoZnR3eXFjbnFwbGJrY253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMDA5MDEsImV4cCI6MjA3OTg3NjkwMX0.-c3SvvDBBOICu18IXdLXS-TUWhMLtypheA3F7Czc-jk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
