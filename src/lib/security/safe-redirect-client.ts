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
  if (!path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  // Blokker paths som inneholder linjeskift (HTTP response splitting)
  if (path.includes("\n") || path.includes("\r")) {
    return fallback;
  }

  return path;
}
