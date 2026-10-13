create type public.wang_external_scope as enum (
  'calendar',
  'plans',
  'training',
  'competitions',
  'camps',
  'messages',
  'contacts'
);

create table public.wang_external_access (
  id uuid primary key default gen_random_uuid(),
  reader_profile_id uuid not null references public.wang_profiles(id) on delete cascade,
  student_id uuid not null references public.wang_students(id) on delete cascade,
  role public.wang_role not null check (role in ('guardian', 'club_coach')),
  scopes public.wang_external_scope[] not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  invited_by uuid references public.wang_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reader_profile_id, student_id, role),
  check (cardinality(scopes) > 0),
  check (expires_at > starts_at),
  check (revoked_at is null or revoked_at >= starts_at)
);

create index wang_external_access_reader_idx
on public.wang_external_access(reader_profile_id, expires_at)
where revoked_at is null;

create index wang_external_access_student_idx
on public.wang_external_access(student_id, expires_at)
where revoked_at is null;

alter table public.wang_external_access enable row level security;

create or replace function private.wang_can_view_school(target_school_id uuid)
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
        or profile.school_id = target_school_id
      )
  )
$$;

create or replace function private.wang_can_oversee_school(target_school_id uuid)
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
          and profile.role in ('school_leader', 'principal', 'head_of_sports')
        )
      )
  )
$$;

create or replace function private.wang_has_active_external_access(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wang_external_access access_row
    where access_row.reader_profile_id = (select auth.uid())
      and access_row.student_id = target_student_id
      and access_row.starts_at <= now()
      and access_row.expires_at > now()
      and access_row.revoked_at is null
  )
$$;

create or replace function private.wang_can_view_school_sport(target_school_sport_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wang_school_sports school_sport
    where school_sport.id = target_school_sport_id
      and private.wang_can_oversee_school(school_sport.school_id)
  )
  or exists (
    select 1
    from public.wang_staff_memberships membership
    where membership.profile_id = (select auth.uid())
      and membership.school_sport_id = target_school_sport_id
      and membership.active = true
  )
  or exists (
    select 1
    from public.wang_students student
    join public.wang_groups group_row on group_row.id = student.group_id
    where group_row.school_sport_id = target_school_sport_id
      and (
        student.profile_id = (select auth.uid())
        or exists (
          select 1
          from public.wang_guardian_students relation
          where relation.guardian_profile_id = (select auth.uid())
            and relation.student_id = student.id
            and relation.active = true
        )
        or private.wang_has_active_external_access(student.id)
      )
  )
$$;

create or replace function private.wang_can_manage_school_sport(target_school_sport_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wang_staff_memberships membership
    where membership.profile_id = (select auth.uid())
      and membership.school_sport_id = target_school_sport_id
      and membership.role in ('sports_director', 'coach')
      and membership.active = true
  )
$$;

create or replace function private.wang_can_access_group(target_group_id uuid)
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
      and private.wang_can_view_school_sport(group_row.school_sport_id)
  )
$$;

create or replace function private.wang_can_access_student(target_student_id uuid)
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
    join public.wang_school_sports school_sport on school_sport.id = group_row.school_sport_id
    where student.id = target_student_id
      and (
        student.profile_id = (select auth.uid())
        or exists (
          select 1
          from public.wang_profiles profile
          where profile.id = (select auth.uid())
            and profile.active = true
            and profile.school_id = school_sport.school_id
            and profile.role in ('school_leader', 'principal', 'head_of_sports')
        )
        or exists (
          select 1
          from public.wang_staff_memberships membership
          where membership.profile_id = (select auth.uid())
            and membership.school_sport_id = group_row.school_sport_id
            and membership.role in ('sports_director', 'coach', 'readonly')
            and membership.active = true
        )
        or exists (
          select 1
          from public.wang_guardian_students relation
          where relation.guardian_profile_id = (select auth.uid())
            and relation.student_id = student.id
            and relation.active = true
        )
        or private.wang_has_active_external_access(student.id)
      )
  )
$$;

create or replace function private.wang_can_access_wellbeing(target_student_id uuid)
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
        or exists (
          select 1
          from public.wang_staff_memberships membership
          where membership.profile_id = (select auth.uid())
            and membership.school_sport_id = group_row.school_sport_id
            and membership.role in ('sports_director', 'coach')
            and membership.active = true
        )
      )
  )
$$;

create or replace function private.wang_can_read_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_profile_id = (select auth.uid())
  or exists (
    select 1
    from public.wang_profiles current_profile
    join public.wang_profiles target_profile on target_profile.id = target_profile_id
    where current_profile.id = (select auth.uid())
      and current_profile.active = true
      and (
        (
          current_profile.role = 'central_admin'
          and target_profile.role in (
            'central_admin',
            'school_leader',
            'principal',
            'head_of_sports',
            'sports_director',
            'coach',
            'readonly'
          )
        )
        or (
          current_profile.school_id = target_profile.school_id
          and current_profile.role in ('school_leader', 'principal', 'head_of_sports')
        )
      )
  )
  or exists (
    select 1
    from public.wang_students student
    where student.profile_id = target_profile_id
      and private.wang_can_access_student(student.id)
  )
$$;

revoke execute on function private.wang_can_view_school(uuid) from public, anon;
revoke execute on function private.wang_can_oversee_school(uuid) from public, anon;
revoke execute on function private.wang_has_active_external_access(uuid) from public, anon;
revoke execute on function private.wang_can_view_school_sport(uuid) from public, anon;
revoke execute on function private.wang_can_manage_school_sport(uuid) from public, anon;
revoke execute on function private.wang_can_access_group(uuid) from public, anon;
revoke execute on function private.wang_can_access_student(uuid) from public, anon;
revoke execute on function private.wang_can_access_wellbeing(uuid) from public, anon;
revoke execute on function private.wang_can_read_profile(uuid) from public, anon;

grant execute on function private.wang_can_view_school(uuid) to authenticated;
grant execute on function private.wang_can_oversee_school(uuid) to authenticated;
grant execute on function private.wang_has_active_external_access(uuid) to authenticated;
grant execute on function private.wang_can_view_school_sport(uuid) to authenticated;
grant execute on function private.wang_can_manage_school_sport(uuid) to authenticated;
grant execute on function private.wang_can_access_group(uuid) to authenticated;
grant execute on function private.wang_can_access_student(uuid) to authenticated;
grant execute on function private.wang_can_access_wellbeing(uuid) to authenticated;
grant execute on function private.wang_can_read_profile(uuid) to authenticated;

alter policy "authenticated read schools"
on public.wang_schools
using (private.wang_can_view_school(id));

alter policy "authenticated read assigned school sports"
on public.wang_school_sports
using (private.wang_can_view_school_sport(id));

alter policy "profiles read self or school leadership"
on public.wang_profiles
using (private.wang_can_read_profile(id));

revoke update on public.wang_profiles from authenticated;
grant update (display_name) on public.wang_profiles to authenticated;

alter policy "staff memberships read own or leadership"
on public.wang_staff_memberships
using (
  profile_id = (select auth.uid())
  or exists (
    select 1
    from public.wang_school_sports school_sport
    where school_sport.id = wang_staff_memberships.school_sport_id
      and private.wang_can_oversee_school(school_sport.school_id)
  )
);

alter policy "groups read assigned"
on public.wang_groups
using (private.wang_can_access_group(id));

alter policy "students read assigned"
on public.wang_students
using (private.wang_can_access_student(id));

alter policy "guardian relations read own or student staff"
on public.wang_guardian_students
using (
  guardian_profile_id = (select auth.uid())
  or private.wang_can_access_student(student_id)
);

create policy "external access read related"
on public.wang_external_access for select to authenticated
using (
  reader_profile_id = (select auth.uid())
  or exists (
    select 1
    from public.wang_students student
    where student.id = wang_external_access.student_id
      and student.profile_id = (select auth.uid())
  )
  or private.wang_can_access_student(student_id)
);

alter policy "plans read assigned or demo"
on public.wang_plan_nodes
using (is_demo = true or private.wang_can_view_school_sport(school_sport_id));

alter policy "staff manage plans"
on public.wang_plan_nodes
using (private.wang_can_manage_school_sport(school_sport_id))
with check (private.wang_can_manage_school_sport(school_sport_id));

alter policy "events read assigned or demo"
on public.wang_calendar_events
using (
  is_demo = true
  or (
    student_id is null
    and school_sport_id is not null
    and private.wang_can_view_school_sport(school_sport_id)
  )
  or (
    student_id is not null
    and private.wang_can_access_student(student_id)
  )
);

alter policy "staff manage wang events"
on public.wang_calendar_events
using (
  source = 'wang'
  and school_sport_id is not null
  and private.wang_can_manage_school_sport(school_sport_id)
)
with check (
  source = 'wang'
  and school_sport_id is not null
  and private.wang_can_manage_school_sport(school_sport_id)
);

alter policy "wellbeing student or assigned staff only"
on public.wang_wellbeing_checkins
using (private.wang_can_access_wellbeing(student_id));

create or replace function public.revoke_wang_external_access(target_access_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_rows integer;
begin
  update public.wang_external_access access_row
  set revoked_at = now(),
      updated_at = now()
  where access_row.id = target_access_id
    and access_row.revoked_at is null
    and exists (
      select 1
      from public.wang_students student
      where student.id = access_row.student_id
        and student.profile_id = (select auth.uid())
    );

  get diagnostics changed_rows = row_count;
  return changed_rows = 1;
end;
$$;

revoke execute on function public.revoke_wang_external_access(uuid) from public, anon;
grant execute on function public.revoke_wang_external_access(uuid) to authenticated;
