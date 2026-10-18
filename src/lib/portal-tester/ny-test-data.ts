/**
 * PH-14 Ny test (pakke 13, stats-resten.html, malen «nytest»): former testbatteriet til velgeren i steg 1.
 * Ren funksjon. Bare tester som finnes i katalogen (testTilgangWhere) og ekte resultater.
 * Mangler en verdi, blir den null, og skjermen viser «—» eller «Aldri tatt».
 */
import type { PyramidArea } from "@/generated/prisma/client";
import { deriveLowerIsBetter } from "./tester-data";

export type NyTestAkse = "fys" | "tek" | "slag" | "spill" | "turn";
export type NyTestGruppe = "fys" | "golf" | "egen";

export type NyTestValg = {
  id: string;
  navn: string;
  under: string;
  akse: NyTestAkse;
  gruppe: NyTestGruppe;
  /** Enheten resultatet føres i. «—» når testen ikke har en. */
  enhet: string;
  lavestBest: boolean;
  /** Siste resultat. null = aldri tatt. */
  sist: { score: number; takenAt: string } | null;
  /** Beste tidligere resultat, for «Personlig rekord». */
  beste: number | null;
};

export type NyTestDefInn = {
  id: string;
  name: string;
  description: string | null;
  pyramidArea: PyramidArea;
  scoringRule: string;
  protocol: unknown;
  isCustom: boolean;
};

export type NyTestResultatInn = { testId: string; score: number; takenAt: Date };

/** Testbatteriets fysiske tester med navn og forklaring fra Precision-utkastet. Nøkkel = navnet i basen. */
const FYS_VISNING: { navn: string; vis: string; under: string }[] = [
  { navn: "Clubhead Speed (CHS)", vis: "Club Speed", under: "TrackMan · driver · beste av 5" },
  { navn: "Trapbar Deadlift", vis: "Markløft trapbar", under: "Tyngste løft med 1 rep" },
  { navn: "Benkpress", vis: "Benkpress", under: "Tyngste løft med 1 rep" },
  { navn: "Standing Long Jump", vis: "Lengdehopp", under: "Stille fra to bein · beste av 3" },
  { navn: "Ball Throw", vis: "Rotasjonskast", under: "Medisinball knestående · beste kast" },
];

const AKSE: Record<PyramidArea, NyTestAkse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const AKSE_REKKE: NyTestAkse[] = ["fys", "tek", "slag", "spill", "turn"];

/** Egen test: enheten fra skjemaet (malverdi.enhet) vist på skjerm. */
const EGEN_ENHET: Record<string, string> = {
  antall: "stk", prosent: "%", tid_sek: "s", distanse_m: "m", score: "poeng", sett: "sett",
};

function protokollFelt(protocol: unknown): { unit: string | null; retning: string | null; egenEnhet: string | null } {
  if (!protocol || typeof protocol !== "object") return { unit: null, retning: null, egenEnhet: null };
  const p = protocol as Record<string, unknown>;
  const unit = typeof p.unit === "string" ? p.unit : null;
  const retning = typeof p.retning === "string" ? p.retning : null;
  const mv = p.malverdi && typeof p.malverdi === "object" ? (p.malverdi as Record<string, unknown>) : null;
  const egenEnhet = mv && typeof mv.enhet === "string" ? mv.enhet : null;
  return { unit, retning, egenEnhet };
}

export function byggNyTestValg(defs: readonly NyTestDefInn[], resultater: readonly NyTestResultatInn[]): NyTestValg[] {
  const perTest = new Map<string, NyTestResultatInn[]>();
  for (const r of resultater) {
    const arr = perTest.get(r.testId) ?? [];
    arr.push(r);
    perTest.set(r.testId, arr);
  }

  const ut = defs.map((d): NyTestValg & { rekke: number } => {
    const { unit, retning, egenEnhet } = protokollFelt(d.protocol);
    const lavestBest = retning ? retning === "lavest" : deriveLowerIsBetter(d.scoringRule);
    const hist = [...(perTest.get(d.id) ?? [])].sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime());
    const sist = hist[0] ? { score: hist[0].score, takenAt: hist[0].takenAt.toISOString() } : null;
    const scorer = hist.map((h) => h.score);
    const beste = scorer.length ? (lavestBest ? Math.min(...scorer) : Math.max(...scorer)) : null;
    const akse = AKSE[d.pyramidArea];

    if (d.isCustom) {
      return {
        id: d.id, navn: d.name, under: d.description?.trim() || d.scoringRule, akse, gruppe: "egen",
        enhet: (egenEnhet && EGEN_ENHET[egenEnhet]) || unit || "—", lavestBest, sist, beste, rekke: 0,
      };
    }
    if (d.pyramidArea === "FYS") {
      const i = FYS_VISNING.findIndex((f) => f.navn === d.name);
      const vis = FYS_VISNING[i];
      return {
        id: d.id, navn: vis?.vis ?? d.name, under: vis?.under ?? d.scoringRule, akse, gruppe: "fys",
        enhet: unit ?? "—", lavestBest, sist, beste, rekke: i < 0 ? 99 : i,
      };
    }
    return {
      id: d.id, navn: d.name.replace(/^TN\s+/, ""), under: d.scoringRule, akse, gruppe: "golf",
      enhet: unit ?? "—", lavestBest, sist, beste, rekke: AKSE_REKKE.indexOf(akse),
    };
  });

  return ut
    .sort((a, b) => a.rekke - b.rekke || a.navn.localeCompare(b.navn, "nb"))
    .map(({ rekke: _rekke, ...v }) => v);
}
