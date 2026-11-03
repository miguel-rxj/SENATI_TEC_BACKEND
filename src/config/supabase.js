import { createClient } from '@supabase/supabase-js';

// Cliente con la Secret key: se salta RLS, por eso SOLO vive en el backend.
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
