drop policy "staff create wang events" on public.wang_calendar_events;
drop policy "staff update wang events" on public.wang_calendar_events;
drop policy "staff delete wang events" on public.wang_calendar_events;
drop policy "students create own events" on public.wang_calendar_events;
drop policy "students update own events" on public.wang_calendar_events;
drop policy "students delete own events" on public.wang_calendar_events;

create policy "authorized create events"
on public.wang_calendar_events for insert to authenticated
with check (
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
);

create policy "authorized update events"
on public.wang_calendar_events for update to authenticated
using (
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
with check (
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
);

create policy "authorized delete events"
on public.wang_calendar_events for delete to authenticated
using (
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
);
