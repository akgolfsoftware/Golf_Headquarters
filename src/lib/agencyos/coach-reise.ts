/**
 * Teknisk AgencyOS-reise J04. Ingen visuell fasit.
 * Hjem → stall → spillerkort → plan/tildeling → oppfølging.
 *
 * Samme spillerporte overalt: `coachScopedPlayerWhere` (stall via
 * `stallenPlayerWhere`, kort/arbeidsvisning, Workbench via
 * `harCoachTilgangTilSpiller`). Oversikt lastes ikke uten den porten.
 */

import { skrivStallUrlState } from "@/lib/admin/stall-url-state";

export const AGENCYOS_SPILLER_VAKT = "coachScopedPlayerWhere" as const;

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

/** Tilbake til stall med samme spiller valgt i URL-en. */
export function agencyosStallMedValgtHref(playerId: string): string {
  const qs = skrivStallUrlState({ filter: "alle", sok: "", valgtId: playerId });
  return qs ? `/admin/spillere?${qs}` : "/admin/spillere";
}

export function sammeSpillerGjennomReise(playerId: string) {
  return {
    stall: "/admin/spillere",
    stallValgt: agencyosStallMedValgtHref(playerId),
    kort: agencyosSpillerkortHref(playerId),
    plan: agencyosWorkbenchHref(playerId),
    oppfolging: "/admin/queue",
  };
}

/** Etter publisering blir coachen stående på samme spiller, ikke en annen. */
export function agencyosEtterPublisering(playerId: string) {
  const reise = sammeSpillerGjennomReise(playerId);
  return {
    plan: reise.plan,
    kort: reise.kort,
    stallValgt: reise.stallValgt,
  };
}
