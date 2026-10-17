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
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }

  // Blokker kontrolltegn og mellomrom: nettlesere fjerner tab og linjeskift i adresser,
  // så «/\t/evil.example» blir «//evil.example» (protocol-relative). Også HTTP response splitting.
  if (/[\u0000-\u001F\u007F\s]/.test(path)) {
    return fallback;
  }

  // Normaliser og krev at målet blir på samme opphav.
  const PLASS = "https://plass.invalid";
  let url: URL;
  try {
    url = new URL(path, PLASS);
  } catch {
    return fallback;
  }
  if (url.origin !== PLASS) return fallback;

  return url.pathname + url.search + url.hash;
}
