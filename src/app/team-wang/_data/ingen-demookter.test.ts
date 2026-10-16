import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import * as wangPlan from "./wang-plan";
import * as liveSesong from "./live-sesong";

// Den gamle fellessiden (wang-fellesside.tsx) viste faste demoøkter (SESSIONS)
// blandet med gruppas ekte data. Siden var ikke koblet til noen rute og ble
// slettet 16.10.2026 (beslutninger.md §ÉN IUP OG ETT TESTBATTERI, punkt 6).
// Testene under hindrer at demoøktene kommer tilbake i /team-wang.

const TEAM_WANG = path.resolve(process.cwd(), "src/app/team-wang");

function filerUnder(mappe: string): string[] {
  return readdirSync(mappe).flatMap((navn) => {
    const full = path.join(mappe, navn);
    if (statSync(full).isDirectory()) return filerUnder(full);
    return /\.(ts|tsx)$/.test(navn) && !navn.endsWith(".test.ts") ? [full] : [];
  });
}

test("wang-plan har ingen demoøkter eller demohendelser", () => {
  for (const navn of [
    "SESSIONS",
    "SESSION_BY_ISO",
    "SESSION_BY_ID",
    "TEMPLATES",
    "EVENTS",
    "COMPS",
    "TESTS",
    "TRAINING_CAMPS",
    "FULL_DAY_CAMPS",
    "monthInfo",
  ]) {
    assert.equal(navn in wangPlan, false, `wang-plan eksporterer ${navn}`);
  }
});

test("live-sesong bygger ikke lenger kalender med demoøkter", () => {
  assert.equal("byggLiveKalenderHendelser" in liveSesong, false);
  assert.equal(liveSesong.erTurneringstittel("Turnering: Srixon Tour"), true);
  assert.equal(liveSesong.erTurneringstittel("Fellessamling"), false);
});

test("ingen fil under /team-wang bruker demoøktene eller den gamle fellessiden", () => {
  const forbudt = /\bSESSIONS\b|SESSION_BY_|byggLiveKalenderHendelser|wang-fellesside|_components\/fane-kalender["']/;
  const treff = filerUnder(TEAM_WANG).filter((fil) =>
    forbudt.test(readFileSync(fil, "utf8")),
  );
  assert.deepEqual(
    treff.map((f) => path.relative(TEAM_WANG, f)),
    [],
  );
});

test("fellessiden /team-wang viser årsplanen, ikke den gamle fellessiden", () => {
  const side = readFileSync(path.join(TEAM_WANG, "page.tsx"), "utf8");
  assert.match(side, /WangArsplanShell/);
  const kalender = readFileSync(
    path.join(TEAM_WANG, "_components/arsplan-2026-27/fane-kalender-arsplan.tsx"),
    "utf8",
  );
  assert.match(kalender, /ARSPLAN_EVENTS/);
});
