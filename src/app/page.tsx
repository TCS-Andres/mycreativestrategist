import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/intake/Logo';
import { SECTIONS } from '@/lib/questions';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <p className="font-heading text-sm font-semibold leading-tight">The Creative Strategist</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Branding Intake</p>
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
        <p className="eyebrow mb-6">Branding intake · Step one</p>
        <h1 className="font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-brand-navy sm:text-6xl">
          Let’s build the brand your business actually deserves.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-navy/80">
          This questionnaire is the foundation of our work together. The clearer you are with me here,
          the sharper the strategy I can build with you. It takes most clients between thirty and
          sixty minutes, and you can save and come back to it whenever you need to.
        </p>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-navy/80">
          Twelve sections, plus a few uploads at the end. Take your time, be honest, and don’t worry
          about polishing the answers. I’ll do that part with you.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/intake">
            <Button size="lg">Begin the questionnaire</Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Already started? Use the link I emailed you to pick up where you left off.
          </p>
        </div>

        <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              className="surface p-5"
            >
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Section {section.index}
              </p>
              <p className="mt-2 font-heading text-base font-semibold text-brand-navy">
                {section.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {section.intro}
              </p>
            </div>
          ))}
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
