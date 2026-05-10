// Strokes Gained (SG) — aggregat-helpers fra Round-rader.

import type { Round } from "@/generated/prisma/client";

export type SgAggregate = {
  total: number | null;
  ott: number | null;
  app: number | null;
  arg: number | null;
  putt: number | null;
  rundeAntall: number;
  snittScore: number | null;
};

/**
 * Returnerer snitt SG per område fra en liste runder.
 * null hvis ingen runder har data for det området.
 */
export function aggregateSg(rounds: Round[]): SgAggregate {
  if (rounds.length === 0) {
    return {
      total: null,
      ott: null,
      app: null,
      arg: null,
      putt: null,
      rundeAntall: 0,
      snittScore: null,
    };
  }

  const snitt = (felt: keyof Pick<Round, "sgTotal" | "sgOtt" | "sgApp" | "sgArg" | "sgPutt">) => {
    const verdier = rounds
      .map((r) => r[felt])
      .filter((v): v is number => v != null);
    if (verdier.length === 0) return null;
    return verdier.reduce((sum, v) => sum + v, 0) / verdier.length;
  };

  const score =
    rounds.reduce((sum, r) => sum + r.score, 0) / rounds.length;

  return {
    total: snitt("sgTotal"),
    ott: snitt("sgOtt"),
    app: snitt("sgApp"),
    arg: snitt("sgArg"),
    putt: snitt("sgPutt"),
    rundeAntall: rounds.length,
    snittScore: score,
  };
}

/** Format SG-verdi: "+1,2", "-0,3", eller "—" */
export function formatSg(v: number | null): string {
  if (v == null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1).replace(".", ",")}`;
}
