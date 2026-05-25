// Tester for Daily Brief-agent. Verifiserer struktur uten Anthropic-kall.
//
// Kjør med:
//   npx tsx --test src/lib/__tests__/ai/daily-brief.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  DAILY_BRIEF_SYSTEM,
  type DailyBriefMetrics,
} from "@/lib/ai/agents/daily-brief";

describe("Daily Brief — system-prompt", () => {
  it("inneholder maks-grense på 200 ord", () => {
    assert.ok(DAILY_BRIEF_SYSTEM.includes("200 ord"));
  });

  it("inneholder struktur-spec med 4 punkter", () => {
    assert.ok(DAILY_BRIEF_SYSTEM.includes("1. Antall spillere"));
    assert.ok(DAILY_BRIEF_SYSTEM.includes("2. 3-5 viktigste flagg"));
    assert.ok(DAILY_BRIEF_SYSTEM.includes("3. Neste turnering"));
    assert.ok(DAILY_BRIEF_SYSTEM.includes("4. Avsluttende anbefaling"));
  });

  it("nevner norsk bokmål", () => {
    assert.ok(/[Nn]orsk\s+bokmål/.test(DAILY_BRIEF_SYSTEM));
  });

  it("forbyr emoji", () => {
    assert.ok(/[Aa]ldri\s+emoji/.test(DAILY_BRIEF_SYSTEM));
  });

  it("inneholder kunnskaps-blokk fra skills", () => {
    assert.ok(DAILY_BRIEF_SYSTEM.includes("KUNNSKAP"));
    // ALL_SKILLS injiseres - minst én av skills-navnene må være med.
    assert.ok(
      /pyramide-taksonomi|bompa-perioder|sg-interpretation/.test(
        DAILY_BRIEF_SYSTEM,
      ),
    );
  });
});

describe("Daily Brief — type-shape", () => {
  it("DailyBriefMetrics har forventet felter", () => {
    const sample: DailyBriefMetrics = {
      coachId: "c1",
      dato: "2026-05-25",
      okterIdag: 3,
      spillereMedOkterIdag: 2,
      flagg: [
        {
          spillerId: "s1",
          spillerNavn: "Test Spiller",
          type: "INAKTIV",
          severity: 3,
          melding: "Ingen aktivitet siste 30 dager",
        },
      ],
      nesteTurnering: {
        id: "t1",
        navn: "NM Match",
        startDato: new Date().toISOString(),
        dagerTil: 14,
        spillere: [{ id: "s1", navn: "Test Spiller" }],
      },
    };

    assert.equal(sample.coachId, "c1");
    assert.equal(sample.flagg[0].type, "INAKTIV");
    assert.equal(sample.flagg[0].severity, 3);
    assert.equal(sample.nesteTurnering?.dagerTil, 14);
  });

  it("flagg-type aksepterer alle 4 varianter", () => {
    const typer: Array<DailyBriefMetrics["flagg"][number]["type"]> = [
      "OVERDUE_TEST",
      "PLAN_ADHERENCE",
      "HRV_ANOMALI",
      "INAKTIV",
    ];
    assert.equal(typer.length, 4);
  });
});
