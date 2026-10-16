import assert from "node:assert/strict";
import { test } from "node:test";

import { demoFlateForEpost, demoSperre, erDemoSperretSti } from "./demo-sperre";

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
