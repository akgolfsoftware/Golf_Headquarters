/** Beskrivende planhistorikk, aldri dokumentasjon på årsakseffekt. */
export type PlanEffektivitet = {
  antallBrukere: number;
  antallMedMaaling: number;
  gjennomsnittligHcpEndring: number | null;
  /** Bakoverkompatibelt felt. Ingen statistisk signifikanstest er utført. */
  signifikant: false;
};
const TOMT_RESULTAT: PlanEffektivitet = {
  antallBrukere: 0, antallMedMaaling: 0, gjennomsnittligHcpEndring: null, signifikant: false,
};
export type PlanEffektivitetRaa = { hcpDelta: number | null; userId: string };

/** Hver spiller vekter likt; flere registreringer gir ikke mer stemmevekt. */
export function aggregerPlanEffektivitet(rader: ReadonlyArray<PlanEffektivitetRaa>): PlanEffektivitet {
  const perSpiller = new Map<string, number[]>();
  for (const r of rader) {
    if (r.hcpDelta === null || !Number.isFinite(r.hcpDelta)) continue;
    perSpiller.set(r.userId, [...(perSpiller.get(r.userId) ?? []), r.hcpDelta]);
  }
  const snitt = [...perSpiller.values()].map(xs => xs.reduce((a, b) => a + b, 0) / xs.length);
  return {
    antallBrukere: new Set(rader.map(r => r.userId)).size,
    antallMedMaaling: perSpiller.size,
    gjennomsnittligHcpEndring: snitt.length ? Math.round(snitt.reduce((a, b) => a + b, 0) / snitt.length * 100) / 100 : null,
    signifikant: false,
  };
}

/** Felles læring er sperret inntil formål, samtykke og uttrekk er innført.
 * Et template-ID alene er ikke hjemmel til å lese alle spilleres historikk. */
export async function beregnPlanEffektivitet(_planId: string): Promise<PlanEffektivitet> {
  return { ...TOMT_RESULTAT };
}
