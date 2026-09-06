/**
 * Aktiv-rute-deteksjon for TnRail - Claw sin variant av `skallAktivFraPath`
 * (AgencyOS). Egen fil fordi Claw og Train-lock aldri deler kode
 * (beslutninger.md §TEAM NORWAY-SKJERMENE DESIGNES I CLAW-BRANDINGEN).
 *
 * Prefiks-tabellen er bevisst kort - kun rutene som faktisk ligger i
 * TnSkall sin meny (`menySet()` i designfilen) skal gi et treff. Ruter
 * utenfor menyen (spillerpost) gir `null`, ikke en gjetning.
 */

const PREFIKSER: { prefix: string; id: string }[] = [
  { prefix: "/team-norway/spiller", id: "" }, // sjekkes FØR /team-norway under - mer spesifikk vinner
  { prefix: "/team-norway", id: "oversikt" },
];

export function tnAktivFraPath(pathname: string): string | null {
  for (const { prefix, id } of PREFIKSER) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return id || null;
    }
  }
  return null;
}
