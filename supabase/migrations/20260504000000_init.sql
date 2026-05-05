-- Branding intake schema
-- Run this against your Supabase project. Order matters: types, tables, indexes, then RLS.

-- Required extensions
create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type submission_status as enum ('new', 'in_review', 'active', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'file_category') then
    create type file_category as enum ('logo', 'brand_guide', 'photography', 'marketing_materials');
  end if;
end$$;

-- Tables
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  status submission_status not null default 'new',
  responses jsonb not null,
  internal_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  resume_token text unique
);

create index if not exists idx_submissions_submitted_at on public.submissions (submitted_at desc);
create index if not exists idx_submissions_status on public.submissions (status);
create index if not exists idx_submissions_business on public.submissions (lower(business_name));
create index if not exists idx_submissions_resume_token on public.submissions (resume_token);

create table if not exists public.submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  category file_category not null,
  file_name text not null,
  file_path text not null,
  file_size integer not null,
  mime_type text not null,
  uploaded_at timestamptz not null default now()
);

create index if not exists idx_submission_files_submission_id
  on public.submission_files (submission_id);

-- Drafts (server-side store for save-and-resume)
create table if not exists public.submission_drafts (
  id uuid primary key default gen_random_uuid(),
  resume_token text unique not null,
  contact_email text not null,
  business_name text,
  responses jsonb not null,
  uploaded_files jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_drafts_email on public.submission_drafts (lower(contact_email));

-- Settings (single row, key/value)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values
  ('admin_notification_email', to_jsonb(coalesce(current_setting('app.admin_email', true), 'andres@mycreativestrategist.com'))),
  ('client_confirmation_subject', to_jsonb('I received your branding intake'::text)),
  ('client_confirmation_body', to_jsonb(
    'Thank you for taking the time to fill that out. I will review your responses carefully and reach out within two business days with next steps. In the meantime, if you have not already booked a strategy call, the link in this email goes straight to my calendar.'::text))
on conflict (key) do nothing;

-- Trigger: maintain reviewed_at when status changes from new -> in_review
create or replace function public.set_reviewed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status <> old.status and old.status = 'new' and new.reviewed_at is null then
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_submissions_reviewed_at on public.submissions;
create trigger trg_submissions_reviewed_at
before update on public.submissions
for each row
execute function public.set_reviewed_at();

-- Row level security
alter table public.submissions enable row level security;
alter table public.submission_files enable row level security;
alter table public.submission_drafts enable row level security;
alter table public.app_settings enable row level security;

-- Public can insert submissions and files but never read.
-- All reads/updates must go through the authenticated admin or the server using the service role
-- (the service role bypasses RLS).
drop policy if exists "public can insert submissions" on public.submissions;
create policy "public can insert submissions"
on public.submissions for insert
to anon, authenticated
with check (true);

drop policy if exists "public can insert files" on public.submission_files;
create policy "public can insert files"
on public.submission_files for insert
to anon, authenticated
with check (true);

drop policy if exists "public can write drafts" on public.submission_drafts;
create policy "public can write drafts"
on public.submission_drafts for insert
to anon, authenticated
with check (true);

drop policy if exists "public can update own draft" on public.submission_drafts;
create policy "public can update own draft"
on public.submission_drafts for update
to anon, authenticated
using (true)
with check (true);

-- Admin-only reads (single allowed email)
-- The check uses auth.jwt() ->> 'email' so RLS works with Supabase Auth.
drop policy if exists "admin reads submissions" on public.submissions;
create policy "admin reads submissions"
on public.submissions for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') = lower(coalesce(current_setting('app.admin_email', true), 'andres@mycreativestrategist.com'))
);

drop policy if exists "admin updates submissions" on public.submissions;
create policy "admin updates submissions"
on public.submissions for update
to authenticated
using (
  lower(auth.jwt() ->> 'email') = lower(coalesce(current_setting('app.admin_email', true), 'andres@mycreativestrategist.com'))
)
with check (true);

drop policy if exists "admin deletes submissions" on public.submissions;
create policy "admin deletes submissions"
on public.submissions for delete
to authenticated
using (
  lower(auth.jwt() ->> 'email') = lower(coalesce(current_setting('app.admin_email', true), 'andres@mycreativestrategist.com'))
);

drop policy if exists "admin reads files" on public.submission_files;
create policy "admin reads files"
on public.submission_files for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') = lower(coalesce(current_setting('app.admin_email', true), 'andres@mycreativestrategist.com'))
);

drop policy if exists "admin reads settings" on public.app_settings;
create policy "admin reads settings"
on public.app_settings for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') = lower(coalesce(current_setting('app.admin_email', true), 'andres@mycreativestrategist.com'))
);

drop policy if exists "admin updates settings" on public.app_settings;
create policy "admin updates settings"
on public.app_settings for update
to authenticated
using (
  lower(auth.jwt() ->> 'email') = lower(coalesce(current_setting('app.admin_email', true), 'andres@mycreativestrategist.com'))
)
with check (true);

-- Note on Storage: create a bucket named "submissions" (private) in the Supabase dashboard,
-- or run the equivalent via the storage API:
--   insert into storage.buckets (id, name, public) values ('submissions', 'submissions', false);
-- Allow public uploads (anon role) into that bucket and only authenticated admins to read.
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'submissions') then
    insert into storage.buckets (id, name, public) values ('submissions', 'submissions', false);
  end if;
end$$;

drop policy if exists "Public can upload to submissions bucket" on storage.objects;
create policy "Public can upload to submissions bucket"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'submissions');

drop policy if exists "Admin can read submissions bucket" on storage.objects;
create policy "Admin can read submissions bucket"
on storage.objects for select
to authenticated
using (
  bucket_id = 'submissions'
  and lower(auth.jwt() ->> 'email') = lower(coalesce(current_setting('app.admin_email', true), 'andres@mycreativestrategist.com'))
);
