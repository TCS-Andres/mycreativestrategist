import 'server-only';
import { Resend } from 'resend';
import AdminNotificationEmail, {
  type AdminNotificationProps,
} from './templates/AdminNotificationEmail';
import ClientConfirmationEmail, {
  type ClientConfirmationProps,
} from './templates/ClientConfirmationEmail';
import ResumeLinkEmail from './templates/ResumeLinkEmail';

let resendClient: Resend | null = null;
function resend() {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  resendClient = new Resend(key);
  return resendClient;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function sendAdminNotification(
  args: AdminNotificationProps & { pdfBuffer: Buffer; toEmail: string },
) {
  const { pdfBuffer, toEmail, ...props } = args;
  return resend().emails.send({
    from: FROM,
    to: [toEmail],
    subject: `New branding intake · ${props.businessName}`,
    react: AdminNotificationEmail(props),
    attachments: [
      {
        filename: `branding-intake-${slug(props.businessName)}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

export async function sendClientConfirmation(
  args: ClientConfirmationProps & { toEmail: string; subject: string },
) {
  const { toEmail, subject, ...props } = args;
  return resend().emails.send({
    from: FROM,
    to: [toEmail],
    subject,
    react: ClientConfirmationEmail(props),
  });
}

export async function sendResumeLink(args: { to: string; token: string; businessName?: string }) {
  const url = `${APP_URL}/intake?resume=${encodeURIComponent(args.token)}`;
  return resend().emails.send({
    from: FROM,
    to: [args.to],
    subject: 'Your branding intake — pick up where you left off',
    react: ResumeLinkEmail({ resumeUrl: url, businessName: args.businessName }),
  });
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);
}
