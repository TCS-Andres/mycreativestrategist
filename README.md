# The Creative Strategist · Branding Intake

A premium, on-brand client intake portal for [The Creative Strategist](https://mycreativestrategist.com). Built with Next.js 14 App Router, Supabase (Postgres + Storage + Auth), Resend, and `@react-pdf/renderer`.

The app has two sides:

1. **Public-facing intake form** – a 12-section wizard with autosave, save-and-resume by email, and file uploads.
2. **Admin dashboard** – password-protected, single-admin view for triaging submissions, downloading branded PDFs, and tracking status.

## What you get out of the box

- Multi-step form wizard with progress bar, animated transitions, and inline Zod validation
- Drag-and-drop file uploads (logo, brand guide, photography, marketing materials)
- Local autosave + server-side draft store with email resume links
- Generated PDF of every submission, attached to the admin notification email
- Resend emails: admin notification (with PDF + signed file links), client confirmation, resume link
- Admin dashboard: list with status filters and search, detail view, status change, internal notes, settings
- Supabase RLS policies so the public can submit but only the admin can read

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS with custom brand tokens |
| Forms | React Hook Form + Zod |
| Database & Storage | Supabase (Postgres + Storage) |
| Auth | Supabase Auth (single admin) |
| Email | Resend with React Email templates |
| PDF | `@react-pdf/renderer` |
| Animation | Framer Motion |
| Hosting | Vercel-ready (Fluid Compute, Node.js runtime) |

---

## Quick start

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com) (or provision via the Vercel Marketplace).

Then in the **SQL Editor**, run the migration:

```bash
supabase/migrations/20260504000000_init.sql
```

This creates:
- `submissions`, `submission_files`, `submission_drafts`, `app_settings` tables
- `submission_status` and `file_category` enums
- A private storage bucket named `submissions`
- Row-level-security policies (public can insert, only the admin email can read)

> **About the admin email check.** The RLS policies compare `auth.jwt() ->> 'email'` against a Postgres setting `app.admin_email`, falling back to `andres@mycreativestrategist.com`. To set it explicitly, run in the SQL editor:
>
> ```sql
> alter database postgres set app.admin_email = 'andres@mycreativestrategist.com';
> ```

### 3. Create the admin user

In Supabase Auth → Users → **Add user** (with email/password). Use the email that matches `ADMIN_ALLOWED_EMAIL` in your env.

### 4. Set up Resend

Create a Resend account, verify your sending domain, and copy the API key.

`RESEND_FROM_EMAIL` should be on a verified domain (e.g. `brand@mycreativestrategist.com`).

### 5. Fill in `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=brand@mycreativestrategist.com

ADMIN_NOTIFICATION_EMAIL=andres@mycreativestrategist.com
ADMIN_ALLOWED_EMAIL=andres@mycreativestrategist.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/andres-hdw/30min
```

### 6. Run the app

```bash
npm run dev
```

Open `http://localhost:3000` for the intake form, `http://localhost:3000/admin/login` to sign in.

---

## Deploying to Vercel

1. Install the CLI if you haven't:

   ```bash
   npm i -g vercel
   ```

2. Link the repo:

   ```bash
   vercel link
   ```

3. Add every variable from `.env.example` to Vercel:

   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add RESEND_API_KEY
   vercel env add RESEND_FROM_EMAIL
   vercel env add ADMIN_NOTIFICATION_EMAIL
   vercel env add ADMIN_ALLOWED_EMAIL
   vercel env add NEXT_PUBLIC_APP_URL
   vercel env add NEXT_PUBLIC_CALENDLY_URL
   ```

4. Deploy:

   ```bash
   vercel deploy
   vercel deploy --prod
   ```

5. Pull env down for local development whenever it changes:

   ```bash
   vercel env pull .env.local
   ```

After deploy, set `NEXT_PUBLIC_APP_URL` to the production URL and redeploy so emails contain the right links.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                      # Landing
│   ├── intake/page.tsx               # The form wizard (server)
│   ├── thank-you/page.tsx            # Confirmation + Calendly embed
│   ├── admin/
│   │   ├── layout.tsx                # Pass-through wrapper
│   │   ├── login/                    # Public login page
│   │   ├── (authed)/                 # Protected area (route group)
│   │   │   ├── layout.tsx            # Header + nav
│   │   │   ├── page.tsx              # Submissions list
│   │   │   ├── submissions/[id]/     # Detail + status + notes
│   │   │   └── settings/             # Settings form
│   ├── api/
│   │   ├── submit/                   # Persists submission + emails
│   │   ├── upload/                   # Server-side file upload
│   │   ├── resume/                   # Save & resume draft + email link
│   │   ├── pdf/[id]/                 # Streams branded PDF
│   │   └── admin/                    # Status, notes, settings updates
├── components/
│   ├── ui/                           # Buttons, inputs, badges, slider
│   └── intake/                       # Form, dropzone, progress bar, logo
├── lib/
│   ├── questions.ts                  # Section + question catalog
│   ├── schema.ts                     # Zod schemas
│   ├── types.ts                      # Shared types + status meta
│   ├── db.ts                         # Supabase server queries
│   ├── supabase/                     # browser/server/admin clients
│   ├── email/templates/              # React Email templates
│   ├── email/send.ts                 # Resend wrapper
│   ├── pdf/SubmissionPdf.tsx         # PDF template
│   └── pdf/render.ts                 # Buffer renderer
└── middleware.ts                     # Admin route protection
supabase/migrations/                  # SQL to run against your project
```

---

## Local testing the full submission flow

1. Sign in to Supabase, run the migration, and confirm the `submissions` bucket exists.
2. Create the admin user.
3. `npm run dev`.
4. Fill out the form (you can advance with valid data on each section). On the Uploads section, drop in a small file or two.
5. Submit. You should see:
   - A row in `submissions` with `status = 'new'`
   - File rows in `submission_files`
   - Files in the storage bucket under `<submission-id>/<category>/...`
   - An email at `ADMIN_NOTIFICATION_EMAIL` with the PDF attached
   - A confirmation email at the address you submitted with
6. Open `/admin/login`, sign in, click into the submission, change status, take notes, download the PDF.

---

## Brand tokens

These are wired into Tailwind under `theme.extend.colors.brand`:

| Token | Hex |
| --- | --- |
| `brand-orange` | `#F28D3D` |
| `brand-orange-deep` | `#E8843C` |
| `brand-navy` | `#1C192A` |
| `brand-black` | `#1A1A1A` |
| `brand-yellow` | `#FCDF09` |
| `brand-blue` | `#2B69D8` |
| `brand-cream` | `#FAF7F2` |
| `brand-gray` | `#E8E4DD` |

Fonts: **Quicksand** (display) and **DM Sans** (body), loaded via `next/font/google`.

If you have logo assets in Google Drive, drop them into `public/brand/` and update `src/components/intake/Logo.tsx` to swap the inline SVG for a real image.

---

## Notes on architecture decisions

- **File uploads use the service role on the server**, not anon writes from the browser. This keeps storage policies simple and gives us validation + size limits in one place.
- **Drafts are stored in `submission_drafts`**, not in `submissions`. Submissions are immutable from the client side; drafts get deleted once promoted.
- **Files are uploaded to a `draft_*/{category}/` path first**, then `move`d into `{submission_id}/{category}/` on submit. If a user abandons mid-flow, their files orphan under their draft id (cheap to clean up later).
- **The PDF is generated on the fly** in two places: at submit time (attached to the admin email) and on demand via `/api/pdf/[id]` from the dashboard. There's no stored PDF file, which keeps everything driven by the source-of-truth row.
- **Middleware enforces auth on `/admin/*`** by checking the Supabase session and the `ADMIN_ALLOWED_EMAIL` env var. The route handlers double-check via `requireAdmin()` so that direct API calls without the cookie also get blocked.

---

## License

Private. © The Creative Strategist.
