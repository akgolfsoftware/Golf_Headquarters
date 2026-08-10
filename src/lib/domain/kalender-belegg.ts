/**
 * Belegg og kollisjoner for AgencyOS-kalenderen (PP-2.4 steg 2).
 *
 * Paper-fasit: `agencyos-kalender.html` §`function belegg(dag)` og
 * §`function kollisjoner()`. Fasitens egen kommentar er regelen her:
 *
 *   «Belegg og kollisjon REGNES, aldri skrives for hånd.»
 *
 * Rene funksjoner uten Prisma og uten Date — kalleren gir minutter siden
 * midnatt. All Oslo-tid-håndtering skjer i laget over (`uke-helpers.ts` /
 * loaderen), slik at denne fila kan testes uten tidssone-oppsett.
 *
 * TO AVVIK FRA FASIT, begge fordi appen har mer data enn mockupen:
 *
 * 1. Fasiten har ÉN coach, så to overlappende timer er alltid en kollisjon.
 *    Appen er multi-coach: to timer som overlapper for FORSKJELLIGE coacher er
 *    ikke en kollisjon — ingen kan være to steder samtidig, men to personer kan
 *    være ett sted hver. Kollisjoner regnes derfor per coach, og økter uten
 *    kjent eier holdes utenfor (se `kollisjoner`).
 *
 * 2. Fasiten regner tilgjengelig tid som «hele tidsaksen minus sperret tid»
 *    (18 t − sperret), fordi mockupen ikke har noe tilgjengelighetsbegrep.
 *    Appen har `CoachAvailability` — coachens faktiske bookbare vindu — som er
 *    et sannere tall. `beleggForDag` tar derfor nevneren som parameter, og
 *    kalleren oppgir hvilket grunnlag som ble brukt (`Grunnlag`) så UI-et kan
 *    si det høyt i stedet for å presentere en prosent uten kontekst.
 */

/**
 * Hva en økt gjør med beleggsregnestykket.
 * - `coaching`: en avtale som opptar coachens tid → teller i telleren.
 *   Fasitens `coaching` og `holdt` er samme slag her: en holdt luke er
 *   opptatt tid selv om den ikke er bekreftet.
 * - `sperret`: tid som ikke er bookbar (ferie, møte, stengt anlegg) → trekkes
 *   fra nevneren, teller ikke som booket.
 * - `ingen`: står i kalenderen uten å oppta coachtid (oppgavefrist, heldags
 *   informasjonsrad) → påvirker ingen av delene.
 */
export type OktSlag = "coaching" | "sperret" | "ingen";

/** Minimalt økt-utsnitt for beleggsregning. */
export type BeleggOkt = {
  id: string;
  /** Minutter siden midnatt. */
  startMin: number;
  /** Minutter siden midnatt. Klemt til døgnet av kalleren for fleredagers-økter. */
  sluttMin: number;
  slag: OktSlag;
  /** Eier. `null` = ukjent — holdes utenfor kollisjonsregningen. */
  coachId: string | null;
};

/** Hvor nevneren i beleggsbrøken kom fra — vises i «Hvorfor dette tallet». */
export type Grunnlag = "tilgjengelighet" | "tidsakse";

export type Belegg = {
  /** Booket coachingtid i minutter. */
  booketMin: number;
  /** Sperret tid i minutter (trukket fra nevneren). */
  sperretMin: number;
  /** Nevneren: tilgjengelig coachtid i minutter, etter fradrag for sperret. */
  tilgjengeligMin: number;
  /** Ledig kapasitet i minutter = tilgjengelig − booket, aldri negativ. */
  ledigMin: number;
  /** Belegg i hele prosent. `null` når nevneren er 0 — da finnes ikke tallet. */
  prosent: number | null;
  grunnlag: Grunnlag;
};

export type Kollisjon = {
  a: string;
  b: string;
  coachId: string;
  /** Overlappets start og slutt i minutter siden midnatt. */
  fraMin: number;
  tilMin: number;
};

/** Varighet i minutter, aldri negativ. */
function varighet(o: BeleggOkt): number {
  return Math.max(0, o.sluttMin - o.startMin);
}

/**
 * Kollisjoner: par av coaching-avtaler som overlapper i tid for SAMME coach.
 *
 * Fasitens regel, ordrett: «Coachen er ressursen. To coachingtimer som
 * overlapper i tid er en kollisjon uansett hvor de foregår — Anders kan ikke
 * være to steder samtidig. Gruppeøkter er ÉN avtale med flere deltakere, ikke
 * flere avtaler.»
 *
 * Økter uten kjent coach (`coachId === null`) holdes utenfor. Å anta at de
 * tilhører den innloggede coachen ville produsert kollisjoner som ikke finnes;
 * å anta at de tilhører alle ville produsert enda flere. Under-rapportering er
 * den ærlige feilen her — og UI-et sier hvor mange økter som ble utelatt.
 *
 * Berøring teller ikke: en økt som slutter 10:00 og en som starter 10:00
 * overlapper ikke (`a1 < b2 && b1 < a2`, som i fasiten).
 */
export function kollisjoner(okter: BeleggOkt[]): Kollisjon[] {
  const relevante = okter.filter((o) => o.slag === "coaching" && o.coachId !== null);
  const ut: Kollisjon[] = [];
  for (let i = 0; i < relevante.length; i++) {
    for (let j = i + 1; j < relevante.length; j++) {
      const a = relevante[i];
      const b = relevante[j];
      if (a.coachId !== b.coachId) continue;
      if (a.startMin < b.sluttMin && b.startMin < a.sluttMin) {
        ut.push({
          a: a.id,
          b: b.id,
          coachId: a.coachId as string,
          fraMin: Math.max(a.startMin, b.startMin),
          tilMin: Math.min(a.sluttMin, b.sluttMin),
        });
      }
    }
  }
  return ut;
}

/** Antall økter som ikke kan kollisjonssjekkes fordi eieren er ukjent. */
export function utenEier(okter: BeleggOkt[]): number {
  return okter.filter((o) => o.slag === "coaching" && o.coachId === null).length;
}

/**
 * Samlet booket tid uten dobbelttelling.
 *
 * To overlappende avtaler på 60 min hver som deler 30 min opptar 90 minutter av
 * coachens dag, ikke 120. Uten sammenslåing kunne belegget passert 100 % nettopp
 * på de dagene som HAR en kollisjon — altså blitt mest feil der det betyr mest.
 * Slår sammen per coach; to coacher som jobber samtidig opptar hver sin tid.
 */
function booketMinutter(okter: BeleggOkt[]): number {
  const perCoach = new Map<string, Array<[number, number]>>();
  for (const o of okter) {
    if (o.slag !== "coaching" || varighet(o) === 0) continue;
    // Ukjent eier får sin egen bøtte per økt — de kan ikke slås sammen med
    // hverandre, siden vi ikke vet om det er samme person.
    const key = o.coachId ?? `ukjent:${o.id}`;
    const liste = perCoach.get(key) ?? [];
    liste.push([o.startMin, o.sluttMin]);
    perCoach.set(key, liste);
  }
  let sum = 0;
  for (const spenn of perCoach.values()) {
    spenn.sort((x, y) => x[0] - y[0]);
    let [fra, til] = spenn[0];
    for (let i = 1; i < spenn.length; i++) {
      const [s, e] = spenn[i];
      if (s <= til) {
        til = Math.max(til, e);
      } else {
        sum += til - fra;
        fra = s;
        til = e;
      }
    }
    sum += til - fra;
  }
  return sum;
}

/**
 * Belegg for én dag.
 *
 * `basisMin` er dagens tilgjengelige coachtid FØR fradrag for sperret tid:
 * summen av coachens availability-vinduer når de finnes (`grunnlag:
 * "tilgjengelighet"`), ellers hele tidsaksen slik fasiten gjør det
 * (`grunnlag: "tidsakse"`).
 */
export function beleggForDag(
  okter: BeleggOkt[],
  basisMin: number,
  grunnlag: Grunnlag,
): Belegg {
  const booketMin = booketMinutter(okter);
  const sperretMin = okter
    .filter((o) => o.slag === "sperret")
    .reduce((n, o) => n + varighet(o), 0);
  const tilgjengeligMin = Math.max(0, basisMin - sperretMin);
  return {
    booketMin,
    sperretMin,
    tilgjengeligMin,
    ledigMin: Math.max(0, tilgjengeligMin - booketMin),
    prosent: tilgjengeligMin > 0 ? Math.round((booketMin / tilgjengeligMin) * 100) : null,
    grunnlag,
  };
}

/**
 * Belegg for flere dager under ett — brukt av uke-visningen, som er den
 * skjermen appen faktisk har (fasiten er dag-scopet).
 *
 * Prosenten regnes av SUMMENE, ikke som snitt av dagsprosentene: en dag med
 * 1 av 2 tilgjengelige timer booket og en dag med 0 av 8 gir 1/10 = 10 %, ikke
 * (50 % + 0 %) / 2 = 25 %. Snittet ville latt en nesten tom uke se halvfull ut.
 */
export function beleggForDager(
  dager: Array<{ okter: BeleggOkt[]; basisMin: number }>,
  grunnlag: Grunnlag,
): Belegg {
  let booketMin = 0;
  let sperretMin = 0;
  let tilgjengeligMin = 0;
  for (const d of dager) {
    const b = beleggForDag(d.okter, d.basisMin, grunnlag);
    booketMin += b.booketMin;
    sperretMin += b.sperretMin;
    tilgjengeligMin += b.tilgjengeligMin;
  }
  return {
    booketMin,
    sperretMin,
    tilgjengeligMin,
    ledigMin: Math.max(0, tilgjengeligMin - booketMin),
    prosent: tilgjengeligMin > 0 ? Math.round((booketMin / tilgjengeligMin) * 100) : null,
    grunnlag,
  };
}

/** «6 t», «1 t 30 min», «45 min» — fasitens `tid()`. */
export function formaterTid(minutter: number): string {
  const t = Math.floor(minutter / 60);
  const m = Math.round(minutter % 60);
  if (!t) return `${m} min`;
  return m ? `${t} t ${m} min` : `${t} t`;
}
