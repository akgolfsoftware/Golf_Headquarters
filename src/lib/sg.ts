// Strokes Gained (SG) — aggregat-helpers fra Round-rader.

/** Minimalt snitt av felter aggregateSg faktisk bruker. */
export type RoundForSgAggregate = {
  score: number;
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

export type SgAggregate = {
  total: number | null;
  ott: number | null;
  app: number | null;
  arg: number | null;
  putt: number | null;
  rundeAntall: number;
  snittScore: number | null;
};

type SgFelt = keyof Pick<
  RoundForSgAggregate,
  "sgTotal" | "sgOtt" | "sgApp" | "sgArg" | "sgPutt"
>;

/**
 * Returnerer snitt SG per område fra en liste runder.
 * null hvis ingen runder har data for det området.
 *
 * Aksepterer hvilken som helst shape som inneholder de nødvendige SG-feltene
 * (f.eks. et Prisma-select-delsett), ikke bare full Round-type.
 */
export function aggregateSg(rounds: RoundForSgAggregate[]): SgAggregate {
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

  const snitt = (felt: SgFelt) => {
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
