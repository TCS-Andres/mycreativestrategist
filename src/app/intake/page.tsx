import { Suspense } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/intake/Logo';
import { IntakeForm } from '@/components/intake/IntakeForm';
import { getDraftByToken } from '@/lib/db';

interface PageProps {
  searchParams: { resume?: string };
}

export default async function IntakePage({ searchParams }: PageProps) {
  let initial: Parameters<typeof IntakeForm>[0]['initial'] = undefined;
  if (searchParams.resume) {
    try {
      const draft = (await getDraftByToken(searchParams.resume)) as
        | {
            id: string;
            resume_token: string;
            contact_email: string;
            responses: Record<string, unknown>;
            uploaded_files: Record<string, unknown>;
          }
        | null;
      if (draft) {
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
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Branding Intake</p>
            </div>
          </Link>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:block">
            Save and resume any time
          </p>
        </div>
      </header>
      <Suspense fallback={null}>
        <IntakeForm initial={initial} />
      </Suspense>
    </main>
  );
}
