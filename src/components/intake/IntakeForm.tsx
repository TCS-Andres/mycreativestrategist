'use client';
import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { ProgressBar } from './ProgressBar';
import { QuestionField } from './QuestionField';
import type { UploadedFile } from './FileDropzone';
import { SECTIONS, FILE_QUESTIONS } from '@/lib/questions';
import { sectionSchemas } from '@/lib/schema';

const STORAGE_KEY = 'tcs_intake_state_v1';

type FilesByQuestion = Record<string, UploadedFile[]>;

interface PersistedState {
  draftId: string;
  resumeToken?: string;
  resumeEmail?: string;
  responses: Record<string, unknown>;
  files: FilesByQuestion;
  sectionIndex: number;
}

function newDraftId() {
  return (
    'draft_' +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-4)
  );
}

function loadPersisted(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function savePersisted(state: PersistedState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or denied
  }
}

function clearPersisted() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function IntakeForm({ initial }: { initial?: Partial<PersistedState> }) {
  const router = useRouter();
  const [state, setState] = React.useState<PersistedState>(() => {
    const persisted = initial && Object.keys(initial).length ? null : loadPersisted();
    return {
      draftId: initial?.draftId ?? persisted?.draftId ?? newDraftId(),
      resumeToken: initial?.resumeToken ?? persisted?.resumeToken,
      resumeEmail: initial?.resumeEmail ?? persisted?.resumeEmail,
      responses: { ...(persisted?.responses ?? {}), ...(initial?.responses ?? {}) },
      files: { ...(persisted?.files ?? {}), ...(initial?.files ?? {}) },
      sectionIndex: initial?.sectionIndex ?? persisted?.sectionIndex ?? 0,
    };
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [saveEmail, setSaveEmail] = React.useState(state.resumeEmail ?? '');
  const [saveBusinessName, setSaveBusinessName] = React.useState('');
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [saveErrorMsg, setSaveErrorMsg] = React.useState<string | null>(null);
  const [direction, setDirection] = React.useState<1 | -1>(1);

  const currentSection = SECTIONS[state.sectionIndex];
  const isLast = state.sectionIndex === SECTIONS.length - 1;

  const sectionDefaults = React.useMemo(() => {
    const init: Record<string, unknown> = {};
    for (const q of currentSection.questions) {
      if (q.kind === 'upload') continue;
      const v = state.responses[q.id];
      if (v !== undefined) {
        init[q.id] = v;
      } else if (q.kind === 'multiselect') {
        init[q.id] = [];
      } else if (q.kind === 'slider') {
        init[q.id] = Math.round(((q.min ?? 1) + (q.max ?? 10)) / 2);
      } else {
        init[q.id] = '';
      }
    }
    return init;
  }, [currentSection, state.responses]);

  const form = useForm<Record<string, unknown>>({
    defaultValues: sectionDefaults,
    mode: 'onBlur',
  });

  React.useEffect(() => {
    form.reset(sectionDefaults);
  }, [sectionDefaults, form]);

  // autosave to localStorage every 3 seconds while values change
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      setState((prev) => {
        const next: PersistedState = {
          ...prev,
          responses: { ...prev.responses, ...(values as Record<string, unknown>) },
        };
        savePersisted(next);
        return next;
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // periodically push draft to server when we have a resume token
  React.useEffect(() => {
    if (!state.resumeToken || !state.resumeEmail) return;
    const id = setInterval(() => {
      void fetch('/api/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: state.resumeToken,
          email: state.resumeEmail,
          business_name: state.responses.business_name ?? '',
          responses: state.responses,
          files: state.files,
        }),
      }).catch(() => {});
    }, 12000);
    return () => clearInterval(id);
  }, [state.resumeToken, state.resumeEmail, state.responses, state.files]);

  function handleFilesChange(questionId: string, files: UploadedFile[]) {
    setState((prev) => {
      const next: PersistedState = {
        ...prev,
        files: { ...prev.files, [questionId]: files },
      };
      savePersisted(next);
      return next;
    });
  }

  async function goNext() {
    if (currentSection.id !== 'uploads') {
      const schema = sectionSchemas[currentSection.id];
      const values = form.getValues();
      const result = (schema as { safeParse: (v: unknown) => { success: boolean; error?: { issues: Array<{ path: (string | number)[]; message: string }> }; data?: unknown } }).safeParse(values);
      if (!result.success) {
        for (const issue of result.error?.issues ?? []) {
          const path = issue.path[0]?.toString();
          if (path) form.setError(path, { type: 'manual', message: issue.message });
        }
        return;
      }
      setState((prev) => {
        const next: PersistedState = {
          ...prev,
          responses: { ...prev.responses, ...(values as Record<string, unknown>) },
          sectionIndex: Math.min(prev.sectionIndex + 1, SECTIONS.length - 1),
        };
        savePersisted(next);
        return next;
      });
    } else {
      await handleSubmit();
      return;
    }
    setDirection(1);
  }

  function goPrev() {
    setDirection(-1);
    setState((prev) => {
      const next: PersistedState = {
        ...prev,
        sectionIndex: Math.max(prev.sectionIndex - 1, 0),
      };
      savePersisted(next);
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const uploaded = FILE_QUESTIONS.flatMap((q) => state.files[q.id] ?? []);
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: state.responses,
          uploaded_files: uploaded,
          resume_token: state.resumeToken,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Something went wrong submitting your responses.');
      }
      const data = await res.json();
      clearPersisted();
      router.push(`/thank-you?id=${data.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed.';
      setSubmitError(message);
      setSubmitting(false);
    }
  }

  async function handleSaveAndContinue() {
    setSaveErrorMsg(null);
    setSaveStatus('sending');
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: saveEmail,
          business_name: saveBusinessName || state.responses.business_name || '',
          responses: state.responses,
          files: state.files,
          existing_token: state.resumeToken,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Could not send the resume link.');
      }
      const data = await res.json();
      setState((prev) => {
        const next = { ...prev, resumeToken: data.token as string, resumeEmail: saveEmail };
        savePersisted(next);
        return next;
      });
      setSaveStatus('sent');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setSaveErrorMsg(message);
      setSaveStatus('error');
    }
  }

  return (
    <>
      <ProgressBar currentIndex={state.sectionIndex} />

      <div className="container max-w-3xl py-10 sm:py-16">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.section
            key={currentSection.id}
            custom={direction}
            initial={{ opacity: 0, y: direction > 0 ? 24 : -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction > 0 ? -16 : 16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-10"
          >
            <header className="space-y-3">
              <p className="eyebrow">Section {currentSection.index} of {SECTIONS.length}</p>
              <h2 className="text-3xl font-semibold sm:text-4xl">{currentSection.title}</h2>
              <p className="max-w-2xl text-base leading-relaxed text-brand-navy/80">
                {currentSection.intro}
              </p>
            </header>

            <div className="surface space-y-8 p-6 sm:p-10">
              {currentSection.questions.map((q) => (
                <QuestionField
                  key={q.id}
                  question={q}
                  control={form.control as never}
                  errors={form.formState.errors}
                  files={state.files}
                  onFilesChange={handleFilesChange}
                  draftId={state.draftId}
                />
              ))}
            </div>

            {submitError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {submitError}
              </p>
            )}

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goPrev}
                  disabled={state.sectionIndex === 0 || submitting}
                >
                  Back
                </Button>
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(true)}
                  className="font-heading text-sm font-semibold text-brand-blue hover:underline"
                >
                  Save and continue later
                </button>
              </div>
              <Button
                type="button"
                onClick={goNext}
                size="lg"
                loading={submitting}
                disabled={submitting}
              >
                {isLast ? 'Submit my responses' : 'Continue'}
              </Button>
            </div>
          </motion.section>
        </AnimatePresence>
      </div>

      {showSaveDialog && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-brand-navy/40 p-4 sm:items-center"
          onClick={() => setShowSaveDialog(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-soft"
          >
            <h3 className="font-heading text-xl font-semibold">Save your progress</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              I’ll email you a private link so you can pick up exactly where you left off.
            </p>
            <div className="mt-5 space-y-4">
              <Field label="Your email" required>
                <Input
                  type="email"
                  value={saveEmail}
                  onChange={(e) => setSaveEmail(e.target.value)}
                  placeholder="you@business.com"
                />
              </Field>
              <Field label="Business name" helper="Optional, helps me recognize the saved draft.">
                <Input
                  value={saveBusinessName}
                  onChange={(e) => setSaveBusinessName(e.target.value)}
                  placeholder=""
                />
              </Field>
              {saveErrorMsg && <p className="text-xs text-destructive">{saveErrorMsg}</p>}
              {saveStatus === 'sent' ? (
                <div className="rounded-md bg-brand-yellow/30 p-4 text-sm text-brand-navy">
                  Sent. Check your inbox for the resume link.
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSaveDialog(false)}
                    className="font-heading text-sm font-semibold text-brand-navy hover:underline"
                  >
                    Cancel
                  </button>
                  <Button
                    type="button"
                    onClick={handleSaveAndContinue}
                    loading={saveStatus === 'sending'}
                    disabled={!saveEmail.includes('@')}
                  >
                    Email me the link
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
