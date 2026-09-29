/**
 * Kartlegging: filtre og sortering (rene funksjoner, testet i kartlegging.test.ts).
 *
 * Periodene er alltid åpne mot i dag (inneværende halvår, i år, siste 12 måneder,
 * alle). Da er «siste resultat i perioden» det samme som «har levert i perioden»,
 * fordi et senere resultat ikke kan finnes etter i dag.
 */

export type KartleggingPeriode = "halvar" | "aar" | "12mnd" | "alle";

export type KartleggingResultat = {
  testId: string;
  dato: Date;
  score: number | null;
  formatert: string | null;
  lavereErBedre: boolean | null;
};

export type KartleggingElev = {
  id: string;
  navn: string;
  skole: string | null;
  klasse: string | null;
  resultater: KartleggingResultat[];
};

const DAG = 864e5;

/** Periodens start (UTC) gitt Oslo-år og -måned for i dag. */
export function periodeStart(periode: KartleggingPeriode, osloAar: number, osloManed: number, naa: Date): Date | null {
  if (periode === "alle") return null;
  if (periode === "12mnd") return new Date(naa.getTime() - 365 * DAG);
  // Oslo-midnatt: 1. januar er vintertid (UTC+1), 1. august sommertid (UTC+2).
  if (periode === "aar") return new Date(Date.UTC(osloAar, 0, 1) - 3600e3);
  // Halvår: vår = januar–juli, høst = august–desember (skoleåret).
  return osloManed >= 8 ? new Date(Date.UTC(osloAar, 7, 1) - 2 * 3600e3) : new Date(Date.UTC(osloAar, 0, 1) - 3600e3);
}

export function halvarNavn(osloAar: number, osloManed: number): string {
  return `${osloManed >= 8 ? "Høst" : "Vår"} ${osloAar}`;
}

export function lesPeriode(v: string | undefined): KartleggingPeriode {
  return v === "aar" || v === "12mnd" || v === "alle" ? v : "halvar";
}

/** Resultatene i perioden, eventuelt bare for én test. */
export function iPerioden(elev: KartleggingElev, fra: Date | null, testId: string | null): KartleggingResultat[] {
  return elev.resultater.filter((r) => (fra === null || r.dato.getTime() >= fra.getTime()) && (testId === null || r.testId === testId));
}

/**
 * Sortering: med valgt test etter resultat (beste først, i testens retning), uten
 * resultat sist. Uten valgt test: de som har levert først, deretter navn.
 */
export function sorterElever(elever: KartleggingElev[], fra: Date | null, testId: string | null): KartleggingElev[] {
  return [...elever].sort((a, b) => {
    const ra = iPerioden(a, fra, testId);
    const rb = iPerioden(b, fra, testId);
    if (testId === null) {
      const d = Number(rb.length > 0) - Number(ra.length > 0);
      return d || a.navn.localeCompare(b.navn, "nb");
    }
    const va = ra[0]?.score ?? null;
    const vb = rb[0]?.score ?? null;
    if (va === null && vb === null) return a.navn.localeCompare(b.navn, "nb");
    if (va === null) return 1;
    if (vb === null) return -1;
    const lavere = ra[0].lavereErBedre ?? rb[0].lavereErBedre ?? false;
    return (lavere ? va - vb : vb - va) || a.navn.localeCompare(b.navn, "nb");
  });
}
