import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { upsertDraft, getDraftByToken } from '@/lib/db';
import { sendResumeLink } from '@/lib/email/send';
import { getIntake } from '@/lib/intakes';

export const runtime = 'nodejs';

function newToken() {
  return randomBytes(24).toString('base64url');
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== 'string' || !body.responses || typeof body.kind !== 'string') {
    return NextResponse.json({ error: 'Missing email, kind, or responses' }, { status: 400 });
  }
  const intake = getIntake(body.kind);
  if (!intake) {
    return NextResponse.json({ error: 'Unknown intake kind' }, { status: 400 });
  }
  const email = body.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  const token = typeof body.existing_token === 'string' && body.existing_token.length >= 8
    ? body.existing_token
    : newToken();

  try {
    await upsertDraft({
      resume_token: token,
      kind: intake.kind,
      contact_email: email,
      business_name: typeof body.business_name === 'string' ? body.business_name : undefined,
      responses: body.responses,
      uploaded_files: body.files ?? {},
    });
    await sendResumeLink({
      to: email,
      token,
      intakeSlug: intake.slug,
      intakeLabel: intake.label,
      businessName: typeof body.business_name === 'string' ? body.business_name : undefined,
    });
    return NextResponse.json({ token });
  } catch (err: unknown) {
    console.error('resume save failed', err);
    const message = err instanceof Error ? err.message : 'Unable to save your draft.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Periodic autosave from the form (no email).
export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.token !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.kind !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const intake = getIntake(body.kind);
  if (!intake) {
    return NextResponse.json({ error: 'Unknown intake kind' }, { status: 400 });
  }
  try {
    await upsertDraft({
      resume_token: body.token,
      kind: intake.kind,
      contact_email: body.email.trim().toLowerCase(),
      business_name: typeof body.business_name === 'string' ? body.business_name : undefined,
      responses: body.responses ?? {},
      uploaded_files: body.files ?? {},
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('resume autosave failed', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false }, { status: 400 });
  const draft = await getDraftByToken(token);
  return NextResponse.json({ valid: !!draft, kind: (draft as { kind?: string } | null)?.kind ?? null });
}
