import { z } from 'zod';

export const optionalText = z
  .string()
  .trim()
  .optional()
  .or(z.literal('').transform(() => undefined));

export const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

export const longText = (label: string, required: boolean) =>
  required
    ? z
        .string()
        .trim()
        .min(2, `${label} needs a real answer.`)
        .max(8000, 'That is a lot. Please trim to under 8000 characters.')
    : z
        .string()
        .trim()
        .max(8000)
        .optional()
        .or(z.literal('').transform(() => undefined));

export const emailSchema = z.string().trim().email('Please enter a valid email');

/** Permissive: domain or full URL or anything string-like. */
export const websiteSchema = z
  .string()
  .trim()
  .max(300, 'That is too long for a URL.')
  .optional()
  .or(z.literal('').transform(() => undefined));

export const telSchema = z
  .string()
  .trim()
  .max(40)
  .optional()
  .or(z.literal('').transform(() => undefined));

export const yearSchema = z.coerce
  .number({ invalid_type_error: 'Year founded must be a number' })
  .int()
  .gte(1800, 'Year founded looks too far back')
  .lte(new Date().getFullYear(), 'Year founded cannot be in the future');

export const slider = z.coerce.number().int().min(1).max(10);

import type { Section } from './types';

/**
 * Build per-section Zod schemas from the full responses schema.
 * Used so that "Continue" validates only the current section's fields.
 */
export function buildSectionSchemas(
  sections: Section[],
  responsesSchema: z.ZodObject<z.ZodRawShape>,
): Record<string, z.ZodTypeAny> {
  const map: Record<string, z.ZodTypeAny> = {};
  const fullShape = responsesSchema.shape;
  for (const section of sections) {
    if (section.id === 'uploads') continue;
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const q of section.questions) {
      if (fullShape[q.id]) shape[q.id] = fullShape[q.id];
    }
    map[section.id] = z.object(shape);
  }
  return map;
}
