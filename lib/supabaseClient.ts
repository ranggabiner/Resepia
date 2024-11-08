import { createClient } from '@supabase/supabase-js';

// Use the anonymous key for client-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; // Client-side environment variable
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Client-side environment variable

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Anonymous Key');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
