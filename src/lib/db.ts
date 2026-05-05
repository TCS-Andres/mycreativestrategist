import 'server-only';
import { getServiceRoleSupabase, STORAGE_BUCKET } from './supabase/admin';
import type { Submission, SubmissionFile, SubmissionStatus, SubmissionWithFiles } from './types';

// Supabase generic types resolve to `never` without generated types, so we narrow
// at the call site rather than fighting the generics in every function.
function db(): any {
  return getServiceRoleSupabase();
}
function storage() {
  return getServiceRoleSupabase().storage;
}

export async function listSubmissions(opts?: {
  status?: SubmissionStatus;
  kind?: string;
  search?: string;
  limit?: number;
}) {
  const supabase = db();
  let query = supabase
    .from('submissions')
    .select('id, kind, business_name, contact_name, contact_email, status, submitted_at, reviewed_at')
    .order('submitted_at', { ascending: false })
    .limit(opts?.limit ?? 200);

  if (opts?.status) query = query.eq('status', opts.status);
  if (opts?.kind) query = query.eq('kind', opts.kind);
  if (opts?.search) {
    const term = `%${opts.search}%`;
    query = query.or(`business_name.ilike.${term},contact_name.ilike.${term},contact_email.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Pick<
    Submission,
    'id' | 'kind' | 'business_name' | 'contact_name' | 'contact_email' | 'status' | 'submitted_at' | 'reviewed_at'
  >[];
}

export async function getSubmission(id: string): Promise<SubmissionWithFiles | null> {
  const supabase = db();
  const { data: sub, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!sub) return null;

  const { data: files, error: fileErr } = await supabase
    .from('submission_files')
    .select('*')
    .eq('submission_id', id)
    .order('uploaded_at', { ascending: true });
  if (fileErr) throw fileErr;

  return { ...(sub as Submission), files: (files ?? []) as SubmissionFile[] };
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  const supabase = db();
  const { error } = await supabase
    .from('submissions')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function updateSubmissionNotes(id: string, notes: string) {
  const supabase = db();
  const { error } = await supabase
    .from('submissions')
    .update({ internal_notes: notes })
    .eq('id', id);
  if (error) throw error;
}

export async function createSignedUrl(path: string, expiresInSeconds = 60 * 60 * 24) {
  const { data, error } = await storage()
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function getSettings() {
  const supabase = db();
  const { data, error } = await supabase.from('app_settings').select('*');
  if (error) throw error;
  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) settings[row.key as string] = row.value;
  return settings;
}

export async function updateSetting(key: string, value: unknown) {
  const supabase = db();
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getDraftByToken(token: string) {
  const supabase = db();
  const { data, error } = await supabase
    .from('submission_drafts')
    .select('*')
    .eq('resume_token', token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertDraft(input: {
  resume_token: string;
  kind: string;
  contact_email: string;
  business_name?: string;
  responses: unknown;
  uploaded_files: unknown;
}) {
  const supabase = db();
  const { error } = await supabase
    .from('submission_drafts')
    .upsert(
      {
        resume_token: input.resume_token,
        kind: input.kind,
        contact_email: input.contact_email,
        business_name: input.business_name,
        responses: input.responses,
        uploaded_files: input.uploaded_files,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'resume_token' },
    );
  if (error) throw error;
}

export async function deleteDraft(token: string) {
  const supabase = db();
  const { error } = await supabase
    .from('submission_drafts')
    .delete()
    .eq('resume_token', token);
  if (error) throw error;
}
