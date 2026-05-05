-- Add a `kind` column to submissions and drafts so the same backend can serve
-- multiple intake forms (branding, full strategy, future intakes).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'intake_kind') then
    create type intake_kind as enum ('branding', 'full');
  end if;
end$$;

-- submissions.kind, default 'full' for any existing rows
alter table public.submissions
  add column if not exists kind intake_kind not null default 'full';

create index if not exists idx_submissions_kind on public.submissions (kind);

-- submission_drafts.kind, default 'full' for backwards compat
alter table public.submission_drafts
  add column if not exists kind intake_kind not null default 'full';
