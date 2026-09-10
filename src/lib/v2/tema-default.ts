/**
 * Én kilde for tema ved servervisning og klientnavigasjon.
 * Anders valgte Train-lock ZIP (4) 10.09.2026: tokens/colors.css
 * angir lys PlayerHQ og mørk AgencyOS. Lagret temavalg vinner.
 */

/** AgencyOS starter mørkt. Rutegrenser skal ikke treffe navn som /administrasjon. */
export function erMorkFlate(path: string): boolean {
  return /^\/admin(\/|$)/.test(path);
}

/** PlayerHQ, innlogging og forelder starter lyst uten lagret valg. */
export function erLysFlate(path: string): boolean {
  return /^\/(portal|auth|forelder)(\/|$)/.test(path);
}

export function onsketTema(
  path: string,
  temaCookie: string | undefined,
  erLandingsside: boolean,
): "dark" | "light" {
  // Landingssidene har ingen bryter — alltid lyse, også med dark-cookie.
  if (erLandingsside) return "light";
  if (temaCookie === "dark") return "dark";
  if (temaCookie === "light") return "light";
  // Ingen cookie: default per flate. Lys-flatene er unntakene; alt annet
  // (produktflatene + stats/team/interne) er mørkt.
  return erLysFlate(path) ? "light" : "dark";
}
