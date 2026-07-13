/**
 * Map WAGR Pts Avg til NGF-kategori (A-L).
 * Kalibrert mot Øyvinds tabell + observerte topp-spillere mai 2026.
 * Delt mellom manuell import (wagr-import/actions.ts) og wagr-sync-agenten.
 */
export function mapTilNgfKategori(ptsAvg: number): string {
  if (ptsAvg >= 1500) return "A";
  if (ptsAvg >= 1100) return "B";
  if (ptsAvg >= 900) return "C";
  if (ptsAvg >= 700) return "D";
  if (ptsAvg >= 400) return "E";
  if (ptsAvg >= 220) return "F";
  if (ptsAvg >= 100) return "G";
  if (ptsAvg >= 50) return "H";
  return "I";
}
