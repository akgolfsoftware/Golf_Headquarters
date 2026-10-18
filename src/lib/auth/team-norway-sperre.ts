/**
 * /team-norway er stengt for uinnloggede (proxy.ts). Anders 18.10.2026: ingen
 * Team Norway-sider skal være åpne. Uinnloggede sendes til Team Norways egen
 * inngang, /teamnorway, med ?next= bevart. Rolle og samtykke avgjøres fortsatt
 * av requirePortalUser i hver rute; proxyen stopper bare dem uten innlogging.
 *
 * /teamnorway (uten bindestrek) er innloggingssiden selv og er IKKE stengt.
 */
const TN_ROT = "/team-norway";

export function erSperretTeamNorwaySti(path: string): boolean {
  return path === TN_ROT || path.startsWith(`${TN_ROT}/`);
}

/** Returstien etter innlogging: bare interne stier under /team-norway. */
export function tryggTeamNorwayRetursti(verdi: string | string[] | undefined): string {
  if (typeof verdi !== "string" || verdi.length === 0) return TN_ROT;
  if (/[\\\u0000-\u001f\u007f]/.test(verdi) || !verdi.startsWith("/")) return TN_ROT;
  try {
    const url = new URL(verdi, "https://tn-retur.invalid");
    if (url.origin !== "https://tn-retur.invalid") return TN_ROT;
    if (!erSperretTeamNorwaySti(url.pathname)) return TN_ROT;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return TN_ROT;
  }
}
