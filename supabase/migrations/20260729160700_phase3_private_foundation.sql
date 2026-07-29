-- DeAddict Phase 3 private-data foundation.
-- DRAFT ONLY: do not apply to a live project without the Phase 3 deployment review.

begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.prevent_user_id_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'user_id is immutable';
  end if;
  return new;
end;
$$;

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timezone_name text not null default 'UTC' check (char_length(timezone_name) between 1 and 64),
  discreet_mode boolean not null default true,
  notifications_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_key text not null check (document_key in ('privacy', 'terms', 'sensitive_data')),
  document_version text not null check (char_length(document_version) between 1 and 32),
  decision text not null check (decision in ('accepted', 'withdrawn')),
  decided_at timestamptz not null default timezone('utc', now()),
  unique (user_id, document_key, document_version, decided_at)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_slug text not null check (category_slug in ('alcohol', 'nicotine', 'digital', 'gambling', 'compulsive', 'other')),
  approach text not null check (approach in ('understand', 'reduce', 'stop', 'unsure')),
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  start_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, user_id)
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  occurred_on date not null,
  mood_score smallint check (mood_score between 0 and 10),
  urge_score smallint check (urge_score between 0 and 10),
  behavior_occurred boolean,
  trigger_code text check (trigger_code is null or char_length(trigger_code) between 1 and 40),
  coping_code text check (coping_code is null or char_length(coping_code) between 1 and 40),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint checkins_goal_owner_fk
    foreign key (goal_id, user_id)
    references public.goals(id, user_id)
    on delete cascade,
  unique (user_id, goal_id, occurred_on)
);

create table public.export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'processing', 'ready', 'expired', 'failed')),
  requested_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  expires_at timestamptz,
  check (completed_at is null or completed_at >= requested_at),
  check (expires_at is null or expires_at >= requested_at)
);

create table public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'processing', 'completed', 'failed', 'cancelled')),
  requested_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  check (completed_at is null or completed_at >= requested_at)
);

create index consent_records_user_id_idx on public.consent_records(user_id, decided_at desc);
create index goals_user_id_idx on public.goals(user_id, created_at desc);
create index checkins_user_date_idx on public.checkins(user_id, occurred_on desc);
create index checkins_goal_id_idx on public.checkins(goal_id, occurred_on desc);
create index export_requests_user_id_idx on public.export_requests(user_id, requested_at desc);
create index deletion_requests_user_id_idx on public.deletion_requests(user_id, requested_at desc);

create unique index export_requests_one_open_per_user_idx
on public.export_requests(user_id)
where status in ('requested', 'processing', 'ready');

create unique index deletion_requests_one_open_per_user_idx
on public.deletion_requests(user_id)
where status in ('requested', 'processing');

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

create trigger checkins_set_updated_at
before update on public.checkins
for each row execute function public.set_updated_at();

create trigger user_profiles_prevent_owner_change
before update on public.user_profiles
for each row execute function public.prevent_user_id_change();

create trigger goals_prevent_owner_change
before update on public.goals
for each row execute function public.prevent_user_id_change();

create trigger checkins_prevent_owner_change
before update on public.checkins
for each row execute function public.prevent_user_id_change();

create trigger consent_records_prevent_owner_change
before update on public.consent_records
for each row execute function public.prevent_user_id_change();

create trigger export_requests_prevent_owner_change
before update on public.export_requests
for each row execute function public.prevent_user_id_change();

create trigger deletion_requests_prevent_owner_change
before update on public.deletion_requests
for each row execute function public.prevent_user_id_change();

alter table public.user_profiles enable row level security;
alter table public.user_profiles force row level security;
alter table public.consent_records enable row level security;
alter table public.consent_records force row level security;
alter table public.goals enable row level security;
alter table public.goals force row level security;
alter table public.checkins enable row level security;
alter table public.checkins force row level security;
alter table public.export_requests enable row level security;
alter table public.export_requests force row level security;
alter table public.deletion_requests enable row level security;
alter table public.deletion_requests force row level security;

revoke all on table public.user_profiles from anon, authenticated;
revoke all on table public.consent_records from anon, authenticated;
revoke all on table public.goals from anon, authenticated;
revoke all on table public.checkins from anon, authenticated;
revoke all on table public.export_requests from anon, authenticated;
revoke all on table public.deletion_requests from anon, authenticated;

grant select, insert, update, delete on table public.user_profiles to authenticated;
grant select, insert on table public.consent_records to authenticated;
grant select, insert, update, delete on table public.goals to authenticated;
grant select, insert, update, delete on table public.checkins to authenticated;
grant select, insert on table public.export_requests to authenticated;
grant select, insert on table public.deletion_requests to authenticated;

create policy user_profiles_select_own on public.user_profiles
for select to authenticated
using ((select auth.uid()) = user_id);

create policy user_profiles_insert_own on public.user_profiles
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy user_profiles_update_own on public.user_profiles
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy user_profiles_delete_own on public.user_profiles
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy consent_records_select_own on public.consent_records
for select to authenticated
using ((select auth.uid()) = user_id);

create policy consent_records_insert_own on public.consent_records
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy goals_select_own on public.goals
for select to authenticated
using ((select auth.uid()) = user_id);

create policy goals_insert_own on public.goals
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy goals_update_own on public.goals
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy goals_delete_own on public.goals
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy checkins_select_own on public.checkins
for select to authenticated
using ((select auth.uid()) = user_id);

create policy checkins_insert_own on public.checkins
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy checkins_update_own on public.checkins
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy checkins_delete_own on public.checkins
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy export_requests_select_own on public.export_requests
for select to authenticated
using ((select auth.uid()) = user_id);

create policy export_requests_insert_own on public.export_requests
for insert to authenticated
with check ((select auth.uid()) = user_id and status = 'requested');

create policy deletion_requests_select_own on public.deletion_requests
for select to authenticated
using ((select auth.uid()) = user_id);

create policy deletion_requests_insert_own on public.deletion_requests
for insert to authenticated
with check ((select auth.uid()) = user_id and status = 'requested');

comment on table public.checkins is 'Structured recovery check-ins only; Phase 3 excludes free-text journal content.';
comment on table public.consent_records is 'Append-only consent decisions; withdrawal is recorded as a new row.';
comment on table public.export_requests is 'User-created request rows. Package generation and status updates must be server-only.';
comment on table public.deletion_requests is 'User-created request rows. Final deletion orchestration and status updates must be server-only.';

commit;
