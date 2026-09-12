/**
 * Teknisk WANG-reise J06. Ingen visuell fasit.
 * Åpen hjemside (uten navn) → innlogging → coach-uke/økt → elev/IUP.
 */

/** Samme slug som `WANG_TOPPIDRETT_SLUG` i wang-tilgang.ts. */
const TOPPIDRETT_SLUG = "wang-toppidrett";

export const WANG_REISE = [
  { steg: "apen-hjem", href: "/team-wang", vakt: "ingen PII, ingen roster" },
  { steg: "innlogging", href: "/team-wang/logg-inn", vakt: "intern next-sti" },
  { steg: "coach-uke", href: "/team-wang/coach", vakt: "hentWangCoachGruppeId + samme live.gruppeId" },
  { steg: "elev-iup", href: "/team-wang/coach/iup/[elevId]", vakt: "hentWangElevGruppeId" },
] as const;

export function wangCoachHref(): string {
  return "/team-wang/coach";
}

export function wangIupHref(elevId: string): string {
  return `/team-wang/coach/iup/${elevId}`;
}

export function wangInnloggingTilCoach(): string {
  return "/team-wang/logg-inn?next=%2Fteam-wang%2Fcoach";
}

/** IUP-lenke bare når eleven står i samme Toppidrett-roster som uka/økten. */
export function wangElevIupFraUke(input: {
  coachGruppeId: string;
  liveGruppeId: string;
  elever: { id: string }[];
  elevId: string;
}): string | null {
  if (input.coachGruppeId !== input.liveGruppeId) return null;
  if (!input.elever.some((e) => e.id === input.elevId)) return null;
  return wangIupHref(input.elevId);
}

export function wangSlugForReise(): string {
  return TOPPIDRETT_SLUG;
}
