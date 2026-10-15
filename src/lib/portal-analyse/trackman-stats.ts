/**
 * TrackMan i Stats (pakke 6, PH-17): felles filter, snitt, spredning, gapping og utvikling.
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, skjermene «trackman», «tmokt» og «koller».
 *
 * Bare rene funksjoner. Datahentingen ligger i load-trackman-stats.ts.
 * Manglende verdi er null og vises som «—», aldri som 0.
 */

export type TmParamKey =
  | "bs" | "smash" | "launch" | "ldir" | "spin" | "saxis"
  | "carry" | "total" | "side" | "apex" | "land"
  | "cs" | "aa" | "path" | "face" | "ftp" | "dl";

export type TmParam = {
  key: TmParamKey;
  navn: string;
  enhet: "" | "mph" | "m" | "°" | "rpm";
  desimaler: number;
  gruppe: "Ballen" | "Ballbanen" | "Kølla";
  /** s = vinkel med fortegn, t = tusenskille, side = V/H i meter. */
  form?: "s" | "t" | "side";
};

/** Alle 17 TrackMan-tall, i utkastets rekkefølge. */
export const TM_PARAM: TmParam[] = [
  { key: "bs", navn: "Ball Speed", enhet: "mph", desimaler: 1, gruppe: "Ballen" },
  { key: "smash", navn: "Smash Factor", enhet: "", desimaler: 2, gruppe: "Ballen" },
  { key: "launch", navn: "Launch Angle", enhet: "°", desimaler: 1, gruppe: "Ballen" },
  { key: "ldir", navn: "Launch Direction", enhet: "°", desimaler: 1, gruppe: "Ballen", form: "s" },
  { key: "spin", navn: "Spin Rate", enhet: "rpm", desimaler: 0, gruppe: "Ballen", form: "t" },
  { key: "saxis", navn: "Spin Axis", enhet: "°", desimaler: 1, gruppe: "Ballen", form: "s" },
  { key: "carry", navn: "Carry", enhet: "m", desimaler: 0, gruppe: "Ballbanen" },
  { key: "total", navn: "Total", enhet: "m", desimaler: 0, gruppe: "Ballbanen" },
  { key: "side", navn: "Side", enhet: "m", desimaler: 1, gruppe: "Ballbanen", form: "side" },
  { key: "apex", navn: "Apex Height", enhet: "m", desimaler: 0, gruppe: "Ballbanen" },
  { key: "land", navn: "Land Angle", enhet: "°", desimaler: 0, gruppe: "Ballbanen" },
  { key: "cs", navn: "Club Speed", enhet: "mph", desimaler: 1, gruppe: "Kølla" },
  { key: "aa", navn: "Attack Angle", enhet: "°", desimaler: 1, gruppe: "Kølla", form: "s" },
  { key: "path", navn: "Club Path", enhet: "°", desimaler: 1, gruppe: "Kølla", form: "s" },
  { key: "face", navn: "Face Angle", enhet: "°", desimaler: 1, gruppe: "Kølla", form: "s" },
  { key: "ftp", navn: "Face to Path", enhet: "°", desimaler: 1, gruppe: "Kølla", form: "s" },
  { key: "dl", navn: "Dynamic Loft", enhet: "°", desimaler: 1, gruppe: "Kølla" },
];

export const TM_PARAM_GRUPPER = ["Ballen", "Ballbanen", "Kølla"] as const;

export function tmParam(key: TmParamKey): TmParam {
  return TM_PARAM.find((p) => p.key === key)!;
}

export type TmHast = "FULL" | "LAV" | "DRY";

export type TmSlag = Record<TmParamKey, number | null> & {
  nr: number;
  kolle: string;
  /** Ekstremt slag (TrackManShot.outlier): vises, men holdes utenfor snittet. */
  ekstrem: boolean;
  /** Målavstand i meter for slaget, eller null. */
  mal: number | null;
  hast: TmHast | null;
  /** Treffpunkt på bladet, −1 hæl … 1 tå og −1 lavt … 1 høyt. */
  sx: number | null;
  sy: number | null;
};

export type TmSted = "Simulator" | "Nett" | "Range" | "Bane";

export type TmOkt = {
  id: string;
  /** ISO-tidspunkt. */
  dato: string;
  sted: TmSted | null;
  /** Oppgaven i teknisk plan flest slag er koblet til, eller null. */
  plan: string | null;
  slag: TmSlag[];
};

const STED: Record<string, TmSted> = {
  SIMULATOR_INDOOR: "Simulator",
  NET_INDOOR: "Nett",
  RANGE_OUTDOOR_MAT: "Range",
  RANGE_OUTDOOR_GRASS: "Range",
  COURSE_PRACTICE: "Bane",
  COURSE_COMPETITION: "Bane",
};

export function stedFraMiljo(miljo: string | null | undefined): TmSted | null {
  return miljo ? (STED[miljo] ?? null) : null;
}

/* ---------- Formatering ---------- */

/** Tall med komma og typografisk minus. */
export function tmTall(v: number, desimaler: number): string {
  const s = desimaler === 0 ? String(Math.round(v)) : v.toFixed(desimaler);
  return s.replace(".", ",").replace(/^-(?=0(,0+)?$)/, "").replace("-", "−");
}

export function formaterTm(p: TmParam, v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (p.form === "side") {
    if (Math.abs(v) < 0.05) return "0,0 m";
    return `${v < 0 ? "V" : "H"} ${tmTall(Math.abs(v), 1)} m`;
  }
  const r = Math.round(v);
  let s = p.form === "t"
    ? `${r < 0 ? "−" : ""}${String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`
    : tmTall(v, p.desimaler);
  if (p.form === "s" && v > 0.04) s = `+${s}`;
  if (p.enhet === "°") return `${s}°`;
  return p.enhet ? `${s} ${p.enhet}` : s;
}

/* ---------- Snitt og spredning ---------- */

export function snitt(slag: TmSlag[]): Record<TmParamKey, number | null> {
  const ut = {} as Record<TmParamKey, number | null>;
  for (const p of TM_PARAM) {
    const v = slag.map((s) => s[p.key]).filter((x): x is number => x != null && Number.isFinite(x));
    ut[p.key] = v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  }
  return ut;
}

/** Standardavvik. Trenger minst to verdier. */
export function sd(slag: TmSlag[], key: TmParamKey): number | null {
  const v = slag.map((s) => s[key]).filter((x): x is number => x != null && Number.isFinite(x));
  if (v.length < 2) return null;
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length);
}

/** Avstand fra målet i meter (carry og side mot målavstanden). */
export function fraMal(s: TmSlag): number | null {
  if (s.mal == null || s.carry == null || s.side == null) return null;
  return Math.sqrt((s.carry - s.mal) ** 2 + s.side ** 2);
}

/** Hvor stor andel av målavstanden slaget bommer med, i prosent (PEI). */
export function peiProsent(slag: TmSlag[]): number | null {
  const v = slag.flatMap((s) => {
    const d = fraMal(s);
    return d != null && s.mal ? [d / s.mal] : [];
  });
  return v.length ? (v.reduce((a, b) => a + b, 0) / v.length) * 100 : null;
}

/* ---------- Køllerekkefølge ---------- */

/** Driver først, så tre, hybrid, jern etter nummer og wedger etter loft. */
export function kolleRang(navn: string): number {
  const n = navn.toLowerCase();
  const tall = Number(n.match(/\d+/)?.[0] ?? NaN);
  if (n.includes("driver")) return 0;
  if (/tre|wood/.test(n)) return 10 + (Number.isFinite(tall) ? tall : 0);
  if (/hybrid|rescue/.test(n)) return 30 + (Number.isFinite(tall) ? tall : 0);
  if (/°/.test(n) && Number.isFinite(tall)) return 100 + tall;
  if (/jern|iron|^\d+i$/.test(n)) return 50 + (Number.isFinite(tall) ? tall : 0);
  if (/^pw|pitch/.test(n)) return 90;
  if (/^gw|^aw|gap/.test(n)) return 98;
  if (/^sw|sand/.test(n)) return 156;
  if (/^lw|lob/.test(n)) return 160;
  return 200;
}

export function sorterKoller(koller: Iterable<string>): string[] {
  return [...new Set(koller)].sort((a, b) => kolleRang(a) - kolleRang(b) || a.localeCompare(b, "nb"));
}

/* ---------- Felles filter (lever i adressen, gjelder alle TrackMan-sidene) ---------- */

export type TmPeriode = "4u" | "90d" | "sesong";
export const TM_PERIODE_NAVN: Record<TmPeriode, string> = { "4u": "Siste 4 uker", "90d": "Siste 90 dager", sesong: "Sesong" };
export type TmHastValg = "Full" | "Lav";
export type TmPlanValg = "koblet" | "ikke";
export const TM_PLAN_NAVN: Record<TmPlanValg, string> = { koblet: "Koblet til teknisk plan", ikke: "Ikke koblet" };

export type TmFilter = {
  periode: TmPeriode;
  kolle: string[];
  sted: TmSted[];
  hast: TmHastValg[];
  plan: TmPlanValg[];
  /** Ta med ekstreme slag i snitt og telling. */
  ekstreme: boolean;
};

export const TM_FILTER_STANDARD: TmFilter = { periode: "90d", kolle: [], sted: [], hast: [], plan: [], ekstreme: false };

type Sok = Record<string, string | string[] | undefined>;
const liste = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v : v ? v.split(",") : []).map((x) => x.trim()).filter(Boolean);
const STEDER: TmSted[] = ["Simulator", "Nett", "Range", "Bane"];

export function lesTmFilter(sok: Sok): TmFilter {
  const periode = sok.periode;
  return {
    periode: periode === "4u" || periode === "sesong" ? periode : "90d",
    kolle: liste(sok.kolle),
    sted: liste(sok.sted).filter((x): x is TmSted => (STEDER as string[]).includes(x)),
    hast: liste(sok.hast).filter((x): x is TmHastValg => x === "Full" || x === "Lav"),
    plan: liste(sok.plan).filter((x): x is TmPlanValg => x === "koblet" || x === "ikke"),
    ekstreme: sok.ekstreme === "vis",
  };
}

/** Søkestrengen for filteret, med «?» foran, eller tom streng for standardfilteret. */
export function tmFilterSok(f: TmFilter): string {
  const p = new URLSearchParams();
  if (f.periode !== "90d") p.set("periode", f.periode);
  if (f.kolle.length) p.set("kolle", f.kolle.join(","));
  if (f.sted.length) p.set("sted", f.sted.join(","));
  if (f.hast.length) p.set("hast", f.hast.join(","));
  if (f.plan.length) p.set("plan", f.plan.join(","));
  if (f.ekstreme) p.set("ekstreme", "vis");
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Første dag i perioden. Sesong er kalenderåret i Oslo. */
export function periodeFra(periode: TmPeriode, naa: Date): Date {
  if (periode === "4u") return new Date(naa.getTime() - 28 * 86_400_000);
  if (periode === "90d") return new Date(naa.getTime() - 90 * 86_400_000);
  const aar = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", year: "numeric" }).format(naa));
  return new Date(Date.UTC(aar, 0, 1) - 2 * 3_600_000);
}

function hastOk(s: TmSlag, f: TmFilter): boolean {
  if (!f.hast.length) return true;
  return (s.hast === "FULL" && f.hast.includes("Full")) || (s.hast === "LAV" && f.hast.includes("Lav"));
}

/** Slagene som teller i snitt og antall: ekstreme slag bare når filteret tar dem med. */
export function tellende(slag: TmSlag[], f: TmFilter): TmSlag[] {
  return f.ekstreme ? slag : slag.filter((s) => !s.ekstrem);
}

/**
 * Øktene som passer filteret, med bare slagene som passer kølle og hastighet.
 * `utenKolle` lar kølle-filteret stå utenfor (utvikling og køllesiden velger kølle selv).
 */
export function filtrerOkter(okter: TmOkt[], f: TmFilter, naa: Date, utenKolle = false): TmOkt[] {
  const fra = periodeFra(f.periode, naa).getTime();
  return okter.flatMap((o) => {
    if (Date.parse(o.dato) < fra) return [];
    if (f.sted.length && (!o.sted || !f.sted.includes(o.sted))) return [];
    if (f.plan.length && !f.plan.includes(o.plan ? "koblet" : "ikke")) return [];
    const slag = o.slag.filter((s) => hastOk(s, f) && (utenKolle || !f.kolle.length || f.kolle.includes(s.kolle)));
    return slag.length ? [{ ...o, slag }] : [];
  });
}

/* ---------- Økter ---------- */

/** Hastigheten flest klassifiserte slag har, eller null når ingen er klassifisert. */
export function oktHast(slag: TmSlag[]): TmHast | null {
  const n = { FULL: 0, LAV: 0, DRY: 0 };
  for (const s of slag) if (s.hast) n[s.hast]++;
  const best = (Object.keys(n) as TmHast[]).sort((a, b) => n[b] - n[a])[0];
  return n[best] ? best : null;
}

export const TM_HAST_NAVN: Record<TmHast, string> = { FULL: "Full hastighet", LAV: "Lav hastighet", DRY: "Uten ball" };

export function oktKoller(o: TmOkt): string[] {
  return sorterKoller(o.slag.map((s) => s.kolle));
}

/** Navnet på økta: oppgaven i teknisk plan, ellers køllene. */
export function oktNavn(o: TmOkt): string {
  if (o.plan) return o.plan;
  const k = oktKoller(o);
  if (k.length > 3) return `${k.length} køller`;
  return k.length > 1 ? `${k.slice(0, -1).join(", ")} og ${k[k.length - 1]}` : (k[0] ?? "TrackMan-økt");
}

/* ---------- Alle køller ---------- */

export type TmKolleRad = {
  kolle: string;
  antall: number;
  okter: number;
  snitt: Record<TmParamKey, number | null>;
  /** ±2 standardavvik til siden, i meter. */
  spredning: number | null;
};

export function kolleOppsummering(okter: TmOkt[], f: TmFilter): TmKolleRad[] {
  const per = new Map<string, { slag: TmSlag[]; okter: Set<string> }>();
  for (const o of okter) for (const s of tellende(o.slag, f)) {
    const r = per.get(s.kolle) ?? { slag: [], okter: new Set<string>() };
    r.slag.push(s);
    r.okter.add(o.id);
    per.set(s.kolle, r);
  }
  return sorterKoller(per.keys()).map((kolle) => {
    const r = per.get(kolle)!;
    const sdSide = sd(r.slag, "side");
    return { kolle, antall: r.slag.length, okter: r.okter.size, snitt: snitt(r.slag), spredning: sdSide == null ? null : 2 * sdSide };
  });
}

export type TmGapRad = { kolle: string; carry: number; antall: number; gapFraForrige: number | null };

/**
 * Gapping: snitt carry per kølle, lengst først. Bare full hastighet; slag uten
 * klassifisert hastighet tas med og telles i `utenHast`, siden importen ikke setter den.
 */
export function gapping(okter: TmOkt[], f: TmFilter): { rader: TmGapRad[]; antall: number; utenHast: number } {
  const per = new Map<string, number[]>();
  let utenHast = 0;
  for (const o of okter) for (const s of tellende(o.slag, f)) {
    if (s.carry == null || s.hast === "LAV" || s.hast === "DRY") continue;
    if (s.hast == null) utenHast++;
    per.set(s.kolle, [...(per.get(s.kolle) ?? []), s.carry]);
  }
  const rader = [...per.entries()]
    .map(([kolle, c]) => ({ kolle, carry: c.reduce((a, b) => a + b, 0) / c.length, antall: c.length }))
    .sort((a, b) => b.carry - a.carry)
    .map((r, i, alle) => ({ ...r, gapFraForrige: i ? alle[i - 1].carry - r.carry : null }));
  return { rader, antall: rader.reduce((a, r) => a + r.antall, 0), utenHast };
}

/* ---------- Utvikling over tid ---------- */

export type TmUtviklingPunkt = {
  oktId: string;
  dato: string;
  kolle: string;
  hast: TmHast | null;
  antall: number;
  snitt: Record<TmParamKey, number | null>;
};

/** Snitt per økt og kølle, eldst først. Klienten velger kølle, tall og hastighet. */
export function utviklingPunkter(okter: TmOkt[], f: TmFilter): TmUtviklingPunkt[] {
  const ut: TmUtviklingPunkt[] = [];
  for (const o of [...okter].sort((a, b) => Date.parse(a.dato) - Date.parse(b.dato))) {
    for (const kolle of oktKoller(o)) {
      const slag = tellende(o.slag.filter((s) => s.kolle === kolle), f);
      if (slag.length) ut.push({ oktId: o.id, dato: o.dato, kolle, hast: oktHast(slag), antall: slag.length, snitt: snitt(slag) });
    }
  }
  return ut;
}

/* ---------- Utstyrshelse ---------- */

export type TmUtstyrEndring = { kolle: string; fraDato: string; fra: number; til: number };

/**
 * Endring i Spin Rate per kølle fra første til siste økt i perioden, største endring først.
 * Bare målte tall: ingen vurdering av om endringen er god eller dårlig (åpent hos Anders).
 */
export function utstyrsEndringer(punkter: TmUtviklingPunkt[], maks = 3): TmUtstyrEndring[] {
  const per = new Map<string, TmUtviklingPunkt[]>();
  for (const p of punkter) if (p.snitt.spin != null) per.set(p.kolle, [...(per.get(p.kolle) ?? []), p]);
  return [...per.entries()]
    .filter(([, l]) => l.length >= 2)
    .map(([kolle, l]) => ({ kolle, fraDato: l[0].dato, fra: l[0].snitt.spin as number, til: l[l.length - 1].snitt.spin as number }))
    .sort((a, b) => Math.abs(b.til - b.fra) - Math.abs(a.til - a.fra))
    .slice(0, maks);
}
