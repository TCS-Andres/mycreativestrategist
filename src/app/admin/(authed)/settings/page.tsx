import { getSettings } from '@/lib/db';
import { SettingsForm } from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="container max-w-3xl py-10">
      <p className="eyebrow mb-2">Settings</p>
      <h1 className="font-heading text-3xl font-semibold">Notifications and copy</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Edit where new submissions are emailed and what the client confirmation says.
      </p>

      <div className="mt-8">
        <SettingsForm
          initial={{
            admin_notification_email:
              (settings.admin_notification_email as string | undefined) ??
              process.env.ADMIN_NOTIFICATION_EMAIL ??
              '',
            client_confirmation_subject:
              (settings.client_confirmation_subject as string | undefined) ??
              'I received your branding intake',
            client_confirmation_body:
              (settings.client_confirmation_body as string | undefined) ??
              '',
          }}
        />
      </div>

      <div className="mt-12 rounded-md border border-border bg-white p-5 text-sm text-muted-foreground">
        <p className="font-heading font-semibold text-brand-navy">Resend API key</p>
        <p className="mt-1">
          The API key lives in Vercel as an environment variable named{' '}
          <code className="rounded bg-brand-cream px-1.5 py-0.5 text-brand-navy">RESEND_API_KEY</code>.
          Update it in the Vercel dashboard or with{' '}
          <code className="rounded bg-brand-cream px-1.5 py-0.5 text-brand-navy">vercel env add</code>{' '}
          and redeploy. Keys are never exposed to the browser.
        </p>
      </div>
    </div>
  );
}
