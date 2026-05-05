import { NextResponse } from 'next/server';
import { internalNotesSchema } from '@/lib/schema';
import { updateSubmissionNotes } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = internalNotesSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid notes' }, { status: 400 });
  }

  try {
    await updateSubmissionNotes(params.id, parsed.data.notes);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('notes update failed', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
