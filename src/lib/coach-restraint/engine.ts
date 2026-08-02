// Restraint-motoren — bestemmer NÅR AI-coachen får si noe, og hva slags
// tale-handling som er lov. Doktrine (evidensgradert, se Kimi-kunnskapsbasen
// og confidence-bands-coaching.md):
//
//   1. Stillhet er standard — kommentar kun ved båndavvik (bandwidth-feedback,
//      Sherwood 1988; Smith et al. 1997 [golf]).
//   2. Oppsummering per blokk på ~5 slag — aldri per slag, aldri concurrent
//      (Schmidt et al. 1989; Sigrist et al. 2013b).
//   3. Selvestimat FØR data — spilleren anslår selv før tallene avsløres
//      (Swinnen et al. 1990; Liu & Wrisberg 1997).
//   4. Data hentes, pushes aldri («vil du se tallene?») (Chiviacowsky & Wulf
//      2002; McKay et al. 2023/2025).
//   5. Periodiske no-feedback-blokker — kollaps uten AI betyr at frekvensen
//      var for høy (Winstein & Schmidt 1990).
//
// Ren og idretts-agnostisk: ingen I/O, ingen golf-avhengigheter utover
// metrikk-nøklene i bands.ts. All tilstand sendes inn og returneres ut.

import type { MetricExceedance, PlayerBand } from "./bands";
import { findExceedances } from "./bands";
import type { ShotEvent } from "./shot-events";

export type FeedbackDecision =
  | "SILENT" // innenfor bånd eller midt i blokk — logg, ikke si noe
  | "ASK_SELF_ESTIMATE" // blokk ferdig med avvik → spør «hva tror du selv?» (uten tall)
  | "OFFER_SUMMARY" // selvestimat gitt → tilby blokk-oppsummering (spilleren henter)
  | "NO_FEEDBACK_BLOCK"; // planlagt stille blokk — ingen AI-input uansett

export const DEFAULT_BLOCK_SIZE = 5;
/** Hver N-te blokk er en planlagt stille testblokk. */
export const DEFAULT_NO_FEEDBACK_EVERY = 4;

export type RestraintState = {
  shotsInBlock: number;
  blocksCompleted: number;
  /** Blokk-avvik akkumulert siden forrige oppsummering. */
  exceedances: MetricExceedance[];
  /** Spilleren har fått selvestimat-spørsmål for gjeldende blokk. */
  awaitingSelfEstimate: boolean;
  /** Spilleren har svart på selvestimatet → data kan tilbys. */
  selfEstimateGiven: boolean;
  blockSize: number;
  noFeedbackEvery: number;
};

export function initialState(
  opts: { blockSize?: number; noFeedbackEvery?: number } = {},
): RestraintState {
  return {
    shotsInBlock: 0,
    blocksCompleted: 0,
    exceedances: [],
    awaitingSelfEstimate: false,
    selfEstimateGiven: false,
    blockSize: opts.blockSize ?? DEFAULT_BLOCK_SIZE,
    noFeedbackEvery: opts.noFeedbackEvery ?? DEFAULT_NO_FEEDBACK_EVERY,
  };
}

/** Er inneværende blokk en planlagt stille testblokk? (1-indeksert blokk-nr) */
export function isNoFeedbackBlock(state: RestraintState): boolean {
  return (state.blocksCompleted + 1) % state.noFeedbackEvery === 0;
}

/** Registrer et slag. Returnerer ny tilstand — muterer aldri. */
export function registerShot(
  state: RestraintState,
  event: ShotEvent,
  bands: PlayerBand[],
): RestraintState {
  return {
    ...state,
    shotsInBlock: state.shotsInBlock + 1,
    exceedances: [...state.exceedances, ...findExceedances(bands, event.metrics)],
  };
}

/** Spilleren har levert selvestimatet sitt for gjeldende blokk. */
export function registerSelfEstimate(state: RestraintState): RestraintState {
  return { ...state, awaitingSelfEstimate: false, selfEstimateGiven: true };
}

export type FeedbackVerdict = {
  decision: FeedbackDecision;
  /** Kort maskinlesbar begrunnelse — logges og kan vises i prompt. */
  reason: string;
  /** Avvikene en ev. oppsummering skal handle om (verste først, maks 2). */
  exceedances: MetricExceedance[];
  nextState: RestraintState;
};

export function decideFeedback(state: RestraintState): FeedbackVerdict {
  const blockDone = state.shotsInBlock >= state.blockSize;

  // Planlagt stille blokk overstyrer alt — også båndavvik.
  if (isNoFeedbackBlock(state)) {
    if (!blockDone) {
      return { decision: "NO_FEEDBACK_BLOCK", reason: "stille-testblokk pågår", exceedances: [], nextState: state };
    }
    return {
      decision: "NO_FEEDBACK_BLOCK",
      reason: "stille-testblokk fullført — logget uten AI-input",
      exceedances: [],
      nextState: rullNyBlokk(state),
    };
  }

  if (!blockDone) {
    return { decision: "SILENT", reason: "midt i blokk — aldri per-slag-feedback", exceedances: [], nextState: state };
  }

  // Blokk ferdig uten avvik → stillhet er riktig svar, ikke ros.
  if (state.exceedances.length === 0) {
    return {
      decision: "SILENT",
      reason: "blokk innenfor spillerens bånd — ingen kommentar",
      exceedances: [],
      nextState: rullNyBlokk(state),
    };
  }

  // Avvik finnes: selvestimat må komme FØR data.
  if (!state.selfEstimateGiven) {
    return {
      decision: "ASK_SELF_ESTIMATE",
      reason: "båndavvik i blokken — spør om spillerens egen vurdering før tall",
      exceedances: topp(state.exceedances),
      nextState: { ...state, awaitingSelfEstimate: true },
    };
  }

  return {
    decision: "OFFER_SUMMARY",
    reason: "selvestimat gitt — tilby blokk-oppsummering (spilleren henter tallene)",
    exceedances: topp(state.exceedances),
    nextState: rullNyBlokk(state),
  };
}

/** Maks 2 avvik per oppsummering — én prioritet, ikke datadump. */
function topp(exceedances: MetricExceedance[]): MetricExceedance[] {
  return [...exceedances].sort((a, b) => b.severity - a.severity).slice(0, 2);
}

function rullNyBlokk(state: RestraintState): RestraintState {
  return {
    ...state,
    shotsInBlock: 0,
    blocksCompleted: state.blocksCompleted + 1,
    exceedances: [],
    awaitingSelfEstimate: false,
    selfEstimateGiven: false,
  };
}
