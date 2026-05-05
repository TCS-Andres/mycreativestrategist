import type { z } from 'zod';
import type { FileCategory } from '@/lib/types';

export type FieldKind =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'longtext'
  | 'select'
  | 'multiselect'
  | 'slider'
  | 'boolean'
  | 'upload';

export type SelectOption = { label: string; value: string };

export type Question = {
  id: string;
  /** Visible question number. Omit for sub-fields that should not be numbered. */
  number?: number;
  label: string;
  helper?: string;
  kind: FieldKind;
  required: boolean;
  placeholder?: string;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  accept?: string[];
  maxFiles?: number;
  maxSizeMb?: number;
  category?: FileCategory;
  autoComplete?: string;
  /** When set, this field is hidden whenever the named boolean field is true. */
  hideWhen?: string;
};

export type Section = {
  id: string;
  index: number;
  title: string;
  intro: string;
  questions: Question[];
};

export type IntakeKind = 'branding' | 'full';

export interface IntakeDefinition {
  kind: IntakeKind;
  /** Short label shown in admin UI and email subjects. */
  label: string;
  /** Public URL slug under /intake/. */
  slug: string;
  /** Two-line description shown on the intake picker page. */
  description: string;
  /** Estimated time to complete. */
  estimatedMinutes: string;
  /** Section catalog. */
  sections: Section[];
  /** Zod schema for the entire responses payload. */
  responsesSchema: z.ZodTypeAny;
  /** Per-section Zod schemas, used for validate-on-Continue. */
  sectionSchemas: Record<string, z.ZodTypeAny>;
  /** Per-intake override for upload-section labels. */
  fileCategoryLabels?: Partial<Record<FileCategory, string>>;
  /** Optional welcome / hero copy for the intake's first screen. */
  hero?: { eyebrow: string; title: string; body: string[] };
}
