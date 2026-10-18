/**
 * Én kilde for tema ved servervisning og klientnavigasjon.
 * Precision Athletics (beslutninger.md §PRECISION ATHLETICS, 26.09.2026):
 * lyst tema er standard i PlayerHQ og AgencyOS. Lagret temavalg vinner.
 */

/** PlayerHQ, AgencyOS, innlogging og forelder starter lyst uten lagret valg.
 * Rutegrenser skal ikke treffe navn som /administrasjon. */
export function erLysFlate(path: string): boolean {
  return /^\/(portal|admin|auth|forelder)(\/|$)/.test(path);
}

/** WANG og Team Norway er alltid lyse (Anders 18.10.2026): ingen mørk default,
 * ingen bryter, og en gammel dark-cookie fra PlayerHQ gjelder ikke her. */
export function erAltidLysFlate(path: string): boolean {
  return /^\/(wang|teamnorway|team-wang|team-norway)(\/|$)/.test(path);
}

export function onsketTema(
  path: string,
  temaCookie: string | undefined,
  erLandingsside: boolean,
): "dark" | "light" {
  // Landingssidene har ingen bryter — alltid lyse, også med dark-cookie.
  if (erLandingsside) return "light";
  if (erAltidLysFlate(path)) return "light";
  if (temaCookie === "dark") return "dark";
  if (temaCookie === "light") return "light";
  // Ingen cookie: default per flate. Lys-flatene er unntakene; alt annet
  // (produktflatene + stats/team/interne) er mørkt.
  return erLysFlate(path) ? "light" : "dark";
}
