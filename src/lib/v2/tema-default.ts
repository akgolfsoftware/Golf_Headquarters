/**
 * Tema-default per rute — ÉN kilde, delt mellom server og klient.
 *
 * Regelen bodde tidligere to steder (`onsketMorkTema` i `src/app/layout.tsx`
 * for SSR og en `useEffect` i `V2Shell` for rute-veksling). De må alltid si
 * det samme, ellers blinker flaten om ved client-side navigasjon — så de bor
 * her nå. Fila er ren (ingen server- eller DOM-import) og kan importeres fra
 * begge sider.
 *
 * MØRK DEFAULT PÅ /portal OG /admin (Anders 25.08.2026, i økt).
 * Train-lock er designfasit for hele produktet, og fasiten er mørk-først:
 * scene `#000000`, lys er varianten (CLAUDE.md invariant 2). Defaulten var
 * lys fra 25.07 — «mørk skjerm er vanskelig å lese utendørs i sollys» — men
 * det er nå brukerens valg via bryteren, ikke appens default. Dette svarer
 * åpent spørsmål 1 i `docs/natt/D2-TOKENS-DONE.md`.
 *
 * Uendret av den beslutningen:
 * - `/auth` er LYS (Paper `#FAF9F5`) — låst beslutning PP-A/A4 16.08.2026.
 * - `/forelder` er LYS som default uten cookie. Forelder-omfangsspørsmålet (T4 i
 *   AAPNE-SPORSMAAL) er LØST 26.08.2026: hele forelder-appen skal ha BÅDE lys og
 *   mørk modus (som resten av produktet) — men det endrer ikke *defaulten* her,
 *   kun at bryteren (mørk-valget) faktisk må fungere visuelt der også, ikke bare
 *   på /portal og /admin. Skjermporten er ikke gjort ennå.
 * - Landingssidene er alltid lyse (egen fasit, ak-golf-website).
 * - Resten (stats, team-flatene, interne) er mørke som før.
 * - Bryteren vinner alltid: cookien `ak-v2-tema` overstyrer defaulten begge
 *   veier, så en bruker som velger lys på /portal beholder lys.
 */

/** Flater som er MØRKE uten cookie. Train-lock-fasitens hjemmebane. */
export function erMorkFlate(path: string): boolean {
  return path.startsWith("/portal") || path.startsWith("/admin");
}

/** Flater som er LYSE uten cookie, og som IKKE er landingssider. */
export function erLysFlate(path: string): boolean {
  return path.startsWith("/auth") || path.startsWith("/forelder");
}

/**
 * Ønsket tema for en rute, gitt `ak-v2-tema`-cookien (undefined = ikke satt).
 * Cookien er brukerens eksplisitte valg og vinner over defaulten.
 */
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
