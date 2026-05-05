'use client';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase/browser';

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={signOut}
      className="font-heading text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-brand-orange"
    >
      Sign out
    </button>
  );
}
