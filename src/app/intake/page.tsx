import Link from 'next/link';
import { Logo } from '@/components/intake/Logo';
import { INTAKE_ORDER, INTAKES } from '@/lib/intakes';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-static';

export default function IntakeIndexPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border/70 bg-brand-cream">
        <div className="container flex items-center justify-between py-5">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="font-heading text-sm font-semibold leading-tight">The Creative Strategist</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Client Intakes</p>
            </div>
          </Link>
        </div>
      </header>

      <section className="container max-w-3xl py-16 sm:py-24">
        <p className="eyebrow mb-6">Intakes</p>
        <h1 className="font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-brand-navy sm:text-5xl">
          Pick the intake we agreed on.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-navy/80">
          If I sent you a direct link, use that one. Otherwise, pick the form that matches the work
          we’re doing together.
        </p>

        <div className="mt-12 space-y-4">
          {INTAKE_ORDER.map((kind) => {
            const intake = INTAKES[kind];
            return (
              <Link
                key={kind}
                href={`/intake/${intake.slug}`}
                className="surface group flex flex-col gap-2 p-6 transition hover:border-brand-orange sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                    {intake.estimatedMinutes} · {intake.sections.length} sections
                  </p>
                  <h2 className="font-heading text-xl font-semibold text-brand-navy">
                    {intake.label}
                  </h2>
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
    </main>
  );
}
