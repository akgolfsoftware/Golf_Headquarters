/**
 * Autentiserte toppnivåruter som aldri skal lagres i Cache Storage.
 * Offentlige mikrosider er bevisst ikke med; bare deres innloggede deler.
 */
export const PRIVATE_CACHE_PREFIXES = [
  "/admin",
  "/api",
  "/auth",
  "/design-system",
  "/demos",
  "/forelder",
  "/innsyn",
  "/meg",
  "/portal",
  "/team-norway",
  "/team-wang/coach",
] as const;

export function erPrivatKlientsti(pathname: string): boolean {
  return PRIVATE_CACHE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function erPrivatNextDataSti(pathname: string): boolean {
  if (!pathname.startsWith("/_next/data/")) return false;
  return PRIVATE_CACHE_PREFIXES.some(
    (prefix) =>
      pathname.includes(`${prefix}/`) || pathname.endsWith(`${prefix}.json`),
  );
}
