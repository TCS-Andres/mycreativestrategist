import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSignedUrl, getSubmission } from '@/lib/db';
import { SECTIONS, getOptionLabel } from '@/lib/questions';
import { FILE_CATEGORY_LABELS, type SubmissionStatus } from '@/lib/types';
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

  const responses = submission.responses;

  const filesWithLinks = await Promise.all(
    submission.files.map(async (f) => ({
      ...f,
      signed_url: await createSignedUrl(f.file_path, 60 * 60 * 24).catch(() => null),
    })),
  );

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
          <p className="eyebrow mb-2">{responses.industry}</p>
          <h1 className="font-heading text-3xl font-semibold leading-tight">
            {responses.business_name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {responses.contact_name} · {responses.contact_email}
            {responses.contact_phone ? ` · ${responses.contact_phone}` : ''}
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
            <StatusControls
              id={submission.id}
              status={submission.status}
              options={STATUSES}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          {SECTIONS.filter((s) => s.id !== 'uploads').map((section) => (
            <section key={section.id} className="space-y-6">
              <div>
                <p className="eyebrow">Section {section.index}</p>
                <h2 className="font-heading text-2xl font-semibold">{section.title}</h2>
              </div>
              <div className="surface divide-y divide-border">
                {section.questions.map((q) => {
                  const value = (responses as Record<string, unknown>)[q.id];
                  return (
                    <div key={q.id} className="grid gap-2 px-6 py-5 sm:grid-cols-[1fr_2fr]">
                      <p className="font-heading text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                        {String(q.number).padStart(2, '0')} · {q.label}
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-navy">
                        {formatValue(q.id, value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <section className="space-y-6">
            <div>
              <p className="eyebrow">Section 12</p>
              <h2 className="font-heading text-2xl font-semibold">Uploads</h2>
            </div>
            <div className="surface divide-y divide-border">
              {(['logo', 'brand_guide', 'photography', 'marketing_materials'] as const).map((cat) => {
                const list = filesWithLinks.filter((f) => f.category === cat);
                return (
                  <div key={cat} className="px-6 py-5">
                    <p className="font-heading text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                      {FILE_CATEGORY_LABELS[cat]}
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
            <Quick label="Industry" value={responses.industry} />
            <Quick label="Team size" value={getOptionLabel('team_size', responses.team_size)} />
            <Quick label="Budget" value={getOptionLabel('budget', responses.budget)} />
            <Quick label="Timeline" value={responses.timeline} />
            <Quick
              label="Sales cycle"
              value={getOptionLabel('sales_cycle', responses.sales_cycle)}
            />
            <Quick
              label="Preferred channel"
              value={getOptionLabel('comm_channel', responses.comm_channel)}
            />
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

function formatValue(qid: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) {
    return value.map((v) => getOptionLabel(qid, String(v))).join(', ');
  }
  if (typeof value === 'number') return String(value);
  return getOptionLabel(qid, String(value));
}
