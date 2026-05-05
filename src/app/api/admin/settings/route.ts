import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSetting } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';

const settingsSchema = z.object({
  admin_notification_email: z.string().trim().email(),
  client_confirmation_subject: z.string().trim().min(1).max(200),
  client_confirmation_body: z.string().trim().min(1).max(5000),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
  }

  try {
    await Promise.all([
      updateSetting('admin_notification_email', parsed.data.admin_notification_email),
      updateSetting('client_confirmation_subject', parsed.data.client_confirmation_subject),
      updateSetting('client_confirmation_body', parsed.data.client_confirmation_body),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('settings save failed', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
