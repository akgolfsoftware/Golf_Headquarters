/**
 * Hvilke /team-norway-stier som krever innlogging (proxy.ts).
 *
 * Disse rutene kaller requirePortalUser og sendte uinnloggede til /auth/login.
 * Proxyen sender dem nå til Team Norways egen inngang, /teamnorway, med
 * ?next= bevart. Andre /team-norway-stier er uendret: ruten selv avgjør.
 */
const SPERRET_ROTER = [
  "/team-norway/workbench",
  "/team-norway/analyse",
  "/team-norway/tilgang",
  "/team-norway/spiller",
  "/team-norway/wang-resultater",
] as const;

export function erSperretTeamNorwaySti(path: string): boolean {
  return SPERRET_ROTER.some((rot) => path === rot || path.startsWith(`${rot}/`));
}

const TN_ROT = "/team-norway";

/** Returstien etter innlogging: bare interne stier under /team-norway. */
export function tryggTeamNorwayRetursti(verdi: string | string[] | undefined): string {
  if (typeof verdi !== "string" || verdi.length === 0) return TN_ROT;
  if (/[\\\u0000-\u001f\u007f]/.test(verdi) || !verdi.startsWith("/")) return TN_ROT;
  try {
    const url = new URL(verdi, "https://tn-retur.invalid");
    if (url.origin !== "https://tn-retur.invalid") return TN_ROT;
    if (url.pathname !== TN_ROT && !url.pathname.startsWith(`${TN_ROT}/`)) return TN_ROT;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return TN_ROT;
  }
}
