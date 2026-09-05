import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev instead of silently falling back to a fake client.
  // eslint-disable-next-line no-console
  console.error(
    'Supabase yapılandırması eksik. .env dosyanızda VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlı olmalı.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const BUSINESS_ASSETS_BUCKET = 'business-assets';
