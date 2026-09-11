/**
 * Knytter lokal kladd/opptak til innlogget bruker.
 * Utlogging og brukerbytte skal aldri vise en annens innhold.
 * Usynkroniserte rader slettes ikke stille — de blir liggende på eier-id.
 */

export const AKTIV_BRUKER_NOKKEL = "akgolf-aktiv-bruker-id";
/** Flagg satt ved utlogging når enheten har usynkroniserte rader. */
export const ULAGRET_FLAGG = "akgolf-ulagret-kladd";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function lesAktivBrukerId(storage: StorageLike | null | undefined): string | null {
  if (!storage) return null;
  try {
    const id = storage.getItem(AKTIV_BRUKER_NOKKEL);
    return id && id.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}

export function settAktivBrukerId(storage: StorageLike | null | undefined, userId: string): void {
  if (!storage || !userId.trim()) return;
  try {
    storage.setItem(AKTIV_BRUKER_NOKKEL, userId.trim());
  } catch {
    /* privat modus / kvote */
  }
}

/** Fjerner aktiv-pekeren. Sletter ikke kladdene. */
export function fjernAktivBrukerId(storage: StorageLike | null | undefined): void {
  if (!storage) return;
  try {
    storage.removeItem(AKTIV_BRUKER_NOKKEL);
  } catch {
    /* ignorer */
  }
}

export function lesNettleserBrukerId(): string | null {
  if (typeof window === "undefined") return null;
  return lesAktivBrukerId(window.sessionStorage);
}

export function tilhorerBruker(
  rad: { userId?: string | null },
  userId: string | null,
): boolean {
  if (!userId) return false;
  return rad.userId === userId;
}

export function filtrerEgne<T extends { userId?: string | null }>(
  rader: T[],
  userId: string | null,
): T[] {
  if (!userId) return [];
  return rader.filter((r) => tilhorerBruker(r, userId));
}

export function harUlagretKladd<T extends { userId?: string | null }>(
  rader: T[],
  userId: string | null,
): boolean {
  return filtrerEgne(rader, userId).length > 0;
}

export function merkUlagretFlagg(storage: StorageLike | null | undefined, har: boolean): void {
  if (!storage) return;
  try {
    if (har) storage.setItem(ULAGRET_FLAGG, "1");
    else storage.removeItem(ULAGRET_FLAGG);
  } catch {
    /* ignorer */
  }
}
