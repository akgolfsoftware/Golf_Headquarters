/**
 * Rene tilgangs-prediktater for to sider som tidligere kun sjekket innlogging
 * (IDOR, arkitektur-kartlegging 30.08.2026 §To sikkerhetsfunn). Holdt utenfor
 * page-komponentene og fri for DB-kall slik at regelen kan enhetstestes uten
 * Prisma — sidene løser selv opp de DB-avhengige bitene (coach-scope,
 * ParentRelation) og sender inn ferdige booleans.
 */

type Viewer = { id: string; role: string };

/**
 * `/portal/spiller/[spillerId]` — full profil (runder, SG, plan, coaching).
 * Kun egen profil, eller en coach/admin med bekreftet tilgang til nettopp
 * denne spilleren (samme port som AgencyOS: `harCoachTilgangTilSpiller`).
 */
export function kanSeSpillerprofil(
  viewer: Viewer,
  spillerId: string,
  erCoachMedTilgang: boolean,
): boolean {
  if (viewer.id === spillerId) return true;
  if (viewer.role !== "ADMIN" && viewer.role !== "COACH") return false;
  return erCoachMedTilgang;
}

/**
 * `/team-wang/coach/iup/[elevId]` — IUP-samtale (egen-/trenervurdering) for
 * én elev. ADMIN/COACH ser alle, eleven ser sin egen, en foresatt ser kun
 * barn koblet via `ParentRelation` (`erForesattTilEleven` avgjøres av
 * `assertBarnTilhorerForelder`, godkjent kobling).
 */
export function kanSeIup(
  viewer: Viewer,
  elevId: string,
  erForesattTilEleven: boolean,
): boolean {
  if (viewer.role === "ADMIN" || viewer.role === "COACH") return true;
  if (viewer.role === "PLAYER") return viewer.id === elevId;
  if (viewer.role === "PARENT") return erForesattTilEleven;
  return false;
}
