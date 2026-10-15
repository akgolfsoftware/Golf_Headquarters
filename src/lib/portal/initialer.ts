/** Initialer til avatar: første bokstav i fornavn og etternavn, «—» uten navn. */
export function initialer(navn: string): string {
  const d = navn.trim().split(/\s+/).filter(Boolean);
  if (d.length === 0) return "—";
  return ((d[0]?.[0] ?? "") + (d.length > 1 ? d[d.length - 1]?.[0] ?? "" : "")).toUpperCase();
}
