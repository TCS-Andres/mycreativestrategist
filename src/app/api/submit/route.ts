import { NextResponse } from 'next/server';
import { submissionPayloadSchema } from '@/lib/schema';
import { getServiceRoleSupabase, STORAGE_BUCKET } from '@/lib/supabase/admin';
import { renderSubmissionPdf } from '@/lib/pdf/render';
import { sendAdminNotification, sendClientConfirmation } from '@/lib/email/send';
import { deleteDraft, createSignedUrl, getSettings } from '@/lib/db';
import { getOptionLabel } from '@/lib/questions';
import { FILE_CATEGORY_LABELS } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = submissionPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid submission', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { responses, uploaded_files, resume_token } = parsed.data;
  const supabase = getServiceRoleSupabase() as unknown as {
    from: (table: string) => any;
    storage: ReturnType<typeof getServiceRoleSupabase>['storage'];
  };

  const { data: insertedRaw, error: insertError } = await supabase
    .from('submissions')
    .insert({
      business_name: responses.business_name,
      contact_name: responses.contact_name,
      contact_email: responses.contact_email,
      contact_phone: responses.contact_phone ?? null,
      status: 'new',
      responses,
      resume_token: null,
    })
    .select('id, submitted_at')
    .single();

  if (insertError || !insertedRaw) {
    console.error('insert submission failed', insertError);
    return NextResponse.json(
      { error: insertError?.message ?? 'Could not save submission.' },
      { status: 500 },
    );
  }

  const inserted = insertedRaw as { id: string; submitted_at: string };
  const submissionId: string = inserted.id;
  const submittedAt: string = inserted.submitted_at;

  // Move uploaded files from draft path -> {submission_id}/{category}/{name} so they live with the record
  const persistedFiles: { category: string; file_name: string; file_path: string; file_size: number; mime_type: string }[] = [];
  for (const f of uploaded_files) {
    const newPath = `${submissionId}/${f.category}/${f.file_path.split('/').pop()}`;
    if (newPath !== f.file_path) {
      const { error: moveErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .move(f.file_path, newPath);
      if (moveErr) {
        console.warn('move failed, keeping draft path', moveErr.message);
        persistedFiles.push(f);
        continue;
      }
    }
    persistedFiles.push({ ...f, file_path: newPath });
  }

  if (persistedFiles.length > 0) {
    const { error: filesError } = await supabase.from('submission_files').insert(
      persistedFiles.map((f) => ({
        submission_id: submissionId,
        category: f.category,
        file_name: f.file_name,
        file_path: f.file_path,
        file_size: f.file_size,
        mime_type: f.mime_type,
      })),
    );
    if (filesError) {
      console.error('insert files failed', filesError);
    }
  }

  if (resume_token) {
    try {
      await deleteDraft(resume_token);
    } catch {
      // best-effort
    }
  }

  // Generate the PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderSubmissionPdf({
      responses,
      submittedAt,
      files: persistedFiles.map((f) => ({ category: f.category as never, file_name: f.file_name })),
    });
  } catch (err) {
    console.error('pdf render failed', err);
    pdfBuffer = Buffer.from('PDF rendering failed. See dashboard for full submission.', 'utf-8');
  }

  // Compose email content
  const settings = (await getSettings().catch(() => ({}))) as Record<string, unknown>;
  const adminEmail =
    (settings['admin_notification_email'] as string | undefined) ??
    process.env.ADMIN_NOTIFICATION_EMAIL ??
    'andres@mycreativestrategist.com';
  const subject =
    (settings['client_confirmation_subject'] as string | undefined) ??
    'I received your branding intake';
  const bodyCopy =
    (settings['client_confirmation_body'] as string | undefined) ??
    'Thank you for taking the time to fill that out. I will review your responses carefully and reach out within two business days with next steps.';

  const fileLinks = await Promise.all(
    persistedFiles.map(async (f) => ({
      category: FILE_CATEGORY_LABELS[f.category as keyof typeof FILE_CATEGORY_LABELS] ?? f.category,
      file_name: f.file_name,
      url: await createSignedUrl(f.file_path).catch(() => '#'),
    })),
  );

  const submissionUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/admin/submissions/${submissionId}`;

  // Fire emails. Don't fail the whole submission if either fails — the record is already saved.
  try {
    await sendAdminNotification({
      toEmail: adminEmail,
      businessName: responses.business_name,
      contactName: responses.contact_name,
      contactEmail: responses.contact_email,
      contactPhone: responses.contact_phone ?? undefined,
      topGoals: responses.top_three_goals ?? '',
      budget: getOptionLabel('budget', responses.budget),
      timeline: responses.timeline,
      submissionUrl,
      files: fileLinks,
      pdfBuffer,
    });
  } catch (err) {
    console.error('admin email failed', err);
  }

  try {
    await sendClientConfirmation({
      toEmail: responses.contact_email,
      subject,
      contactName: responses.contact_name,
      businessName: responses.business_name,
      bodyCopy,
      calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/andres-hdw/30min',
    });
  } catch (err) {
    console.error('client email failed', err);
  }

  return NextResponse.json({ id: submissionId });
}
