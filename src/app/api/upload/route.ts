import { NextResponse } from 'next/server';
import { getServiceRoleSupabase, STORAGE_BUCKET } from '@/lib/supabase/admin';
import { getIntake, getFileQuestions } from '@/lib/intakes';
import { safeFilename } from '@/lib/utils';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const category = String(formData.get('category') ?? '');
  const draftId = String(formData.get('draftId') ?? '');
  const kind = String(formData.get('kind') ?? '');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  const intake = getIntake(kind);
  if (!intake) {
    return NextResponse.json({ error: 'Unknown intake kind' }, { status: 400 });
  }
  const fileQuestions = getFileQuestions(intake.kind);
  const question = fileQuestions.find((q) => q.category === category);
  if (!question) {
    return NextResponse.json({ error: 'Unknown category for this intake' }, { status: 400 });
  }
  if (!/^draft_[a-z0-9_]{6,40}$/i.test(draftId)) {
    return NextResponse.json({ error: 'Invalid draft id' }, { status: 400 });
  }

  const maxBytes = (question.maxSizeMb ?? 50) * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File exceeds the ${question.maxSizeMb}MB limit.` },
      { status: 400 },
    );
  }

  const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
  if (question.accept && !question.accept.includes(ext)) {
    return NextResponse.json(
      { error: `Unsupported file type. Accepts ${question.accept.join(', ')}.` },
      { status: 400 },
    );
  }

  const supabase = getServiceRoleSupabase();
  const cleanName = safeFilename(file.name);
  const path = `${draftId}/${category}/${Date.now()}-${cleanName}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, bytes, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });
  if (error) {
    console.error('upload failed', { path, message: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    file: {
      category,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
    },
  });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.path !== 'string' || typeof body.draftId !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!body.path.startsWith(`${body.draftId}/`)) {
    return NextResponse.json({ error: 'Path mismatch' }, { status: 400 });
  }
  const supabase = getServiceRoleSupabase();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([body.path]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
