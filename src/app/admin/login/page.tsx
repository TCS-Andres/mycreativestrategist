import Link from 'next/link';
import { LoginForm } from './LoginForm';
import { Logo } from '@/components/intake/Logo';

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  return (
    <main className="min-h-screen bg-brand-navy text-brand-cream">
      <div className="container flex min-h-screen max-w-md flex-col justify-center py-16">
        <Link href="/" className="mb-12 flex items-center gap-3">
          <Logo />
          <div>
            <p className="font-heading text-sm font-semibold leading-tight text-brand-cream">
              The Creative Strategist
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-brand-cream/60">Admin</p>
          </div>
        </Link>
        <h1 className="font-heading text-3xl font-semibold leading-tight">
          Sign in to the dashboard
        </h1>
        <p className="mt-2 text-sm text-brand-cream/70">
          Single admin only. Use the email and password you set up in Supabase Auth.
        </p>

        <div className="mt-10 rounded-lg bg-white/5 p-6 backdrop-blur">
          <LoginForm next={searchParams.next} initialError={searchParams.error} />
        </div>
      </div>
    </main>
  );
}
