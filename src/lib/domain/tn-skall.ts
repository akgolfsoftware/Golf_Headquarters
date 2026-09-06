/**
 * Aktiv-rute-deteksjon for TnRail - Claw sin variant av `skallAktivFraPath`
 * (AgencyOS). Egen fil fordi Claw og Train-lock aldri deler kode
 * (beslutninger.md §TEAM NORWAY-SKJERMENE DESIGNES I CLAW-BRANDINGEN).
 *
 * Differensierer mellom:
 * - /team-norway/spiller/[id] → null (eget skall, ingen shared menu)
 * - /team-norway/[groupId]/dokumenter → "dokumenter"
 * - /team-norway/[groupId] → "gruppeposter"
 */

export function tnAktivFraPath(pathname: string): string | null {
  // Sjekk spiller-ruter først (mest spesifikk)
  if (pathname.startsWith("/team-norway/spiller")) {
    return null;
  }
  // Sjekk dokumenter-ruter (mer spesifikk enn gruppeposter)
  if (pathname.endsWith("/dokumenter") || (pathname.startsWith("/team-norway") && pathname.includes("/dokumenter/"))) {
    return "dokumenter";
  }
  // Gruppeposter-ruter (gruppe-oversikt)
  if (pathname.startsWith("/team-norway")) {
    return "gruppeposter";
  }
  return null;
}
