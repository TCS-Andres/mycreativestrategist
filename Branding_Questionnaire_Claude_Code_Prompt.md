# Build Brief: The Creative Strategist Branding Intake Portal

## Project Overview

I want you to build a polished, on-brand client intake web application for my business, **The Creative Strategist** (mycreativestrategist.com). This is a structured branding questionnaire that new and prospective clients fill out before our strategy engagement begins. It is the front door of my onboarding process and the foundational input for my signature methodology, so the experience needs to feel premium, considered, and aligned with my brand.

The application has two sides:

1. **A public-facing intake form** that clients complete in one sitting (or save and resume). They answer a multi-section questionnaire and upload supporting files (logo, existing brand guide, marketing samples, reference imagery).
2. **A private admin dashboard** where I (the only admin) can view all submissions, download files, export a clean PDF of any response, and track submission status.

When a client submits, the system also sends me an email notification at andres@mycreativestrategist.com with a summary of the response, the attached files (or signed download links), and a deep link to the full submission in the dashboard.

## Tech Stack (Required)

- **Framework:** Next.js 14+ with the App Router and TypeScript
- **Styling:** Tailwind CSS with custom design tokens for my brand
- **Database & Storage:** Supabase (Postgres for form data, Storage for uploads)
- **Auth:** Supabase Auth for the admin side only (single admin user, email/password). The public form requires no login.
- **Email:** Resend, with a clean React Email template
- **PDF generation:** Use `@react-pdf/renderer` or Puppeteer (your choice based on layout fidelity needs) to produce a branded PDF of any submission
- **Deployment:** Vercel-ready, with environment variables documented in a `.env.example` file
- **Form state:** React Hook Form with Zod validation
- **UI primitives:** shadcn/ui components, customized to my brand

## Brand Guidelines (Apply Throughout)

Use these exact tokens. The application should feel like a premium extension of my brand, not a generic form.

**Colors**
- Brand Orange (primary): `#F28D3D` (with deeper variant `#E8843C`)
- Deep Navy (primary text and dark surfaces): `#1C192A` (with `#1A1A1A` for true black)
- Golden Yellow (accent): `#FCDF09`
- Accent Blue (links and highlights): `#2B69D8`
- Neutrals: a warm off-white `#FAF7F2` for the page background, and a soft gray `#E8E4DD` for borders and dividers

**Typography**
- Primary typeface (headings, eyebrows, CTAs): **Quicksand** (load via `next/font/google`)
- Body typeface (form labels, paragraph text, inputs): **DM Sans** (load via `next/font/google`)

**Voice and Tone**
- Confident, warm, considered. Never corporate or stiff.
- Section intros should feel like a conversation with a strategist, not a tax form.
- Microcopy should be human (use "Tell me about..." not "Please describe...")
- No em dashes anywhere in the UI copy. Use periods, commas, semicolons, or parentheses instead.

**Layout principles**
- Generous whitespace. Form questions breathe.
- One section visible at a time with a sticky progress indicator at the top.
- Smooth transitions between sections (Framer Motion, subtle fades and slides).
- Mobile-first responsive design. The form must be excellent on phones.

## The Questionnaire (Full Content)

The form is organized into twelve sections. Display them as a multi-step wizard with a progress bar showing section X of 12 and the section name. Allow the user to save progress (auto-save to localStorage every few seconds, plus a "Save and continue later" option that emails them a resume link if they provide an email upfront).

Below is every question, grouped by section. Use the exact section titles and intro copy.

### Section 1: The Basics

*Intro copy:* "Let's start with the essentials. The boring-but-necessary stuff so I know who I'm working with."

1. Business name (text, required)
2. Primary contact name (text, required)
3. Role or title (text, required)
4. Email address (email, required)
5. Phone number (tel, optional)
6. Website URL (url, optional)
7. Industry or category (text, required)
8. Year founded (number, required)
9. Team size (single select: Solo, 2 to 5, 6 to 20, 21 to 50, 51 to 200, 200+)
10. Where you operate (text, required, e.g., "South Florida and remote nationwide")

### Section 2: Your Story

*Intro copy:* "Every brand worth building has a real story underneath it. This is where I get to know yours."

11. Why does your business exist? What pulled you into this work? (long text, required)
12. How did the business actually start? (long text, required)
13. What is the single biggest problem you solve for your customers? (long text, required)
14. What is the most common misconception people have about your industry? (long text, optional)

### Section 3: Mission, Vision, and Values

*Intro copy:* "If you have these locked in already, share them. If not, give me the raw material and I'll help you shape them later."

15. Your mission, in your own words (long text, required)
16. Your long-term vision. Where is this going in five to ten years? (long text, required)
17. Your core values, listed however feels right (long text, required)
18. What does your brand stand against? What do you refuse to do or be? (long text, optional)

### Section 4: Your Audience

*Intro copy:* "I don't believe in 'everyone' as a target. The more specific you can be, the better the strategy gets."

19. Describe your ideal customer in plain language. Who are they? (long text, required)
20. Demographics (age range, gender, income range, location, role if B2B) (long text, required)
21. Psychographics. What do they value, fear, and aspire to? (long text, required)
22. Where do they spend their attention? (platforms, communities, publications, events) (long text, required)
23. What do they typically buy or do *instead* of working with you? (long text, optional)
24. If you could put one sentence in their head about your brand, what would it be? (long text, optional)

### Section 5: Your Offer

*Intro copy:* "Now let's talk about what you actually sell."

25. List your top three products or services (long text, required)
26. What makes your offer genuinely different from the alternatives? (long text, required)
27. Typical price point or range (text, required)
28. Average sales cycle. How long from first touch to closed deal? (single select: Same day, A few days, A few weeks, One to three months, Three plus months)

### Section 6: The Competitive Landscape

*Intro copy:* "Knowing the room you're walking into matters."

29. Your top three competitors, with website links if you have them (long text, required)
30. What do you do better than they do? (long text, required)
31. What do they do better than you? (long text, required)
32. Three brands you admire, inside or outside your industry, and why (long text, required)

### Section 7: Brand Personality

*Intro copy:* "If your brand walked into a room, who would it be?"

33. Five adjectives that describe your brand (text, required, comma separated)
34. Five adjectives your brand should never be (text, required, comma separated)
35. If your brand were a person, who would they be? Real or fictional, that's fine. (long text, required)
36. Tone of voice slider, from very formal to very casual (range slider 1 to 10, required)
37. Tone of voice slider, from playful to serious (range slider 1 to 10, required)
38. Tone of voice slider, from understated to bold (range slider 1 to 10, required)

### Section 8: Visual Direction

*Intro copy:* "Get specific here. Vague references give vague results."

39. Current brand colors, if any, with hex codes if you know them (long text, optional)
40. Colors you love (long text, optional)
41. Colors you absolutely don't want (long text, optional)
42. Typography preferences (serif, sans, modern, classic, etc.) (long text, optional)
43. Overall visual feel (multi-select with these options: Minimalist, Bold and graphic, Organic and warm, Editorial and refined, Playful and energetic, Tech-forward, Luxurious, Earthy, Retro, Futuristic)
44. Three reference brands or visuals you'd love your brand to feel like, with links (long text, required)

### Section 9: Current State

*Intro copy:* "Honest answers here save us months."

45. What is currently working about your branding? (long text, required)
46. What is clearly not working? (long text, required)
47. Have you attempted a rebrand or redesign before? What happened? (long text, optional)
48. What feedback do you hear most often from customers about your brand or experience? (long text, optional)

### Section 10: Goals

*Intro copy:* "Strategy without a destination is just decoration."

49. Top three business goals for the next twelve months (long text, required)
50. What does success look like at the end of our engagement? (long text, required)
51. Key metrics you currently track or want to track (long text, optional)
52. The single most important outcome you need from this work (long text, required)

### Section 11: Logistics

*Intro copy:* "The practical stuff so we run a smooth project."

53. Desired project timeline or launch date (text, required)
54. Budget range (single select: Under 5K, 5K to 15K, 15K to 35K, 35K to 75K, 75K plus, Not sure yet)
55. Who else is involved in approving creative decisions? (long text, required)
56. Preferred communication channel (single select: Email, Slack, Text, Phone, Voxer, Other)
57. Anything else I should know before we begin? (long text, optional)

### Section 12: Uploads

*Intro copy:* "Last step. Send me anything that'll help me get up to speed faster."

58. Current logo files (file upload, accept: .png, .jpg, .svg, .ai, .pdf, max 25MB, multiple)
59. Existing brand guide, if you have one (file upload, accept: .pdf, .docx, max 50MB, single)
60. Brand photography or imagery samples (file upload, accept: .png, .jpg, .pdf, max 50MB total, multiple, up to 10 files)
61. Marketing materials, decks, or anything else relevant (file upload, accept: .pdf, .docx, .pptx, .png, .jpg, max 100MB total, multiple, up to 10 files)

## Submission Flow

1. On submit, validate every required field client-side (Zod) and again server-side.
2. Store the response in a `submissions` table in Postgres with all answers as a structured JSON column plus key fields (business_name, contact_name, email, submitted_at, status) as their own columns for easy querying.
3. Upload all files to a Supabase Storage bucket organized by submission ID (e.g., `submissions/{submission_id}/logo/filename.png`).
4. Generate a branded PDF of the submission using the brand colors, fonts, and a clean layout that mirrors the section structure.
5. Send an email to andres@mycreativestrategist.com via Resend that contains:
   - A short summary (business name, contact, top three goals, budget, timeline)
   - The PDF as an attachment
   - Signed download links for each uploaded file (24 hour expiry)
   - A deep link to the full submission in the admin dashboard
6. Send a confirmation email to the client thanking them and letting them know I'll review and reach out within two business days.
7. Show the client a polished thank-you screen with a small calendar embed (Calendly link: https://calendly.com/andres-hdw/30min) inviting them to book a strategy call if they haven't already.

## Admin Dashboard

Protected by Supabase Auth. Only my email (andres@mycreativestrategist.com) can sign in.

**Pages needed:**
- `/admin/login` (email and password sign-in)
- `/admin` (dashboard home with a table of all submissions, sortable and filterable by status, date, and search by business name)
- `/admin/submissions/[id]` (full submission detail view, with every answer formatted cleanly, all uploaded files listed with download buttons and previews where possible, a "Download PDF" button, a "Mark as reviewed" toggle, and an internal notes field that only I see)
- `/admin/settings` (edit my notification email, customize the client confirmation email copy, manage Resend API key reference)

**Submission statuses:** New, In Review, Active Client, Archived. Use color-coded badges aligned with brand tokens.

## Database Schema (Recommended)

Generate the SQL migration files and the corresponding Supabase types. At minimum:

```
submissions
  id (uuid, pk)
  business_name (text)
  contact_name (text)
  contact_email (text)
  contact_phone (text)
  status (enum: new, in_review, active, archived)
  responses (jsonb)
  internal_notes (text, nullable)
  submitted_at (timestamptz, default now)
  reviewed_at (timestamptz, nullable)
  resume_token (text, nullable, for save-and-resume)

submission_files
  id (uuid, pk)
  submission_id (uuid, fk)
  category (enum: logo, brand_guide, photography, marketing_materials)
  file_name (text)
  file_path (text)
  file_size (integer)
  mime_type (text)
  uploaded_at (timestamptz)
```

Set up Row Level Security so the public can insert into `submissions` and `submission_files` but only the authenticated admin can read, update, or delete.

## Public Form UX Details

- The landing screen of the form has a hero with my logo at the top, a warm intro paragraph from me explaining what this questionnaire is and why it matters (write a draft of this copy in my voice, three to four sentences), and a "Begin" button.
- A persistent progress bar at the top shows current section and percent complete.
- Every section has a small intro paragraph (use the intro copy I provided above).
- Long-text fields are textareas with auto-resize and a soft character count (no hard limits except where it would obviously be excessive).
- File upload zones are drag-and-drop with clear file type and size hints, plus a visible list of attached files with the option to remove before submitting.
- Inline validation only fires after the user blurs a field or tries to advance, never as they type.
- The "Save and continue later" feature emails the user a unique resume link tied to their email address.
- The submit button on the final section is prominent, brand orange, with a clear loading state during submission.

## Deliverables

When you're done, give me:
1. The full Next.js project, organized cleanly with components, lib, app router pages, and Supabase types.
2. SQL migration files for the Supabase schema and RLS policies.
3. A `README.md` with setup instructions, environment variables, deployment steps to Vercel, and instructions for connecting Supabase and Resend.
4. A `.env.example` file with every variable I'll need.
5. The React Email templates for both the admin notification and the client confirmation.
6. The PDF template component.
7. Seed data or a way to test a full submission flow locally before deploying.

## Build Order

Do not try to build everything at once. Work in this sequence and check in with me at each milestone:

1. Project scaffolding, brand tokens, and the public form shell with the first three sections
2. The remaining nine sections including file uploads
3. Supabase schema, RLS, and submission persistence
4. Email notifications via Resend (both admin and client emails)
5. PDF generation
6. Admin authentication and dashboard
7. Polish pass: animations, edge cases, loading states, mobile QA
8. Deployment guide and final README

Build this with the same care you'd build a product you were proud to ship. The questionnaire is often a client's first real experience of working with me, so the experience itself is part of the brand.
