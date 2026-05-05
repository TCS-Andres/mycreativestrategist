import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Logo } from '@/components/intake/Logo';
import { IntakeForm } from '@/components/intake/IntakeForm';
import { intakeBySlug, INTAKE_ORDER, INTAKES } from '@/lib/intakes';
import { getDraftByToken } from '@/lib/db';

export function generateStaticParams() {
  return INTAKE_ORDER.map((kind) => ({ slug: INTAKES[kind].slug }));
}

interface PageProps {
  params: { slug: string };
  searchParams: { resume?: string };
}

export default async function IntakePage({ params, searchParams }: PageProps) {
  const intake = intakeBySlug(params.slug);
  if (!intake) notFound();

  let initial: Parameters<typeof IntakeForm>[0]['initial'] = undefined;
  if (searchParams.resume) {
    try {
      const draft = (await getDraftByToken(searchParams.resume)) as
        | {
            id: string;
            kind: string;
            resume_token: string;
            contact_email: string;
            responses: Record<string, unknown>;
            uploaded_files: Record<string, unknown>;
          }
        | null;
      // Only restore if the draft was for this intake.
      if (draft && draft.kind === intake.kind) {
        initial = {
          draftId: draft.id,
          resumeToken: draft.resume_token,
          resumeEmail: draft.contact_email,
          responses: draft.responses,
          files: (draft.uploaded_files ?? {}) as never,
        };
      }
    } catch {
      // fall through with empty form
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border/70 bg-brand-cream">
        <div className="container flex items-center justify-between py-5">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="font-heading text-sm font-semibold leading-tight">The Creative Strategist</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{intake.label}</p>
            </div>
          </Link>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:block">
            Save and resume any time
          </p>
        </div>
      </header>

      {!initial && intake.hero && (
        <section className="container max-w-3xl py-12 sm:py-16">
          <p className="eyebrow mb-4">{intake.hero.eyebrow}</p>
          <h1 className="font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-brand-navy sm:text-5xl">
            {intake.hero.title}
          </h1>
          {intake.hero.body.map((paragraph, i) => (
            <p
              key={i}
              className="mt-5 max-w-2xl text-base leading-relaxed text-brand-navy/80 sm:text-lg"
            >
              {paragraph}
            </p>
          ))}
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            About {intake.estimatedMinutes} · {intake.sections.length} sections
          </p>
        </section>
      )}

      <IntakeForm intake={intake} initial={initial} />
    </main>
  );
}
