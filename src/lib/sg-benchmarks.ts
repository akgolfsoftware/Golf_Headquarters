// Broadie-avledede forventede SG-verdier per HCP-nivå, målt per runde mot scratch.
// Kilde: Broadie "Every Shot Counts" (2014) + Golf Channel Amateur Tour dataset.
// Distribusjon ved HCP 10: OTT 20%, APP 40%, ARG 20%, PUTT 20% — skifter gradvis
// mot mer APP/ARG-dominans ved høyere HCP. Hver rad summerer til nøyaktig -HCP.

export type SgOmraade = "ott" | "app" | "arg" | "putt";

type BenchmarkRad = {
  hcp: number;
  ott: number;
  app: number;
  arg: number;
  putt: number;
};

// prettier-ignore
const TABELL: BenchmarkRad[] = [
  { hcp:  0, ott:  0.00, app:  0.00, arg:  0.00, putt:  0.00 },
  { hcp:  5, ott: -1.10, app: -2.00, arg: -1.00, putt: -0.90 },
  { hcp: 10, ott: -2.00, app: -4.00, arg: -2.00, putt: -2.00 },
  { hcp: 15, ott: -2.70, app: -6.30, arg: -3.30, putt: -2.70 },
  { hcp: 20, ott: -3.50, app: -8.60, arg: -4.60, putt: -3.30 },
  { hcp: 28, ott: -4.80, app:-12.00, arg: -6.80, putt: -4.40 },
  { hcp: 36, ott: -6.00, app:-16.00, arg: -9.00, putt: -5.00 },
];

/** Forventet SG for et gitt HCP og kategori. Interpolerer lineært mellom tabellpunkter. */
export function forventetSg(hcp: number, omraade: SgOmraade): number {
  const h = Math.max(0, Math.min(54, hcp));

  let a = TABELL[0];
  let b = TABELL[TABELL.length - 1];

  for (let i = 0; i < TABELL.length - 1; i++) {
    if (h >= TABELL[i].hcp && h <= TABELL[i + 1].hcp) {
      a = TABELL[i];
      b = TABELL[i + 1];
      break;
    }
  }

  if (a.hcp === b.hcp) return a[omraade];
  const t = (h - a.hcp) / (b.hcp - a.hcp);
  return a[omraade] + t * (b[omraade] - a[omraade]);
}

export type KriseSjekk = {
  erKrise: boolean;
  /** faktisk − forventet. Negativ = taper mer enn forventet. */
  avvik: number;
  forventet: number;
  faktisk: number;
};

// Spiller er i krise hvis faktisk SG er ≥ 1,0 slag svakere enn HCP-forventet.
const KRISE_GRENSE = 1.0;

export function erIKrise(
  hcp: number,
  omraade: SgOmraade,
  faktiskSg: number,
): KriseSjekk {
  const forventet = forventetSg(hcp, omraade);
  const avvik = faktiskSg - forventet;
  return {
    erKrise: avvik < -KRISE_GRENSE,
    avvik,
    forventet,
    faktisk: faktiskSg,
  };
}

export type SgDiagnose = {
  ott: KriseSjekk;
  app: KriseSjekk;
  arg: KriseSjekk;
  putt: KriseSjekk;
  antallKriser: number;
  /** Sorter etter størst avvik — brukes til å prioritere kriseområder. */
  prioritertRekkefølge: SgOmraade[];
};

/**
 * Diagnostiserer alle fire SG-kategorier og returnerer krisestatus per kategori.
 * Returnerer null hvis ett eller flere SG-felt mangler data.
 */
export function diagnostiserSg(
  hcp: number,
  faktiskSg: {
    ott: number | null;
    app: number | null;
    arg: number | null;
    putt: number | null;
  },
): SgDiagnose | null {
  if (
    faktiskSg.ott == null ||
    faktiskSg.app == null ||
    faktiskSg.arg == null ||
    faktiskSg.putt == null
  ) {
    return null;
  }

  const ott = erIKrise(hcp, "ott", faktiskSg.ott);
  const app = erIKrise(hcp, "app", faktiskSg.app);
  const arg = erIKrise(hcp, "arg", faktiskSg.arg);
  const putt = erIKrise(hcp, "putt", faktiskSg.putt);

  const kategorier: { omraade: SgOmraade; sjekk: KriseSjekk }[] = [
    { omraade: "ott", sjekk: ott },
    { omraade: "app", sjekk: app },
    { omraade: "arg", sjekk: arg },
    { omraade: "putt", sjekk: putt },
  ];

  const prioritertRekkefølge = kategorier
    .slice()
    .sort((a, b) => a.sjekk.avvik - b.sjekk.avvik) // mest negativt avvik først
    .map((k) => k.omraade);

  return {
    ott,
    app,
    arg,
    putt,
    antallKriser: [ott, app, arg, putt].filter((k) => k.erKrise).length,
    prioritertRekkefølge,
  };
}
