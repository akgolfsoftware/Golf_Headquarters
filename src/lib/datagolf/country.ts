/**
 * ISO 3166-1 alpha-3 → alpha-2 konvertering.
 *
 * DataGolf returnerer landkoder som 3-bokstaver ("NOR", "USA", "ENG").
 * Flagg-komponenten (FlagGlyph) og PublicPlayer.country bruker 2-bokstaver
 * ("no", "us"). Denne mappen dekker alle golf-nasjoner vi forventer i feltene.
 *
 * Spesialtilfeller: DataGolf bruker noen ganger sub-nasjonale koder for
 * Storbritannia (ENG, SCO, WAL, NIR). Disse mapper vi til "gb" (Union Jack).
 */

const ISO3_TO_ISO2: Record<string, string> = {
  // Norden
  NOR: "NO",
  SWE: "SE",
  DEN: "DK",
  FIN: "FI",
  ISL: "IS",
  // Storbritannia + sub-nasjoner
  GBR: "GB",
  ENG: "GB",
  SCO: "GB",
  WAL: "GB",
  NIR: "GB",
  // Resten av Europa
  IRL: "IE",
  FRA: "FR",
  GER: "DE",
  DEU: "DE",
  ESP: "ES",
  ITA: "IT",
  NED: "NL",
  NLD: "NL",
  BEL: "BE",
  AUT: "AT",
  SUI: "CH",
  CHE: "CH",
  POR: "PT",
  PRT: "PT",
  POL: "PL",
  CZE: "CZ",
  SVK: "SK",
  HUN: "HU",
  GRE: "GR",
  GRC: "GR",
  AND: "AD",
  // Amerika
  USA: "US",
  CAN: "CA",
  MEX: "MX",
  ARG: "AR",
  CHI: "CL",
  CHL: "CL",
  COL: "CO",
  VEN: "VE",
  BRA: "BR",
  PAR: "PY",
  PRY: "PY",
  // Asia
  JPN: "JP",
  KOR: "KR",
  CHN: "CN",
  TPE: "TW",
  THA: "TH",
  IND: "IN",
  PHI: "PH",
  PHL: "PH",
  MAS: "MY",
  MYS: "MY",
  SIN: "SG",
  SGP: "SG",
  HKG: "HK",
  INA: "ID",
  IDN: "ID",
  VIE: "VN",
  VNM: "VN",
  // Afrika
  RSA: "ZA",
  ZAF: "ZA",
  ZIM: "ZW",
  ZWE: "ZW",
  KEN: "KE",
  MAR: "MA",
  EGY: "EG",
  NGR: "NG",
  NGA: "NG",
  // Oseania
  AUS: "AU",
  NZL: "NZ",
  FIJ: "FJ",
  FJI: "FJ",
};

/**
 * Konverterer en ISO3-landkode til ISO2 (uppercase).
 * Faller tilbake til "XX" hvis ukjent — FlagGlyph håndterer ukjent kode.
 */
export function iso3to2(code: string | undefined | null): string {
  if (!code) return "XX";
  const upper = code.trim().toUpperCase();
  return ISO3_TO_ISO2[upper] ?? "XX";
}
