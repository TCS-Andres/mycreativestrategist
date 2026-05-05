import Link from 'next/link';
import { Logo } from '@/components/intake/Logo';
import { SignOutButton } from '../SignOutButton';

export default function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-border/70 bg-white">
        <div className="container flex items-center justify-between py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="font-heading text-sm font-semibold leading-tight">The Creative Strategist</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Admin Dashboard</p>
            </div>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-brand-navy">
            <Link href="/admin" className="hover:text-brand-orange">
              Submissions
            </Link>
            <Link href="/admin/settings" className="hover:text-brand-orange">
              Settings
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
