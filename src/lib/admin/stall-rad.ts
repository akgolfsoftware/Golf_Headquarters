/**
 * Stall-lista — radens fire ting (MASTERPLAN 15.11, beslutning 6.5).
 *
 * Raden viser KUN: navn, neste økt, siste aktivitet, én varsel-prikk.
 * Fylt = trenger deg · åpen ring = følg med · ingen = på planen.
 * SG-form, plan-etterlevelse, hcp, pakke og skyldig beløp er LESE-informasjon
 * og bor i spillerkortet (detaljpanelet + /admin/spillere/[id]) — aldri i raden.
 *
 * Ren modul (ingen Prisma/React) så etikettene kan låses med tester.
 * All datotolkning er Oslo-korrekt via Intl (tidssone-gotcha: Vercel kjører UTC).
 */

export type StallPrikk = "fylt" | "aapen" | "ingen";

const OSLO_DAG = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" });
const OSLO_UKEDAG = new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: "Europe/Oslo" });
const OSLO_KLOKKE = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Oslo",
});

/** Hele Oslo-døgn mellom to tidspunkter (0 = samme dag, 1 = i går/i morgen …). */
export function osloDagDiff(a: Date, b: Date): number {
  const [ya, ma, da] = OSLO_DAG.format(a).split("-").map(Number);
  const [yb, mb, db] = OSLO_DAG.format(b).split("-").map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86_400_000);
}

/** «Neste: i dag 13.00» · «Neste: i morgen 07.30» · «Neste: man 07.30» · «Ingen økt planlagt». */
export function nesteOktLabel(neste: Date | null, naa: Date): string {
  if (neste === null) return "Ingen økt planlagt";
  const klokke = OSLO_KLOKKE.format(neste).replace(":", ".");
  const diff = osloDagDiff(naa, neste);
  if (diff === 0) return `Neste: i dag ${klokke}`;
  if (diff === 1) return `Neste: i morgen ${klokke}`;
  const ukedag = OSLO_UKEDAG.format(neste).replace(".", "");
  return `Neste: ${ukedag} ${klokke}`;
}

/**
 * Siste aktivitet — ærlig om KILDEN (TruthLayer): en gjennomført økt sies som
 * «økt …», ren innlogging som «innlogget …». Aldri «logget» uten kilde.
 */
export function sisteAktivitetLabel(
  sisteOkt: Date | null,
  dagerSidenInnlogging: number | null,
  naa: Date,
): string {
  if (sisteOkt !== null) {
    const diff = osloDagDiff(sisteOkt, naa);
    if (diff <= 0) return "økt i dag";
    if (diff === 1) return "økt i går";
    return `økt ${diff} dg siden`;
  }
  if (dagerSidenInnlogging === null) return "aldri aktiv";
  if (dagerSidenInnlogging === 0) return "innlogget i dag";
  if (dagerSidenInnlogging === 1) return "innlogget i går";
  return `innlogget ${dagerSidenInnlogging} dg siden`;
}

/**
 * Prikken følger bolkene (samme kilde som «Trenger deg nå / Følger planen /
 * Hviler»): trenger → fylt, hviler → åpen ring (følg med), planen → ingen.
 */
export function prikkForBolk(bolk: "trenger" | "planen" | "hviler"): StallPrikk {
  if (bolk === "trenger") return "fylt";
  if (bolk === "hviler") return "aapen";
  return "ingen";
}
