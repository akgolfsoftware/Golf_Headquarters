/**
 * URL-tilstand for AgencyOS Stall-lista (`/admin/spillere`).
 *
 * J04 (coach-reisen, 2026-09-11): filter/søk/valgt spiller lå kun i React
 * `useState` i `TrainLockStall` — coachen mistet filteret hver gang siden
 * åpnet en spillers 360-side og gikk tilbake (App Router remounter
 * server-komponenten, som gir klientkomponenten et nytt startpunkt).
 * Query-parametrene her er den ene sannhetskilden URL-en bærer videre, slik
 * at «tilbake» faktisk viser det coachen sto i.
 *
 * Rene funksjoner — testes uten DOM/React (`stall-url-state.test.ts`).
 */

export type StallFilterKey = "alle" | "akademi" | "wang" | "gfgk" | "stille";

const GYLDIGE_FILTRE: ReadonlySet<StallFilterKey> = new Set([
  "alle",
  "akademi",
  "wang",
  "gfgk",
  "stille",
]);

export type StallUrlState = {
  filter: StallFilterKey;
  sok: string;
  valgtId: string | null;
};

/** Leser query-parametre (`f`, `q`, `v`) til Stall-lastens tilstand. Ugyldig filter faller tilbake til "alle" i stedet for å kaste. */
export function lesStallUrlState(params: URLSearchParams): StallUrlState {
  const fRaw = params.get("f");
  const filter: StallFilterKey = fRaw && GYLDIGE_FILTRE.has(fRaw as StallFilterKey) ? (fRaw as StallFilterKey) : "alle";
  const sok = params.get("q") ?? "";
  const valgtId = params.get("v");
  return { filter, sok, valgtId: valgtId && valgtId.length > 0 ? valgtId : null };
}

/**
 * Skriver tilstanden tilbake til en query-string. Default-verdier (filter
 * "alle", tomt søk) utelates helt — url-en skal være ren når coachen ikke
 * har gjort noe valg, ikke `?f=alle&q=`.
 */
export function skrivStallUrlState(state: StallUrlState, eksisterende?: URLSearchParams): string {
  const params = new URLSearchParams(eksisterende);
  params.delete("f");
  params.delete("q");
  params.delete("v");
  if (state.filter !== "alle") params.set("f", state.filter);
  if (state.sok.trim() !== "") params.set("q", state.sok);
  if (state.valgtId) params.set("v", state.valgtId);
  return params.toString();
}
