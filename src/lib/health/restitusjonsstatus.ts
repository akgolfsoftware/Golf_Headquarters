/**
 * Restitusjonsstatus — grønn/gul/rød utledet fra helsedata.
 *
 * Dette er DET ENESTE coachen ser uten et eget detalj-samtykke: en farge og en
 * dato, aldri tallene bak. Poenget er at coachen skal kunne justere treningen
 * for en sliten spiller uten å få innsyn i søvnmønsteret og pulsen deres.
 *
 * Følger samme prinsipp som FYS-score og belastning: INGEN hardkodede
 * fysiologiske terskler. «Hvilepuls over 75» er meningsløst på tvers av
 * mennesker — vi sammenligner kun spilleren med sitt EGET normalnivå, målt i
 * spillerens eget standardavvik. En utholdenhetsutøver med hvilepuls 42 og en
 * med 68 får dermed like riktig status.
 *
 * Statusen er en ANBEFALING, aldri en sperre (invariant 1): den forteller at
 * noe avviker, ikke at spilleren ikke får trene.
 */

import { prisma } from "@/lib/prisma";

/** Antall døgn baseline regnes over (eksklusive siste måling). */
const BASELINE_DAGER = 28;
/** Færre målinger enn dette gir «ukjent» — spredningen blir ren støy. */
const MIN_MAALINGER = 7;
/** Avvik i egne standardavvik før vi flagger. */
const GUL_SD = 1;
const ROED_SD = 2;

export type Restitusjonsfarge = "GROENN" | "GUL" | "ROED" | "UKJENT";

export type Restitusjonsstatus = {
  farge: Restitusjonsfarge;
  /** Dato for målingen statusen bygger på. null når vi ikke har noe. */
  sisteMaaling: Date | null;
  /**
   * Hvilke markører som avvek, som ren tekst uten tall — trygg å vise coach.
   * Tom når alt er normalt.
   */
  avvik: string[];
};

const UKJENT: Restitusjonsstatus = { farge: "UKJENT", sisteMaaling: null, avvik: [] };

/** Én måling. Feltene speiler HealthEntry, men uten DB-avhengighet. */
export type Maaling = {
  date: Date;
  restingHr: number | null;
  hrv: number | null;
  sleepHours: number | null;
};

type Markoer = {
  navn: string;
  les: (m: Maaling) => number | null;
  /** +1 når HØYERE verdi er dårligere (hvilepuls), -1 når lavere er dårligere. */
  daarligRetning: 1 | -1;
};

const MARKOERER: Markoer[] = [
  { navn: "hvilepuls", les: (m) => m.restingHr, daarligRetning: 1 },
  { navn: "restitusjon (HRV)", les: (m) => m.hrv, daarligRetning: -1 },
  { navn: "søvn", les: (m) => m.sleepHours, daarligRetning: -1 },
];

function snitt(tall: number[]): number {
  return tall.reduce((sum, t) => sum + t, 0) / tall.length;
}

/** Populasjons-standardavvik. Returnerer 0 for en konstant serie. */
function standardavvik(tall: number[], middel: number): number {
  const varians = snitt(tall.map((t) => (t - middel) ** 2));
  return Math.sqrt(varians);
}

/**
 * Ren beregning fra målinger. Skilt ut for å kunne enhetstestes uten DB.
 *
 * `maalinger` kan komme i vilkårlig rekkefølge — vi sorterer selv, så en
 * endret `orderBy` et sted i kallkjeden ikke stille snur logikken.
 */
export function beregnRestitusjonsstatus(maalinger: Maaling[]): Restitusjonsstatus {
  if (maalinger.length === 0) return UKJENT;

  const sortert = [...maalinger].sort((a, b) => b.date.getTime() - a.date.getTime());
  const siste = sortert[0];
  const grense = new Date(siste.date.getTime() - BASELINE_DAGER * 86_400_000);
  const baseline = sortert.slice(1).filter((m) => m.date > grense);

  let gule = 0;
  let roede = 0;
  const avvik: string[] = [];

  for (const markoer of MARKOERER) {
    const naa = markoer.les(siste);
    if (naa === null) continue;

    const historikk = baseline
      .map(markoer.les)
      .filter((v): v is number => v !== null);
    if (historikk.length < MIN_MAALINGER) continue;

    const middel = snitt(historikk);
    const sd = standardavvik(historikk, middel);
    // Konstant historikk gir ingen meningsfull spredning å måle mot.
    if (sd <= 0) continue;

    // Positivt tall = avvik i dårlig retning, målt i spillerens egne SD.
    const avstand = ((naa - middel) * markoer.daarligRetning) / sd;

    if (avstand >= ROED_SD) {
      roede++;
      avvik.push(`${markoer.navn} klart under ditt vanlige nivå`);
    } else if (avstand >= GUL_SD) {
      gule++;
      avvik.push(`${markoer.navn} noe under ditt vanlige nivå`);
    }
  }

  // Rød når én markør avviker kraftig, eller når to samtidig drar nedover.
  const farge: Restitusjonsfarge =
    roede > 0 || gule >= 2 ? "ROED" : gule === 1 ? "GUL" : "GROENN";

  return { farge, sisteMaaling: siste.date, avvik };
}

/**
 * Hent siste ~29 døgns helse-logg og regn ut statusen.
 *
 * MERK: denne sjekker IKKE samtykke — den regner bare. Kallstedet må selv ha
 * avklart at mottakeren har lov til å se resultatet (`harCoachInnsyn` i
 * samtykke.ts). Spilleren selv trenger ingen slik sjekk for sine egne data.
 */
export async function hentRestitusjonsstatus(
  userId: string,
  naa: Date = new Date(),
): Promise<Restitusjonsstatus> {
  const fra = new Date(naa.getTime() - (BASELINE_DAGER + 1) * 86_400_000);

  const rader = await prisma.healthEntry.findMany({
    where: { userId, date: { gte: fra } },
    orderBy: { date: "desc" },
    select: { date: true, restingHr: true, hrv: true, sleepHours: true },
  });

  return beregnRestitusjonsstatus(rader);
}

/**
 * Samme som over for flere spillere i ett DB-kall. Brukes av coach-lister og
 * daily-brief, som ellers ville gjort ett oppslag per spiller.
 */
export async function hentRestitusjonsstatusForFlere(
  userIds: string[],
  naa: Date = new Date(),
): Promise<Map<string, Restitusjonsstatus>> {
  if (userIds.length === 0) return new Map();

  const fra = new Date(naa.getTime() - (BASELINE_DAGER + 1) * 86_400_000);
  const rader = await prisma.healthEntry.findMany({
    where: { userId: { in: userIds }, date: { gte: fra } },
    select: { userId: true, date: true, restingHr: true, hrv: true, sleepHours: true },
  });

  const perBruker = new Map<string, Maaling[]>();
  for (const rad of rader) {
    const liste = perBruker.get(rad.userId);
    if (liste) liste.push(rad);
    else perBruker.set(rad.userId, [rad]);
  }

  const resultat = new Map<string, Restitusjonsstatus>();
  for (const userId of userIds) {
    resultat.set(userId, beregnRestitusjonsstatus(perBruker.get(userId) ?? []));
  }
  return resultat;
}
