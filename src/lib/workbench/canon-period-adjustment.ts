/**
 * CANON-periodejustering — speiler AK Golf CANON v3.5 sine periode→pyramide-regler.
 *
 * Masterbrain (`~/Developer/Masterbrain/knowledge/concepts/canon-methodology.json`,
 * `pyramid_rules` pr_6/pr_7/pr_8) er FASIT-KILDEN for disse retningene. Denne filen
 * er en manuelt vedlikeholdt TS-speiling (samme mønster som `src/lib/design-tokens.ts`
 * speiler `globals.css`) — Masterbrain er en kunnskaps-database, ikke en tjeneste
 * appen kan spørre live. Endres CANON-reglene i Masterbrain, må denne filen
 * oppdateres manuelt — det finnes ingen automatisk synk.
 *
 * Kun RETNING (opp/ned/lik) uttrykkes her, aldri prosenttall — faktiske prosenter
 * bor i `PlanTemplate.disciplinFordeling` og kalibreres uavhengig. Dette er en
 * ANBEFALING, aldri en sperre (låst prinsipp, `plans/skjermplan-master.md`).
 */

import type { LPhase, PyramidArea } from "@/generated/prisma/client";

export type CanonRetning = "opp" | "ned" | "lik";

/**
 * GRUNN (pr_6): FYS+TEK opp, SLAG standard, SPILL redusert, TURN minimal.
 * SPESIAL (pr_7): SLAG opp, TEK+SPILL standard, TURN lav. FYS ikke nevnt i CANON → lik.
 * TURNERING (pr_8): SPILL+TURN opp, TEK redusert, FYS minimal. SLAG ikke nevnt i CANON → lik.
 */
export const CANON_PERIOD_ADJUSTMENT: Record<LPhase, Record<PyramidArea, CanonRetning>> = {
  GRUNN: { FYS: "opp", TEK: "opp", SLAG: "lik", SPILL: "ned", TURN: "ned" },
  SPESIAL: { FYS: "lik", TEK: "lik", SLAG: "opp", SPILL: "lik", TURN: "ned" },
  TURNERING: { FYS: "ned", TEK: "ned", SLAG: "lik", SPILL: "opp", TURN: "opp" },
};

const RETNING_LABEL: Record<CanonRetning, string> = {
  opp: "høyere",
  ned: "lavere",
  lik: "uendret",
};

const PYRAMID_LABEL: Record<PyramidArea, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

/**
 * Klarspråk-avvikstekst når faktisk fordeling går MOT det CANON anbefaler for
 * gjeldende periode — kun for områder CANON faktisk har en retning på ("lik"
 * gir aldri avvik). Returnerer null når alt stemmer eller ingen sammenligning er mulig.
 */
export function canonDeviationChip(
  actual: Partial<Record<PyramidArea, number>>,
  lPhase: LPhase,
): string | null {
  const rules = CANON_PERIOD_ADJUSTMENT[lPhase];
  const avvik: string[] = [];

  for (const area of Object.keys(rules) as PyramidArea[]) {
    const retning = rules[area];
    if (retning === "lik") continue;
    const pct = actual[area];
    if (pct == null) continue;
    const snitt = 20; // pyramidens jevne fordeling (5 akser à 20 %) som nøytral referanse
    const gikkOpp = pct > snitt;
    const stemmer = retning === "opp" ? gikkOpp : !gikkOpp;
    if (!stemmer) {
      avvik.push(`${PYRAMID_LABEL[area]} bør være ${RETNING_LABEL[retning]} i denne perioden`);
    }
  }

  if (avvik.length === 0) return null;
  return avvik.join(" · ");
}
