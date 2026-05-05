'use client';
import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Field } from '@/components/ui/Field';

interface Initial {
  admin_notification_email: string;
  client_confirmation_subject: string;
  client_confirmation_body: string;
}

export function SettingsForm({ initial }: { initial: Initial }) {
  const [values, setValues] = React.useState(initial);
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  function set<K extends keyof Initial>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
    setStatus('idle');
  }

  async function save() {
    setStatus('saving');
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Could not save settings.');
      }
      setStatus('saved');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setError(message);
      setStatus('error');
    }
  }

  return (
    <div className="surface space-y-8 p-6 sm:p-8">
      <Field label="Admin notification email" required>
        <Input
          type="email"
          value={values.admin_notification_email}
          onChange={(e) => set('admin_notification_email', e.target.value)}
        />
      </Field>
      <Field label="Client confirmation subject" required>
        <Input
          value={values.client_confirmation_subject}
          onChange={(e) => set('client_confirmation_subject', e.target.value)}
        />
      </Field>
      <Field
        label="Client confirmation body"
        helper="Plain text. Renders inside the email template above the Calendly button."
        required
      >
        <Textarea
          rows={6}
          value={values.client_confirmation_body}
          onChange={(e) => set('client_confirmation_body', e.target.value)}
        />
      </Field>

      <div className="flex items-center justify-end gap-3">
        {status === 'saved' && <span className="text-sm text-brand-blue">Saved.</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
        <Button onClick={save} loading={status === 'saving'} disabled={status === 'saving'}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
