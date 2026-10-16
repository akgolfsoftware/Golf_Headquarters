create table public.wang_message_threads (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.wang_students(id) on delete cascade,
  subject text not null check (char_length(btrim(subject)) between 1 and 160),
  created_by uuid references public.wang_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  check (closed_at is null or closed_at >= created_at)
);

create table public.wang_message_participants (
  thread_id uuid not null references public.wang_message_threads(id) on delete cascade,
  profile_id uuid not null references public.wang_profiles(id) on delete cascade,
  participant_role public.wang_role not null,
  can_reply boolean not null default false,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  check (left_at is null or left_at >= joined_at),
  primary key (thread_id, profile_id)
);

create table public.wang_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.wang_message_threads(id) on delete cascade,
  sender_profile_id uuid references public.wang_profiles(id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  client_request_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique (sender_profile_id, client_request_id)
);

create index wang_message_threads_student_idx
  on public.wang_message_threads (student_id, updated_at desc);

create index wang_message_participants_profile_idx
  on public.wang_message_participants (profile_id, left_at, thread_id);

create index wang_messages_thread_idx
  on public.wang_messages (thread_id, created_at);

create or replace function private.wang_profile_can_message_student(
  p_profile_id uuid,
  p_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wang_profiles profile
    join public.wang_students student on student.id = p_student_id
    join public.wang_groups group_row on group_row.id = student.group_id
    join public.wang_school_sports school_sport on school_sport.id = group_row.school_sport_id
    where profile.id = p_profile_id
      and profile.active = true
      and student.is_demo = false
      and student.profile_id is not null
      and (
        (profile.role = 'student' and student.profile_id = profile.id)
        or (
          profile.role in ('school_leader', 'principal', 'head_of_sports')
          and profile.school_id = school_sport.school_id
        )
        or (
          profile.role in ('sports_director', 'coach')
          and exists (
            select 1
            from public.wang_staff_memberships membership
            where membership.profile_id = profile.id
              and membership.school_sport_id = group_row.school_sport_id
              and membership.role = profile.role
              and membership.active = true
          )
        )
        or (
          profile.role in ('guardian', 'club_coach')
          and exists (
            select 1
            from public.wang_external_access external_access
            where external_access.reader_profile_id = profile.id
              and external_access.student_id = student.id
              and external_access.revoked_at is null
              and external_access.starts_at <= now()
              and external_access.expires_at > now()
              and 'messages' = any(external_access.scopes)
          )
        )
      )
  );
$$;

create or replace function private.wang_profile_can_start_message(
  p_profile_id uuid,
  p_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wang_profiles profile
    where profile.id = p_profile_id
      and profile.active = true
      and profile.role in (
        'school_leader',
        'principal',
        'head_of_sports',
        'sports_director',
        'coach'
      )
      and private.wang_profile_can_message_student(profile.id, p_student_id)
  );
$$;

create or replace function private.wang_is_message_thread_participant(
  p_profile_id uuid,
  p_thread_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wang_message_participants participant
    join public.wang_message_threads thread on thread.id = participant.thread_id
    where participant.thread_id = p_thread_id
      and participant.profile_id = p_profile_id
      and participant.left_at is null
      and private.wang_profile_can_message_student(p_profile_id, thread.student_id)
  );
$$;

create or replace function private.wang_guard_message_thread_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.created_by is null
      or not private.wang_profile_can_start_message(new.created_by, new.student_id) then
      raise exception 'WANG message thread is not allowed';
    end if;
  elsif new.student_id is distinct from old.student_id
    or new.created_by is distinct from old.created_by then
    raise exception 'WANG message thread ownership cannot change';
  end if;

  return new;
end;
$$;

create or replace function private.wang_guard_message_participant_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  thread_student_id uuid;
  current_role public.wang_role;
begin
  select thread.student_id
  into thread_student_id
  from public.wang_message_threads thread
  where thread.id = new.thread_id;

  select profile.role
  into current_role
  from public.wang_profiles profile
  where profile.id = new.profile_id
    and profile.active = true;

  if thread_student_id is null
    or current_role is null
    or current_role is distinct from new.participant_role
    or not private.wang_profile_can_message_student(new.profile_id, thread_student_id) then
    raise exception 'WANG message participant is not allowed';
  end if;

  return new;
end;
$$;

create or replace function private.wang_guard_message_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.sender_profile_id is null
    or not exists (
      select 1
      from public.wang_message_participants participant
      where participant.thread_id = new.thread_id
        and participant.profile_id = new.sender_profile_id
        and participant.left_at is null
        and participant.can_reply = true
    )
    or not private.wang_is_message_thread_participant(new.sender_profile_id, new.thread_id) then
    raise exception 'WANG message sender is not allowed';
  end if;

  return new;
end;
$$;

create trigger wang_message_threads_guard
before insert or update on public.wang_message_threads
for each row execute function private.wang_guard_message_thread_write();

create trigger wang_message_participants_guard
before insert or update on public.wang_message_participants
for each row execute function private.wang_guard_message_participant_write();

create trigger wang_messages_guard
before insert or update on public.wang_messages
for each row execute function private.wang_guard_message_write();

alter table public.wang_message_threads enable row level security;
alter table public.wang_message_participants enable row level security;
alter table public.wang_messages enable row level security;

revoke all on public.wang_message_threads from public, anon, authenticated;
revoke all on public.wang_message_participants from public, anon, authenticated;
revoke all on public.wang_messages from public, anon, authenticated;

grant select on public.wang_message_threads to authenticated;
grant select on public.wang_message_participants to authenticated;
grant select on public.wang_messages to authenticated;

create policy "wang_message_threads_select_participant"
on public.wang_message_threads
for select
to authenticated
using (
  private.wang_is_message_thread_participant((select auth.uid()), id)
);

create policy "wang_message_participants_select_participant"
on public.wang_message_participants
for select
to authenticated
using (
  private.wang_is_message_thread_participant((select auth.uid()), thread_id)
);

create policy "wang_messages_select_participant"
on public.wang_messages
for select
to authenticated
using (
  private.wang_is_message_thread_participant((select auth.uid()), thread_id)
);

revoke all on function private.wang_profile_can_message_student(uuid, uuid) from public, anon, authenticated;
revoke all on function private.wang_profile_can_start_message(uuid, uuid) from public, anon, authenticated;
revoke all on function private.wang_is_message_thread_participant(uuid, uuid) from public, anon, authenticated;
revoke all on function private.wang_guard_message_thread_write() from public, anon, authenticated;
revoke all on function private.wang_guard_message_participant_write() from public, anon, authenticated;
revoke all on function private.wang_guard_message_write() from public, anon, authenticated;

grant execute on function private.wang_is_message_thread_participant(uuid, uuid) to authenticated;
