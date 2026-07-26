/**
 * Uttrekk av spredningspunkter per kølle for v2-`DispersionPlot` (Bølge 12c).
 *
 * Erstatter den gamle lokale `dispersion-plot.tsx`, som tegnet sitt eget SVG med
 * Tailwind/shadcn-tokens (`hsl(var(--primary))`) midt på en v2-flate — altså en
 * annen palett enn alt rundt. Her hentes bare TALLENE ut; tegningen gjøres av
 * fasit-komponenten i `components/v2/spesialviz`.
 *
 * Fasit-plottet er PER KØLLE (ett siktemål, én ellipse). Det gamle plottet
 * blandet alle køller i samme bilde, der driver og wedge havnet i samme sky og
 * «spredningen» ble et mål på køllevalg, ikke på treffsikkerhet.
 *
 * Side-fortegn følger TrackMans «Side»-kolonne: negativ = venstre, positiv =
 * høyre — samme tolkning som det gamle plottet og som `stabilitet.ts`.
 *
 * Rent uttrekk, ingen JSX — kan brukes fra server-komponent.
 */

/** Én rad i `TrackManSession.rawJson` (CSV/HTML-import, frie kolonnenavn). */
type RaaRad = Record<string, string | undefined>;

export type DispersjonDbShot = {
  club: string;
  carryDistance: number | null;
  totalDistance: number | null;
  side: number | null;
};

/** Ett punkt slik `DispersionPlot` vil ha det. */
export type DispersjonPunkt = { side: number; lengde: number };

export type DispersjonKolle = {
  kolle: string;
  punkter: DispersjonPunkt[];
};

/** Minst 2 punkter før en spredning betyr noe — 1 slag er ikke spredning. */
const MIN_PUNKTER = 2;

function tall(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** rawJson-rader → punkter per kølle. Tomt objekt når kolonnene mangler. */
function fraRaaRader(rader: RaaRad[]): Map<string, DispersjonPunkt[]> {
  const map = new Map<string, DispersjonPunkt[]>();
  for (const r of rader) {
    const lengde = tall(r.Distance ?? r.distance ?? r.Carry ?? r.carry);
    const side = tall(r.Lateral ?? r.lateral ?? r.Side ?? r.side);
    // Side må finnes som tall — uten den er punktet ikke plasserbart sidelengs.
    if (lengde === null || lengde <= 0 || side === null) continue;
    const kolle = (r.Club ?? r.club ?? r.kolle ?? "").trim() || "Ukjent";
    map.set(kolle, [...(map.get(kolle) ?? []), { side, lengde }]);
  }
  return map;
}

/** Lagrede slag → punkter per kølle (brukes når rawJson mangler kolonnene). */
function fraDbSlag(slag: DispersjonDbShot[]): Map<string, DispersjonPunkt[]> {
  const map = new Map<string, DispersjonPunkt[]>();
  for (const s of slag) {
    const lengde = s.carryDistance ?? s.totalDistance;
    if (lengde === null || lengde <= 0 || s.side === null) continue;
    const kolle = s.club?.trim() || "Ukjent";
    map.set(kolle, [...(map.get(kolle) ?? []), { side: s.side, lengde }]);
  }
  return map;
}

/**
 * Kølla med flest plasserbare slag i økta — den som gir det mest meningsfulle
 * spredningsbildet. Returnerer null når ingen kølle har nok punkter.
 */
export function finnDispersjonKolle(
  rawJson: unknown,
  dbSlag: DispersjonDbShot[],
): DispersjonKolle | null {
  const rader: RaaRad[] = Array.isArray(rawJson) ? (rawJson as RaaRad[]) : [];
  let map = fraRaaRader(rader);
  if (map.size === 0) map = fraDbSlag(dbSlag);

  let beste: DispersjonKolle | null = null;
  for (const [kolle, punkter] of map.entries()) {
    if (punkter.length < MIN_PUNKTER) continue;
    if (beste === null || punkter.length > beste.punkter.length) {
      beste = { kolle, punkter };
    }
  }
  return beste;
}

/** «2 m høyre» / «1 m venstre» / «på linja». Null når grunnlaget mangler. */
export function sideTekst(meanSide: number | null): string | null {
  if (meanSide === null) return null;
  const avrundet = Math.round(Math.abs(meanSide));
  if (avrundet === 0) return "på linja";
  return `${avrundet} m ${meanSide < 0 ? "venstre" : "høyre"}`;
}
