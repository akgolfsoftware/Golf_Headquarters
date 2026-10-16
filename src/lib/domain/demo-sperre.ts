/**
 * Demokontoene for Team Norway og WANG har coach-rollen, men skal aldri nå
 * AgencyOS (Anders 15.10.2026, PR #1347). Kalenderen og stall-dagen i AgencyOS
 * viser alle coachers bookinger, så rollen alene ville slippe dem inn til ekte
 * spillere. Sperren ligger i proxyen, så den gjelder både sidene, handlingene
 * som sendes til dem (server actions) og coach-API-ene.
 *
 * Regelen er ren og uten databaseoppslag, så den kan låses med test.
 */

import { gruppeSlugForEpost, TN_DEMO_SLUG, WANG_DEMO_SLUG } from "@/lib/domain/demo-grupper";

const SPERREDE_SIDER = ["/admin"];
const SPERREDE_API = ["/api/admin", "/api/coach", "/api/kommando", "/api/view-as-player", "/api/view-mode"];

function under(path: string, rot: string): boolean {
  return path === rot || path.startsWith(`${rot}/`);
}

/** Kan stien være sperret for en demokonto? Avgjør om proxyen må slå opp brukeren. */
export function erDemoSperretSti(path: string): boolean {
  return [...SPERREDE_SIDER, ...SPERREDE_API].some((rot) => under(path, rot));
}

/** Trenerflaten demokontoen hører til, eller `null` for vanlige kontoer. */
export function demoFlateForEpost(epost: string | null | undefined): string | null {
  if (gruppeSlugForEpost(epost, "TEAM_NORWAY") === TN_DEMO_SLUG) return "/team-norway";
  if (gruppeSlugForEpost(epost, "WANG") === WANG_DEMO_SLUG) return "/team-wang/coach";
  return null;
}

/**
 * Skal vakten (requirePortalUser / requireCoachActionUser) stoppe kontoen?
 * Demokontoer stoppes alltid, unntatt der siden eller handlingen eksplisitt
 * slipper dem inn (`tillatDemo`, bare Team Norway- og WANG-flatene).
 */
export function demoStoppesAvVakt(epost: string | null | undefined, tillatDemo: boolean): boolean {
  return !tillatDemo && demoFlateForEpost(epost) !== null;
}

export type DemoSperre = { type: "send-til"; sti: string } | { type: "avvis" };

/**
 * Hva proxyen skal gjøre med en forespørsel. Sider sendes til demokontoens
 * egen flate; API-kall avvises. `null` = slipp gjennom.
 */
export function demoSperre(epost: string | null | undefined, path: string): DemoSperre | null {
  const flate = demoFlateForEpost(epost);
  if (!flate) return null;
  if (SPERREDE_SIDER.some((rot) => under(path, rot))) return { type: "send-til", sti: flate };
  if (SPERREDE_API.some((rot) => under(path, rot))) return { type: "avvis" };
  return null;
}
