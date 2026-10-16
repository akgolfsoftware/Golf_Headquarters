create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.wang_current_role()
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

create or replace function private.wang_can_access_school(target_school_id uuid)
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

create or replace function private.wang_can_access_school_sport(target_school_sport_id uuid)
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
        and private.wang_can_access_school(school_sport.school_id)
    )
    or exists (
      select 1
      from public.wang_staff_memberships membership
      where membership.profile_id = (select auth.uid())
        and membership.school_sport_id = target_school_sport_id
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
      and private.wang_can_access_school_sport(group_row.school_sport_id)
  )
  or exists (
    select 1
    from public.wang_students student
    where student.group_id = target_group_id
      and student.profile_id = (select auth.uid())
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
    where student.id = target_student_id
      and (
        student.profile_id = (select auth.uid())
        or private.wang_can_access_school_sport(group_row.school_sport_id)
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

revoke execute on function private.wang_current_role() from public, anon;
revoke execute on function private.wang_can_access_school(uuid) from public, anon;
revoke execute on function private.wang_can_access_school_sport(uuid) from public, anon;
revoke execute on function private.wang_can_access_group(uuid) from public, anon;
revoke execute on function private.wang_can_access_student(uuid) from public, anon;
grant execute on function private.wang_current_role() to authenticated;
grant execute on function private.wang_can_access_school(uuid) to authenticated;
grant execute on function private.wang_can_access_school_sport(uuid) to authenticated;
grant execute on function private.wang_can_access_group(uuid) to authenticated;
grant execute on function private.wang_can_access_student(uuid) to authenticated;

alter function public.wang_current_role() security invoker;
alter function public.wang_can_access_school(uuid) security invoker;
alter function public.wang_can_access_school_sport(uuid) security invoker;
alter function public.wang_can_access_group(uuid) security invoker;
alter function public.wang_can_access_student(uuid) security invoker;
revoke execute on function public.wang_current_role() from public, anon, authenticated;
revoke execute on function public.wang_can_access_school(uuid) from public, anon, authenticated;
revoke execute on function public.wang_can_access_school_sport(uuid) from public, anon, authenticated;
revoke execute on function public.wang_can_access_group(uuid) from public, anon, authenticated;
revoke execute on function public.wang_can_access_student(uuid) from public, anon, authenticated;

alter policy "authenticated read schools"
on public.wang_schools
using (private.wang_can_access_school(id) or exists (
  select 1 from public.wang_profiles profile
  where profile.id = (select auth.uid()) and profile.school_id = wang_schools.id and profile.active = true
));

alter policy "authenticated read assigned school sports"
on public.wang_school_sports
using (private.wang_can_access_school_sport(id));

alter policy "profiles read self or school leadership"
on public.wang_profiles
using (id = (select auth.uid()) or private.wang_can_access_school(school_id));

alter policy "staff memberships read own or leadership"
on public.wang_staff_memberships
using (
  profile_id = (select auth.uid())
  or private.wang_can_access_school_sport(school_sport_id)
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

alter policy "plans read assigned or demo"
on public.wang_plan_nodes
using (is_demo = true or private.wang_can_access_school_sport(school_sport_id));

alter policy "staff manage plans"
on public.wang_plan_nodes
using (private.wang_can_access_school_sport(school_sport_id))
with check (private.wang_can_access_school_sport(school_sport_id));

alter policy "events read assigned or demo"
on public.wang_calendar_events
using (
  is_demo = true
  or (school_sport_id is not null and private.wang_can_access_school_sport(school_sport_id))
  or (student_id is not null and private.wang_can_access_student(student_id))
);

alter policy "staff manage wang events"
on public.wang_calendar_events
using (
  source = 'wang'
  and school_sport_id is not null
  and private.wang_can_access_school_sport(school_sport_id)
)
with check (
  source = 'wang'
  and school_sport_id is not null
  and private.wang_can_access_school_sport(school_sport_id)
);

alter policy "wellbeing student or assigned staff only"
on public.wang_wellbeing_checkins
using (
  exists (
    select 1
    from public.wang_students student
    join public.wang_groups group_row on group_row.id = student.group_id
    where student.id = wang_wellbeing_checkins.student_id
      and (
        student.profile_id = (select auth.uid())
        or private.wang_can_access_school_sport(group_row.school_sport_id)
      )
  )
);

create index if not exists wang_school_sports_sport_idx on public.wang_school_sports(sport_id);
create index if not exists wang_profiles_school_idx on public.wang_profiles(school_id);
create index if not exists wang_staff_memberships_school_sport_idx on public.wang_staff_memberships(school_sport_id);
create index if not exists wang_guardian_students_student_idx on public.wang_guardian_students(student_id);
create index if not exists wang_plan_nodes_school_sport_idx on public.wang_plan_nodes(school_sport_id);
create index if not exists wang_plan_nodes_parent_idx on public.wang_plan_nodes(parent_id);
create index if not exists wang_plan_nodes_created_by_idx on public.wang_plan_nodes(created_by);
create index if not exists wang_calendar_events_school_idx on public.wang_calendar_events(school_id);
create index if not exists wang_calendar_events_school_sport_idx on public.wang_calendar_events(school_sport_id);
create index if not exists wang_calendar_events_plan_node_idx on public.wang_calendar_events(plan_node_id);
create index if not exists wang_calendar_events_created_by_idx on public.wang_calendar_events(created_by);
