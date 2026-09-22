/** Ny rekkefølge når øvelsen på `indeks` flyttes ett steg. Null når flyttingen ikke er mulig. */
export function nyRekkefolge(ider: readonly string[], indeks: number, retning: -1 | 1): string[] | null {
  const til = indeks + retning;
  if (indeks < 0 || indeks >= ider.length || til < 0 || til >= ider.length) return null;
  const ut = [...ider];
  [ut[indeks], ut[til]] = [ut[til], ut[indeks]];
  return ut;
}
