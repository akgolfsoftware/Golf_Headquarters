/**
 * Personvernregel for talentflater (beslutninger.md §Data):
 * spillere født 2008 eller senere uten samtykke vises aldri, og spillere uten
 * fødselsår vises ikke. Samme regel for discovery-rader.
 */

export type TalentSynlighet = { born: number | null; consent: boolean };
export type DiscoverySynlighet = { fodt: number | null; samtykke: boolean };

export const BARNEVERN_FODSELSAAR = 2008;

export function erTalentSynlig(p: TalentSynlighet): boolean {
  return p.born != null && (p.born < BARNEVERN_FODSELSAAR || p.consent);
}

export function filtrerSynligeTalenter<T extends TalentSynlighet>(spillere: T[]): T[] {
  return spillere.filter(erTalentSynlig);
}

export function filtrerSynligeDiscovery<T extends DiscoverySynlighet>(rader: T[]): T[] {
  return rader.filter((r) => r.fodt != null && (r.fodt < BARNEVERN_FODSELSAAR || r.samtykke));
}
