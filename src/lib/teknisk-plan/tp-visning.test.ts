import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

/** Liten forventningshjelper, så testene leser som påstander om skjermen. */
function expect(faktisk: unknown) {
  return {
    toBe: (v: unknown) => assert.equal(faktisk, v),
    toEqual: (v: unknown) => assert.deepEqual(faktisk, v),
    toBeNull: () => assert.equal(faktisk, null),
    toHaveLength: (n: number) => assert.equal((faktisk as unknown[]).length, n),
    toMatchObject: (v: Record<string, unknown>) => {
      const f = faktisk as Record<string, unknown>;
      for (const [k, x] of Object.entries(v)) assert.deepEqual(f[k], x, `felt ${k}`);
    },
  };
}
import {
  formelFor,
  planVisning,
  protokollTekst,
  skjemaFraOppgave,
  type TpOppgaveInn,
  type TpPlanInn,
  type TpTmInn,
} from "./tp-visning";

const T0 = new Date("2026-09-26T10:00:00Z");

function oppgave(p: Partial<TpOppgaveInn> = {}): TpOppgaveInn {
  return {
    id: "t1",
    tittel: "Hendene foran ballen i treff",
    slagNavn: "7-jern lav fade",
    pyramide: "TEK",
    omraade: "Innspill 150–200 m",
    omraadeKode: "INNSPILL_150",
    koller: ["7-jern"],
    motorikk: "LAV_HAST",
    belastning: "TRENINGSOMRAADE",
    press: "ALENE",
    dimensjon: "TREFFPUNKT",
    sandTrinn: null,
    maaleutstyr: "TRACKMAN",
    status: "ACTIVE",
    repsMaalDry: 60,
    repsMaalLav: 120,
    repsMaalFull: 0,
    repsGjortDry: 60,
    repsGjortLav: 64,
    repsGjortFull: 0,
    logs: [],
    maalMatrise: [],
    tmGoals: [],
    ...p,
  };
}

function tm(p: Partial<TpTmInn> = {}): TpTmInn {
  return {
    id: "g1", metric: "attack_angle_mean", klubb: "7-jern", baselineValue: -1.2, baselineFrom: "auto-30d",
    baselineDate: new Date("2026-08-12T10:00:00Z"), baselineN: 50, targetValue: -5, targetType: "CAUSAL",
    comparison: "RANGE", rangeMax: -3, currentValue: null, inTarget: false, lastUpdated: null, protocol: null,
    windowSize: null, requiredHits: null, corridorMin: null, corridorMax: null, currentHits: null,
    currentBatchSize: null, bestHits: null, currentStreak: null, ...p,
  };
}

function plan(tasks: TpOppgaveInn[], p: Partial<TpPlanInn> = {}): TpPlanInn {
  return {
    id: "plan1", navn: "Teknisk plan høst 2026", status: "ACTIVE", userId: "u1",
    opprettetAv: { name: "Anders Kristiansen" },
    positions: [{ id: "pos7", pNummer: "P7.0", sortOrder: 0, hovedfokus: true, tasks }],
    ...p,
  };
}

describe("formelFor", () => {
  it("tar med læringssteg bare på fullsving", () => {
    expect(formelFor({ pyramide: "TEK", omraadeKode: "INNSPILL_150", motorikk: "LAV_HAST", belastning: "BANE", press: "ALENE" }))
      .toBe("TEK_INNSPILL_150_LAV_HAST_BANE_ALENE");
    expect(formelFor({ pyramide: "TEK", omraadeKode: "PITCH", motorikk: "LAV_HAST", belastning: "BANE", press: null }))
      .toBe("TEK_PITCH_BANE");
  });
  it("gir null uten område — aldri en gjettet formel", () => {
    expect(formelFor({ pyramide: "TEK", omraadeKode: null, motorikk: null, belastning: null, press: null })).toBeNull();
  });
});

describe("oppgave i planvisningen", () => {
  it("viser læringssteg med mål, og «—» (null) der steget ikke er i planen", () => {
    const v = planVisning(plan([oppgave()])).oppgaver[0];
    expect(v.familie).toBe("FULLSVING");
    expect(v.steg).toEqual([
      { navn: "Uten ball", gjort: 60, maal: 60 },
      { navn: "Lav hastighet", gjort: 64, maal: 120 },
      { navn: "Automatikk", gjort: 0, maal: null },
    ]);
    expect(v.gjort).toBe(124);
    expect(v.maal).toBe(180);
  });

  it("slår sammen til én rep-strek utenfor fullsving", () => {
    const v = planVisning(plan([oppgave({ omraadeKode: "PITCH", repsMaalFull: 150, repsMaalDry: 0, repsMaalLav: 0, repsGjortDry: 0, repsGjortLav: 0, repsGjortFull: 90 })])).oppgaver[0];
    expect(v.steg).toEqual([{ navn: "Repetisjoner", gjort: 90, maal: 150 }]);
  });

  it("teller miljø fra loggene og mål fra målmatrisen; miljø uten mål er null", () => {
    const v = planVisning(plan([oppgave({
      maalMatrise: [
        { motorikk: "LAV_HAST", belastning: "INNENDORS", maalReps: 100 },
        { motorikk: "AUTO", belastning: "INNENDORS", maalReps: 40 },
      ],
      logs: [
        { id: "l1", reps: 40, hastighet: "LAV", belastning: "INNENDORS", notater: null, sessionV2Id: null, trackmanShotId: null, loggedAt: T0 },
        { id: "l2", reps: 10, hastighet: "LAV", belastning: null, notater: null, sessionV2Id: null, trackmanShotId: null, loggedAt: T0 },
      ],
    })])).oppgaver[0];
    expect(v.miljo.find((m) => m.kode === "INNENDORS")).toMatchObject({ gjort: 40, maal: 140 });
    expect(v.miljo.find((m) => m.kode === "BANE")).toMatchObject({ gjort: 0, maal: null });
  });

  it("TrackMan-mål: målboks fra RANGE, åpen ende for LESS_THAN, og «—» uten utgangspunkt", () => {
    const v = planVisning(plan([oppgave({
      tmGoals: [
        tm({ currentValue: -2.1, inTarget: false, lastUpdated: T0 }),
        tm({ id: "g2", metric: "side_std", comparison: "LESS_THAN", targetValue: 8, rangeMax: null, baselineFrom: "ingen" }),
      ],
    })])).oppgaver[0];
    expect(v.tm[0]).toMatchObject({ navn: "Attack Angle", fra: -5, til: -3, naa: -2.1, innenfor: false, utgangspunkt: -1.2, utgangspunktDato: "12.08.2026" });
    expect(v.tm[1]).toMatchObject({ fra: null, til: 8, naa: null, innenfor: null, utgangspunkt: null, utgangspunktDato: "—" });
  });

  it("treffprotokoll: setning og nåtall; uten måling blir nå «—»", () => {
    const med = planVisning(plan([oppgave({ tmGoals: [tm({ id: "h", targetType: "HIT_RATE", protocol: "ROLLING_WINDOW", windowSize: 20, requiredHits: 16, currentHits: 12, currentBatchSize: 20 })] })])).oppgaver[0];
    expect(med.protokoll).toEqual({ type: "ROLLING_WINDOW", navn: "Rullende vindu", tekst: "16 av de siste 20 slagene innenfor målboksen", naa: "12 av 20" });
    expect(med.tm).toHaveLength(0);
    const uten = planVisning(plan([oppgave({ tmGoals: [tm({ id: "h", targetType: "HIT_RATE", protocol: "STREAK", requiredHits: 5 })] })])).oppgaver[0];
    expect(uten.protokoll?.naa).toBe("—");
    expect(protokollTekst("STREAK", null, 5)).toBe("5 slag på rad innenfor målboksen");
  });

  it("kilde og dato fra registreringene, ellers «ingen registreringer»", () => {
    expect(planVisning(plan([oppgave()])).oppgaver[0].kilde).toBe("INGEN REGISTRERINGER ENNÅ");
    const v = planVisning(plan([oppgave({ logs: [
      { id: "l1", reps: 5, hastighet: "FULL", belastning: null, notater: null, sessionV2Id: "s1", trackmanShotId: null, loggedAt: T0 },
      { id: "l2", reps: 5, hastighet: "FULL", belastning: null, notater: null, sessionV2Id: null, trackmanShotId: null, loggedAt: new Date("2026-09-20T10:00:00Z") },
    ] })])).oppgaver[0];
    expect(v.kilde).toBe("LIVE-ØKT · MANUELT · 26.09.2026");
  });
});

describe("planVisning", () => {
  it("hovedfokus, planstatus og ingen publiseringsdato (finnes ikke i basen)", () => {
    const v = planVisning(plan([oppgave()]));
    expect(v.hovedfokus).toEqual(["P7.0"]);
    expect(v.status).toBe("Aktiv");
    expect(v.publisert).toBeNull();
    expect(v.sistRegistrert).toBe("—");
  });

  it("mellomposisjoner hører til sin hoved-P, arkiverte oppgaver vises ikke", () => {
    const v = planVisning(plan([], { positions: [
      { id: "a", pNummer: "P4.1", sortOrder: 1, hovedfokus: false, tasks: [oppgave({ id: "x" }), oppgave({ id: "y", status: "ARCHIVED" })] },
    ] }));
    expect(v.oppgaver.map((o) => [o.id, o.pNummer, o.hovedP])).toEqual([["x", "P4.1", "P4.0"]]);
  });

  it("siste registreringer nyest først, med læringssteg bare på fullsving", () => {
    const v = planVisning(plan([oppgave({ logs: [
      { id: "gammel", reps: 24, hastighet: "LAV", belastning: "INNENDORS", notater: null, sessionV2Id: null, trackmanShotId: "shot", loggedAt: new Date("2026-09-24T10:00:00Z") },
      { id: "ny", reps: 40, hastighet: "LAV", belastning: "TRENINGSOMRAADE", notater: " Kjentes riktig ", sessionV2Id: "s", trackmanShotId: null, loggedAt: T0 },
    ] })]));
    expect(v.logg.map((l) => l.id)).toEqual(["ny", "gammel"]);
    expect(v.logg[0]).toMatchObject({ steg: "Lav hastighet", miljo: "Treningsområde", kilde: "Live-økt", kommentar: "Kjentes riktig", dato: "26.09.2026" });
    expect(v.logg[1].kilde).toBe("TrackMan");
  });
});

describe("skjemaFraOppgave", () => {
  it("leser mål per steg, per miljø, TrackMan-boks og protokoll tilbake til skjemaet", () => {
    const s = skjemaFraOppgave(oppgave({
      maalMatrise: [{ motorikk: "LAV_HAST", belastning: "BANE", maalReps: 80 }],
      tmGoals: [tm(), tm({ id: "h", targetType: "HIT_RATE", protocol: "BEST_OF_N", windowSize: 10, requiredHits: 7 })],
    }), "P7.0");
    expect(s.repSteg).toEqual({ UTEN_BALL: 60, LAV_HAST: 120, AUTO: 0 });
    expect(s.rep).toBe(0);
    expect(s.repMiljo).toEqual({ BANE: 80 });
    expect(s.tm).toEqual([{ id: "g1", metric: "attack_angle_mean", fra: -5, til: -3 }]);
    expect(s.protokoll).toEqual({ type: "BEST_OF_N", antall: 10, treff: 7 });
    expect(s.kolle).toBe("7-jern");
  });
});
