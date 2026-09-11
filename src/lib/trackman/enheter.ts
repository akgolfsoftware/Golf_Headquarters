/**
 * TrackMan-enheter tas fra kilden. Tallstørrelse brukes aldri til å gjette.
 */

export type SpeedUnit = "mps" | "mph" | "unknown";
export type DistanceUnit = "m" | "yd" | "unknown";

const MPH_RE = /\bmph\b/i;
const MPS_RE = /\bm\/s\b|\bmps\b/i;
const YD_RE = /\b(?:yds?|yards?)\b/i;
const M_RE = /\b(?:metres?|meters?)\b|\(\s*m\s*\)|\[\s*m\s*\]/i;

export function lesHastighetsenhet(tekst: string): SpeedUnit {
  const t = tekst.trim();
  if (!t) return "unknown";
  if (MPS_RE.test(t)) return "mps";
  if (MPH_RE.test(t)) return "mph";
  return "unknown";
}

export function lesAvstandsenhet(tekst: string): DistanceUnit {
  const t = tekst.trim();
  if (!t) return "unknown";
  if (YD_RE.test(t)) return "yd";
  if (M_RE.test(t) || /(?:^|[\s(])m(?:$|[\s)])/i.test(t)) {
    if (MPS_RE.test(t)) return "unknown";
    return "m";
  }
  return "unknown";
}

/** En rad som bare inneholder enhetsceller (typisk rad 2 i TrackMan-CSV). */
export function erEnhetsrad(celler: string[]): boolean {
  const fylte = celler.map((c) => c.trim()).filter(Boolean);
  if (fylte.length === 0) return false;
  return fylte.every((c) =>
    /^(mph|m\/s|mps|yds?|yards?|m|metres?|meters?)$/i.test(c),
  );
}

function feltErHastighet(hode: string): boolean {
  return /speed|hastighet/i.test(hode);
}

function feltErAvstand(hode: string): boolean {
  return /carry|total|distance|avstand/i.test(hode);
}

export function lesEnheterFraFelt(
  headers: string[],
  unitsRow: string[] | null,
  felt: "speed" | "distance",
): SpeedUnit | DistanceUnit {
  const treff = headers
    .map((h, i) => ({ h, u: unitsRow?.[i] ?? "" }))
    .filter(({ h }) => (felt === "speed" ? feltErHastighet(h) : feltErAvstand(h)));
  const hodeTekst = treff.map((t) => t.h).join(" ");
  const radTekst = treff.map((t) => t.u).join(" ");
  if (felt === "speed") {
    const fraHode = lesHastighetsenhet(hodeTekst);
    if (fraHode !== "unknown") return fraHode;
    return lesHastighetsenhet(radTekst);
  }
  const fraHode = lesAvstandsenhet(hodeTekst);
  if (fraHode !== "unknown") return fraHode;
  return lesAvstandsenhet(radTekst);
}

export function lesEnheterFraRapporttekst(tekst: string): {
  speed: SpeedUnit;
  distance: DistanceUnit;
} {
  const speedVindu = /club\s*speed[\s\S]{0,48}/i.exec(tekst)?.[0] ?? "";
  const carryVindu = /carry[\s\S]{0,48}/i.exec(tekst)?.[0] ?? "";
  const totalVindu = /total(?:\s*distance)?[\s\S]{0,48}/i.exec(tekst)?.[0] ?? "";
  const speed = lesHastighetsenhet(speedVindu) !== "unknown"
    ? lesHastighetsenhet(speedVindu)
    : lesHastighetsenhet(tekst.slice(0, 2000));
  const distanceFraCarry = lesAvstandsenhet(carryVindu);
  const distanceFraTotal = lesAvstandsenhet(totalVindu);
  const distance =
    distanceFraCarry !== "unknown"
      ? distanceFraCarry
      : distanceFraTotal !== "unknown"
        ? distanceFraTotal
        : lesAvstandsenhet(tekst.slice(0, 2000));
  return { speed, distance };
}
