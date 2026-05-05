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
  | 'upload';

export type SelectOption = { label: string; value: string };

export type Question = {
  id: string;
  number: number;
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
  category?: 'logo' | 'brand_guide' | 'photography' | 'marketing_materials';
};

export type Section = {
  id: string;
  index: number;
  title: string;
  intro: string;
  questions: Question[];
};

const teamSizes: SelectOption[] = [
  { label: 'Solo', value: 'solo' },
  { label: '2 to 5', value: '2-5' },
  { label: '6 to 20', value: '6-20' },
  { label: '21 to 50', value: '21-50' },
  { label: '51 to 200', value: '51-200' },
  { label: '200+', value: '200+' },
];

const salesCycles: SelectOption[] = [
  { label: 'Same day', value: 'same-day' },
  { label: 'A few days', value: 'few-days' },
  { label: 'A few weeks', value: 'few-weeks' },
  { label: 'One to three months', value: '1-3-months' },
  { label: 'Three plus months', value: '3-plus-months' },
];

const visualFeels: SelectOption[] = [
  { label: 'Minimalist', value: 'minimalist' },
  { label: 'Bold and graphic', value: 'bold-graphic' },
  { label: 'Organic and warm', value: 'organic-warm' },
  { label: 'Editorial and refined', value: 'editorial-refined' },
  { label: 'Playful and energetic', value: 'playful-energetic' },
  { label: 'Tech-forward', value: 'tech-forward' },
  { label: 'Luxurious', value: 'luxurious' },
  { label: 'Earthy', value: 'earthy' },
  { label: 'Retro', value: 'retro' },
  { label: 'Futuristic', value: 'futuristic' },
];

const budgetRanges: SelectOption[] = [
  { label: 'Under 5K', value: 'under-5k' },
  { label: '5K to 15K', value: '5k-15k' },
  { label: '15K to 35K', value: '15k-35k' },
  { label: '35K to 75K', value: '35k-75k' },
  { label: '75K plus', value: '75k-plus' },
  { label: 'Not sure yet', value: 'not-sure' },
];

const commChannels: SelectOption[] = [
  { label: 'Email', value: 'email' },
  { label: 'Slack', value: 'slack' },
  { label: 'Text', value: 'text' },
  { label: 'Phone', value: 'phone' },
  { label: 'Voxer', value: 'voxer' },
  { label: 'Other', value: 'other' },
];

export const SECTIONS: Section[] = [
  {
    id: 'basics',
    index: 1,
    title: 'The Basics',
    intro:
      "Let's start with the essentials. The boring-but-necessary stuff so I know who I'm working with.",
    questions: [
      { id: 'business_name', number: 1, label: 'Business name', kind: 'text', required: true },
      { id: 'contact_name', number: 2, label: 'Primary contact name', kind: 'text', required: true },
      { id: 'role_title', number: 3, label: 'Role or title', kind: 'text', required: true },
      { id: 'contact_email', number: 4, label: 'Email address', kind: 'email', required: true },
      { id: 'contact_phone', number: 5, label: 'Phone number', kind: 'tel', required: false },
      { id: 'website_url', number: 6, label: 'Website URL', kind: 'url', required: false, placeholder: 'https://' },
      { id: 'industry', number: 7, label: 'Industry or category', kind: 'text', required: true },
      { id: 'year_founded', number: 8, label: 'Year founded', kind: 'number', required: true, min: 1800, max: new Date().getFullYear() },
      { id: 'team_size', number: 9, label: 'Team size', kind: 'select', required: true, options: teamSizes },
      {
        id: 'where_you_operate',
        number: 10,
        label: 'Where you operate',
        helper: 'For example, "South Florida and remote nationwide".',
        kind: 'text',
        required: true,
      },
    ],
  },
  {
    id: 'story',
    index: 2,
    title: 'Your Story',
    intro:
      'Every brand worth building has a real story underneath it. This is where I get to know yours.',
    questions: [
      {
        id: 'why_business_exists',
        number: 11,
        label: 'Why does your business exist? What pulled you into this work?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'how_started',
        number: 12,
        label: 'How did the business actually start?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'biggest_problem_solved',
        number: 13,
        label: 'What is the single biggest problem you solve for your customers?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'common_misconception',
        number: 14,
        label: 'What is the most common misconception people have about your industry?',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  {
    id: 'mission_vision_values',
    index: 3,
    title: 'Mission, Vision, and Values',
    intro:
      "If you have these locked in already, share them. If not, give me the raw material and I'll help you shape them later.",
    questions: [
      { id: 'mission', number: 15, label: 'Your mission, in your own words', kind: 'longtext', required: true },
      {
        id: 'vision',
        number: 16,
        label: 'Your long-term vision. Where is this going in five to ten years?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'core_values',
        number: 17,
        label: 'Your core values, listed however feels right',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'stand_against',
        number: 18,
        label: 'What does your brand stand against? What do you refuse to do or be?',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  {
    id: 'audience',
    index: 4,
    title: 'Your Audience',
    intro:
      "I don't believe in 'everyone' as a target. The more specific you can be, the better the strategy gets.",
    questions: [
      {
        id: 'ideal_customer',
        number: 19,
        label: 'Describe your ideal customer in plain language. Who are they?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'demographics',
        number: 20,
        label: 'Demographics (age range, gender, income range, location, role if B2B)',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'psychographics',
        number: 21,
        label: 'Psychographics. What do they value, fear, and aspire to?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'attention_locations',
        number: 22,
        label: 'Where do they spend their attention? (platforms, communities, publications, events)',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'alternatives_chosen',
        number: 23,
        label: 'What do they typically buy or do instead of working with you?',
        kind: 'longtext',
        required: false,
      },
      {
        id: 'one_sentence_in_head',
        number: 24,
        label: 'If you could put one sentence in their head about your brand, what would it be?',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  {
    id: 'offer',
    index: 5,
    title: 'Your Offer',
    intro: "Now let's talk about what you actually sell.",
    questions: [
      {
        id: 'top_three_offers',
        number: 25,
        label: 'List your top three products or services',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'differentiator',
        number: 26,
        label: 'What makes your offer genuinely different from the alternatives?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'price_point',
        number: 27,
        label: 'Typical price point or range',
        kind: 'text',
        required: true,
      },
      {
        id: 'sales_cycle',
        number: 28,
        label: 'Average sales cycle. How long from first touch to closed deal?',
        kind: 'select',
        required: true,
        options: salesCycles,
      },
    ],
  },
  {
    id: 'competition',
    index: 6,
    title: 'The Competitive Landscape',
    intro: 'Knowing the room you’re walking into matters.',
    questions: [
      {
        id: 'top_competitors',
        number: 29,
        label: 'Your top three competitors, with website links if you have them',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'do_better',
        number: 30,
        label: 'What do you do better than they do?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'they_do_better',
        number: 31,
        label: 'What do they do better than you?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'admired_brands',
        number: 32,
        label: 'Three brands you admire, inside or outside your industry, and why',
        kind: 'longtext',
        required: true,
      },
    ],
  },
  {
    id: 'personality',
    index: 7,
    title: 'Brand Personality',
    intro: 'If your brand walked into a room, who would it be?',
    questions: [
      {
        id: 'adjectives_yes',
        number: 33,
        label: 'Five adjectives that describe your brand',
        helper: 'Comma separated.',
        kind: 'text',
        required: true,
      },
      {
        id: 'adjectives_no',
        number: 34,
        label: 'Five adjectives your brand should never be',
        helper: 'Comma separated.',
        kind: 'text',
        required: true,
      },
      {
        id: 'brand_as_person',
        number: 35,
        label: "If your brand were a person, who would they be? Real or fictional, that’s fine.",
        kind: 'longtext',
        required: true,
      },
      {
        id: 'tone_formal_casual',
        number: 36,
        label: 'Tone of voice: very formal to very casual',
        kind: 'slider',
        required: true,
        min: 1,
        max: 10,
        step: 1,
        minLabel: 'Very formal',
        maxLabel: 'Very casual',
      },
      {
        id: 'tone_playful_serious',
        number: 37,
        label: 'Tone of voice: playful to serious',
        kind: 'slider',
        required: true,
        min: 1,
        max: 10,
        step: 1,
        minLabel: 'Playful',
        maxLabel: 'Serious',
      },
      {
        id: 'tone_understated_bold',
        number: 38,
        label: 'Tone of voice: understated to bold',
        kind: 'slider',
        required: true,
        min: 1,
        max: 10,
        step: 1,
        minLabel: 'Understated',
        maxLabel: 'Bold',
      },
    ],
  },
  {
    id: 'visual',
    index: 8,
    title: 'Visual Direction',
    intro: 'Get specific here. Vague references give vague results.',
    questions: [
      {
        id: 'current_colors',
        number: 39,
        label: 'Current brand colors, if any, with hex codes if you know them',
        kind: 'longtext',
        required: false,
      },
      { id: 'colors_love', number: 40, label: 'Colors you love', kind: 'longtext', required: false },
      {
        id: 'colors_avoid',
        number: 41,
        label: "Colors you absolutely don’t want",
        kind: 'longtext',
        required: false,
      },
      {
        id: 'typography_pref',
        number: 42,
        label: 'Typography preferences (serif, sans, modern, classic, etc.)',
        kind: 'longtext',
        required: false,
      },
      {
        id: 'visual_feel',
        number: 43,
        label: 'Overall visual feel',
        helper: 'Pick all that apply.',
        kind: 'multiselect',
        required: true,
        options: visualFeels,
      },
      {
        id: 'reference_brands',
        number: 44,
        label: "Three reference brands or visuals you’d love your brand to feel like, with links",
        kind: 'longtext',
        required: true,
      },
    ],
  },
  {
    id: 'current_state',
    index: 9,
    title: 'Current State',
    intro: 'Honest answers here save us months.',
    questions: [
      {
        id: 'whats_working',
        number: 45,
        label: 'What is currently working about your branding?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'whats_not_working',
        number: 46,
        label: 'What is clearly not working?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'past_rebrand',
        number: 47,
        label: 'Have you attempted a rebrand or redesign before? What happened?',
        kind: 'longtext',
        required: false,
      },
      {
        id: 'customer_feedback',
        number: 48,
        label: 'What feedback do you hear most often from customers about your brand or experience?',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  {
    id: 'goals',
    index: 10,
    title: 'Goals',
    intro: 'Strategy without a destination is just decoration.',
    questions: [
      {
        id: 'top_three_goals',
        number: 49,
        label: 'Top three business goals for the next twelve months',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'engagement_success',
        number: 50,
        label: 'What does success look like at the end of our engagement?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'metrics',
        number: 51,
        label: 'Key metrics you currently track or want to track',
        kind: 'longtext',
        required: false,
      },
      {
        id: 'most_important_outcome',
        number: 52,
        label: 'The single most important outcome you need from this work',
        kind: 'longtext',
        required: true,
      },
    ],
  },
  {
    id: 'logistics',
    index: 11,
    title: 'Logistics',
    intro: 'The practical stuff so we run a smooth project.',
    questions: [
      {
        id: 'timeline',
        number: 53,
        label: 'Desired project timeline or launch date',
        kind: 'text',
        required: true,
      },
      {
        id: 'budget',
        number: 54,
        label: 'Budget range',
        kind: 'select',
        required: true,
        options: budgetRanges,
      },
      {
        id: 'approvers',
        number: 55,
        label: 'Who else is involved in approving creative decisions?',
        kind: 'longtext',
        required: true,
      },
      {
        id: 'comm_channel',
        number: 56,
        label: 'Preferred communication channel',
        kind: 'select',
        required: true,
        options: commChannels,
      },
      {
        id: 'anything_else',
        number: 57,
        label: 'Anything else I should know before we begin?',
        kind: 'longtext',
        required: false,
      },
    ],
  },
  {
    id: 'uploads',
    index: 12,
    title: 'Uploads',
    intro: "Last step. Send me anything that’ll help me get up to speed faster.",
    questions: [
      {
        id: 'files_logo',
        number: 58,
        label: 'Current logo files',
        kind: 'upload',
        required: false,
        accept: ['.png', '.jpg', '.jpeg', '.svg', '.ai', '.pdf'],
        maxSizeMb: 25,
        maxFiles: 10,
        category: 'logo',
      },
      {
        id: 'files_brand_guide',
        number: 59,
        label: 'Existing brand guide, if you have one',
        kind: 'upload',
        required: false,
        accept: ['.pdf', '.docx'],
        maxSizeMb: 50,
        maxFiles: 1,
        category: 'brand_guide',
      },
      {
        id: 'files_photography',
        number: 60,
        label: 'Brand photography or imagery samples',
        kind: 'upload',
        required: false,
        accept: ['.png', '.jpg', '.jpeg', '.pdf'],
        maxSizeMb: 50,
        maxFiles: 10,
        category: 'photography',
      },
      {
        id: 'files_marketing',
        number: 61,
        label: 'Marketing materials, decks, or anything else relevant',
        kind: 'upload',
        required: false,
        accept: ['.pdf', '.docx', '.pptx', '.png', '.jpg', '.jpeg'],
        maxSizeMb: 100,
        maxFiles: 10,
        category: 'marketing_materials',
      },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = SECTIONS.flatMap((s) => s.questions);

export const FILE_QUESTIONS = ALL_QUESTIONS.filter((q) => q.kind === 'upload');

export function getQuestion(id: string) {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

export function getSection(id: string) {
  return SECTIONS.find((s) => s.id === id);
}

export function getOptionLabel(questionId: string, value: string) {
  const q = getQuestion(questionId);
  if (!q?.options) return value;
  return q.options.find((o) => o.value === value)?.label ?? value;
}
