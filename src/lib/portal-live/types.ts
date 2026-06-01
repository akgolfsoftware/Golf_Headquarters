/**
 * PlayerHQ · Live-økt — delte typer.
 *
 * Live-økt-flyten (brief → active → summary) bygger på Prisma-modellene
 * `trainingPlanSession` + `sessionDrill` + `exerciseDefinition`. Disse typene
 * er view-modellen klient-komponentene konsumerer — utledet i `data.ts`.
 *
 * Ekte data: planlagte reps/CS leses fra `SessionDrill`. Faktiske reps og
 * total-tid logges klient-side i live-økt (sesjonen er offline-først), og
 * persisteres til `trainingPlanSessionLog` ved fullført økt.
 */

import type { PyramidArea } from "@/generated/prisma/client";

export type LiveAxis = PyramidArea; // "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"

/** Én drill i live-økta — planlagte verdier fra SessionDrill. */
export type LiveDrill = {
  id: string;
  /** 1-basert rekkefølge for visning. */
  index: number;
  name: string;
  axis: LiveAxis;
  lPhase: string | null;
  /** Planlagt antall reps (utledet fra repsSets/reps). 0 = ikke spesifisert. */
  plannedReps: number;
  /** Rå reps/sett-streng fra coach-plan, f.eks. "3 × 10" eller "30". */
  repsLabel: string;
  /** Compliance-score-mål (csTarget), hvis satt. */
  csTarget: number | null;
  /** Coach-notat på drillen, hvis satt. */
  notes: string | null;
};

/** Hele live-økta — utledet view-modell. */
export type LiveSessionData = {
  sessionId: string;
  planId: string;
  planName: string;
  /** Økt-tittel fra coach. */
  title: string;
  /** Coach-rasjonale / mål-tekst. */
  rationale: string | null;
  axis: LiveAxis;
  /** Planlagt varighet i minutter. */
  durationMin: number;
  /** ISO-streng for planlagt starttidspunkt. */
  scheduledAtISO: string;
  /** Allerede fullført? (status === COMPLETED) */
  completed: boolean;
  drills: LiveDrill[];
  /** Sum av planlagte reps på tvers av alle drills. */
  totalPlannedReps: number;
  /** Neste planlagte økt etter denne (for oppsummering-CTA). Null hvis ingen. */
  nextSession: NextSessionRef | null;
};

export type NextSessionRef = {
  id: string;
  title: string;
  axis: LiveAxis;
  durationMin: number;
  scheduledAtISO: string;
};

/** Faktisk logget per drill — bygges klient-side under økta. */
export type DrillLog = {
  drillId: string;
  /** Faktiske reps logget. */
  reps: number;
  /** Brukt tid på drillen i sekunder. */
  elapsedSec: number;
  status: "done" | "active" | "queued";
};
