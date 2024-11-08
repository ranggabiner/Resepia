import { createClient } from '@supabase/supabase-js';

// Use the service role key for server-side operations (like deleting users)
const supabaseUrl = process.env.SUPABASE_URL as string;  // Server-side environment variable
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;  // Server-side environment variable

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Service Role Key');
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey);
