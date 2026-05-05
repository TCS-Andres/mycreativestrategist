import type { z } from 'zod';
import type { IntakeDefinition, IntakeKind, Question } from './types';
import { brandingIntake } from './branding';
import { fullIntake } from './full';

export type { IntakeDefinition, IntakeKind, Question, Section, FieldKind, SelectOption } from './types';

export const INTAKES: Record<IntakeKind, IntakeDefinition> = {
  branding: brandingIntake,
  full: fullIntake,
};

/** Order shown on the intake picker page. */
export const INTAKE_ORDER: IntakeKind[] = ['branding', 'full'];

export function getIntake(kind: string | undefined | null): IntakeDefinition | null {
  if (!kind) return null;
  return INTAKES[kind as IntakeKind] ?? null;
}

export function intakeBySlug(slug: string | undefined | null): IntakeDefinition | null {
  if (!slug) return null;
  return Object.values(INTAKES).find((i) => i.slug === slug) ?? null;
}

export function getAllQuestions(kind: IntakeKind): Question[] {
  return INTAKES[kind].sections.flatMap((s) => s.questions);
}

export function getFileQuestions(kind: IntakeKind): Question[] {
  return getAllQuestions(kind).filter((q) => q.kind === 'upload');
}

export function getOptionLabel(kind: IntakeKind, questionId: string, value: string): string {
  const q = getAllQuestions(kind).find((q) => q.id === questionId);
  if (!q?.options) return value;
  return q.options.find((o) => o.value === value)?.label ?? value;
}

/** Resolve a payload to its intake. The payload is whatever the client posted. */
export function intakeForPayload(kind: unknown): IntakeDefinition | null {
  if (typeof kind !== 'string') return null;
  return getIntake(kind);
}

export function intakeFileCategoryLabel(
  intake: IntakeDefinition,
  category: string,
): string {
  return (
    (intake.fileCategoryLabels?.[category as keyof typeof intake.fileCategoryLabels] as
      | string
      | undefined) ??
    DEFAULT_FILE_CATEGORY_LABELS[category as keyof typeof DEFAULT_FILE_CATEGORY_LABELS] ??
    category
  );
}

export const DEFAULT_FILE_CATEGORY_LABELS = {
  logo: 'Logo files',
  brand_guide: 'Brand guide',
  photography: 'Brand photography',
  marketing_materials: 'Marketing materials',
} as const;

export type IntakeResponses<K extends IntakeKind> = z.infer<
  (typeof INTAKES)[K]['responsesSchema']
>;
