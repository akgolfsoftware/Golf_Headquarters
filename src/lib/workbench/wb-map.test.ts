/**
 * Mapper-tester — Prisma-rad → domenetype. Rene funksjoner, ingen database.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SPILLER_SYNLIGE_STATUSER,
  fraDatoKolonne,
  mapSession,
  tilDatoKolonne,
  type WbRow,
} from "./wb-map";

function rad(overstyr: Partial<WbRow> = {}): WbRow {
  return {
    id: "ws1",
    playerId: "p1",
    coachId: "c1",
    groupId: null,
    sourceGroupSessionId: null,
    date: new Date(Date.UTC(2026, 7, 24)),
    startMinute: 540,
    durationMinutes: 60,
    title: "Innspill 150",
    pyramid: "TEK",
    status: "DRAFT",
    blockType: "OEKT",
    environment: null,
    practiceType: null,
    location: null,
    notes: null,
    origin: "COACH",
    needsPlayerApproval: false,
    approvalStatus: null,
    localOverride: false,
    publishedAt: null,
    publishedBy: null,
    isAgentProposal: false,
    planActionId: null,
    createdBy: "COACH",
    createdAt: new Date(Date.UTC(2026, 7, 24, 8)),
    updatedAt: new Date(Date.UTC(2026, 7, 24, 8)),
    drills: [],
    ...overstyr,
  } as WbRow;
}

describe("dato-kolonne", () => {
  it("bruker UTC-midnatt begge veier", () => {
    // Ellers sklir datoen én dag bakover når actionen kjøres fra Oslo.
    assert.equal(fraDatoKolonne(tilDatoKolonne("2026-08-24")), "2026-08-24");
    assert.equal(fraDatoKolonne(tilDatoKolonne("2026-01-01")), "2026-01-01");
    assert.equal(tilDatoKolonne("2026-08-24").getUTCHours(), 0);
  });
});

describe("mapSession", () => {
  it("mapper en utkast-rad", () => {
    const s = mapSession(rad());
    assert.equal(s.status, "DRAFT");
    assert.equal(s.date, "2026-08-24");
    assert.equal(s.startMinute, 540);
    assert.equal(s.publishedAt, undefined);
    assert.equal(s.drills.length, 0);
  });

  it("faller tilbake på nøytrale verdier ved ugyldig lagret status", () => {
    const s = mapSession(rad({ status: "TULL", pyramid: "TULL" }));
    assert.equal(s.status, "DRAFT");
    assert.equal(s.pyramid, "TEK");
  });

  it("sorterer øvelsene på sortOrder og leser AK-formelen", () => {
    const s = mapSession(
      rad({
        drills: [
          {
            id: "d2",
            sessionId: "ws1",
            title: "B",
            description: null,
            durationMinutes: 15,
            akFormel: { pyramid: "SLAG", area: "PUTT_3_5", label: "SLAG · Putt 3–5" },
            techniqueFocus: null,
            sourceId: null,
            sortOrder: 1,
          },
          {
            id: "d1",
            sessionId: "ws1",
            title: "A",
            description: null,
            durationMinutes: 15,
            akFormel: { ugyldig: true },
            techniqueFocus: null,
            sourceId: null,
            sortOrder: 0,
          },
        ],
      } as Partial<WbRow>),
    );
    assert.equal(s.drills[0].title, "A");
    assert.equal(s.drills[1].title, "B");
    assert.equal(s.drills[1].akFormel.area, "PUTT_3_5");
    // Ugyldig JSON gir nøytral fallback, ikke krasj.
    assert.equal(s.drills[0].akFormel.label, "A");
  });
});

describe("spiller-synlighet", () => {
  it("inneholder aldri DRAFT", () => {
    const statuser: readonly string[] = SPILLER_SYNLIGE_STATUSER;
    assert.equal(statuser.includes("DRAFT"), false);
    assert.equal(statuser.includes("SCHEDULED"), false);
    assert.deepEqual([...statuser], ["PUBLISHED", "IN_PROGRESS", "COMPLETED"]);
  });
});
