import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://sxarzvozpjyujmyvyqeo.supabase.co',
  'sb_publishable_0qnRa1a9Mvg-WHNBOaRY5A_2sZm6lNw',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  },
);
