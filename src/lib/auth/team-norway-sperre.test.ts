import assert from "node:assert/strict";
import { test } from "node:test";

import { erSperretTeamNorwaySti, tryggTeamNorwayRetursti } from "./team-norway-sperre";

test("sperrer bare rutene som krever innlogging", () => {
  assert.equal(erSperretTeamNorwaySti("/team-norway/workbench"), true);
  assert.equal(erSperretTeamNorwaySti("/team-norway/spiller/abc/tester"), true);
  assert.equal(erSperretTeamNorwaySti("/team-norway"), false);
  assert.equal(erSperretTeamNorwaySti("/team-norway/rangliste"), false);
  assert.equal(erSperretTeamNorwaySti("/team-norway/workbench-ond"), false);
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
