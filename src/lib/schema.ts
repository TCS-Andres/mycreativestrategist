import { z } from 'zod';
import { SECTIONS } from './questions';

const optionalText = z.string().trim().optional().or(z.literal('').transform(() => undefined));
const requiredText = (label: string) => z.string().trim().min(1, `${label} is required`);
const longText = (label: string, required: boolean) =>
  required
    ? z
        .string()
        .trim()
        .min(2, `${label} needs a real answer.`)
        .max(8000, 'That is a lot. Please trim to under 8000 characters.')
    : z.string().trim().max(8000).optional().or(z.literal('').transform(() => undefined));

const emailSchema = z.string().trim().email('Please enter a valid email');
// Permissive: accept anything from "mycreativestrategist.com" to "https://...",
// trim down to a sane max length, and treat blanks as undefined.
const websiteSchema = z
  .string()
  .trim()
  .max(300, 'That is too long for a URL.')
  .optional()
  .or(z.literal('').transform(() => undefined));
const telSchema = z
  .string()
  .trim()
  .max(40)
  .optional()
  .or(z.literal('').transform(() => undefined));

const yearSchema = z.coerce
  .number({ invalid_type_error: 'Year founded must be a number' })
  .int()
  .gte(1800, 'Year founded looks too far back')
  .lte(new Date().getFullYear(), 'Year founded cannot be in the future');

const slider = z.coerce.number().int().min(1).max(10);

export const responsesSchema = z.object({
  // Basics
  business_name: requiredText('Business name'),
  contact_name: requiredText('Primary contact name'),
  role_title: requiredText('Role or title'),
  contact_email: emailSchema,
  contact_phone: telSchema,
  website_url: websiteSchema,
  no_website: z.boolean().optional(),
  industry: requiredText('Industry or category'),
  year_founded: yearSchema,
  team_size: z.enum(['solo', '2-5', '6-20', '21-50', '51-200', '200+']),
  where_you_operate: requiredText('Where you operate'),

  // Story
  why_business_exists: longText('Why your business exists', true),
  how_started: longText('How the business started', true),
  biggest_problem_solved: longText('The biggest problem you solve', true),
  common_misconception: longText('Common misconception', false),

  // Mission/Vision/Values
  mission: longText('Mission', true),
  vision: longText('Vision', true),
  core_values: longText('Core values', true),
  stand_against: longText('What you stand against', false),

  // Audience
  ideal_customer: longText('Ideal customer', true),
  demographics: longText('Demographics', true),
  psychographics: longText('Psychographics', true),
  attention_locations: longText('Where they pay attention', true),
  alternatives_chosen: longText('Alternatives chosen', false),
  one_sentence_in_head: longText('One sentence in their head', false),

  // Offer
  top_three_offers: longText('Top three offers', true),
  differentiator: longText('What makes you different', true),
  price_point: requiredText('Typical price point or range'),
  sales_cycle: z.enum(['same-day', 'few-days', 'few-weeks', '1-3-months', '3-plus-months']),

  // Competition
  top_competitors: longText('Top competitors', true),
  do_better: longText('What you do better', true),
  they_do_better: longText('What they do better', true),
  admired_brands: longText('Admired brands', true),

  // Personality
  adjectives_yes: requiredText('Adjectives that describe your brand'),
  adjectives_no: requiredText('Adjectives your brand should never be'),
  brand_as_person: longText('Brand as a person', true),
  tone_formal_casual: slider,
  tone_playful_serious: slider,
  tone_understated_bold: slider,

  // Visual
  current_colors: optionalText,
  colors_love: optionalText,
  colors_avoid: optionalText,
  typography_pref: optionalText,
  visual_feel: z.array(z.string()).min(1, 'Pick at least one'),
  reference_brands: longText('Reference brands', true),

  // Current state
  whats_working: longText('What is working', true),
  whats_not_working: longText('What is not working', true),
  past_rebrand: longText('Past rebrand', false),
  customer_feedback: longText('Customer feedback', false),

  // Goals
  top_three_goals: longText('Top three goals', true),
  engagement_success: longText('Engagement success', true),
  metrics: longText('Metrics', false),
  most_important_outcome: longText('Most important outcome', true),

  // Logistics
  timeline: requiredText('Desired timeline'),
  budget: z.enum(['under-5k', '5k-15k', '15k-35k', '35k-75k', '75k-plus', 'not-sure']),
  approvers: longText('Approvers', true),
  comm_channel: z.enum(['email', 'slack', 'text', 'phone', 'voxer', 'other']),
  anything_else: longText('Anything else', false),
});

export type Responses = z.infer<typeof responsesSchema>;

export const sectionSchemas: Record<string, z.ZodType<unknown>> = (() => {
  const map: Record<string, z.ZodType<unknown>> = {};
  for (const section of SECTIONS) {
    if (section.id === 'uploads') continue;
    const ids = section.questions.map((q) => q.id);
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const id of ids) {
      const fullShape = (responsesSchema as unknown as { shape: Record<string, z.ZodTypeAny> }).shape;
      if (fullShape[id]) shape[id] = fullShape[id];
    }
    map[section.id] = z.object(shape);
  }
  return map;
})();

export const submissionPayloadSchema = z.object({
  responses: responsesSchema,
  resume_token: z.string().optional(),
  uploaded_files: z
    .array(
      z.object({
        category: z.enum(['logo', 'brand_guide', 'photography', 'marketing_materials']),
        file_name: z.string(),
        file_path: z.string(),
        file_size: z.number().int().nonnegative(),
        mime_type: z.string(),
      }),
    )
    .max(40),
});

export type SubmissionPayload = z.infer<typeof submissionPayloadSchema>;

export const resumeStartSchema = z.object({
  email: z.string().trim().email(),
  business_name: z.string().trim().min(1),
});

export const resumeFetchSchema = z.object({
  token: z.string().min(8),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const internalNotesSchema = z.object({
  notes: z.string().max(20000),
});

export const statusUpdateSchema = z.object({
  status: z.enum(['new', 'in_review', 'active', 'archived']),
});
