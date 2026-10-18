import assert from "node:assert/strict";
import { test } from "node:test";

import { erSperretTeamNorwaySti, tryggTeamNorwayRetursti } from "./team-norway-sperre";

test("hele /team-norway er stengt for uinnloggede", () => {
  for (const sti of [
    "/team-norway",
    "/team-norway/",
    "/team-norway/workbench",
    "/team-norway/spiller/abc/tester",
    "/team-norway/rangliste",
    "/team-norway/inviter",
    "/team-norway/live-watch",
    "/team-norway/gruppe-1/dokumenter",
  ]) {
    assert.equal(erSperretTeamNorwaySti(sti), true, sti);
  }
});

test("innloggingssiden og andre flater er ikke stengt av denne vakten", () => {
  for (const sti of ["/teamnorway", "/team-norway-ond", "/team-wang", "/portal"]) {
    assert.equal(erSperretTeamNorwaySti(sti), false, sti);
  }
});

test("beholder interne returstier under team-norway", () => {
  assert.equal(tryggTeamNorwayRetursti("/team-norway/workbench?visning=uke#a"), "/team-norway/workbench?visning=uke#a");
  assert.equal(tryggTeamNorwayRetursti("/team-norway"), "/team-norway");
});

test("avviser ekstern, protokollrelativ og forfalsket sti", () => {
  for (const verdi of [
    "https://ond.example/team-norway",
    "//ond.example/team-norway",
    "/team-norway-ond/x",
    "/portal",
    "/team-norway\\@ond.example",
    "/team-norway/\tx",
    "",
    ["/team-norway/workbench", "https://ond.example"],
    undefined,
  ]) {
    assert.equal(tryggTeamNorwayRetursti(verdi), "/team-norway", String(verdi));
  }
});
