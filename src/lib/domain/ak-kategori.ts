/**
 * A–K kategorisystem — snittscore → kategori (Anders 2026-06-22).
 *
 * Primær nøkkel er SNITTSCORE (brutto, ekte slag). Lavere snittscore = bedre =
 * nærmere A. «Typisk alder» er kun kontekst, IKKE en del av formelen.
 *
 * Kilde (Anders' tabell):
 *   A World Elite        < 68      (18–22)
 *   B National Elite     68–72     (17–20)
 *   C National U21       72–74     (16–19)
 *   D Regional Elite     74–76     (15–18)
 *   E Regional U18       76–78     (14–17)
 *   F Klubbspiller Senior 78–80    (15–17)
 *   G Klubbspiller Junior 80–85    (14–16)
 *   H Rekrutt Senior     85–90     (13–15)
 *   I Rekrutt Junior     90–95     (12–14)
 *   J Nybegynner Senior  95–100    (11–13)
 *   K Nybegynner Junior  100+      (8–11)
 *
 * GRENSE-KONVENSJON (avklart i kode, bekreftes av Anders): hvert bånd er
 * [min, max) — min INKLUSIV, max EKSKLUSIV. Dvs. snittscore 72 → C, 80 → G, 100 → K.
 */

export type AkKategori =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";

export type AkBand = {
  kategori: AkKategori;
  niva: string;
  /** Nedre grense (inklusiv). null = ingen nedre grense (A). */
  min: number | null;
  /** Øvre grense (eksklusiv). null = ingen øvre grense (K). */
  max: number | null;
  /** Visningsetikett for snittscore-spennet. */
  snittLabel: string;
  /** Typisk alder — kontekst, ikke del av formelen. */
  typiskAlder: string;
};

/** Kanonisk A–K-tabell. Best (A) først. Endre HER hvis grensene justeres. */
export const AK_BANDS: readonly AkBand[] = [
  { kategori: "A", niva: "World Elite",         min: null, max: 68,   snittLabel: "< 68",   typiskAlder: "18–22" },
  { kategori: "B", niva: "National Elite",      min: 68,   max: 72,   snittLabel: "68–72",  typiskAlder: "17–20" },
  { kategori: "C", niva: "National U21",        min: 72,   max: 74,   snittLabel: "72–74",  typiskAlder: "16–19" },
  { kategori: "D", niva: "Regional Elite",      min: 74,   max: 76,   snittLabel: "74–76",  typiskAlder: "15–18" },
  { kategori: "E", niva: "Regional U18",        min: 76,   max: 78,   snittLabel: "76–78",  typiskAlder: "14–17" },
  { kategori: "F", niva: "Klubbspiller Senior", min: 78,   max: 80,   snittLabel: "78–80",  typiskAlder: "15–17" },
  { kategori: "G", niva: "Klubbspiller Junior", min: 80,   max: 85,   snittLabel: "80–85",  typiskAlder: "14–16" },
  { kategori: "H", niva: "Rekrutt Senior",      min: 85,   max: 90,   snittLabel: "85–90",  typiskAlder: "13–15" },
  { kategori: "I", niva: "Rekrutt Junior",      min: 90,   max: 95,   snittLabel: "90–95",  typiskAlder: "12–14" },
  { kategori: "J", niva: "Nybegynner Senior",   min: 95,   max: 100,  snittLabel: "95–100", typiskAlder: "11–13" },
  { kategori: "K", niva: "Nybegynner Junior",   min: 100,  max: null, snittLabel: "100+",   typiskAlder: "8–11" },
] as const;

/** Slår opp A–K-båndet for en gitt snittscore. [min, max) — min inkl., max ekskl. */
export function kategoriFraSnittscore(snittscore: number): AkBand {
  const band = AK_BANDS.find(
    (b) => (b.min == null || snittscore >= b.min) && (b.max == null || snittscore < b.max),
  );
  // Dekkende tabell (−∞ … +∞) — band finnes alltid, men fall tilbake til K for sikkerhets skyld.
  return band ?? AK_BANDS[AK_BANDS.length - 1];
}

/** Neste nivå (ett bånd bedre / lavere score). null hvis allerede A (toppen). */
export function nesteKategori(kategori: AkKategori): AkBand | null {
  const i = AK_BANDS.findIndex((b) => b.kategori === kategori);
  return i > 0 ? AK_BANDS[i - 1] : null;
}

/**
 * Hvor langt spilleren er gjennom sitt nåværende bånd, mot neste (bedre) nivå.
 * 0 % = nettopp kommet inn i båndet (verste score i båndet), 100 % = klar for opprykk.
 * null for A og K (åpne ender — ingen entydig prosent). Lavere score = bedre.
 */
export function prosentTilNesteNiva(snittscore: number): number | null {
  const b = kategoriFraSnittscore(snittscore);
  if (b.min == null || b.max == null) return null;
  const pct = ((b.max - snittscore) / (b.max - b.min)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}
