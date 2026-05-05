import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/intake/Logo';
import { INTAKE_ORDER, INTAKES } from '@/lib/intakes';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <p className="font-heading text-sm font-semibold leading-tight">The Creative Strategist</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Client Intakes</p>
          </div>
        </div>
        <Link
          href="/admin/login"
          className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-brand-navy"
        >
          Admin
        </Link>
      </header>

      <section className="container max-w-3xl py-16 sm:py-24">
        <p className="eyebrow mb-6">Welcome</p>
        <h1 className="font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-brand-navy sm:text-6xl">
          The work begins with knowing you well.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-navy/80">
          These intakes are how I get up to speed before we start. Pick the one that matches the
          engagement we agreed on, or follow the link I sent you.
        </p>

        <div className="mt-12 space-y-4">
          {INTAKE_ORDER.map((kind) => {
            const intake = INTAKES[kind];
            return (
              <Link
                key={kind}
                href={`/intake/${intake.slug}`}
                className="surface group flex flex-col gap-3 p-6 transition hover:border-brand-orange sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                    {intake.estimatedMinutes} · {intake.sections.length} sections
                  </p>
                  <h2 className="font-heading text-xl font-semibold text-brand-navy">{intake.label}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {intake.description}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="self-start sm:self-auto">
                  Begin →
                </Button>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border/70 py-10">
        <div className="container flex flex-col gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© The Creative Strategist · mycreativestrategist.com</span>
          <span>Built with care for clients I’m proud to call mine.</span>
        </div>
      </footer>
    </main>
  );
}
