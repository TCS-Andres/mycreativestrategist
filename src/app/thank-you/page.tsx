import Link from 'next/link';
import { Logo } from '@/components/intake/Logo';

export default function ThankYouPage() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/andres-hdw/30min';
  return (
    <main className="min-h-screen">
      <header className="container flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <div>
            <p className="font-heading text-sm font-semibold leading-tight">The Creative Strategist</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Branding Intake</p>
          </div>
        </Link>
      </header>

      <section className="container max-w-3xl py-16 sm:py-24 text-center">
        <p className="eyebrow mb-6">Submitted</p>
        <h1 className="font-heading text-4xl font-semibold leading-[1.15] tracking-tight text-brand-navy sm:text-5xl">
          Thank you. I’ve got it.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-brand-navy/80">
          A confirmation is on its way to your inbox. I’ll review everything in the next two business
          days and reach out personally with next steps.
        </p>
        <p className="mt-2 text-lg leading-relaxed text-brand-navy/80">
          If you haven’t already booked a strategy call, the easiest way to keep momentum is to grab
          a slot below.
        </p>

        <div className="surface mt-12 overflow-hidden">
          <iframe
            src={`${calendlyUrl}?hide_event_type_details=1&hide_gdpr_banner=1`}
            className="h-[680px] w-full"
            title="Book a strategy call"
            loading="lazy"
          />
        </div>

        <Link
          href="/"
          className="mt-10 inline-block font-heading text-sm font-semibold text-brand-blue hover:underline"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
