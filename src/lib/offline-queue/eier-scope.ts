/**
 * Felles brukeravgrensning for lokal, sensitiv nettleserlagring.
 *
 * Bruker-ID-en kommer fra den serververifiserte layouten. Den brukes bare som
 * lokal navneromsnøkkel; serveren må fortsatt kontrollere tilgang ved synk.
 */

export type LokaltEid = { eierId?: string };

export function erGyldigEierId(eierId: string | null | undefined): eierId is string {
  return typeof eierId === "string" && eierId.trim().length > 0;
}

export function byggEierNokkel(eierId: string, lokalId: string): string {
  if (!erGyldigEierId(eierId)) throw new Error("Mangler lokal eier");
  return `${encodeURIComponent(eierId)}:${lokalId}`;
}

export function byggLagringsNokkel(
  grunnnokkel: string,
  eierId: string | null | undefined,
): string | null {
  return erGyldigEierId(eierId)
    ? `${grunnnokkel}:${encodeURIComponent(eierId)}`
    : null;
}

export function erEidAv(rad: LokaltEid, eierId: string): boolean {
  return erGyldigEierId(eierId) && rad.eierId === eierId;
}

export function filtrerEideRader<T extends LokaltEid>(
  rader: T[],
  eierId: string,
): T[] {
  return rader.filter((rad) => erEidAv(rad, eierId));
}
