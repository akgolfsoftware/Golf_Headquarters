/**
 * Etter WANG-innlogging: bare stier under /team-wang.
 * Open-redirect og login-sløyfe avvises.
 */
export function wangReturSti(path: string | null | undefined): string {
  const fallback = "/team-wang";
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("\n") || path.includes("\r") || path.includes("\\")) {
    return fallback;
  }
  const utenQuery = (path.split("?")[0] ?? path).split("#")[0] ?? path;
  if (utenQuery.includes("..")) return fallback;
  if (utenQuery === "/team-wang/logg-inn" || utenQuery.startsWith("/team-wang/logg-inn/")) {
    return fallback;
  }
  if (utenQuery === "/team-wang" || utenQuery.startsWith("/team-wang/")) return path;
  return fallback;
}
