/**
 * Private flater som aldri skal mellomlagres (Cache Storage / SW).
 * Delt enhet: forelder, junior, coach og spiller på samme telefon.
 */

const PRIVAT_PREFIKS = [
  "/portal",
  "/admin",
  "/api/",
  "/api",
  "/forelder",
  "/team-norway",
  "/meg",
  "/innsyn",
  "/intern",
  "/team-wang/coach",
  "/auth/samtykke-venter",
] as const;

function normaliser(pathname: string): string {
  const utenQuery = pathname.split("?")[0] ?? pathname;
  if (!utenQuery.startsWith("/_next/data/")) return utenQuery;
  const rest = utenQuery.replace(/^\/_next\/data\/[^/]+/, "").replace(/\.json$/, "");
  return rest.startsWith("/") ? rest : `/${rest}`;
}

export function erPrivatFlate(pathname: string): boolean {
  const p = normaliser(pathname);
  if (p === "/api" || p.startsWith("/api/")) return true;
  return PRIVAT_PREFIKS.some((pre) => {
    if (pre === "/api" || pre === "/api/") return false;
    return p === pre || p.startsWith(`${pre}/`);
  });
}
