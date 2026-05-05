import * as React from 'react';
import { cn } from '@/lib/utils';
import { STATUS_META, type SubmissionStatus } from '@/lib/types';

export function StatusBadge({ status, className }: { status: SubmissionStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 font-heading text-xs font-semibold',
        meta.bg,
        meta.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}
