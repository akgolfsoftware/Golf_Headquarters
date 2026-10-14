import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import path from "node:path";

const migration = readFileSync(
  path.join(
    process.cwd(),
    "supabase-wang/migrations/20261013064000_wang_role_access_contract.sql",
  ),
  "utf8",
);

const hardeningMigration = readFileSync(
  path.join(
    process.cwd(),
    "supabase-wang/migrations/20261013065000_wang_external_access_hardening.sql",
  ),
  "utf8",
);

const calendarScopeMigration = readFileSync(
  path.join(
    process.cwd(),
    "supabase-wang/migrations/20261014024517_wang_calendar_scope_guard.sql",
  ),
  "utf8",
);

const messageFoundationMigration = readFileSync(
  path.join(
    process.cwd(),
    "supabase-wang/migrations/20261014140000_wang_message_foundation_readonly.sql",
  ),
  "utf8",
);

const messageIndexMigration = readFileSync(
  path.join(
    process.cwd(),
    "supabase-wang/migrations/20261014142000_wang_message_created_by_index.sql",
  ),
  "utf8",
);

test("sentral admin får oversikt uten automatisk tilgang til elever", () => {
  const studentFunction = migration.match(
    /create or replace function private\.wang_can_access_student[\s\S]*?\n\$\$;/,
  );
  assert.ok(studentFunction);
  assert.doesNotMatch(studentFunction[0], /central_admin/);
});

test("morgeninnsjekk er begrenset til elev, sportssjef og trener", () => {
  const wellbeingFunction = migration.match(
    /create or replace function private\.wang_can_access_wellbeing[\s\S]*?\n\$\$;/,
  );
  assert.ok(wellbeingFunction);
  assert.match(wellbeingFunction[0], /sports_director/);
  assert.match(wellbeingFunction[0], /coach/);
  assert.doesNotMatch(wellbeingFunction[0], /principal|head_of_sports|guardian|club_coach/);
});

test("klubbtrenerens tilgang har periode", () => {
  assert.match(migration, /expires_at timestamptz not null/);
  assert.match(migration, /revoked_at timestamptz/);
  assert.match(migration, /expires_at > now\(\)/);
});

test("eleven kan bare oppdatere tilbakekallingsfeltet på egen deling", () => {
  assert.match(hardeningMigration, /drop function if exists public\.revoke_wang_external_access/);
  assert.match(hardeningMigration, /grant update \(revoked_at\)/);
  assert.match(hardeningMigration, /create policy "student revoke external access"/);
  assert.match(hardeningMigration, /student\.profile_id = \(select auth\.uid\(\)\)/);
});

test("brukeren kan ikke endre sin egen rolle eller skoletilhørighet", () => {
  assert.match(migration, /revoke update on public\.wang_profiles from authenticated/);
  assert.match(migration, /grant update \(display_name\) on public\.wang_profiles to authenticated/);
});

test("eksterne lesere trenger aktivt calendar-scope for kalenderhendelser", () => {
  assert.match(calendarScopeMigration, /create or replace function private\.wang_event_scope_is_consistent/);
  assert.match(calendarScopeMigration, /create or replace function private\.wang_can_view_calendar_event/);
  assert.match(calendarScopeMigration, /'calendar' = any\(access_row\.scopes\)/);
  assert.match(calendarScopeMigration, /access_row\.expires_at > now\(\)/);
  assert.match(calendarScopeMigration, /access_row\.revoked_at is null/);
  assert.match(
    calendarScopeMigration,
    /private\.wang_can_view_calendar_event\(school_sport_id, group_id, student_id\)/,
  );
  assert.match(calendarScopeMigration, /alter policy "authorized create events"/);
  assert.match(calendarScopeMigration, /alter policy "authorized update events"/);
  assert.match(
    calendarScopeMigration,
    /private\.wang_event_scope_is_consistent\(school_sport_id, group_id, student_id\)/,
  );
});

test("meldinger er begrenset til navngitt elev og aktiv rolle", () => {
  const accessFunction = messageFoundationMigration.match(
    /create or replace function private\.wang_profile_can_message_student[\s\S]*?\n\$\$;/,
  );
  assert.ok(accessFunction);
  assert.doesNotMatch(accessFunction[0], /central_admin|readonly/);
  assert.match(accessFunction[0], /student\.profile_id = profile\.id/);
  assert.match(accessFunction[0], /membership\.active = true/);
  assert.match(accessFunction[0], /external_access\.reader_profile_id = profile\.id/);
  assert.match(accessFunction[0], /external_access\.starts_at <= now\(\)/);
  assert.match(accessFunction[0], /external_access\.expires_at > now\(\)/);
  assert.match(accessFunction[0], /external_access\.revoked_at is null/);
  assert.match(accessFunction[0], /'messages' = any\(external_access\.scopes\)/);
});

test("bare godkjente voksne kan starte en WANG-samtale", () => {
  const starterFunction = messageFoundationMigration.match(
    /create or replace function private\.wang_profile_can_start_message[\s\S]*?\n\$\$;/,
  );
  assert.ok(starterFunction);
  assert.match(starterFunction[0], /school_leader/);
  assert.match(starterFunction[0], /principal/);
  assert.match(starterFunction[0], /head_of_sports/);
  assert.match(starterFunction[0], /sports_director/);
  assert.match(starterFunction[0], /coach/);
  assert.doesNotMatch(
    starterFunction[0],
    /'(student|guardian|club_coach|central_admin|readonly)'/,
  );
});

test("meldingsgrunnlaget er skrivebeskyttet for innloggede klienter", () => {
  assert.doesNotMatch(messageFoundationMigration, /wang_current_profile_id/);
  assert.equal(
    messageFoundationMigration.match(/private\.wang_is_message_thread_participant\(\(select auth\.uid\(\)\),/g)?.length,
    3,
  );
  for (const table of [
    "wang_message_threads",
    "wang_message_participants",
    "wang_messages",
  ]) {
    assert.match(
      messageFoundationMigration,
      new RegExp(`revoke all on public\\.${table} from public, anon, authenticated`),
    );
    assert.match(
      messageFoundationMigration,
      new RegExp(`grant select on public\\.${table} to authenticated`),
    );
  }
  assert.doesNotMatch(messageFoundationMigration, /grant (insert|update|delete|all)/i);
  assert.doesNotMatch(messageFoundationMigration, /for (insert|update|delete|all)\s+to authenticated/i);
  assert.doesNotMatch(messageFoundationMigration, /email|phone|sleep|readiness|checkin/i);
  assert.match(messageIndexMigration, /wang_message_threads \(created_by\)/);
});
