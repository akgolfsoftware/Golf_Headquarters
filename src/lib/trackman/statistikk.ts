/**
 * TrackMan-statistikk per parameter og kølle (§TRACKMAN I TEAM NORWAY-TESTENE punkt 6, Anders 22.10.2026, planfila
 * §6.2b): snitt, median, min, maks og spredning (standardavvik), og andel slag i målvinduet. Ren logikk uten database.
 *
 *  - Under 5 slag: «for få slag». Snitt, median, min og maks vises, men ikke spredning eller andel i målvindu.
 *  - Standardvinduene (Anders 22.10): Face to Path, Club Path og Face Angle ±2° · Smash Factor ≥ 1,35 jern og
 *    ≥ 1,45 driver · Attack Angle −5 til −3° jern og 0 til +4° driver · Carry og Side ±5 m jern og ±15 m driver.
 *    Carry måles mot målet: spillerens eget mål, ellers slagets målavstand fra TrackMan. Uten mål: «—».
 *  - Trener og spiller kan sette eget mål og vindu per spiller, kølle og parameter (`TrackManMaal`). Det egne
 *    vinduet gjelder i stedet for standarden.
 *  - Ytterpunkt (`outlier`) teller med; TrackMan merker dem, men treneren ser dem i min og maks.
 */

export type TmParameter =
  | "clubSpeed" | "ballSpeed" | "smashFactor" | "attackAngle" | "clubPath" | "faceAngle" | "faceToPath" | "dynamicLoft"
  | "launchAngle" | "launchDirection" | "spinRate" | "spinAxis" | "carryDistance" | "totalDistance" | "side" | "apexHeight" | "landAngle";

/** Rekkefølgen og navnene i statistikken. TrackMan-navn på engelsk med stor forbokstav. */
export const TM_PARAMETRE: { key: TmParameter; navn: string; enhet: string; desimaler: number }[] = [
  { key: "clubSpeed", navn: "Club Speed", enhet: "mph", desimaler: 1 },
  { key: "ballSpeed", navn: "Ball Speed", enhet: "mph", desimaler: 1 },
  { key: "smashFactor", navn: "Smash Factor", enhet: "", desimaler: 2 },
  { key: "attackAngle", navn: "Attack Angle", enhet: "°", desimaler: 1 },
  { key: "clubPath", navn: "Club Path", enhet: "°", desimaler: 1 },
  { key: "faceAngle", navn: "Face Angle", enhet: "°", desimaler: 1 },
  { key: "faceToPath", navn: "Face to Path", enhet: "°", desimaler: 1 },
  { key: "dynamicLoft", navn: "Dynamic Loft", enhet: "°", desimaler: 1 },
  { key: "launchAngle", navn: "Launch Angle", enhet: "°", desimaler: 1 },
  { key: "launchDirection", navn: "Launch Direction", enhet: "°", desimaler: 1 },
  { key: "spinRate", navn: "Spin Rate", enhet: "rpm", desimaler: 0 },
  { key: "spinAxis", navn: "Spin Axis", enhet: "°", desimaler: 1 },
  { key: "carryDistance", navn: "Carry", enhet: "m", desimaler: 1 },
  { key: "totalDistance", navn: "Total", enhet: "m", desimaler: 1 },
  { key: "side", navn: "Side", enhet: "m", desimaler: 1 },
  { key: "apexHeight", navn: "Apex", enhet: "m", desimaler: 1 },
  { key: "landAngle", navn: "Land Angle", enhet: "°", desimaler: 1 },
];

export const MIN_SLAG = 5;

export type StatSlag = { id: string; club: string | null } & Partial<Record<TmParameter, number | null>> & { targetDistanceM?: number | null };

export type Parameterstat = {
  n: number;
  forFaa: boolean;
  snitt: number | null;
  median: number | null;
  min: { verdi: number; slagId: string } | null;
  maks: { verdi: number; slagId: string } | null;
  /** Standardavvik (utvalg). null under 5 slag. */
  spredning: number | null;
};

export function parameterstat(slag: StatSlag[], p: TmParameter): Parameterstat {
  const v = slag.flatMap((s) => (typeof s[p] === "number" && Number.isFinite(s[p]) ? [{ verdi: s[p] as number, slagId: s.id }] : []));
  const n = v.length;
  if (!n) return { n, forFaa: true, snitt: null, median: null, min: null, maks: null, spredning: null };
  const sortert = [...v].sort((a, b) => a.verdi - b.verdi);
  const snitt = v.reduce((a, x) => a + x.verdi, 0) / n;
  const midt = Math.floor(n / 2);
  const median = n % 2 ? sortert[midt]!.verdi : (sortert[midt - 1]!.verdi + sortert[midt]!.verdi) / 2;
  const forFaa = n < MIN_SLAG;
  const spredning = forFaa ? null : Math.sqrt(v.reduce((a, x) => a + (x.verdi - snitt) ** 2, 0) / (n - 1));
  return { n, forFaa, snitt, median, min: sortert[0]!, maks: sortert[n - 1]!, spredning };
}

export type Kolletype = "driver" | "jern";
export function kolletype(club: string | null): Kolletype {
  return club && /\b(driver|dr|1w)\b/i.test(club) ? "driver" : "jern";
}

export type Malvindu = { min: number | null; max: number | null; relativTilMaal?: boolean; kilde: "standard" | "eget" };
export type EgetMaal = { parameter: string; maal: number | null; vinduMin: number | null; vinduMax: number | null };

/** Standardvinduet for parameteren og køllen, eller null når parameteren ikke har et vindu. */
export function standardvindu(p: TmParameter, type: Kolletype): Malvindu | null {
  const d = type === "driver";
  switch (p) {
    case "faceToPath": case "clubPath": case "faceAngle": return { min: -2, max: 2, kilde: "standard" };
    case "smashFactor": return { min: d ? 1.45 : 1.35, max: null, kilde: "standard" };
    case "attackAngle": return d ? { min: 0, max: 4, kilde: "standard" } : { min: -5, max: -3, kilde: "standard" };
    case "carryDistance": return { min: d ? -15 : -5, max: d ? 15 : 5, relativTilMaal: true, kilde: "standard" };
    case "side": return { min: d ? -15 : -5, max: d ? 15 : 5, kilde: "standard" };
    default: return null;
  }
}

/** Vinduet som gjelder: eget mål når det finnes, ellers standarden. Eget vindu er alltid absolutte verdier. */
export function gjeldendeVindu(p: TmParameter, type: Kolletype, eget?: EgetMaal | null): Malvindu | null {
  if (eget && (eget.vinduMin !== null || eget.vinduMax !== null)) return { min: eget.vinduMin, max: eget.vinduMax, kilde: "eget" };
  return standardvindu(p, type);
}

/** Andel slag (0–1) i vinduet. null under 5 slag, uten vindu, eller når Carry mangler mål. */
export function andelIVindu(slag: StatSlag[], p: TmParameter, vindu: Malvindu | null, egetCarryMaal?: number | null): number | null {
  if (!vindu) return null;
  let n = 0, inne = 0;
  for (const s of slag) {
    const v = s[p];
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    let x = v;
    if (vindu.relativTilMaal) {
      const maal = egetCarryMaal ?? s.targetDistanceM ?? null;
      if (maal === null) continue;
      x = v - maal;
    }
    n++;
    if ((vindu.min === null || x >= vindu.min) && (vindu.max === null || x <= vindu.max)) inne++;
  }
  return n < MIN_SLAG ? null : inne / n;
}

export function vinduTekst(v: Malvindu | null, enhet: string): string {
  if (!v) return "—";
  const t = (x: number) => `${x > 0 && (v.relativTilMaal || v.min !== null && v.min < 0) ? "+" : ""}${x.toLocaleString("nb-NO")}`.replace("-", "−");
  const e = enhet === "°" ? "°" : enhet ? ` ${enhet}` : "";
  if (v.min !== null && v.max !== null && v.min === -v.max) return `±${v.max.toLocaleString("nb-NO")}${e}${v.relativTilMaal ? " fra målet" : ""}`;
  if (v.min !== null && v.max !== null) return `${t(v.min)} til ${t(v.max)}${e}`;
  if (v.min !== null) return `≥ ${v.min.toLocaleString("nb-NO")}${e}`;
  if (v.max !== null) return `≤ ${v.max.toLocaleString("nb-NO")}${e}`;
  return "—";
}

/** Slagene gruppert per kølle, sortert etter antall slag. Manglende kølle samles under «—». */
export function perKolle<T extends StatSlag>(slag: T[]): { kolle: string; slag: T[] }[] {
  const m = new Map<string, T[]>();
  for (const s of slag) {
    const k = s.club?.trim() || "—";
    m.set(k, [...(m.get(k) ?? []), s]);
  }
  return [...m.entries()].map(([kolle, liste]) => ({ kolle, slag: liste })).sort((a, b) => b.slag.length - a.slag.length);
}

/** Gapping: carry-snitt og spredning per kølle, lengst først. Gap regnes bare mellom køller med minst 5 slag. */
export function gapping(slag: StatSlag[]): { kolle: string; n: number; carry: number | null; spredning: number | null; gap: number | null }[] {
  const rader = perKolle(slag).map(({ kolle, slag: s }) => {
    const st = parameterstat(s, "carryDistance");
    return { kolle, n: st.n, carry: st.snitt, spredning: st.spredning, gap: null as number | null };
  }).sort((a, b) => (b.carry ?? -1) - (a.carry ?? -1));
  const nok = rader.filter((r) => r.n >= MIN_SLAG && r.carry !== null);
  for (let i = 0; i < nok.length - 1; i++) nok[i]!.gap = nok[i]!.carry! - nok[i + 1]!.carry!;
  return rader;
}

/** Treffpunkt: snitt av strikePatternX/Y (−1..1, tå/hæl og lavt/høyt) for slag som har det. */
export function treffpunkt(slag: { strikePatternX?: number | null; strikePatternY?: number | null }[]): { n: number; x: number | null; y: number | null } {
  const med = slag.filter((s) => typeof s.strikePatternX === "number" && typeof s.strikePatternY === "number");
  if (!med.length) return { n: 0, x: null, y: null };
  return { n: med.length, x: med.reduce((a, s) => a + s.strikePatternX!, 0) / med.length, y: med.reduce((a, s) => a + s.strikePatternY!, 0) / med.length };
}
