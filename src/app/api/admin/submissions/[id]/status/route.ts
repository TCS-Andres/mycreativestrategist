import { NextResponse } from 'next/server';
import { statusUpdateSchema } from '@/lib/schema';
import { updateSubmissionStatus } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = statusUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    await updateSubmissionStatus(params.id, parsed.data.status);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('status update failed', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
