import 'server-only';
import { createServerSupabase } from './supabase/server';

export async function requireAdmin(): Promise<{ ok: true; email: string } | { ok: false }> {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getUser();
  const allowed = process.env.ADMIN_ALLOWED_EMAIL?.toLowerCase();
  const email = data.user?.email?.toLowerCase();
  if (!email || (allowed && email !== allowed)) return { ok: false };
  return { ok: true, email };
}
