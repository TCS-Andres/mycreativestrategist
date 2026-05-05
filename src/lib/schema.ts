import { z } from 'zod';
import { getIntake, INTAKES } from './intakes';
import type { IntakeKind } from './intakes/types';

export const resumeStartSchema = z.object({
  email: z.string().trim().email(),
  business_name: z.string().trim().min(1),
});

export const resumeFetchSchema = z.object({
  token: z.string().min(8),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const internalNotesSchema = z.object({
  notes: z.string().max(20000),
});

export const statusUpdateSchema = z.object({
  status: z.enum(['new', 'in_review', 'active', 'archived']),
});

/**
 * Validate a submission payload against a known intake. Two-step parse so that
 * the responses schema is selected by `kind`.
 */
export const submissionEnvelopeSchema = z.object({
  kind: z.enum(Object.keys(INTAKES) as [IntakeKind, ...IntakeKind[]]),
  responses: z.record(z.unknown()),
  resume_token: z.string().optional(),
  uploaded_files: z
    .array(
      z.object({
        category: z.enum(['logo', 'brand_guide', 'photography', 'marketing_materials']),
        file_name: z.string(),
        file_path: z.string(),
        file_size: z.number().int().nonnegative(),
        mime_type: z.string(),
      }),
    )
    .max(40),
});

export type SubmissionEnvelope = z.infer<typeof submissionEnvelopeSchema>;

export function validateSubmission(json: unknown):
  | {
      ok: true;
      kind: IntakeKind;
      responses: Record<string, unknown>;
      uploaded_files: SubmissionEnvelope['uploaded_files'];
      resume_token?: string;
    }
  | { ok: false; error: string; issues?: unknown } {
  const envelope = submissionEnvelopeSchema.safeParse(json);
  if (!envelope.success) {
    return { ok: false, error: 'Invalid submission envelope', issues: envelope.error.issues };
  }
  const intake = getIntake(envelope.data.kind);
  if (!intake) return { ok: false, error: 'Unknown intake kind' };
  const responsesParsed = intake.responsesSchema.safeParse(envelope.data.responses);
  if (!responsesParsed.success) {
    return { ok: false, error: 'Invalid responses', issues: responsesParsed.error.issues };
  }
  return {
    ok: true,
    kind: envelope.data.kind,
    responses: responsesParsed.data as Record<string, unknown>,
    uploaded_files: envelope.data.uploaded_files,
    resume_token: envelope.data.resume_token,
  };
}
