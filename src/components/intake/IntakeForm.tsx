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
import type { IntakeDefinition, IntakeKind, Section } from '@/lib/intakes/types';

const STORAGE_KEY_PREFIX = 'tcs_intake_state_v2_';

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

function storageKey(kind: IntakeKind) {
  return `${STORAGE_KEY_PREFIX}${kind}`;
}

function loadPersisted(kind: IntakeKind): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey(kind));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function savePersisted(kind: IntakeKind, state: PersistedState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(kind), JSON.stringify(state));
  } catch {
    // localStorage full or denied
  }
}

function clearPersisted(kind: IntakeKind) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey(kind));
}

function buildAllDefaults(sections: Section[], responses: Record<string, unknown>) {
  const d: Record<string, unknown> = {};
  for (const section of sections) {
    for (const q of section.questions) {
      if (q.kind === 'upload') continue;
      const v = responses[q.id];
      if (v !== undefined) {
        d[q.id] = v;
      } else if (q.kind === 'multiselect') {
        d[q.id] = [];
      } else if (q.kind === 'slider') {
        d[q.id] = Math.round(((q.min ?? 1) + (q.max ?? 10)) / 2);
      } else if (q.kind === 'boolean') {
        d[q.id] = false;
      } else {
        d[q.id] = '';
      }
    }
  }
  return d;
}

export function IntakeForm({
  intake,
  initial,
}: {
  intake: IntakeDefinition;
  initial?: Partial<PersistedState>;
}) {
  const router = useRouter();
  const sections = intake.sections;
  const fileQuestions = sections.flatMap((s) => s.questions).filter((q) => q.kind === 'upload');

  // Compute the starting state ONCE.
  const initialRef = React.useRef<PersistedState | null>(null);
  if (initialRef.current === null) {
    const persisted = initial && Object.keys(initial).length ? null : loadPersisted(intake.kind);
    initialRef.current = {
      draftId: initial?.draftId ?? persisted?.draftId ?? newDraftId(),
      resumeToken: initial?.resumeToken ?? persisted?.resumeToken,
      resumeEmail: initial?.resumeEmail ?? persisted?.resumeEmail,
      responses: { ...(persisted?.responses ?? {}), ...(initial?.responses ?? {}) },
      files: { ...(persisted?.files ?? {}), ...(initial?.files ?? {}) },
      sectionIndex: initial?.sectionIndex ?? persisted?.sectionIndex ?? 0,
    };
  }
  const initialState = initialRef.current;

  const [sectionIndex, setSectionIndex] = React.useState(initialState.sectionIndex);
  const [files, setFiles] = React.useState<FilesByQuestion>(initialState.files);
  const [resumeToken, setResumeToken] = React.useState<string | undefined>(initialState.resumeToken);
  const [resumeEmail, setResumeEmail] = React.useState<string | undefined>(initialState.resumeEmail);

  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [saveEmail, setSaveEmail] = React.useState(initialState.resumeEmail ?? '');
  const [saveBusinessName, setSaveBusinessName] = React.useState('');
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [saveErrorMsg, setSaveErrorMsg] = React.useState<string | null>(null);
  const [direction, setDirection] = React.useState<1 | -1>(1);

  const currentSection = sections[sectionIndex];
  const isLast = sectionIndex === sections.length - 1;

  const allDefaults = React.useMemo(
    () => buildAllDefaults(sections, initialState.responses),
    [sections, initialState.responses],
  );

  const form = useForm<Record<string, unknown>>({
    defaultValues: allDefaults,
    mode: 'onBlur',
    shouldUnregister: false,
  });

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const subscription = form.watch((values) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        savePersisted(intake.kind, {
          draftId: initialState.draftId,
          resumeToken,
          resumeEmail,
          responses: values as Record<string, unknown>,
          files,
          sectionIndex,
        });
      }, 400);
    });
    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [form, intake.kind, initialState.draftId, resumeToken, resumeEmail, files, sectionIndex]);

  React.useEffect(() => {
    savePersisted(intake.kind, {
      draftId: initialState.draftId,
      resumeToken,
      resumeEmail,
      responses: form.getValues(),
      files,
      sectionIndex,
    });
  }, [sectionIndex, files, resumeToken, resumeEmail, intake.kind, initialState.draftId, form]);

  React.useEffect(() => {
    if (!resumeToken || !resumeEmail) return;
    const id = setInterval(() => {
      const values = form.getValues();
      void fetch('/api/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resumeToken,
          email: resumeEmail,
          kind: intake.kind,
          business_name: (values.business_name as string) ?? '',
          responses: values,
          files,
        }),
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [resumeToken, resumeEmail, files, form, intake.kind]);

  function handleFilesChange(questionId: string, list: UploadedFile[]) {
    setFiles((prev) => ({ ...prev, [questionId]: list }));
  }

  async function goNext() {
    if (currentSection.id === 'uploads') {
      await handleSubmit();
      return;
    }
    const schema = intake.sectionSchemas[currentSection.id];
    const values = form.getValues();
    const result = (
      schema as {
        safeParse: (v: unknown) => {
          success: boolean;
          error?: { issues: Array<{ path: (string | number)[]; message: string }> };
        };
      }
    ).safeParse(values);
    if (!result.success) {
      for (const issue of result.error?.issues ?? []) {
        const path = issue.path[0]?.toString();
        if (path) form.setError(path, { type: 'manual', message: issue.message });
      }
      return;
    }
    form.clearErrors(currentSection.questions.map((q) => q.id));
    setDirection(1);
    setSectionIndex((i) => Math.min(i + 1, sections.length - 1));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goPrev() {
    setDirection(-1);
    setSectionIndex((i) => Math.max(i - 1, 0));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const values = form.getValues();
      const uploaded = fileQuestions.flatMap((q) => files[q.id] ?? []);
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: intake.kind,
          responses: values,
          uploaded_files: uploaded,
          resume_token: resumeToken,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Something went wrong submitting your responses.');
      }
      const data = await res.json();
      clearPersisted(intake.kind);
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
      const values = form.getValues();
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: saveEmail,
          kind: intake.kind,
          business_name: saveBusinessName || (values.business_name as string) || '',
          responses: values,
          files,
          existing_token: resumeToken,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Could not send the resume link.');
      }
      const data = await res.json();
      setResumeToken(data.token as string);
      setResumeEmail(saveEmail);
      setSaveStatus('sent');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setSaveErrorMsg(message);
      setSaveStatus('error');
    }
  }

  return (
    <>
      <ProgressBar sections={sections} currentIndex={sectionIndex} />

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
              <p className="eyebrow">
                Section {currentSection.index} of {sections.length}
              </p>
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
                  intakeKind={intake.kind}
                  control={form.control as never}
                  errors={form.formState.errors}
                  files={files}
                  onFilesChange={handleFilesChange}
                  draftId={initialState.draftId}
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
                  disabled={sectionIndex === 0 || submitting}
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
                  autoComplete="email"
                />
              </Field>
              <Field label="Business name" helper="Optional, helps me recognize the saved draft.">
                <Input
                  value={saveBusinessName}
                  onChange={(e) => setSaveBusinessName(e.target.value)}
                  placeholder=""
                  autoComplete="organization"
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
