/**
 * Spiller 360 (AG-08) i Precision Athletics — rene visningsregler.
 *
 * Ingen database, ingen server-only: reglene her er det skjermen lover om
 * tallene (brutto score, nok data, fortegn), og de er låst med tester.
 * Visningstypene ligger i spiller360-typer.ts.
 */
import { AK_BANDS, kategoriFraSnittscore, type AkKategori } from "@/lib/domain/ak-kategori";

export const FANER = [
  ["plan", "Plan"],
  ["stats", "Stats"],
  ["tp", "Teknisk plan"],
  ["test", "Tester"],
  ["iup", "IUP"],
  ["samtaler", "Samtaler"],
  ["talent", "Talent"],
] as const;
export type S360Fane = (typeof FANER)[number][0];

export function tilFane(v: string | undefined | null): S360Fane {
  return FANER.some(([k]) => k === v) ? (v as S360Fane) : "plan";
}

const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });
const OSLO_KORT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });

/** «26.09.2026», eller «—». */
export function dato(d: Date | null | undefined): string {
  return d ? OSLO_DATO.format(d) : "—";
}
/** «26.09», eller «—». */
export function kortDato(d: Date | null | undefined): string {
  return d ? OSLO_KORT.format(d) : "—";
}

/** Komma-desimal, «—» for null. */
export function desimal(v: number | null | undefined, d = 1): string {
  return v == null || !Number.isFinite(v) ? "—" : v.toFixed(d).replace(".", ",");
}

/** Strokes Gained med fortegn: +0,4 · −1,2 · ±0,0. */
export function sg(v: number | null | undefined, d = 1): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const grense = 0.5 * 10 ** -d;
  const tegn = v >= grense ? "+" : v <= -grense ? "−" : "±";
  return tegn + Math.abs(v).toFixed(d).replace(".", ",");
}

/** Score mot par: +3 · −1 · ±0. */
export function tilPar(diff: number | null | undefined): string {
  if (diff == null || !Number.isFinite(diff)) return "—";
  return diff > 0 ? `+${diff}` : diff < 0 ? `−${Math.abs(diff)}` : "±0";
}

/** HCP som den registreres: 8,4 · +1,2 (plusshandicap). */
export function hcp(v: number | null | undefined): string {
  if (v == null) return "—";
  return v < 0 ? `+${Math.abs(v).toFixed(1).replace(".", ",")}` : v.toFixed(1).replace(".", ",");
}

/**
 * Nok data (beslutninger.md §SKJERMENE … RUNDE 8, Stats): under 4 runder ingen
 * konklusjon, 4–7 «foreløpig», fra 8 vises tallet uten forbehold.
 */
export type Datagrunnlag = "ingen" | "forelopig" | "ok";
export function datagrunnlag(antallRunder: number): Datagrunnlag {
  if (antallRunder < 4) return "ingen";
  if (antallRunder < 8) return "forelopig";
  return "ok";
}
export const DATAGRUNNLAG_TEKST: Record<Datagrunnlag, string> = {
  ingen: "For lite data · under 4 runder",
  forelopig: "Foreløpig · 4–7 runder",
  ok: "Nok data",
};

export type RundeInn = {
  score: number;
  playedAt: Date;
  /** Hull med registrert score. 0 = ukjent hullantall (bare totalscore). */
  hull: number;
};

/**
 * Brutto snittscore for tellende runder: bare 18-hullsrunder, eller runder uten
 * hullkort (ukjent antall hull regnes som en hel runde, som resten av appen gjør).
 * Ni hull teller aldri. Runder sorteres nyeste først.
 */
export function tellendeRunder<T extends RundeInn>(runder: readonly T[]): T[] {
  return [...runder]
    .filter((r) => r.hull === 0 || r.hull >= 18)
    .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
}

function snitt(tall: readonly number[]): number | null {
  return tall.length ? tall.reduce((a, b) => a + b, 0) / tall.length : null;
}

export type Snittscore = {
  antall: number;
  siste10: number | null;
  forrige10: number | null;
  kategori: AkKategori | null;
  kategoriNavn: string | null;
  /** Neste kategori og hvor mange slag som gjenstår. null for A eller uten snitt. */
  neste: { kategori: AkKategori; grense: number; slag: number } | null;
  grunnlag: Datagrunnlag;
};

export function snittscore(runder: readonly RundeInn[]): Snittscore {
  const t = tellendeRunder(runder);
  const siste = t.slice(0, 10).map((r) => r.score);
  const forrige = t.slice(10, 20).map((r) => r.score);
  const s = snitt(siste);
  const grunnlag = datagrunnlag(t.length);
  if (s == null || grunnlag === "ingen") {
    return { antall: t.length, siste10: s, forrige10: snitt(forrige), kategori: null, kategoriNavn: null, neste: null, grunnlag };
  }
  const band = kategoriFraSnittscore(s);
  const i = AK_BANDS.findIndex((b) => b.kategori === band.kategori);
  const bedre = i > 0 ? AK_BANDS[i - 1] : null;
  // For å nå neste kategori må snittet under nåværende båndets nedre grense.
  const neste = bedre && band.min != null
    ? { kategori: bedre.kategori, grense: band.min, slag: Math.max(0, Math.round((s - band.min) * 10) / 10) }
    : null;
  return { antall: t.length, siste10: s, forrige10: snitt(forrige), kategori: band.kategori, kategoriNavn: band.niva, neste, grunnlag };
}

/** Workbench-status til visning. Ukjent status vises som den er lagret. */
export const OKT_STATUS: Record<string, [string, "ok" | "warn" | "neutral" | "live"]> = {
  COMPLETED: ["Gjennomført", "ok"],
  SKIPPED: ["Hoppet over", "warn"],
  CANCELLED: ["Avlyst", "neutral"],
  IN_PROGRESS: ["Pågår", "live"],
  DRAFT: ["Utkast", "neutral"],
  PLANNED: ["Planlagt", "neutral"],
  PUBLISHED: ["Planlagt", "neutral"],
};
export function oktStatus(s: string): [string, "ok" | "warn" | "neutral" | "live"] {
  return OKT_STATUS[s] ?? [s.toLowerCase(), "neutral"];
}

const AKSER = ["fys", "tek", "slag", "spill", "turn"] as const;
export type AkseKode = (typeof AKSER)[number];
/** «TEK», «SLAG» … → aksekode, eller null når feltet ikke er en akse. */
export function akseFra(v: string | null | undefined): AkseKode | null {
  const k = (v ?? "").toLowerCase();
  return (AKSER as readonly string[]).includes(k) ? (k as AkseKode) : null;
}

/** Programmet avgjør om fireukerssjekk og utviklingssjekk gjelder (beslutninger 28.09). */
export function erWangEllerTn(programmer: readonly (string | null)[], gruppenavn: readonly string[]): boolean {
  if (programmer.some((p) => p === "WANG_TOPPIDRETT" || p === "WANG_UNG")) return true;
  return gruppenavn.some((n) => /team norway/i.test(n));
}
