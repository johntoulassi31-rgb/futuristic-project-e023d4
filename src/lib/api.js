import { supabase } from './supabase.js';

export async function api(path, method='GET', body) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error('Connectez-vous à votre compte Mentoratplus pour continuer.');
  const { data, error } = await supabase.functions.invoke('mentoratplus-api', {
    body: { path, method, body: body ?? {} },
  });
  if (error) {
    let message = error.message || 'Action indisponible. Réessayez.';
    try {
      const payload = await error.context?.json?.();
      if (payload?.error) message = payload.error;
    } catch {}
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
