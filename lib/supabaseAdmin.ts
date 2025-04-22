import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Missing environment variables for Supabase Admin client. ' +
    'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
  );
  // In development, we throw an error to make it clear what's missing
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Missing required environment variables for Supabase Admin client');
  }
}

// Create a Supabase client with the service role key for admin access
export const supabaseAdmin = createClient<Database>(
  supabaseUrl as string, 
  supabaseServiceKey as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
); 