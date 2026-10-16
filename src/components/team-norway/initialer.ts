/**
 * Initialer til avatar i Team Norway-skallet. Egen fil uten "use client",
 * så både serverkomponenten TnRail og klientkomponenten TnRailMobil kan kalle den.
 */
export function initialer(navn: string) {
  return navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]?.toUpperCase() ?? "").join("") || "?";
}
