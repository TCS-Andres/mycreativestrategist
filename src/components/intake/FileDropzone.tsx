'use client';
import * as React from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { cn, formatBytes } from '@/lib/utils';
import type { FileCategory } from '@/lib/types';

export interface UploadedFile {
  category: FileCategory;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
}

export interface FileDropzoneProps {
  category: FileCategory;
  accept: string[];
  maxFiles: number;
  maxSizeMb: number;
  files: UploadedFile[];
  submissionDraftId: string;
  onChange: (files: UploadedFile[]) => void;
  label: string;
}

export function FileDropzone({
  category,
  accept,
  maxFiles,
  maxSizeMb,
  files,
  submissionDraftId,
  onChange,
  label,
}: FileDropzoneProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const acceptMap = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const ext of accept) map[`*/${ext.replace('.', '')}`] = [ext];
    return map;
  }, [accept]);

  const onDrop = React.useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected.length) {
        setError(rejected[0]?.errors[0]?.message ?? 'That file was rejected.');
        return;
      }
      if (files.length + accepted.length > maxFiles) {
        setError(`Up to ${maxFiles} file${maxFiles === 1 ? '' : 's'} for this section.`);
        return;
      }
      setUploading(true);
      try {
        const next: UploadedFile[] = [...files];
        for (const file of accepted) {
          const formData = new FormData();
          formData.set('file', file);
          formData.set('category', category);
          formData.set('draftId', submissionDraftId);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j.error ?? 'Upload failed.');
          }
          const data = await res.json();
          next.push(data.file as UploadedFile);
        }
        onChange(next);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed.';
        setError(message);
      } finally {
        setUploading(false);
      }
    },
    [files, maxFiles, category, submissionDraftId, onChange],
  );

  const removeFile = async (file: UploadedFile) => {
    setError(null);
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.file_path, draftId: submissionDraftId }),
      });
    } catch {
      // best-effort delete
    }
    onChange(files.filter((f) => f.file_path !== file.file_path));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptMap,
    maxSize: maxSizeMb * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed bg-white px-6 py-10 text-center transition',
          isDragActive
            ? 'border-brand-orange bg-brand-orange/5'
            : 'border-border hover:border-brand-orange/60',
          uploading && 'opacity-70',
        )}
      >
        <input {...getInputProps()} />
        <p className="font-heading text-base font-semibold text-brand-navy">
          {isDragActive ? 'Drop them here' : `Drop ${label.toLowerCase()} here, or click to browse`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Accepts {accept.join(', ')} · up to {maxSizeMb}MB each · max {maxFiles} file
          {maxFiles === 1 ? '' : 's'}
        </p>
        {uploading && (
          <p className="mt-3 text-sm font-medium text-brand-orange">Uploading…</p>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.file_path}
              className="flex items-center justify-between rounded-md border border-border bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold text-brand-navy">
                  {f.file_name}
                </p>
                <p className="text-xs text-muted-foreground">{formatBytes(f.file_size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(f)}
                className="ml-4 text-xs font-semibold uppercase tracking-wider text-destructive hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
