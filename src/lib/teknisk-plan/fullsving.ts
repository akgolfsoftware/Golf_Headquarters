/** Full sving — gjenkjenn slagType uten egen tabell. */

export function erFullsving(slagType: string | null | undefined): boolean {
  if (!slagType) return false;
  const s = slagType.trim().toLowerCase();
  return s === "fullsving" || s === "full sving" || s === "full-sving";
}
