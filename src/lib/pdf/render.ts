import 'server-only';
import { renderToBuffer } from '@react-pdf/renderer';
import { SubmissionPdf } from './SubmissionPdf';
import type { IntakeKind } from '@/lib/intakes/types';
import type { SubmissionFile } from '@/lib/types';

export async function renderSubmissionPdf(args: {
  kind: IntakeKind;
  responses: Record<string, unknown>;
  submittedAt: string;
  files?: Pick<SubmissionFile, 'category' | 'file_name'>[];
}) {
  const buffer = await renderToBuffer(SubmissionPdf(args) as never);
  return buffer;
}
