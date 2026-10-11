/**
 * Hvilke /team-wang-stier som er sperret for uinnloggede (proxy.ts).
 *
 * Fellessiden `/team-wang` og `/team-wang/logg-inn` er ÅPNE. Trener- og
 * sportssjefflatene viser navn og demokatalog og er sperret her OG av
 * requirePortalUser i selve ruten.
 */
const SPERRET_ROTER = ["/team-wang/coach", "/team-wang/skjermer"] as const;

export function erSperretTeamWangSti(path: string): boolean {
  return SPERRET_ROTER.some((rot) => path === rot || path.startsWith(`${rot}/`));
}
