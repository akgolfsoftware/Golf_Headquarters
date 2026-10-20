/**
 * Demokontoer for Team Norway og WANG (Anders 15.10.2026, valg A).
 *
 * `demo@golfforbundet.no` og `demo@wang.no` skal kunne vise trenerflatene uten
 * å se ekte trenere, kalender eller spillere. De peker derfor på hver sin
 * demogruppe med fiktive spillere, og slipper aldri inn i de ekte gruppene,
 * heller ikke om noen ved en feil gjør dem til medlem der.
 *
 * Regelen er ren og uten databaseoppslag, så den kan låses med test.
 */

import { TEAM_NORWAY_SLUG } from "@/lib/domain/grupper";

/** Samme slug som `WANG_TOPPIDRETT_SLUG` i src/app/team-wang/_data/wang-tilgang.ts. */
const WANG_SLUG = "wang-toppidrett";

export const TN_DEMO_SLUG = "team-norway-demo";
export const WANG_DEMO_SLUG = "wang-toppidrett-demo";

export type DemoFlate = "TEAM_NORWAY" | "WANG";

/**
 * To generasjoner demotrenere, begge aktive COACH i demogruppene:
 * `demo.sportssjef@wang.no` og `demo.trener@golfforbundet.no` fra 28.09.2026
 * (kontoene i `.env.local`, DEMO_WANG_EPOST / DEMO_TN_EPOST), og `demo@wang.no`
 * og `demo@golfforbundet.no` fra seed-skriptet 15.10. Manglet de første her,
 * ble de sendt til de ekte gruppene og fikk feilside (auditen 20.10.2026).
 */
const DEMOKONTOER: Record<string, string> = {
  "demo@golfforbundet.no": TN_DEMO_SLUG,
  "demo.trener@golfforbundet.no": TN_DEMO_SLUG,
  "demo@wang.no": WANG_DEMO_SLUG,
  "demo.sportssjef@wang.no": WANG_DEMO_SLUG,
};

const KANONISK: Record<DemoFlate, string> = { TEAM_NORWAY: TEAM_NORWAY_SLUG, WANG: WANG_SLUG };
const DEMO: Record<DemoFlate, string> = { TEAM_NORWAY: TN_DEMO_SLUG, WANG: WANG_DEMO_SLUG };

export function erDemokonto(epost: string | null | undefined): boolean {
  return Boolean(epost && DEMOKONTOER[epost.trim().toLowerCase()]);
}

/**
 * Gruppa en konto skal se på flaten. Vanlige kontoer får den ekte gruppa.
 * En demokonto får bare sin egen demogruppe, og `null` på den andre flaten.
 */
export function gruppeSlugForEpost(epost: string | null | undefined, flate: DemoFlate): string | null {
  const demo = epost ? DEMOKONTOER[epost.trim().toLowerCase()] : undefined;
  if (demo === undefined) return KANONISK[flate];
  return demo === DEMO[flate] ? demo : null;
}

const STARTSIDE: Record<string, string> = {
  [TN_DEMO_SLUG]: "/team-norway",
  [WANG_DEMO_SLUG]: "/team-wang/coach",
};

/**
 * Startsiden for en demokonto: trenerflaten den hører til, aldri AgencyOS.
 * `null` for vanlige kontoer, som følger rollen som før.
 */
export function startsideForDemokonto(epost: string | null | undefined): string | null {
  const demo = epost ? DEMOKONTOER[epost.trim().toLowerCase()] : undefined;
  return demo ? STARTSIDE[demo] : null;
}

/** Team Norway-gruppa eller demoutgaven av den. */
export function erTnGruppeSlug(slug: string | null | undefined): boolean {
  return slug === TEAM_NORWAY_SLUG || slug === TN_DEMO_SLUG;
}
