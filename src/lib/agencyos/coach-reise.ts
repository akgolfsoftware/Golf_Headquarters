/**
 * Teknisk AgencyOS-reise J04. Ingen visuell fasit.
 * Hjem → stall → spillerkort → plan/tildeling → oppfølging.
 */

export const AGENCYOS_COACH_REISE = [
  { steg: "hjem", href: "/admin/agencyos", vakt: "requirePortalUser ADMIN/COACH" },
  { steg: "stall", href: "/admin/spillere", vakt: "stallenPlayerWhere = coachScopedPlayerWhere" },
  { steg: "spillerkort", href: "/admin/spillere/[id]", vakt: "coachScopedPlayerWhere + notFound" },
  { steg: "plan", href: "/admin/workbench/[playerId]", vakt: "harCoachTilgangTilSpiller" },
  { steg: "oppfolging", href: "/admin/queue", vakt: "stall, ikke kø" },
] as const;

export function agencyosSpillerkortHref(playerId: string): string {
  return `/admin/spillere/${playerId}`;
}

export function agencyosWorkbenchHref(playerId: string): string {
  return `/admin/workbench/${playerId}`;
}

export function sammeSpillerGjennomReise(playerId: string) {
  return {
    stall: "/admin/spillere",
    kort: agencyosSpillerkortHref(playerId),
    plan: agencyosWorkbenchHref(playerId),
    oppfolging: "/admin/queue",
  };
}
