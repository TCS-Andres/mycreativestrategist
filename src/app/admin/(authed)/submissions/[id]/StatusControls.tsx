'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/Select';
import type { SubmissionStatus } from '@/lib/types';

export function StatusControls({
  id,
  status,
  options,
}: {
  id: string;
  status: SubmissionStatus;
  options: { value: SubmissionStatus; label: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function update(value: SubmissionStatus) {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: value }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Select
      value={status}
      onChange={(e) => update(e.target.value as SubmissionStatus)}
      disabled={pending}
      className="h-10 py-1 text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          Mark as {opt.label}
        </option>
      ))}
    </Select>
  );
}
