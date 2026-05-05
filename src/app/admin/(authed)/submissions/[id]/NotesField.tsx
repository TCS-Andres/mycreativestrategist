'use client';
import * as React from 'react';
import { Textarea } from '@/components/ui/Textarea';

export function NotesField({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = React.useState(initial);
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (value === initial) {
      setStatus('idle');
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setStatus('saving');
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/submissions/${id}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: value }),
        });
        setStatus(res.ok ? 'saved' : 'error');
      } catch {
        setStatus('error');
      }
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, id, initial]);

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={6}
        placeholder="Private notes for me only. Nothing here is shown to the client."
      />
      <p className="text-xs text-muted-foreground">
        {status === 'saving' && 'Saving…'}
        {status === 'saved' && 'Saved.'}
        {status === 'error' && 'Could not save. Try again.'}
      </p>
    </div>
  );
}
