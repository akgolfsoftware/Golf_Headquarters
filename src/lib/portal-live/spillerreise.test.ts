import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { idagNaaCta } from "@/lib/portal/idag-visning";
import { planWeekSession, type PlanWeekRow } from "@/lib/portal/plan-week";
import { v2DbSessionHref } from "@/lib/portal/session-hrefs";
import {
  canAccessResolved,
  liveHrefForStatus,
  liveRouteForResolved,
  type LiveSessionKind,
  type ResolvedLiveSession,
} from "./live-route";
import { mapWbToLiveSummary } from "./wb-live-map";
import {
  idagCtaForOkt,
  liveRouterHref,
  liveSteg,
  oktLivFraStatus,
  registrerteTapperTall,
  registrerteV2Tall,
  skillOktOgPersistens,
  stegFraLiveHref,
} from "./spillerreise";

const SPILLER = "spiller-1";
const COACH = "coach-1";
const FREMMED = "fremmed";

function resolved(kind: LiveSessionKind, status: string): ResolvedLiveSession {
  return {
    kind,
    id: `${kind}-1`,
    status,
    playerId: SPILLER,
    coachId: COACH,
    hostId: null,
    isParticipant: false,
  };
}

function planRad(status: PlanWeekRow["status"]): PlanWeekRow {
  return {
    id: "plan-1",
    title: "Mobilitet",
    scheduledAt: new Date("2026-09-14T07:00Z"),
    durationMin: 40,
    status,
    pyramidArea: "FYS",
    location: "Studio",
    miljo: null,
    maalsetning: "Hold 8/12",
    drills: [{ id: "d1", repMinutter: 15, exercise: { name: "Hofte", durationMin: 15 } }],
  };
}

describe("R-E innlogget spillerreise", () => {
  it("samme økt-ID følger I dag, Plan, øktark, Live, oppsummering og gjenåpning for alle tre modeller", () => {
    const v2Id = "v2-1";
    const wbId = "wb-1";
    const planId = "plan-1";

    assert.equal(idagCtaForOkt("v2", v2Id, "PLANNED").ctaHref, liveRouterHref(v2Id));
    assert.equal(idagCtaForOkt("wb", wbId, "PUBLISHED").ctaHref, liveRouterHref(wbId));
    assert.equal(idagCtaForOkt("plan", planId, "PLANNED").ctaHref, liveRouterHref(planId));

    assert.equal(v2DbSessionHref(v2Id, "PLANNED"), liveRouterHref(v2Id));
    assert.equal(liveHrefForStatus("wb", "PUBLISHED", wbId), `/portal/live/${wbId}/brief`);
    const plan = planWeekSession(planRad("PLANNED"));
    assert.equal(plan?.id, planId);
    assert.equal(plan?.model, "plan");
    assert.equal(plan?.href, `/portal/live/${planId}/brief`);

    assert.deepEqual(liveSteg("v2", v2Id, "PLANNED"), { href: `/portal/live/${v2Id}/brief`, steg: "ph04" });
    assert.deepEqual(liveSteg("wb", wbId, "PUBLISHED"), { href: `/portal/live/${wbId}/brief`, steg: "ph04" });
    assert.deepEqual(liveSteg("plan", planId, "PLANNED"), { href: `/portal/live/${planId}/brief`, steg: "ph04" });

    assert.deepEqual(liveSteg("v2", v2Id, "IN_PROGRESS"), { href: `/portal/live/${v2Id}/active`, steg: "ph05" });
    assert.deepEqual(liveSteg("wb", wbId, "IN_PROGRESS"), { href: `/portal/live/${wbId}/tapper`, steg: "ph05" });
    assert.deepEqual(liveSteg("plan", planId, "ACTIVE"), { href: `/portal/live/${planId}/tapper`, steg: "ph05" });

    for (const [kind, id] of [["v2", v2Id], ["wb", wbId], ["plan", planId]] as const) {
      const ferdig = liveSteg(kind, id, "COMPLETED");
      assert.equal(ferdig.steg, "ph06");
      assert.equal(ferdig.href, `/portal/live/${id}/summary`);
      assert.equal(idagCtaForOkt(kind, id, "COMPLETED").ctaHref, ferdig.href);
      assert.equal(stegFraLiveHref(ferdig.href), "ph06");
    }
  });

  it("I dag-CTA skiller start, fortsett og recap uten å bytte økt", () => {
    const start = idagNaaCta({ id: "wb-1", modell: "wb", status: "PUBLISHED" });
    const fortsett = idagNaaCta({ id: "wb-1", modell: "wb", status: "IN_PROGRESS" });
    const recap = idagNaaCta({ id: "wb-1", modell: "wb", status: "COMPLETED" });
    assert.equal(start.ctaTekst, "Start økt");
    assert.equal(fortsett.ctaTekst, "Fortsett");
    assert.equal(recap.ctaTekst, "Se recap");
    assert.equal(start.ctaHref.includes("wb-1"), true);
    assert.equal(fortsett.ctaHref.includes("wb-1"), true);
    assert.equal(recap.ctaHref.includes("wb-1"), true);
  });

  it("registrerte tall overlever fullføring og gjenåpning", () => {
    const v2 = registrerteV2Tall({
      liveSummary: { totalReps: 13, drillsCompleted: 1, durationSec: 123, completedDrillIds: ["d1"] },
    });
    assert.deepEqual(v2, { totalReps: 13, drillsCompleted: 1, durationSec: 123 });
    assert.deepEqual(registrerteV2Tall({ liveSummary: { totalReps: 13, drillsCompleted: 1, durationSec: 123 } }), v2);

    const counts = [{ count: 12 }, { count: 8 }];
    assert.equal(registrerteTapperTall(counts), 20);
    const summary = mapWbToLiveSummary({
      id: "wb-1",
      title: "Innspill",
      status: "COMPLETED",
      pyramid: "TEK",
      durationMinutes: 50,
      date: new Date(Date.UTC(2026, 8, 14)),
      startMinute: 540,
      location: "Range",
      notes: null,
      publishedAt: null,
      createdAt: new Date(0),
      drills: [],
    }, counts);
    assert.equal(summary.sessionId, "wb-1");
    assert.equal(summary.totalReps, 20);
    assert.equal(summary.durationSec, 0);
  });

  it("planlagt, pågående, fullført og avbrutt holdes atskilt fra lagret/lagrer/feilet", () => {
    assert.equal(oktLivFraStatus("v2", "PLANNED"), "planlagt");
    assert.equal(oktLivFraStatus("v2", "IN_PROGRESS"), "pagar");
    assert.equal(oktLivFraStatus("wb", "IN_PROGRESS"), "pagar");
    assert.equal(oktLivFraStatus("plan", "ACTIVE"), "pagar");
    assert.equal(oktLivFraStatus("plan", "PAUSED"), "pagar");
    assert.equal(oktLivFraStatus("v2", "COMPLETED"), "fullfort");
    assert.equal(oktLivFraStatus("wb", "SKIPPED"), "avbrutt");
    assert.equal(oktLivFraStatus("plan", "ABANDONED"), "avbrutt");

    const pagaendeFeilet = skillOktOgPersistens("pagar", "feilet");
    assert.equal(pagaendeFeilet.liv, "pagar");
    assert.equal(pagaendeFeilet.persistens, "feilet");
    const fullfortLagret = skillOktOgPersistens("fullfort", "lagret");
    assert.equal(fullfortLagret.liv, "fullfort");
    assert.notEqual(pagaendeFeilet.liv, fullfortLagret.liv);
  });

  it("egen spiller og tillatt coach slipper inn; uvedkommende avvises uten øktdata", () => {
    for (const kind of ["v2", "wb", "plan"] as const) {
      const okt = resolved(kind, "PUBLISHED");
      assert.equal(canAccessResolved(okt, SPILLER, false), true);
      assert.equal(canAccessResolved(okt, FREMMED, true), true);
      assert.equal(canAccessResolved(okt, FREMMED, false), false);
      assert.equal(liveRouteForResolved(okt, { userId: FREMMED, hasPlayerAccess: false }).type, "forbidden");
      assert.equal(liveRouteForResolved(null, { userId: SPILLER, hasPlayerAccess: false }).type, "notfound");
    }
    const v2Deltaker = resolved("v2", "PLANNED");
    v2Deltaker.isParticipant = true;
    assert.equal(canAccessResolved(v2Deltaker, FREMMED, false), true);
    const v2Coach = resolved("v2", "PLANNED");
    assert.equal(canAccessResolved(v2Coach, COACH, false), true);
  });

  it("kritiske ruter hopper ikke over manglende økt", () => {
    const rute = liveRouteForResolved(null, { userId: SPILLER, hasPlayerAccess: false });
    assert.deepEqual(rute, { type: "notfound" });
    assert.equal(registrerteV2Tall(null), null);
    assert.equal(registrerteV2Tall({}), null);
    assert.equal(planWeekSession(planRad("ABANDONED")), null);
  });
});
