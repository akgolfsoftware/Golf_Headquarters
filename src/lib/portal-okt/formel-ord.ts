/**
 * AK-formel v2 (PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS) skrevet ut i ord for øktarket,
 * slik utkastet til pakke 2 viser den: «SLAG · Innspill 50 100 · Lav hastighet · Treningsområde · Alene».
 * Ukjente ledd vises som de er, aldri gjettet.
 */
const ORD: Record<string, string> = {
  UTEN_BALL: "Uten ball", LAV_HAST: "Lav hastighet", AUTO: "Automatikk",
  INNENDORS: "Innendørs", TRENINGSOMRADE: "Treningsområde", BANE: "Bane", TURNERING: "Turnering",
  ALENE: "Alene", OBSERVERT: "Observert", KONKURRANSE: "Konkurranse",
};
const AKSER = new Set(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);

export function formelLedd(formel: string): string[] {
  const deler: string[] = [];
  const rest = formel.split("_");
  for (let i = 0; i < rest.length; i++) {
    const to = `${rest[i]}_${rest[i + 1] ?? ""}`;
    if (ORD[to]) { deler.push(ORD[to]); i++; continue; }
    const d = rest[i]!;
    if (!d) continue;
    if (AKSER.has(d) && deler.length === 0) deler.push(d);
    else if (ORD[d]) deler.push(ORD[d]);
    else { const t = d.replaceAll("-", " ").toLowerCase(); deler.push(t.charAt(0).toUpperCase() + t.slice(1)); }
  }
  return deler;
}
