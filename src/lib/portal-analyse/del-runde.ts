/**
 * Del runde (PlayerHQ pakke 13, vedtak 16.10.2026 §DEL RUNDE FINNES VED LANSERING).
 * Ren modul: tallene på delekortet og scorekortet. Bare brutto. Par regnes fra hullene, aldri fra banen
 * (en ni-hullsrunde mot banens par 72 gir feil til par). Mangler hullene, er til par «—».
 */
export type DelRundeHull = { nr: number; par: number; slag: number };
export type DelRundeInn = {
  id: string;
  score: number;
  playedAt: Date;
  bane: string;
  sg: { ott: number | null; app: number | null; arg: number | null; putt: number | null };
  hull: DelRundeHull[];
  sharedWithCoach: boolean;
};
export type DelRundeData = {
  id: string;
  brutto: number;
  /** null når hullene ikke er ført for 9 eller 18 hull. */
  motPar: number | null;
  bane: string;
  dato: string;
  /** «2026-10-04», til filnavn. */
  datoKort: string;
  sg: { navn: string; v: number | null }[];
  hull: DelRundeHull[];
  sharedWithCoach: boolean;
};

const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric" });
const ISO = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });

export function byggDelRunde(r: DelRundeInn): DelRundeData {
  const hull = [...r.hull].sort((a, b) => a.nr - b.nr);
  const komplett = (hull.length === 9 || hull.length === 18) && hull.reduce((a, h) => a + h.slag, 0) === r.score;
  return {
    id: r.id,
    brutto: r.score,
    motPar: komplett ? r.score - hull.reduce((a, h) => a + h.par, 0) : null,
    bane: r.bane,
    dato: DATO.format(r.playedAt),
    datoKort: ISO.format(r.playedAt),
    sg: [
      { navn: "Utslag", v: r.sg.ott },
      { navn: "Innspill", v: r.sg.app },
      { navn: "Nærspill", v: r.sg.arg },
      { navn: "Putting", v: r.sg.putt },
    ],
    hull,
    sharedWithCoach: r.sharedWithCoach,
  };
}

/** «på par», «3 over par», «2 under par», eller «—». */
export function motParOrd(v: number | null): string {
  if (v == null) return "—";
  if (v === 0) return "på par";
  return `${Math.abs(v)} ${v > 0 ? "over" : "under"} par`;
}

/** «+0,4», «−0,6», «0,0» eller «—». */
export function sgTekst(v: number | null): string {
  if (v == null) return "—";
  const s = Math.abs(v).toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return v > 0.04 ? `+${s}` : v < -0.04 ? `−${s}` : "0,0";
}

/** Initialer for avataren: «Øyvind Rohjan» → «ØR». */
export function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  return ((deler[0]?.[0] ?? "") + (deler.length > 1 ? deler[deler.length - 1]![0] : "")).toUpperCase() || "—";
}

export type DelFormat = "story" | "post" | "pdf";
export const FORMAT_MAAL: Record<Exclude<DelFormat, "pdf">, { b: number; h: number }> = {
  story: { b: 1080, h: 1920 },
  post: { b: 1080, h: 1080 },
};

export function delFilnavn(d: Pick<DelRundeData, "datoKort">, format: DelFormat): string {
  return `runde-${d.datoKort}-${format === "pdf" ? "scorekort.pdf" : `${format}.png`}`;
}
