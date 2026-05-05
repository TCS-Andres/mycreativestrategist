import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSignedUrl, getSubmission } from '@/lib/db';
import { getIntake, getOptionLabel, intakeFileCategoryLabel } from '@/lib/intakes';
import type { SubmissionStatus } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatBytes, formatDateTime } from '@/lib/utils';
import { StatusControls } from './StatusControls';
import { NotesField } from './NotesField';

export const dynamic = 'force-dynamic';

const STATUSES: { value: SubmissionStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In Review' },
  { value: 'active', label: 'Active Client' },
  { value: 'archived', label: 'Archived' },
];

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const submission = await getSubmission(params.id);
  if (!submission) notFound();

  const intake = getIntake(submission.kind);
  if (!intake) notFound();

  const responses = submission.responses;

  const filesWithLinks = await Promise.all(
    submission.files.map(async (f) => ({
      ...f,
      signed_url: await createSignedUrl(f.file_path, 60 * 60 * 24).catch(() => null),
    })),
  );

  const businessName = (responses.business_name as string) ?? '(no business name)';
  const contactName = (responses.contact_name as string) ?? '';
  const contactEmail = (responses.contact_email as string) ?? '';
  const contactPhone = (responses.contact_phone as string | undefined) ?? '';
  const industry = (responses.industry as string | undefined) ?? '';

  const nonUploadSections = intake.sections.filter((s) => s.id !== 'uploads');

  return (
    <div className="container max-w-5xl py-10">
      <Link
        href="/admin"
        className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-brand-orange"
      >
        ← All submissions
      </Link>

      <div className="mt-4 flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">
            {industry ? `${industry} · ` : ''}{intake.label}
          </p>
          <h1 className="font-heading text-3xl font-semibold leading-tight">{businessName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {contactName} · {contactEmail}
            {contactPhone ? ` · ${contactPhone}` : ''}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Submitted {formatDateTime(submission.submitted_at)}
            {submission.reviewed_at ? ` · Reviewed ${formatDateTime(submission.reviewed_at)}` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <StatusBadge status={submission.status} />
          <div className="flex gap-2">
            <a
              href={`/api/pdf/${submission.id}`}
              className="rounded-md bg-brand-navy px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wider text-brand-cream hover:bg-brand-black"
            >
              Download PDF
            </a>
            <StatusControls id={submission.id} status={submission.status} options={STATUSES} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          {nonUploadSections.map((section) => (
            <section key={section.id} className="space-y-6">
              <div>
                <p className="eyebrow">Section {section.index}</p>
                <h2 className="font-heading text-2xl font-semibold">{section.title}</h2>
              </div>
              <div className="surface divide-y divide-border">
                {section.questions.map((q) => {
                  const value = responses[q.id];
                  return (
                    <div key={q.id} className="grid gap-2 px-6 py-5 sm:grid-cols-[1fr_2fr]">
                      <p className="font-heading text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                        {q.number !== undefined ? `${String(q.number).padStart(2, '0')} · ` : ''}
                        {q.label}
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-navy">
                        {formatValue(submission.kind, q.id, value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <section className="space-y-6">
            <div>
              <p className="eyebrow">Uploads</p>
              <h2 className="font-heading text-2xl font-semibold">Uploaded files</h2>
            </div>
            <div className="surface divide-y divide-border">
              {(['logo', 'brand_guide', 'photography', 'marketing_materials'] as const).map((cat) => {
                const list = filesWithLinks.filter((f) => f.category === cat);
                return (
                  <div key={cat} className="px-6 py-5">
                    <p className="font-heading text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                      {intakeFileCategoryLabel(intake, cat)}
                    </p>
                    {list.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">— None uploaded</p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {list.map((f) => (
                          <li key={f.id} className="flex flex-wrap items-center gap-3">
                            {f.signed_url ? (
                              <a
                                href={f.signed_url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-heading text-sm font-semibold text-brand-blue hover:underline"
                              >
                                {f.file_name}
                              </a>
                            ) : (
                              <span className="font-heading text-sm font-semibold text-muted-foreground">
                                {f.file_name}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatBytes(f.file_size)} · {f.mime_type}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
          <div className="surface p-5">
            <p className="eyebrow mb-3">Quick view</p>
            <Quick label="Intake" value={intake.label} />
            {industry ? <Quick label="Industry" value={industry} /> : null}
            {responses.team_size ? (
              <Quick label="Team size" value={getOptionLabel(submission.kind, 'team_size', String(responses.team_size))} />
            ) : null}
            {responses.budget ? (
              <Quick label="Budget" value={getOptionLabel(submission.kind, 'budget', String(responses.budget))} />
            ) : null}
            {responses.timeline ? <Quick label="Timeline" value={String(responses.timeline)} /> : null}
            {responses.logo_type ? (
              <Quick label="Logo type" value={getOptionLabel(submission.kind, 'logo_type', String(responses.logo_type))} />
            ) : null}
            {responses.starting_point ? (
              <Quick label="Starting point" value={getOptionLabel(submission.kind, 'starting_point', String(responses.starting_point))} />
            ) : null}
          </div>

          <div className="surface p-5">
            <p className="eyebrow mb-3">Internal notes</p>
            <NotesField id={submission.id} initial={submission.internal_notes ?? ''} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Quick({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="border-b border-border/60 py-2 last:border-b-0">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-brand-navy">{value || '—'}</p>
    </div>
  );
}

function formatValue(kind: string, qid: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    return value.map((v) => getOptionLabel(kind as never, qid, String(v))).join(', ');
  }
  if (typeof value === 'number') return String(value);
  return getOptionLabel(kind as never, qid, String(value));
}
