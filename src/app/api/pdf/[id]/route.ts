import { NextResponse } from 'next/server';
import { getSubmission } from '@/lib/db';
import { renderSubmissionPdf } from '@/lib/pdf/render';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const submission = await getSubmission(params.id);
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const buffer = await renderSubmissionPdf({
    responses: submission.responses,
    submittedAt: submission.submitted_at,
    files: submission.files.map((f) => ({ category: f.category, file_name: f.file_name })),
  });

  const slug = submission.business_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="branding-intake-${slug || 'submission'}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
