import type { Responses } from './schema';

export type SubmissionStatus = 'new' | 'in_review' | 'active' | 'archived';

export type FileCategory = 'logo' | 'brand_guide' | 'photography' | 'marketing_materials';

export interface SubmissionFile {
  id: string;
  submission_id: string;
  category: FileCategory;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface Submission {
  id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: SubmissionStatus;
  responses: Responses;
  internal_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  resume_token: string | null;
}

export interface SubmissionWithFiles extends Submission {
  files: SubmissionFile[];
}

export const STATUS_META: Record<
  SubmissionStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  new: {
    label: 'New',
    bg: 'bg-brand-yellow/30',
    text: 'text-brand-navy',
    dot: 'bg-brand-yellow',
  },
  in_review: {
    label: 'In Review',
    bg: 'bg-brand-orange/15',
    text: 'text-brand-orange-deep',
    dot: 'bg-brand-orange',
  },
  active: {
    label: 'Active Client',
    bg: 'bg-brand-blue/10',
    text: 'text-brand-blue',
    dot: 'bg-brand-blue',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-brand-gray',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
};

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  logo: 'Logo files',
  brand_guide: 'Brand guide',
  photography: 'Brand photography',
  marketing_materials: 'Marketing materials',
};
