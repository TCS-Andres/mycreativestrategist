// Back-compat shim. New code should import from '@/lib/intakes' directly.
export type { FieldKind, Question, Section, SelectOption } from './intakes/types';
export { INTAKES, getIntake, intakeBySlug } from './intakes';
