import { createClient } from '@supabase/supabase-js';

// Aunque peguen la URL con /rest/v1, nos quedamos solo con el dominio
const url = new URL(process.env.SUPABASE_URL).origin;

// Cliente con la Secret key: se salta RLS, por eso SOLO vive en el backend.
export const supabase = createClient(url, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
