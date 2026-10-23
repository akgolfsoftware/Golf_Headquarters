/**
 * Referanseplanen (`wagr_reference_plans`) lagrer bare WAGR-turnerings-ID-er som heltall, f.eks. [12345, 12400].
 * Samme format som teamnorwayref skriver, så begge flater leser samme rad.
 */

/** Gyldige, unike turnerings-ID-er i lagret rekkefølge. Alt som ikke er et positivt heltall, hoppes over. */
export function referanseEventIder(events: unknown): number[] {
  if (!Array.isArray(events)) return [];
  const sett = new Set<number>();
  for (const x of events) if (typeof x === "number" && Number.isInteger(x) && x > 0) sett.add(x);
  return [...sett];
}

export function medEvent(ider: number[], id: number): number[] {
  return ider.includes(id) ? ider : [...ider, id];
}

export function utenEvent(ider: number[], id: number): number[] {
  return ider.filter((x) => x !== id);
}
