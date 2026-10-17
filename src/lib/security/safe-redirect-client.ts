/**
 * Klient-side variant av safeRedirectPath — ingen server-only-import.
 * Brukes i Client Components for å validere next-param før router.push().
 *
 * @see src/lib/security/safe-redirect.ts for server-side versjon
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

  // Kontrolltegn og mellomrom: nettlesere fjerner tab og linjeskift, så «/\t/x» blir «//x».
  if (/[\u0000-\u001F\u007F\s]/.test(path)) {
    return fallback;
  }

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
