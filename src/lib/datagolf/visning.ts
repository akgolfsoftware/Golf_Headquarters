/**
 * Felles visningsregler for Data Golf-komponentene (src/components/datagolf).
 *
 * Ren logikk uten database og uten server-only, så den kan testes og brukes av
 * både serverkomponenter og visningssiden. Reglene her er fakta om datagrunnlaget
 * (kartlagt 19.10.2026) og skal ikke omgås i komponentene:
 *
 *   - Kategori-SG (OTT/APP/ARG/PUTT) finnes bare for PGA og LIV. Andre tourer har
 *     bare SG total. En kategori uten tall vises som «—», aldri som 0.
 *   - Spillerfordelinger finnes bare for pga og euro.
 *   - Snitt regnes bare over runder som faktisk har tallet, og antallet står ved siden av.
 *
 * Lisens: Data Golf er personlig bakgrunn og vises aldri til andre. Se DG_INTERN_MERKE.
 */

import { bandFraApproachRad, type TakBandRad } from "./tak";

export const DG_INTERN_MERKE = "Intern bruk. Data Golf vises ikke til spillere, foreldre eller klubb.";

export const DG_KATEGORI_TOURER: readonly string[] = ["pga", "liv"];
export const DG_FORDELING_TOURER: readonly string[] = ["pga", "euro"];

export const harKategoriSg = (tour: string | null | undefined) =>
  !!tour && DG_KATEGORI_TOURER.includes(tour.toLowerCase());
export const harFordeling = (tour: string | null | undefined) =>
  !!tour && DG_FORDELING_TOURER.includes(tour.toLowerCase());

const TOUR_NAVN: Readonly<Record<string, string>> = {
  pga: "PGA Tour", euro: "DP World Tour", liv: "LIV", kft: "Korn Ferry Tour", ngl: "Nordic Golf League",
  cha: "Challenge Tour", champ: "PGA Tour Champions", jpn: "Japan Tour", afr: "Sunshine Tour",
  alp: "Alps Tour", kor: "Korea Tour", anz: "PGA Tour of Australasia",
};
export const tourNavn = (kode: string) => TOUR_NAVN[kode.toLowerCase()] ?? kode.toUpperCase();

// ----------------------------------------------------------------------------- SG-profil

export type SgKategoriKode = "ott" | "app" | "arg" | "putt";
export const SG_KATEGORIER: ReadonlyArray<{ kode: SgKategoriKode; navn: string; lang: string }> = [
  { kode: "ott", navn: "OTT", lang: "Utslag" },
  { kode: "app", navn: "APP", lang: "Innspill" },
  { kode: "arg", navn: "ARG", lang: "Rundt green" },
  { kode: "putt", navn: "PUTT", lang: "Putting" },
];

/** En runde slik komponentene trenger den (bruttoscore, med SG der den finnes). */
export type DgSgRunde = {
  id: number;
  dato: string | null;
  tour: string | null;
  arrangement: string | null;
  runde: number | null;
  total: number | null;
  ott: number | null;
  app: number | null;
  arg: number | null;
  putt: number | null;
};

export type SgSnitt = { snitt: number | null; antall: number };

export type SgProfilBeregning = {
  antallRunder: number;
  total: SgSnitt;
  kategorier: ReadonlyArray<{ kode: SgKategoriKode; navn: string; lang: string } & SgSnitt>;
  /** Andel av rundene (0–1) som har alle fire kategoriene. Null når det ikke finnes runder. */
  kategoriAndel: number | null;
  harKategoriData: boolean;
};

const gyldig = (v: number | null | undefined): v is number => typeof v === "number" && Number.isFinite(v);

function snittAv(verdier: ReadonlyArray<number | null | undefined>): SgSnitt {
  const brukbare = verdier.filter(gyldig);
  if (!brukbare.length) return { snitt: null, antall: 0 };
  return { snitt: brukbare.reduce((a, b) => a + b, 0) / brukbare.length, antall: brukbare.length };
}

export function beregnSgProfil(runder: readonly DgSgRunde[]): SgProfilBeregning {
  const kategorier = SG_KATEGORIER.map(k => ({ ...k, ...snittAv(runder.map(r => r[k.kode])) }));
  const medAlle = runder.filter(r => gyldig(r.ott) && gyldig(r.app) && gyldig(r.arg) && gyldig(r.putt)).length;
  return {
    antallRunder: runder.length,
    total: snittAv(runder.map(r => r.total)),
    kategorier,
    kategoriAndel: runder.length ? medAlle / runder.length : null,
    harKategoriData: kategorier.some(k => k.antall > 0),
  };
}

// ----------------------------------------------------------------------------- Rundeserie

export type TrendPunkt = {
  /** Plass i serien, eldst først (0, 1, 2 …). */
  indeks: number;
  dato: string | null;
  tour: string | null;
  arrangement: string | null;
  verdi: number | null;
  /** Rullerende snitt over de siste `vindu` rundene som har tall. Null til det er nok grunnlag. */
  snitt: number | null;
};

export const TREND_MIN_GRUNNLAG = 3;

/** Runder i vilkårlig rekkefølge inn; serien kommer ut eldst først, så grafen leses mot høyre. */
export function byggTrend(runder: readonly DgSgRunde[], vindu = 10): TrendPunkt[] {
  const sortert = [...runder].sort((a, b) =>
    (a.dato ?? "").localeCompare(b.dato ?? "") || (a.runde ?? 0) - (b.runde ?? 0) || a.id - b.id);
  const siste: number[] = [];
  return sortert.map((r, indeks) => {
    if (gyldig(r.total)) {
      siste.push(r.total);
      if (siste.length > vindu) siste.shift();
    }
    const snitt = siste.length >= TREND_MIN_GRUNNLAG ? siste.reduce((a, b) => a + b, 0) / siste.length : null;
    return { indeks, dato: r.dato, tour: r.tour, arrangement: r.arrangement, verdi: gyldig(r.total) ? r.total : null, snitt };
  });
}

// ----------------------------------------------------------------------------- Tour-dekning

export type TourDekningRad = {
  tour: string;
  antallRunder: number;
  medTotal: number;
  medKategori: number;
  fraAar: number | null;
  tilAar: number | null;
};

export type TourDekningVisning = TourDekningRad & {
  navn: string;
  /** Andel av rundene med SG total, 0–1. */
  totalAndel: number;
  /** Andel av rundene med alle fire kategoriene, 0–1. */
  kategoriAndel: number;
  kategoriForventet: boolean;
  fordelingFinnes: boolean;
};

export function byggTourDekning(rader: readonly TourDekningRad[]): TourDekningVisning[] {
  return [...rader]
    .filter(r => r.antallRunder > 0)
    .sort((a, b) => b.antallRunder - a.antallRunder || a.tour.localeCompare(b.tour))
    .map(r => ({
      ...r,
      navn: tourNavn(r.tour),
      totalAndel: r.medTotal / r.antallRunder,
      kategoriAndel: r.medKategori / r.antallRunder,
      kategoriForventet: harKategoriSg(r.tour),
      fordelingFinnes: harFordeling(r.tour),
    }));
}

// ----------------------------------------------------------------------------- Approach

export type ApproachBoette = {
  id: string;
  lie: "fairway" | "rough";
  navn: string;
  sgPerSlag: number | null;
  naerhetMeter: number | null;
  girPct: number | null;
  antallSlag: number | null;
  /** Færre slag enn dette gir for tynt grunnlag til å tolke bøtta. */
  tyntGrunnlag: boolean;
};

export const APPROACH_MIN_SLAG = 30;

const BOETTE_NAVN: Readonly<Record<string, string>> = {
  "fairway-50": "Fairway 50–100 yd", "fairway-100": "Fairway 100–150 yd",
  "fairway-150": "Fairway 150–200 yd", "fairway-200": "Fairway 200+ yd",
  "rough-100": "Rough under 150 yd", "rough-150": "Rough over 150 yd",
};

/** Leser kildebøttene fra payload (jsonb) slik Data Golf leverer dem. Manglende felt blir null. */
export function lesApproachBoetter(payload: unknown): ApproachBoette[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  return bandFraApproachRad(payload as Record<string, unknown>).map((b: TakBandRad) => {
    const id = `${b.lie}-${b.band.replace("innspill", "")}`;
    return {
      id,
      lie: b.lie,
      navn: BOETTE_NAVN[id] ?? id,
      sgPerSlag: b.sgPerShot,
      naerhetMeter: b.proximityMeters,
      girPct: b.girRate === null ? null : b.girRate * 100,
      antallSlag: b.shotCount,
      tyntGrunnlag: b.shotCount !== null && b.shotCount < APPROACH_MIN_SLAG,
    };
  });
}

/** Sant når minst én bøtte har et SG-tall. Ellers skal komponenten vise tom tilstand. */
export const harApproachTall = (boetter: readonly ApproachBoette[]) => boetter.some(b => b.sgPerSlag !== null);

// ----------------------------------------------------------------------------- Tilstand

/**
 * Det komponentene får fra datalaget. «ikke-konfigurert» betyr at tabellen mangler, «tom» at den
 * finnes uten rader for utvalget, «feil» at spørringen feilet (uten feiltekst eller adresser),
 * «ingen-tilgang» at innlogget bruker ikke er coach eller admin.
 */
export type DgResultat<T> =
  | { tilstand: "klar"; data: T }
  | { tilstand: "tom" }
  | { tilstand: "ikke-konfigurert" }
  | { tilstand: "feil" }
  | { tilstand: "ingen-tilgang" };

/** Det komponentene tar inn: datalagets svar, eller «laster» mens det hentes. */
export type DgVisning<T> = DgResultat<T> | { tilstand: "laster" };

export type ApproachRaa = { asOf: string; period: string; payload: unknown };

// ----------------------------------------------------------------------------- Spillerkort

export type SpillerKortData = {
  dgId: number;
  navn: string;
  land: string | null;
  fodselsaar: number | null;
  amator: boolean;
  norsk: boolean;
  dgRang: number | null;
  owgrRang: number | null;
  primaerTour: string | null;
  sgTotal: number | null;
  kildedato: string | null;
  antallRunder: number;
  fraAar: number | null;
  tilAar: number | null;
};
