\set ON_ERROR_STOP on

create schema test_support;

create or replace function test_support.expect_error(statement text)
returns void
language plpgsql
as $$
begin
  begin
    execute statement;
  exception when others then
    return;
  end;
  raise exception 'Expected statement to fail: %', statement;
end;
$$;

grant usage on schema test_support to anon, authenticated;
grant execute on function test_support.expect_error(text) to anon, authenticated;

-- User A creates an owned profile, consent decision, goal, check-in, and jobs.
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);

insert into public.user_profiles (user_id, timezone_name)
values ('11111111-1111-4111-8111-111111111111', 'Asia/Kolkata');

insert into public.consent_records (id, user_id, document_key, document_version, decision)
values (
  'a1000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  'privacy',
  '2026-07-29',
  'accepted'
);

insert into public.goals (id, user_id, category_slug, approach)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'alcohol',
  'understand'
);

insert into public.checkins (
  id, user_id, goal_id, occurred_on, mood_score, urge_score, behavior_occurred, trigger_code, coping_code
) values (
  'c1000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  current_date,
  6,
  4,
  false,
  'stress',
  'walk'
);

insert into public.export_requests (id, user_id)
values ('e1000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111');

insert into public.deletion_requests (id, user_id)
values ('d1000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111');

-- User A cannot create rows owned by User B or advance privileged job state.
select test_support.expect_error($sql$
  insert into public.user_profiles (user_id)
  values ('22222222-2222-4222-8222-222222222222')
$sql$);

select test_support.expect_error($sql$
  insert into public.export_requests (user_id, status)
  values ('11111111-1111-4111-8111-111111111111', 'processing')
$sql$);

select test_support.expect_error($sql$
  update public.export_requests set status = 'ready'
  where user_id = '11111111-1111-4111-8111-111111111111'
$sql$);

select test_support.expect_error($sql$
  update public.deletion_requests set status = 'completed'
  where user_id = '11111111-1111-4111-8111-111111111111'
$sql$);

select test_support.expect_error($sql$
  update public.consent_records set decision = 'withdrawn'
  where user_id = '11111111-1111-4111-8111-111111111111'
$sql$);

select test_support.expect_error($sql$
  delete from public.consent_records
  where user_id = '11111111-1111-4111-8111-111111111111'
$sql$);

select test_support.expect_error($sql$
  insert into public.export_requests (user_id)
  values ('11111111-1111-4111-8111-111111111111')
$sql$);

reset role;
select set_config('request.jwt.claim.sub', '', false);

-- User B creates separate owned records.
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);

insert into public.user_profiles (user_id, timezone_name)
values ('22222222-2222-4222-8222-222222222222', 'UTC');

insert into public.goals (id, user_id, category_slug, approach)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '22222222-2222-4222-8222-222222222222',
  'digital',
  'reduce'
);

insert into public.checkins (
  id, user_id, goal_id, occurred_on, mood_score, urge_score, behavior_occurred
) values (
  'c2000000-0000-4000-8000-000000000002',
  '22222222-2222-4222-8222-222222222222',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  current_date,
  7,
  3,
  false
);

-- User B sees only User B data.
select 1 / case when (select count(*) from public.user_profiles) = 1 then 1 else 0 end;
select 1 / case when (select count(*) from public.goals) = 1 then 1 else 0 end;
select 1 / case when (select count(*) from public.checkins) = 1 then 1 else 0 end;
select 1 / case when (select count(*) from public.export_requests) = 0 then 1 else 0 end;

-- User B cannot read, update, or delete User A records.
select 1 / case when (
  select count(*) from public.goals
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
) = 0 then 1 else 0 end;

with changed as (
  update public.goals set status = 'paused'
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  returning 1
)
select 1 / case when count(*) = 0 then 1 else 0 end from changed;

with removed as (
  delete from public.checkins
  where id = 'c1000000-0000-4000-8000-000000000001'
  returning 1
)
select 1 / case when count(*) = 0 then 1 else 0 end from removed;

-- The composite foreign key blocks linking User B's goal to User A ownership.
select test_support.expect_error($sql$
  insert into public.checkins (
    user_id, goal_id, occurred_on, mood_score, urge_score
  ) values (
    '22222222-2222-4222-8222-222222222222',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    current_date - 1,
    5,
    5
  )
$sql$);

-- Ownership cannot be transferred.
select test_support.expect_error($sql$
  update public.goals
  set user_id = '11111111-1111-4111-8111-111111111111'
  where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
$sql$);

reset role;
select set_config('request.jwt.claim.sub', '', false);

-- Anonymous clients have neither grants nor policies for private data.
set role anon;
select test_support.expect_error('select * from public.user_profiles');
select test_support.expect_error($sql$
  insert into public.goals (user_id, category_slug, approach)
  values ('11111111-1111-4111-8111-111111111111', 'alcohol', 'understand')
$sql$);
reset role;

-- Deleting an auth user cascades all owned rows without affecting another user.
delete from auth.users where id = '22222222-2222-4222-8222-222222222222';

select 1 / case when (
  select count(*) from public.user_profiles
  where user_id = '22222222-2222-4222-8222-222222222222'
) = 0 then 1 else 0 end;
select 1 / case when (
  select count(*) from public.goals
  where user_id = '22222222-2222-4222-8222-222222222222'
) = 0 then 1 else 0 end;
select 1 / case when (
  select count(*) from public.checkins
  where user_id = '22222222-2222-4222-8222-222222222222'
) = 0 then 1 else 0 end;
select 1 / case when (
  select count(*) from public.user_profiles
  where user_id = '11111111-1111-4111-8111-111111111111'
) = 1 then 1 else 0 end;

select 'PHASE3_POSTGRES_RLS_INTEGRATION=PASS' as result;
