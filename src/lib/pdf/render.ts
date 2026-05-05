import 'server-only';
import { renderToBuffer } from '@react-pdf/renderer';
import { SubmissionPdf } from './SubmissionPdf';
import type { Responses } from '@/lib/schema';
import type { SubmissionFile } from '@/lib/types';

export async function renderSubmissionPdf(args: {
  responses: Responses;
  submittedAt: string;
  files?: Pick<SubmissionFile, 'category' | 'file_name'>[];
}) {
  const buffer = await renderToBuffer(SubmissionPdf(args) as never);
  return buffer;
}
