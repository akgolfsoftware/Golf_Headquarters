/**
 * Ren parselogikk for UpGame/aggregat-CSV → HoleScore-input.
 * Holdt fri for React/server-avhengigheter så den kan enhetstestes
 * med fikstur-CSV (både «;» og «,» som skilletegn).
 *
 * Slag FABRIKKERES ALDRI fra aggregater — CSV-en vet score/putter/FIR/GIR
 * per hull, ikke hvor slagene gikk. SG kommer først når spilleren fullfører
 * slag-kjeden (egen flyt).
 */

/** Strukturen server-actionen `importUpGameHoleScores` validerer med zod. */
export type ImportertHull = {
  holeNumber: number;
  par: number;
  strokes: number;
  putts: number | null;
  fairway: boolean | null;
  gir: boolean | null;
};

// Kolonne-mapping: prøver kjente norske og engelske navn
export const KOLONNE_MAP = {
  hullNr: ["hull", "hole", "hullnr", "nr", "hole_number", "hullnummer"],
  par: ["par"],
  score: ["score", "slag", "strokes", "total"],
  fir: ["fir", "fairway", "fairway_i_reg", "fairway i regulasjon"],
  gir: ["gir", "green", "green_i_reg", "green i regulasjon"],
  putts: ["putter", "putts", "putt"],
  forstePutt: ["første_putt", "forste_putt", "first_putt", "puttavstand", "avstand_til_hull"],
  straff: ["straff", "penalty", "penalties", "straffslag"],
  bunker: ["bunker", "sand"],
  sandSave: ["sand_save", "sandredd", "berget_fra_bunker"],
  scrambling: ["scrambling"],
  kjørelengde: ["kjørelengde", "kjøre", "driving_distance", "lengde", "drive_length"],
} as const;

export type KolonneNøkkel = keyof typeof KOLONNE_MAP;

export type ParsetRad = Record<string, string>;

export function detekterKolonne(headers: string[], nøkkel: KolonneNøkkel): string | null {
  const kandidater = KOLONNE_MAP[nøkkel] as readonly string[];
  const normaliser = (s: string) => s.toLowerCase().replace(/[^a-zæøå0-9]/g, "_");
  return headers.find((h) => kandidater.includes(normaliser(h))) ?? null;
}

export function parseCSV(tekst: string): { headers: string[]; rader: ParsetRad[] } {
  const linjer = tekst
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim());

  if (linjer.length < 2) return { headers: [], rader: [] };

  const sep = linjer[0].includes(";") ? ";" : ",";
  const headers = linjer[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, ""));
  const rader = linjer.slice(1).map((l) => {
    const verdier = l.split(sep).map((v) => v.trim().replace(/^"|"$/g, ""));
    const rad: ParsetRad = {};
    headers.forEach((h, i) => { rad[h] = verdier[i] ?? ""; });
    return rad;
  });

  return { headers, rader };
}

export function parseBool(v: string | undefined): boolean | null {
  if (!v) return null;
  const n = v.toLowerCase().trim();
  if (["ja", "j", "1", "yes", "y", "true", "x"].includes(n)) return true;
  if (["nei", "n", "0", "no", "false", "-", ""].includes(n)) return false;
  return null;
}

/** Aggregat-rader → HoleScore-input. */
export function konverterRaderTilHoleScores(
  rader: ParsetRad[],
  kolMapping: Record<KolonneNøkkel, string | null>,
): { hull: ImportertHull[]; advarsel: string | null } {
  const hull: ImportertHull[] = [];
  const advarsel: string[] = [];

  const hullNrKol = kolMapping.hullNr;
  if (!hullNrKol) return { hull: [], advarsel: "Mangler hull-nummer-kolonne" };

  for (const rad of rader) {
    const hullNr = parseInt(rad[hullNrKol] ?? "");
    if (isNaN(hullNr) || hullNr < 1 || hullNr > 18) continue;

    const par = kolMapping.par ? parseInt(rad[kolMapping.par] ?? "") : NaN;
    const score = kolMapping.score ? parseInt(rad[kolMapping.score] ?? "") : NaN;
    const putts = kolMapping.putts ? parseInt(rad[kolMapping.putts] ?? "") : NaN;
    const fir = kolMapping.fir ? parseBool(rad[kolMapping.fir]) : null;
    const gir = kolMapping.gir ? parseBool(rad[kolMapping.gir]) : null;

    if (isNaN(score)) {
      advarsel.push(`Hull ${hullNr}: mangler score — hoppet over`);
      continue;
    }
    if (isNaN(par)) {
      advarsel.push(`Hull ${hullNr}: mangler par — antar par 4`);
    }

    hull.push({
      holeNumber: hullNr,
      par: isNaN(par) ? 4 : par,
      strokes: score,
      putts: isNaN(putts) ? null : putts,
      fairway: fir,
      gir,
    });
  }

  return { hull, advarsel: advarsel.length > 0 ? advarsel.join("; ") : null };
}
