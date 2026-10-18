create policy "public read sports catalogue"
on public.wang_sports for select to anon
using (true);

with golf_group as (
  select group_row.id as group_id, group_row.school_sport_id
  from public.wang_groups group_row
  where group_row.code = 'FRE-GO-G2'
    and group_row.school_year = '2026/2027'
    and group_row.is_demo = true
)
insert into public.wang_plan_nodes (
  school_sport_id,
  group_id,
  level,
  title,
  starts_on,
  ends_on,
  status,
  source_note,
  subject_basis_status,
  is_demo
)
select
  golf_group.school_sport_id,
  golf_group.group_id,
  'year',
  'Årsplan 2026/2027',
  date '2026-08-01',
  date '2027-06-30',
  'draft',
  'Demo – struktur fra godkjent skjermreise',
  'Fagmodell ikke godkjent – B16 ikke koblet',
  true
from golf_group
where not exists (
  select 1 from public.wang_plan_nodes existing
  where existing.group_id = golf_group.group_id
    and existing.level = 'year'
    and existing.title = 'Årsplan 2026/2027'
    and existing.is_demo = true
);

with golf_group as (
  select group_row.id as group_id, group_row.school_sport_id
  from public.wang_groups group_row
  where group_row.code = 'FRE-GO-G2'
    and group_row.school_year = '2026/2027'
    and group_row.is_demo = true
), year_plan as (
  select plan.id
  from public.wang_plan_nodes plan
  join golf_group on golf_group.group_id = plan.group_id
  where plan.level = 'year'
    and plan.title = 'Årsplan 2026/2027'
    and plan.is_demo = true
  limit 1
)
insert into public.wang_plan_nodes (
  school_sport_id,
  group_id,
  parent_id,
  level,
  title,
  starts_on,
  ends_on,
  status,
  source_note,
  subject_basis_status,
  is_demo
)
select
  golf_group.school_sport_id,
  golf_group.group_id,
  year_plan.id,
  'period',
  'Høstperiode 2',
  date '2026-10-05',
  date '2026-11-29',
  'draft',
  'Demo – innhold må kvalitetssikres av WANG Golf',
  'Fagmodell ikke godkjent – B16 ikke koblet',
  true
from golf_group
cross join year_plan
where not exists (
  select 1 from public.wang_plan_nodes existing
  where existing.group_id = golf_group.group_id
    and existing.level = 'period'
    and existing.title = 'Høstperiode 2'
    and existing.is_demo = true
);

with golf_group as (
  select group_row.id as group_id, group_row.school_sport_id
  from public.wang_groups group_row
  where group_row.code = 'FRE-GO-G2'
    and group_row.school_year = '2026/2027'
    and group_row.is_demo = true
), period_plan as (
  select plan.id
  from public.wang_plan_nodes plan
  join golf_group on golf_group.group_id = plan.group_id
  where plan.level = 'period'
    and plan.title = 'Høstperiode 2'
    and plan.is_demo = true
  limit 1
)
insert into public.wang_plan_nodes (
  school_sport_id,
  group_id,
  parent_id,
  level,
  title,
  starts_on,
  ends_on,
  status,
  source_note,
  subject_basis_status,
  is_demo
)
select
  golf_group.school_sport_id,
  golf_group.group_id,
  period_plan.id,
  'month',
  'Oktober 2026',
  date '2026-10-01',
  date '2026-10-31',
  'draft',
  'Demo – innhold må kvalitetssikres av WANG Golf',
  'Fagmodell ikke godkjent – B16 ikke koblet',
  true
from golf_group
cross join period_plan
where not exists (
  select 1 from public.wang_plan_nodes existing
  where existing.group_id = golf_group.group_id
    and existing.level = 'month'
    and existing.title = 'Oktober 2026'
    and existing.is_demo = true
);

with golf_group as (
  select group_row.id as group_id, group_row.school_sport_id
  from public.wang_groups group_row
  where group_row.code = 'FRE-GO-G2'
    and group_row.school_year = '2026/2027'
    and group_row.is_demo = true
), month_plan as (
  select plan.id
  from public.wang_plan_nodes plan
  join golf_group on golf_group.group_id = plan.group_id
  where plan.level = 'month'
    and plan.title = 'Oktober 2026'
    and plan.is_demo = true
  limit 1
)
insert into public.wang_plan_nodes (
  school_sport_id,
  group_id,
  parent_id,
  level,
  title,
  starts_on,
  ends_on,
  status,
  source_note,
  subject_basis_status,
  is_demo
)
select
  golf_group.school_sport_id,
  golf_group.group_id,
  month_plan.id,
  'week',
  'Uke 43 · 19.–25. oktober',
  date '2026-10-19',
  date '2026-10-25',
  'draft',
  'Demo – koblet til kalenderhendelser i uke 43',
  'Fagmodell ikke godkjent – B16 ikke koblet',
  true
from golf_group
cross join month_plan
where not exists (
  select 1 from public.wang_plan_nodes existing
  where existing.group_id = golf_group.group_id
    and existing.level = 'week'
    and existing.title = 'Uke 43 · 19.–25. oktober'
    and existing.is_demo = true
);

with golf_group as (
  select group_row.id as group_id, group_row.school_sport_id
  from public.wang_groups group_row
  where group_row.code = 'FRE-GO-G2'
    and group_row.school_year = '2026/2027'
    and group_row.is_demo = true
), week_plan as (
  select plan.id
  from public.wang_plan_nodes plan
  join golf_group on golf_group.group_id = plan.group_id
  where plan.level = 'week'
    and plan.title = 'Uke 43 · 19.–25. oktober'
    and plan.is_demo = true
  limit 1
)
insert into public.wang_plan_nodes (
  school_sport_id,
  group_id,
  parent_id,
  level,
  title,
  starts_on,
  ends_on,
  status,
  source_note,
  subject_basis_status,
  is_demo
)
select
  golf_group.school_sport_id,
  golf_group.group_id,
  week_plan.id,
  'session',
  'Kortspill 50–100 m',
  date '2026-10-21',
  date '2026-10-21',
  'published',
  'Demo – øktdetaljer er ikke en godkjent idrettsfaglig modell',
  'Fagmodell ikke godkjent – B16 ikke koblet',
  true
from golf_group
cross join week_plan
where not exists (
  select 1 from public.wang_plan_nodes existing
  where existing.group_id = golf_group.group_id
    and existing.level = 'session'
    and existing.title = 'Kortspill 50–100 m'
    and existing.is_demo = true
);

update public.wang_calendar_events event
set plan_node_id = plan.id,
    updated_at = now()
from public.wang_plan_nodes plan
where event.is_demo = true
  and event.title = 'Kortspill 50–100 m'
  and plan.is_demo = true
  and plan.level = 'session'
  and plan.title = event.title
  and plan.group_id = event.group_id
  and event.plan_node_id is null;
