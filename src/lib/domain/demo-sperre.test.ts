import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { demoFlateForEpost, demoSperre, demoStoppesAvVakt, erDemoSperretSti } from "./demo-sperre";

test("demokontoene sendes fra AgencyOS til sin egen trenerflate", () => {
  assert.deepEqual(demoSperre("demo@golfforbundet.no", "/admin/agencyos"), { type: "send-til", sti: "/team-norway" });
  assert.deepEqual(demoSperre(" DEMO@wang.no ", "/admin/kalender"), { type: "send-til", sti: "/team-wang/coach" });
  assert.deepEqual(demoSperre("demo@wang.no", "/admin"), { type: "send-til", sti: "/team-wang/coach" });
});

test("demokontoene avvises på coach-API-ene", () => {
  for (const sti of ["/api/admin/search", "/api/admin/reports/spillere.csv", "/api/coach/ai-chat", "/api/kommando/chat", "/api/view-as-player"]) {
    assert.deepEqual(demoSperre("demo@golfforbundet.no", sti), { type: "avvis" }, sti);
  }
});

test("demokontoene slipper inn på sin egen flate", () => {
  assert.equal(demoSperre("demo@golfforbundet.no", "/team-norway"), null);
  assert.equal(demoSperre("demo@wang.no", "/team-wang/coach"), null);
  assert.equal(demoSperre("demo@golfforbundet.no", "/api/team-norway/x"), null);
});

test("vanlige kontoer berøres ikke", () => {
  assert.equal(demoSperre("anders@akgolf.no", "/admin/agencyos"), null);
  assert.equal(demoSperre(null, "/admin/agencyos"), null);
  assert.equal(demoFlateForEpost("trener@wang.no"), null);
});

test("bare AgencyOS- og coach-stier krever oppslag", () => {
  assert.equal(erDemoSperretSti("/admin/kalender"), true);
  assert.equal(erDemoSperretSti("/api/coach/ai-chat"), true);
  assert.equal(erDemoSperretSti("/administrasjon"), false);
  assert.equal(erDemoSperretSti("/api/adminx"), false);
  assert.equal(erDemoSperretSti("/team-norway"), false);
});

test("vaktene stopper demokontoene unntatt der flaten slipper dem inn", () => {
  assert.equal(demoStoppesAvVakt("demo@golfforbundet.no", false), true);
  assert.equal(demoStoppesAvVakt("demo@wang.no", false), true);
  assert.equal(demoStoppesAvVakt("demo@wang.no", true), false);
  assert.equal(demoStoppesAvVakt("anders@akgolf.no", false), false);
});

test("ingen AgencyOS-side eller -handling slipper inn demokontoene", () => {
  // Server-handlinger kan postes til hvilken som helst adresse, så proxyen alene
  // holder ikke. Unntaket er gruppehandlingene Team Norway bruker for å invitere
  // spillere; de er avgrenset til grupper treneren selv eier.
  const unntak = new Set([path.join("src", "app", "admin", "grupper", "[id]", "actions.ts")]);
  const treff: string[] = [];
  const gaa = (mappe: string) => {
    for (const e of readdirSync(mappe, { withFileTypes: true })) {
      const sti = path.join(mappe, e.name);
      if (e.isDirectory()) gaa(sti);
      else if (/\.tsx?$/.test(e.name) && !unntak.has(sti) && readFileSync(sti, "utf8").includes("tillatDemo")) treff.push(sti);
    }
  };
  gaa(path.join("src", "app", "admin"));
  gaa(path.join("src", "app", "api", "admin"));
  assert.deepEqual(treff, []);
});
