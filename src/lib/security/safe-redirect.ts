import "server-only";

/**
 * Sikker redirect-validering — beskytter mot open redirect-angrep.
 *
 * Problemet: `new URL(next, origin)` returnerer `next` uendret hvis `next` er
 * en absolutt URL (eks. "https://evil.com"), noe som gjør det mulig for
 * angripere å sende brukere til phishing-sider etter login.
 *
 * Løsning: kun relative paths (starter med "/") er tillatt. Absolutte URLer
 * og protocol-relative URLer (starter med "//") avvises.
 */

/**
 * Validerer at `path` er trygg å redirecte til.
 * Returnerer `path` hvis trygg, ellers `fallback`.
 *
 * @param path     Verdi fra query-parameter (eks. ?next=/portal/planlegge)
 * @param fallback Standard-path hvis `path` er utrygg
 */
export function safeRedirectPath(
  path: string | null | undefined,
  fallback = "/portal"
): string {
  if (!path) return fallback;

  // Kun relativ path tillatt: må starte med "/" men IKKE med "//" (protocol-relative)
  if (!path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  // Blokker paths som inneholder linjeskift (HTTP response splitting)
  if (path.includes("\n") || path.includes("\r")) {
    return fallback;
  }

  return path;
}
