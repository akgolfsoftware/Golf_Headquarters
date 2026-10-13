create extension if not exists pgcrypto;

create type public.wang_role as enum (
  'central_admin',
  'school_leader',
  'sports_director',
  'coach',
  'student',
  'guardian',
  'readonly'
);

create type public.wang_sport_status as enum ('active', 'future');
create type public.wang_plan_level as enum ('year', 'period', 'month', 'week', 'session');
create type public.wang_plan_status as enum ('draft', 'published', 'archived');
create type public.wang_event_source as enum ('school', 'wang', 'student', 'club');
create type public.wang_event_kind as enum (
  'school_lesson',
  'assessment',
  'training',
  'competition',
  'camp',
  'self_training',
  'club_training'
);

create table public.wang_schools (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  city text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wang_sports (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  family text,
  workbench_status public.wang_sport_status not null default 'future',
  mapping_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wang_school_sports (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.wang_schools(id) on delete cascade,
  sport_id uuid not null references public.wang_sports(id) on delete restrict,
  school_year text not null,
  status public.wang_sport_status not null,
  workbench_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, sport_id, school_year)
);

create table public.wang_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role public.wang_role not null,
  school_id uuid references public.wang_schools(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wang_staff_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.wang_profiles(id) on delete cascade,
  school_sport_id uuid not null references public.wang_school_sports(id) on delete cascade,
  role public.wang_role not null check (role in ('sports_director', 'coach', 'readonly')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (profile_id, school_sport_id, role)
);

create table public.wang_groups (
  id uuid primary key default gen_random_uuid(),
  school_sport_id uuid not null references public.wang_school_sports(id) on delete cascade,
  code text not null,
  name text not null,
  grade text,
  school_year text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_sport_id, code, school_year)
);

create table public.wang_students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.wang_profiles(id) on delete set null,
  group_id uuid not null references public.wang_groups(id) on delete cascade,
  demo_name text,
  grade text not null check (grade in ('VG1', 'VG2', 'VG3')),
  status_label text not null default 'Ingen data',
  checkin_status text not null default 'Ikke sendt',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((is_demo and demo_name is not null) or (not is_demo and profile_id is not null))
);

create table public.wang_guardian_students (
  id uuid primary key default gen_random_uuid(),
  guardian_profile_id uuid not null references public.wang_profiles(id) on delete cascade,
  student_id uuid not null references public.wang_students(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (guardian_profile_id, student_id)
);

create table public.wang_plan_nodes (
  id uuid primary key default gen_random_uuid(),
  school_sport_id uuid not null references public.wang_school_sports(id) on delete cascade,
  group_id uuid references public.wang_groups(id) on delete cascade,
  parent_id uuid references public.wang_plan_nodes(id) on delete cascade,
  level public.wang_plan_level not null,
  title text not null,
  starts_on date not null,
  ends_on date not null,
  status public.wang_plan_status not null default 'draft',
  source_note text,
  subject_basis_status text not null default 'Faggrunnlag mangler',
  is_demo boolean not null default false,
  created_by uuid references public.wang_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table public.wang_calendar_events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.wang_schools(id) on delete cascade,
  school_sport_id uuid references public.wang_school_sports(id) on delete cascade,
  group_id uuid references public.wang_groups(id) on delete cascade,
  student_id uuid references public.wang_students(id) on delete cascade,
  plan_node_id uuid references public.wang_plan_nodes(id) on delete set null,
  source public.wang_event_source not null,
  kind public.wang_event_kind not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  place text,
  recurrence_rule text,
  locked_for_student boolean not null default true,
  status public.wang_plan_status not null default 'draft',
  is_demo boolean not null default false,
  created_by uuid references public.wang_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (
    (source in ('school', 'wang') and locked_for_student)
    or source in ('student', 'club')
  )
);

create table public.wang_wellbeing_checkins (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.wang_students(id) on delete cascade,
  checkin_date date not null,
  sleep_hours numeric(4, 2) not null check (sleep_hours between 0 and 24),
  readiness smallint not null check (readiness between 1 and 5),
  created_at timestamptz not null default now(),
  unique (student_id, checkin_date)
);

create index wang_school_sports_school_idx on public.wang_school_sports(school_id);
create index wang_staff_memberships_profile_idx on public.wang_staff_memberships(profile_id);
create index wang_groups_school_sport_idx on public.wang_groups(school_sport_id);
create index wang_students_group_idx on public.wang_students(group_id);
create index wang_plan_nodes_group_level_idx on public.wang_plan_nodes(group_id, level);
create index wang_calendar_events_group_start_idx on public.wang_calendar_events(group_id, starts_at);
create index wang_calendar_events_student_start_idx on public.wang_calendar_events(student_id, starts_at);
create index wang_wellbeing_student_date_idx on public.wang_wellbeing_checkins(student_id, checkin_date desc);

create or replace function public.wang_current_role()
returns public.wang_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.wang_profiles
  where id = (select auth.uid()) and active = true
$$;

create or replace function public.wang_can_access_school(target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wang_profiles profile
    where profile.id = (select auth.uid())
      and profile.active = true
      and (
        profile.role = 'central_admin'
        or (
          profile.school_id = target_school_id
          and profile.role in ('school_leader', 'sports_director')
        )
      )
  )
$$;

create or replace function public.wang_can_access_school_sport(target_school_sport_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.wang_school_sports school_sport
      where school_sport.id = target_school_sport_id
        and public.wang_can_access_school(school_sport.school_id)
    )
    or exists (
      select 1
      from public.wang_staff_memberships membership
      where membership.profile_id = (select auth.uid())
        and membership.school_sport_id = target_school_sport_id
        and membership.active = true
    )
$$;

create or replace function public.wang_can_access_group(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wang_groups group_row
    where group_row.id = target_group_id
      and public.wang_can_access_school_sport(group_row.school_sport_id)
  )
  or exists (
    select 1
    from public.wang_students student
    where student.group_id = target_group_id
      and student.profile_id = (select auth.uid())
  )
$$;

create or replace function public.wang_can_access_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wang_students student
    join public.wang_groups group_row on group_row.id = student.group_id
    where student.id = target_student_id
      and (
        student.profile_id = (select auth.uid())
        or public.wang_can_access_school_sport(group_row.school_sport_id)
        or exists (
          select 1
          from public.wang_guardian_students relation
          where relation.guardian_profile_id = (select auth.uid())
            and relation.student_id = student.id
            and relation.active = true
        )
      )
  )
$$;

grant execute on function public.wang_current_role() to authenticated;
grant execute on function public.wang_can_access_school(uuid) to authenticated;
grant execute on function public.wang_can_access_school_sport(uuid) to authenticated;
grant execute on function public.wang_can_access_group(uuid) to authenticated;
grant execute on function public.wang_can_access_student(uuid) to authenticated;

alter table public.wang_schools enable row level security;
alter table public.wang_sports enable row level security;
alter table public.wang_school_sports enable row level security;
alter table public.wang_profiles enable row level security;
alter table public.wang_staff_memberships enable row level security;
alter table public.wang_groups enable row level security;
alter table public.wang_students enable row level security;
alter table public.wang_guardian_students enable row level security;
alter table public.wang_plan_nodes enable row level security;
alter table public.wang_calendar_events enable row level security;
alter table public.wang_wellbeing_checkins enable row level security;

create policy "authenticated read schools"
on public.wang_schools for select to authenticated
using (public.wang_can_access_school(id) or exists (
  select 1 from public.wang_profiles profile
  where profile.id = (select auth.uid()) and profile.school_id = wang_schools.id and profile.active = true
));

create policy "authenticated read sports"
on public.wang_sports for select to authenticated
using (true);

create policy "authenticated read assigned school sports"
on public.wang_school_sports for select to authenticated
using (public.wang_can_access_school_sport(id));

create policy "profiles read self or school leadership"
on public.wang_profiles for select to authenticated
using (id = (select auth.uid()) or public.wang_can_access_school(school_id));

create policy "profiles update self"
on public.wang_profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "staff memberships read own or leadership"
on public.wang_staff_memberships for select to authenticated
using (
  profile_id = (select auth.uid())
  or public.wang_can_access_school_sport(school_sport_id)
);

create policy "groups read assigned"
on public.wang_groups for select to authenticated
using (public.wang_can_access_group(id));

create policy "public read demo groups"
on public.wang_groups for select to anon
using (is_demo = true);

create policy "students read assigned"
on public.wang_students for select to authenticated
using (public.wang_can_access_student(id));

create policy "public read demo students"
on public.wang_students for select to anon
using (is_demo = true);

create policy "guardian relations read own or student staff"
on public.wang_guardian_students for select to authenticated
using (
  guardian_profile_id = (select auth.uid())
  or public.wang_can_access_student(student_id)
);

create policy "plans read assigned or demo"
on public.wang_plan_nodes for select to authenticated
using (is_demo = true or public.wang_can_access_school_sport(school_sport_id));

create policy "public read demo plans"
on public.wang_plan_nodes for select to anon
using (is_demo = true);

create policy "staff manage plans"
on public.wang_plan_nodes for all to authenticated
using (public.wang_can_access_school_sport(school_sport_id))
with check (public.wang_can_access_school_sport(school_sport_id));

create policy "events read assigned or demo"
on public.wang_calendar_events for select to authenticated
using (
  is_demo = true
  or (school_sport_id is not null and public.wang_can_access_school_sport(school_sport_id))
  or (student_id is not null and public.wang_can_access_student(student_id))
);

create policy "public read demo events"
on public.wang_calendar_events for select to anon
using (is_demo = true);

create policy "staff manage wang events"
on public.wang_calendar_events for all to authenticated
using (
  source = 'wang'
  and school_sport_id is not null
  and public.wang_can_access_school_sport(school_sport_id)
)
with check (
  source = 'wang'
  and school_sport_id is not null
  and public.wang_can_access_school_sport(school_sport_id)
);

create policy "students manage own events"
on public.wang_calendar_events for all to authenticated
using (
  source in ('student', 'club')
  and student_id is not null
  and exists (
    select 1 from public.wang_students student
    where student.id = wang_calendar_events.student_id
      and student.profile_id = (select auth.uid())
  )
)
with check (
  source in ('student', 'club')
  and locked_for_student = false
  and student_id is not null
  and exists (
    select 1 from public.wang_students student
    where student.id = wang_calendar_events.student_id
      and student.profile_id = (select auth.uid())
  )
);

create policy "wellbeing student or assigned staff only"
on public.wang_wellbeing_checkins for select to authenticated
using (
  exists (
    select 1
    from public.wang_students student
    join public.wang_groups group_row on group_row.id = student.group_id
    where student.id = wang_wellbeing_checkins.student_id
      and (
        student.profile_id = (select auth.uid())
        or public.wang_can_access_school_sport(group_row.school_sport_id)
      )
  )
);

create policy "students create own wellbeing"
on public.wang_wellbeing_checkins for insert to authenticated
with check (
  exists (
    select 1 from public.wang_students student
    where student.id = wang_wellbeing_checkins.student_id
      and student.profile_id = (select auth.uid())
  )
);

insert into public.wang_schools (code, name, city)
values ('fredrikstad-toppidrett', 'WANG Toppidrett Fredrikstad', 'Fredrikstad')
on conflict (code) do update set
  name = excluded.name,
  city = excluded.city,
  updated_at = now();

insert into public.wang_sports (code, name, family, workbench_status, mapping_approved)
values
  ('andre-idretter', 'Andre idretter', null, 'active', false),
  ('fotball', 'Fotball', 'lag', 'active', false),
  ('friidrett', 'Friidrett', 'utholdenhet', 'active', false),
  ('golf', 'Golf', 'golf', 'active', false),
  ('handball', 'Håndball', 'lag', 'active', false),
  ('innebandy', 'Innebandy', 'lag', 'active', false),
  ('ishockey', 'Ishockey', 'lag', 'active', false),
  ('kampidrett', 'Kampidrett', 'teknikk', 'active', false),
  ('svomming', 'Svømming', 'utholdenhet', 'active', false),
  ('apparatturn', 'Apparatturn', 'teknikk', 'active', false),
  ('roing', 'Roing', 'utholdenhet', 'future', false)
on conflict (code) do update set
  name = excluded.name,
  family = excluded.family,
  workbench_status = excluded.workbench_status,
  updated_at = now();

insert into public.wang_school_sports (school_id, sport_id, school_year, status, workbench_enabled)
select school.id, sport.id, '2026/2027', sport.workbench_status, sport.code = 'golf'
from public.wang_schools school
cross join public.wang_sports sport
where school.code = 'fredrikstad-toppidrett'
on conflict (school_id, sport_id, school_year) do update set
  status = excluded.status,
  workbench_enabled = excluded.workbench_enabled,
  updated_at = now();

with golf as (
  select school_sport.id
  from public.wang_school_sports school_sport
  join public.wang_schools school on school.id = school_sport.school_id
  join public.wang_sports sport on sport.id = school_sport.sport_id
  where school.code = 'fredrikstad-toppidrett'
    and sport.code = 'golf'
    and school_sport.school_year = '2026/2027'
)
insert into public.wang_groups (school_sport_id, code, name, grade, school_year, is_demo)
select golf.id, seed.code, seed.name, seed.grade, '2026/2027', true
from golf
cross join (values
  ('FRE-GO-G1', 'Golf G1', 'VG1'),
  ('FRE-GO-G2', 'Golf G2', 'VG2')
) as seed(code, name, grade)
on conflict (school_sport_id, code, school_year) do update set
  name = excluded.name,
  grade = excluded.grade,
  is_demo = true,
  updated_at = now();

insert into public.wang_students (group_id, demo_name, grade, status_label, checkin_status, is_demo)
select group_row.id, seed.demo_name, seed.grade, seed.status_label, seed.checkin_status, true
from public.wang_groups group_row
join public.wang_school_sports school_sport on school_sport.id = group_row.school_sport_id
join public.wang_sports sport on sport.id = school_sport.sport_id
cross join lateral (
  select * from (values
    ('Nora Berg', 'VG2', 'I rute', 'Sendt', 'FRE-GO-G2'),
    ('Selma Fjeld', 'VG2', 'Følg opp', 'Sendt', 'FRE-GO-G2'),
    ('Thea Bakke', 'VG2', 'I rute', 'Ikke sendt', 'FRE-GO-G2'),
    ('Henrik Lie', 'VG2', 'Ikke tilgjengelig', 'Sendt', 'FRE-GO-G2'),
    ('Live Hauge', 'VG1', 'I rute', 'Sendt', 'FRE-GO-G1'),
    ('Oskar Dahl', 'VG1', 'Ingen data', 'Ikke sendt', 'FRE-GO-G1'),
    ('Maja Vik', 'VG1', 'I rute', 'Sendt', 'FRE-GO-G1')
  ) as rows(demo_name, grade, status_label, checkin_status, group_code)
  where rows.group_code = group_row.code
) seed
where sport.code = 'golf'
  and group_row.school_year = '2026/2027'
  and group_row.is_demo = true
  and not exists (
    select 1 from public.wang_students existing
    where existing.group_id = group_row.id and existing.demo_name = seed.demo_name and existing.is_demo = true
  );

with golf as (
  select school.id as school_id, school_sport.id as school_sport_id
  from public.wang_school_sports school_sport
  join public.wang_schools school on school.id = school_sport.school_id
  join public.wang_sports sport on sport.id = school_sport.sport_id
  where school.code = 'fredrikstad-toppidrett'
    and sport.code = 'golf'
    and school_sport.school_year = '2026/2027'
), groups as (
  select group_row.id, group_row.code
  from public.wang_groups group_row
  join golf on golf.school_sport_id = group_row.school_sport_id
)
insert into public.wang_calendar_events (
  school_id,
  school_sport_id,
  group_id,
  source,
  kind,
  title,
  starts_at,
  ends_at,
  place,
  recurrence_rule,
  locked_for_student,
  status,
  is_demo
)
select
  golf.school_id,
  golf.school_sport_id,
  groups.id,
  seed.source::public.wang_event_source,
  seed.kind::public.wang_event_kind,
  seed.title,
  seed.starts_at::timestamptz,
  seed.ends_at::timestamptz,
  seed.place,
  seed.recurrence_rule,
  true,
  seed.status::public.wang_plan_status,
  true
from golf
join groups on true
join (values
  ('FRE-GO-G2', 'wang', 'training', 'Kortspill 50–100 m', '2026-10-21 08:00:00+02', '2026-10-21 10:00:00+02', 'Golfhallen', null, 'published'),
  ('FRE-GO-G2', 'wang', 'training', 'Spill på bane: 9 hull', '2026-10-22 15:30:00+02', '2026-10-22 17:00:00+02', 'Golfbanen', null, 'draft'),
  ('FRE-GO-G2', 'school', 'assessment', 'Prøve · demo', '2026-10-23 09:00:00+02', '2026-10-23 10:30:00+02', 'WANG Fredrikstad', null, 'published'),
  ('FRE-GO-G2', 'wang', 'competition', 'Turnering · demo', '2026-10-25 09:00:00+01', '2026-10-25 15:00:00+01', 'Demobane', null, 'published'),
  ('FRE-GO-G1', 'wang', 'camp', 'Samling · demo', '2026-11-05 08:00:00+01', '2026-11-07 18:00:00+01', 'Sted ikke satt', null, 'draft'),
  ('FRE-GO-G2', 'wang', 'camp', 'Samling · demo', '2026-11-05 08:00:00+01', '2026-11-07 18:00:00+01', 'Sted ikke satt', null, 'draft')
) as seed(group_code, source, kind, title, starts_at, ends_at, place, recurrence_rule, status)
  on seed.group_code = groups.code
where not exists (
  select 1
  from public.wang_calendar_events existing
  where existing.group_id = groups.id
    and existing.title = seed.title
    and existing.starts_at = seed.starts_at::timestamptz
    and existing.is_demo = true
);
