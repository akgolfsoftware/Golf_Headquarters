/**
 * Spillerlisten i Team Norway viser alle aktive spillere i gruppa med navn og offentlig
 * WAGR-plass, også de som ikke har delt (beslutninger.md §SPILLERLISTEN I TEAM NORWAY VISER DE
 * ÅPNE TALLENE, 22.10.2026). Raden har med vilje ingen plan-, trenings- eller testfelt: det
 * krever delingssamtykke og leses bare via `hentTnSpillere`.
 */

export const WAGR_KILDE = "World Amateur Golf Ranking (WAGR), The R&A";

export type TnApenSpillerRad = {
  id: string;
  navn: string;
  /** Offentlig WAGR-plass. `null` når spilleren ikke er koblet til WAGR eller mangler plass. */
  wagrPlass: number | null;
  /** Rankinguka plassen gjelder. `null` når plassen mangler. */
  wagrDato: Date | null;
  delt: boolean;
};

export type TnMedlemInn = { id: string; navn: string | null; wagrId: string | null };
export type TnWagrPlass = { plass: number | null; dato: Date };

/** `PublicPlayer.wagrId` er tekst, `wagr_ref_players.wagrPlayerId` er heltall. Alt annet enn rene sifre gir `null`. */
export function tilWagrSpillerId(wagrId: string | null): number | null {
  if (!wagrId || !/^\d+$/.test(wagrId.trim())) return null;
  const tall = Number.parseInt(wagrId.trim(), 10);
  return Number.isSafeInteger(tall) ? tall : null;
}

export function byggApneSpillerrader(medlemmer: TnMedlemInn[], deltIder: ReadonlySet<string>, wagr: ReadonlyMap<number, TnWagrPlass>): TnApenSpillerRad[] {
  return medlemmer
    .map((m): TnApenSpillerRad => {
      const spillerId = tilWagrSpillerId(m.wagrId);
      const ref = spillerId === null ? undefined : wagr.get(spillerId);
      const plass = ref?.plass ?? null;
      return { id: m.id, navn: m.navn?.trim() || "Ukjent", wagrPlass: plass, wagrDato: plass === null ? null : ref?.dato ?? null, delt: deltIder.has(m.id) };
    })
    .sort((a, b) => a.navn.localeCompare(b.navn, "nb"));
}
