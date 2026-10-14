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
