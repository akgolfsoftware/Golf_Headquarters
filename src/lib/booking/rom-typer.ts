/**
 * Romtyper en tjeneste kan kreve (ServiceType.facilityType), med klartekst for AgencyOS.
 * Verdiene er de samme som enumen FacilityType i prisma/schema.prisma.
 */
export const ROMTYPER = [
  { verdi: "STUDIO", navn: "Performance Studio / simulator" },
  { verdi: "RANGE_1F", navn: "Driving Range 1. etasje" },
  { verdi: "RANGE_2F", navn: "Driving Range 2. etasje" },
  { verdi: "PUTTING_GREEN", navn: "Putting Green" },
  { verdi: "SHORT_GAME", navn: "Nærspillsområde" },
  { verdi: "COURSE_9H", navn: "9-hullsbanen" },
  { verdi: "COURSE_18H", navn: "18-hullsbanen" },
  { verdi: "SPECIFIC_HOLES", navn: "Bestemte hull" },
] as const;

export type RomtypeVerdi = (typeof ROMTYPER)[number]["verdi"];

export function romtypeNavn(verdi: string | null | undefined): string {
  return ROMTYPER.find((r) => r.verdi === verdi)?.navn ?? "Ingen bestemt romtype";
}
