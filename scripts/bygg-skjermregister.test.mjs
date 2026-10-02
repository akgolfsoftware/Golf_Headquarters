import test from "node:test";
import assert from "node:assert/strict";
import { patternScore, bestMatch, navigationKind, buildRegister } from "./bygg-skjermregister.mjs";
import { PRECISION_TYPER } from "./skjermregister-typer.mjs";

test("dynamic segment names do not have to match, and an exact type beats a prefix", () => {
  assert.ok(patternScore("/portal/live/[id]/active", "/portal/live/[sessionId]/active") >= 2000);
  assert.equal(patternScore("/team-norway/[groupId]", "/team-norway/analyse"), -1);
  assert.ok(patternScore("/team-norway/[groupId]", "/team-norway/[groupId]") >= 2000);
  const active = bestMatch("/portal/live/[sessionId]/active", PRECISION_TYPER);
  assert.equal(active.type.id, "PH-05");
  assert.equal(bestMatch("/portal/tren/tester/ny", PRECISION_TYPER).type.id, "PH-14");
  assert.equal(bestMatch("/portal/tren/tester/[testId]/gjennomfor", PRECISION_TYPER).type.id, "PH-15");
  assert.equal(bestMatch("/portal/meg/bookinger/reschedule/[bookingId]", PRECISION_TYPER).type.id, "PH-23");
  assert.equal(bestMatch("/admin/spillere/[id]/rediger", PRECISION_TYPER).type.id, "AG-08");
  assert.equal(bestMatch("/admin/spillere/[id]/plan/[planId]", PRECISION_TYPER).type.id, "AG-10");
  assert.equal(bestMatch("/innsyn/talent/discovery", PRECISION_TYPER).type.id, "AG-22");
  assert.equal(bestMatch("/stats/pga/spillere/[dg_id]", PRECISION_TYPER).type.id, "ST-03");
  assert.equal(bestMatch("/stats/pga/drive-distance", PRECISION_TYPER).type.id, "ST-05");
  assert.equal(PRECISION_TYPER.length, 74);
});

test("auth redirects are not screens, and a screen may import redirect", () => {
  assert.equal(navigationKind('import { redirect } from "next/navigation";\nexport default function Page(){ redirect("/admin/agencyos"); }\n').kind, "videresending");
  assert.equal(navigationKind('import { notFound } from "next/navigation";\nexport default function Page(){ notFound(); }\n').kind, "notFound");
  assert.equal(navigationKind('import { redirect } from "next/navigation";\nexport default function Page(){ return <Dashboard />; }\n'), null);
  assert.equal(navigationKind("export default function Page(){ const x: Promise<string> = redirect(\"/x\") as Promise<string>; }\n").kind, "videresending");
});

test("every current page file gets an explanation and an owner", () => {
  const register = buildRegister(process.cwd());
  assert.equal(register.presisjon.skjermtyper, 74);
  assert.equal(register.sider.length, register.inventar.pageFiles);
  assert.equal(new Set(register.sider.map((row) => row.kildefil)).size, register.sider.length);
  for (const row of register.sider) {
    assert.ok(row.forklaring && row.eier === "D01-skjermregister" && row.kobling && row.screenId);
    assert.equal(row.status.kontrollertIApp, false);
    if (row.status.implementert === "ikke-verifisert") assert.equal(row.kontrollbevis, null);
  }
  const byRoute = new Map(register.sider.map((row) => [row.rute, row]));
  assert.equal(byRoute.get("/portal").screenId, "PH-01");
  assert.equal(byRoute.get("/portal").status.valgtForBygging, true);
  assert.equal(byRoute.get("/portal").status.implementert, "precision-visning");
  assert.match(byRoute.get("/portal").kontrollbevis, /PH01IDag/);
  assert.equal(byRoute.get("/admin").kobling, "videresending");
  assert.equal(byRoute.get("/team-gfgk").screenId, "AVSLATT");
  assert.equal(byRoute.get("/").screenId, "MK-FORSIDE");
  assert.equal(byRoute.get("/team-norway/college").screenId, "TN-15");
  assert.match(byRoute.get("/team-norway/college").avvik.join(" "), /TN-06/);
  assert.equal(byRoute.get("/portal/planlegge").screenId, "PH-10");
  assert.equal(byRoute.get("/portal/planlegge").status.implementert, "precision-visning");
  assert.match(byRoute.get("/portal/planlegge").kontrollbevis, /PH10Plan/);
  assert.equal(byRoute.get("/portal/gjennomfore").screenId, "PH-02");
  assert.equal(byRoute.get("/portal/gjennomfore").status.implementert, "precision-visning");
  assert.match(byRoute.get("/portal/gjennomfore").kontrollbevis, /PH02Gjor/);
  assert.equal(byRoute.get("/portal/gjennomfore/[id]").screenId, "PH-03");
  assert.equal(byRoute.get("/portal/gjennomfore/[id]").status.implementert, "precision-visning");
  assert.match(byRoute.get("/portal/gjennomfore/[id]").kontrollbevis, /PH03Oktark/);
  assert.equal(byRoute.get("/portal/live/[sessionId]/brief").screenId, "PH-04");
  assert.equal(byRoute.get("/portal/live/[sessionId]/brief").status.implementert, "precision-visning");
  assert.match(byRoute.get("/portal/live/[sessionId]/brief").kontrollbevis, /PH04Brief/);
  assert.equal(byRoute.get("/portal/live/[sessionId]/active").screenId, "PH-05");
  assert.equal(byRoute.get("/portal/live/[sessionId]/active").status.implementert, "precision-visning");
  assert.match(byRoute.get("/portal/live/[sessionId]/active").kontrollbevis, /PH05Live/);
  assert.equal(byRoute.get("/portal/tren/wb").status.implementert, "ikke-verifisert");
  assert.equal(byRoute.get("/portal/kalender").status.implementert, "ikke-verifisert");
  assert.equal(register.tellinger.implementert, 6);
  assert.equal(register.tellinger.valgtForBygging > 0, true);
  assert.equal(register.sider.some((row) => row.status.kontrollertIApp), false);
});
