create or replace function private.wang_event_scope_is_consistent(
  target_school_sport_id uuid,
  target_group_id uuid,
  target_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    target_school_sport_id is not null
    or target_group_id is not null
    or target_student_id is not null
  )
  and (
    target_group_id is null
    or exists (
      select 1
      from public.wang_groups group_row
      where group_row.id = target_group_id
        and (
          target_school_sport_id is null
          or group_row.school_sport_id = target_school_sport_id
        )
    )
  )
  and (
    target_student_id is null
    or exists (
      select 1
      from public.wang_students student
      join public.wang_groups group_row on group_row.id = student.group_id
      where student.id = target_student_id
        and (target_group_id is null or student.group_id = target_group_id)
        and (
          target_school_sport_id is null
          or group_row.school_sport_id = target_school_sport_id
        )
    )
  )
$$;

create or replace function private.wang_can_view_calendar_event(
  target_school_sport_id uuid,
  target_group_id uuid,
  target_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.wang_event_scope_is_consistent(
    target_school_sport_id,
    target_group_id,
    target_student_id
  )
  and (
  exists (
    select 1
    from public.wang_school_sports school_sport
    where (
        school_sport.id = target_school_sport_id
        or exists (
          select 1
          from public.wang_groups group_row
          where group_row.id = target_group_id
            and group_row.school_sport_id = school_sport.id
        )
        or exists (
          select 1
          from public.wang_students student
          join public.wang_groups group_row on group_row.id = student.group_id
          where student.id = target_student_id
            and group_row.school_sport_id = school_sport.id
        )
      )
      and private.wang_can_oversee_school(school_sport.school_id)
  )
  or exists (
    select 1
    from public.wang_staff_memberships membership
    where membership.profile_id = (select auth.uid())
      and membership.active = true
      and (
        membership.school_sport_id = target_school_sport_id
        or exists (
          select 1
          from public.wang_groups group_row
          where group_row.id = target_group_id
            and group_row.school_sport_id = membership.school_sport_id
        )
        or exists (
          select 1
          from public.wang_students student
          join public.wang_groups group_row on group_row.id = student.group_id
          where student.id = target_student_id
            and group_row.school_sport_id = membership.school_sport_id
        )
      )
  )
  or exists (
    select 1
    from public.wang_students student
    join public.wang_groups group_row on group_row.id = student.group_id
    where student.profile_id = (select auth.uid())
      and (target_school_sport_id is null or group_row.school_sport_id = target_school_sport_id)
      and (
        student.id = target_student_id
        or (target_student_id is null and student.group_id = target_group_id)
        or (
          target_student_id is null
          and target_group_id is null
          and group_row.school_sport_id = target_school_sport_id
        )
      )
  )
  or exists (
    select 1
    from public.wang_external_access access_row
    join public.wang_students student on student.id = access_row.student_id
    join public.wang_groups group_row on group_row.id = student.group_id
    where access_row.reader_profile_id = (select auth.uid())
      and access_row.starts_at <= now()
      and access_row.expires_at > now()
      and access_row.revoked_at is null
      and 'calendar' = any(access_row.scopes)
      and (target_school_sport_id is null or group_row.school_sport_id = target_school_sport_id)
      and (
        student.id = target_student_id
        or (target_student_id is null and student.group_id = target_group_id)
        or (
          target_student_id is null
          and target_group_id is null
          and group_row.school_sport_id = target_school_sport_id
        )
      )
  )
  )
$$;

revoke execute on function private.wang_event_scope_is_consistent(uuid, uuid, uuid)
from public, anon;
revoke execute on function private.wang_can_view_calendar_event(uuid, uuid, uuid)
from public, anon;
grant execute on function private.wang_event_scope_is_consistent(uuid, uuid, uuid)
to authenticated;
grant execute on function private.wang_can_view_calendar_event(uuid, uuid, uuid)
to authenticated;

alter policy "events read assigned or demo"
on public.wang_calendar_events
using (
  is_demo = true
  or private.wang_can_view_calendar_event(school_sport_id, group_id, student_id)
);

alter policy "authorized create events"
on public.wang_calendar_events
with check (
  private.wang_event_scope_is_consistent(school_sport_id, group_id, student_id)
  and (
    (
      source = 'wang'
      and school_sport_id is not null
      and private.wang_can_manage_school_sport(school_sport_id)
    )
    or (
      source in ('student', 'club')
      and locked_for_student = false
      and student_id is not null
      and exists (
        select 1
        from public.wang_students student
        where student.id = wang_calendar_events.student_id
          and student.profile_id = (select auth.uid())
      )
    )
  )
);

alter policy "authorized update events"
on public.wang_calendar_events
using (
  private.wang_event_scope_is_consistent(school_sport_id, group_id, student_id)
  and (
    (
      source = 'wang'
      and school_sport_id is not null
      and private.wang_can_manage_school_sport(school_sport_id)
    )
    or (
      source in ('student', 'club')
      and student_id is not null
      and exists (
        select 1
        from public.wang_students student
        where student.id = wang_calendar_events.student_id
          and student.profile_id = (select auth.uid())
      )
    )
  )
)
with check (
  private.wang_event_scope_is_consistent(school_sport_id, group_id, student_id)
  and (
    (
      source = 'wang'
      and school_sport_id is not null
      and private.wang_can_manage_school_sport(school_sport_id)
    )
    or (
      source in ('student', 'club')
      and locked_for_student = false
      and student_id is not null
      and exists (
        select 1
        from public.wang_students student
        where student.id = wang_calendar_events.student_id
          and student.profile_id = (select auth.uid())
      )
    )
  )
);
