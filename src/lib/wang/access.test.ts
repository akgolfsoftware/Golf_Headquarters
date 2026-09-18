import assert from "node:assert/strict";
import { test } from "node:test";
import {
  activeMemberships,
  canAccessScreen,
  canPostToPlayer,
  canSetConsent,
  groupsVisibleTo,
  latestConsent,
  playersVisibleTo,
  rankingVisible,
  schoolAggregates,
} from "./access.ts";
import {
  CONSENTS,
  GROUPS,
  MEMBERSHIPS,
  PARENTS,
  PLAYERS,
  SCHOOLS,
} from "./data.ts";

const ALL_GROUPS = GROUPS.map((g) => g.id);

test("rollen bor på gruppen — utmeldt medlemskap gir null innsyn", () => {
  const active = activeMemberships(MEMBERSHIPS, "u-gammel");
  assert.equal(active.length, 0);
});

test("sportssjef ser alle grupper, trener bare egne aktive", () => {
  const ss = groupsVisibleTo(MEMBERSHIPS, "u-anders", "SS", ALL_GROUPS);
  const tr = groupsVisibleTo(MEMBERSHIPS, "u-marte", "TR", ALL_GROUPS);
  assert.equal(ss.length, 6);
  assert.deepEqual(tr.sort(), ["g-golf", "g-u16"]);
});

test("TN-18 tilgang er bare sportssjef", () => {
  assert.equal(canAccessScreen("SS", "tilgang"), true);
  assert.equal(canAccessScreen("TR", "tilgang"), false);
  assert.equal(canAccessScreen("HJ", "tilgang"), false);
  assert.equal(canAccessScreen("SP", "tilgang"), false);
});

test("ranglisten er skjult for spiller og foresatt", () => {
  assert.equal(rankingVisible("SP"), false);
  assert.equal(rankingVisible("FO"), false);
  assert.equal(rankingVisible("TR"), true);
});

test("hjelpetrener når ikke protokolldetalj", () => {
  assert.equal(canAccessScreen("HJ", "protokolldetalj"), false);
  assert.equal(canAccessScreen("TR", "protokolldetalj"), true);
});

test("skoleaggregat navngir aldri utøvere og bruker under-3", () => {
  const ssPlayers = PLAYERS.map((p) => p.id);
  const rows = schoolAggregates({
    role: "SS",
    schools: SCHOOLS,
    players: PLAYERS,
    visiblePlayerIds: ssPlayers,
  });
  const glemmen = rows.find((r) => r.schoolId === "s-glemmen");
  const olav = rows.find((r) => r.schoolId === "s-olav");
  const wang = rows.find((r) => r.schoolId === "s-wang");
  assert.equal(glemmen?.athleteCountLabel, "under 3");
  assert.equal(olav?.athleteCountLabel, "under 3");
  assert.equal(wang?.athleteCountLabel, "5");
  for (const row of rows) {
    assert.deepEqual(row.namedAthletes, []);
  }
});

test("ekstern leser ser kun egen skole", () => {
  const rows = schoolAggregates({
    role: "EL",
    elSchoolId: "s-wang",
    schools: SCHOOLS,
    players: PLAYERS,
    visiblePlayerIds: [],
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.schoolId, "s-wang");
});

test("1:1-post til mindreårig uten foresatt er sperret", () => {
  const ida = PLAYERS.find((p) => p.id === "u-ida")!;
  const blocked = canPostToPlayer({
    role: "TR",
    player: ida,
    parentRelations: PARENTS,
  });
  assert.equal(blocked.ok, false);

  const emma = PLAYERS.find((p) => p.id === "u-emma")!;
  const ok = canPostToPlayer({
    role: "TR",
    player: emma,
    parentRelations: PARENTS,
  });
  assert.equal(ok.ok, true);
});

test("samtykke er append-only — nyeste rad vinner", () => {
  const latest = latestConsent(CONSENTS, "u-emma", "deling-tn", "g-golf");
  assert.equal(latest?.gitt, true);
  const ngf = latestConsent(CONSENTS, "u-emma", "skole-navn-ngf", "ngf");
  assert.equal(ngf?.gitt, false);
});

test("mindreårig kan ikke sette eget samtykke", () => {
  const emma = PLAYERS.find((p) => p.id === "u-emma")!;
  assert.equal(canSetConsent({ actorRole: "SP", player: emma }), false);
  assert.equal(canSetConsent({ actorRole: "FO", player: emma }), true);
});

test("foresatt ser bare eget barn, ikke gruppelisten", () => {
  const seen = playersVisibleTo({
    role: "FO",
    userId: "u-kari",
    memberships: MEMBERSHIPS,
    players: PLAYERS,
    allGroupIds: ALL_GROUPS,
  });
  assert.deepEqual(
    seen.map((p) => p.id),
    ["u-emma"],
  );
});
