drop function if exists public.revoke_wang_external_access(uuid);

revoke update on public.wang_external_access from authenticated;
grant update (revoked_at) on public.wang_external_access to authenticated;

create policy "student revoke external access"
on public.wang_external_access for update to authenticated
using (
  revoked_at is null
  and exists (
    select 1
    from public.wang_students student
    where student.id = wang_external_access.student_id
      and student.profile_id = (select auth.uid())
  )
)
with check (
  revoked_at is not null
  and exists (
    select 1
    from public.wang_students student
    where student.id = wang_external_access.student_id
      and student.profile_id = (select auth.uid())
  )
);

create index wang_external_access_invited_by_idx
on public.wang_external_access(invited_by);

drop policy "staff manage plans" on public.wang_plan_nodes;

create policy "staff create plans"
on public.wang_plan_nodes for insert to authenticated
with check (private.wang_can_manage_school_sport(school_sport_id));

create policy "staff update plans"
on public.wang_plan_nodes for update to authenticated
using (private.wang_can_manage_school_sport(school_sport_id))
with check (private.wang_can_manage_school_sport(school_sport_id));

create policy "staff delete plans"
on public.wang_plan_nodes for delete to authenticated
using (private.wang_can_manage_school_sport(school_sport_id));

drop policy "staff manage wang events" on public.wang_calendar_events;
drop policy "students manage own events" on public.wang_calendar_events;

create policy "staff create wang events"
on public.wang_calendar_events for insert to authenticated
with check (
  source = 'wang'
  and school_sport_id is not null
  and private.wang_can_manage_school_sport(school_sport_id)
);

create policy "staff update wang events"
on public.wang_calendar_events for update to authenticated
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

create policy "staff delete wang events"
on public.wang_calendar_events for delete to authenticated
using (
  source = 'wang'
  and school_sport_id is not null
  and private.wang_can_manage_school_sport(school_sport_id)
);

create policy "students create own events"
on public.wang_calendar_events for insert to authenticated
with check (
  source in ('student', 'club')
  and locked_for_student = false
  and student_id is not null
  and exists (
    select 1
    from public.wang_students student
    where student.id = wang_calendar_events.student_id
      and student.profile_id = (select auth.uid())
  )
);

create policy "students update own events"
on public.wang_calendar_events for update to authenticated
using (
  source in ('student', 'club')
  and student_id is not null
  and exists (
    select 1
    from public.wang_students student
    where student.id = wang_calendar_events.student_id
      and student.profile_id = (select auth.uid())
  )
)
with check (
  source in ('student', 'club')
  and locked_for_student = false
  and student_id is not null
  and exists (
    select 1
    from public.wang_students student
    where student.id = wang_calendar_events.student_id
      and student.profile_id = (select auth.uid())
  )
);

create policy "students delete own events"
on public.wang_calendar_events for delete to authenticated
using (
  source in ('student', 'club')
  and student_id is not null
  and exists (
    select 1
    from public.wang_students student
    where student.id = wang_calendar_events.student_id
      and student.profile_id = (select auth.uid())
  )
);
