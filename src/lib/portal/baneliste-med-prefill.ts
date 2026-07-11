/**
 * Prefill (flytpakke 2, punkt 2.5): flytter én bane-id først i en liste —
 * ren funksjon, ingen server-avhengighet (så den er enhetstestbar direkte).
 * Datahenting (sist spilte bane) skjer i `siste-spilte-bane.ts`.
 */
export function medForst<T extends { id: string }>(liste: T[], forstId: string | null): T[] {
  if (!forstId) return liste;
  const idx = liste.findIndex((x) => x.id === forstId);
  if (idx <= 0) return liste;
  const kopi = [...liste];
  const [funnet] = kopi.splice(idx, 1);
  kopi.unshift(funnet);
  return kopi;
}
