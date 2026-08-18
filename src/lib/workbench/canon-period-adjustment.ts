/**
 * CANON-periodejustering — speiler AK Golf CANON v3.5 sine periode→pyramide-regler.
 *
 * Masterbrain (`src/lib/masterbrain/knowledge/concepts/canon-methodology.json`,
 * `pyramid_rules` pr_6/pr_7/pr_8) er FASIT-KILDEN for disse retningene. Denne filen
 * er en manuelt vedlikeholdt TS-speiling — Masterbrain er en kunnskaps-database,
 * ikke en tjeneste appen kan spørre live. Endres CANON-reglene i Masterbrain,
 * må denne filen oppdateres manuelt — det finnes ingen automatisk synk.
 *
 * Kun RETNING (opp/ned/lik) uttrykkes her, aldri prosenttall — faktiske prosenter
 * bor i `PlanTemplate.disciplinFordeling` og kalibreres uavhengig. Dette er en
 * ANBEFALING, aldri en sperre (låst prinsipp, `.claude/rules/beslutninger.md`).
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
  // 8c.1 — nye periodetyper: CANON sier ingenting om disse ennå → alt "lik"
  // (ingen pyramide-justering; anbefaling, aldri sperre).
  TESTUKE: { FYS: "lik", TEK: "lik", SLAG: "lik", SPILL: "lik", TURN: "lik" },
  FERIE: { FYS: "lik", TEK: "lik", SLAG: "lik", SPILL: "lik", TURN: "lik" },
  TRENINGSSAMLING: { FYS: "lik", TEK: "lik", SLAG: "lik", SPILL: "lik", TURN: "lik" },
  HELDAGSSAMLING: { FYS: "lik", TEK: "lik", SLAG: "lik", SPILL: "lik", TURN: "lik" },
};

