import Link from 'next/link';
import { listSubmissions } from '@/lib/db';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDateTime, truncate } from '@/lib/utils';
import type { SubmissionStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STATUS_FILTERS: { value: SubmissionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In Review' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const rawStatus = searchParams.status as SubmissionStatus | 'all' | undefined;
  const status: SubmissionStatus | 'all' = rawStatus ?? 'all';
  const search = searchParams.q?.trim() || undefined;

  const submissions = await listSubmissions({
    status: status !== 'all' ? status : undefined,
    search,
  });

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Inbox</p>
          <h1 className="font-heading text-3xl font-semibold">Submissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
            {search ? ` matching "${search}"` : ''}.
          </p>
        </div>
        <form className="flex items-center gap-2" action="/admin">
          {status !== 'all' && (
            <input type="hidden" name="status" value={status} />
          )}
          <input
            type="search"
            name="q"
            defaultValue={search ?? ''}
            placeholder="Search business or contact"
            className="input-base h-10 w-64 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brand-cream hover:bg-brand-black"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((opt) => {
          const active = (status ?? 'all') === opt.value;
          const params = new URLSearchParams();
          if (opt.value !== 'all') params.set('status', opt.value);
          if (search) params.set('q', search);
          const href = `/admin${params.size ? `?${params.toString()}` : ''}`;
          return (
            <Link
              key={opt.value}
              href={href}
              className={`rounded-full border px-4 py-1.5 text-xs font-heading font-semibold transition ${
                active
                  ? 'border-brand-navy bg-brand-navy text-brand-cream'
                  : 'border-border bg-white text-brand-navy hover:border-brand-navy'
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-border bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-cream/60 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-heading">Business</th>
              <th className="px-5 py-3 font-heading">Contact</th>
              <th className="px-5 py-3 font-heading">Status</th>
              <th className="px-5 py-3 font-heading">Submitted</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  No submissions yet. New ones land here automatically.
                </td>
              </tr>
            )}
            {submissions.map((s) => (
              <tr key={s.id} className="border-t border-border/70 hover:bg-brand-cream/40">
                <td className="px-5 py-4 align-top">
                  <Link
                    href={`/admin/submissions/${s.id}`}
                    className="font-heading font-semibold text-brand-navy hover:text-brand-orange"
                  >
                    {truncate(s.business_name, 60)}
                  </Link>
                </td>
                <td className="px-5 py-4 align-top text-muted-foreground">
                  <div className="text-brand-navy">{s.contact_name}</div>
                  <div className="text-xs">{s.contact_email}</div>
                </td>
                <td className="px-5 py-4 align-top">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-5 py-4 align-top text-muted-foreground">
                  {formatDateTime(s.submitted_at)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/submissions/${s.id}`}
                    className="text-xs font-semibold uppercase tracking-wider text-brand-blue hover:underline"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
