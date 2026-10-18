/**
 * Opptak (WANG-31, -32) og koordinering mellom skolene (WANG-33): typer og rene hjelpere.
 * Kan brukes i nettleseren. Lesing og skriving skjer bare på serveren (wang-opptak.ts, opptak-actions.ts).
 */

export const KANDIDAT_STATUS = ["SOKT", "PROVESPILL", "VENTELISTE", "TATT_OPP", "IKKE_TATT_OPP"] as const;
export type WangKandidatStatus = (typeof KANDIDAT_STATUS)[number];

export const KANDIDAT_STATUS_TEKST: Record<WangKandidatStatus, string> = {
  SOKT: "Søkt",
  PROVESPILL: "Prøvespill",
  VENTELISTE: "Venteliste",
  TATT_OPP: "Tatt opp",
  IKKE_TATT_OPP: "Ikke tatt opp",
};

export const KONTAKT_MOTTAKER = ["KANDIDAT", "FORESATTE"] as const;
export type WangKontaktMottaker = (typeof KONTAKT_MOTTAKER)[number];

export interface WangKandidatRad {
  id: string;
  navn: string;
  klubb: string | null;
  fodselsaar: number | null;
  status: WangKandidatStatus;
  /** Egen skole har stjernemerket kandidaten. */
  stjerneEgen: boolean;
}

export interface WangKoordineringRad {
  id: string;
  navn: string;
  klubb: string | null;
  fodselsaar: number | null;
  /** Skolene (gruppenavn) som har stjernemerket kandidaten. */
  stjernerFra: string[];
  stjerneEgen: boolean;
  /** Nyeste først. Aldri innhold, bare hvem, hvem de snakket med og når. */
  kontakter: Array<{ id: string; skole: string; personRolle: string; personNavn: string; mottaker: WangKontaktMottaker; kontaktetAt: string }>;
}

export interface WangOpptakData {
  skoleaar: string;
  skoleNavn: string;
  plasser: number | null;
  kandidater: WangKandidatRad[];
  koordinering: WangKoordineringRad[];
}

/**
 * Opptaket gjelder alltid neste skoleår. Fra august (skolestart) er det året etter, ellers året som starter i august.
 * Oslo-dato inn som «YYYY-MM-DD» (osloIdagIso) så Vercels UTC ikke flytter året.
 */
export function opptakSkoleaar(osloIso: string): string {
  const [aar, maaned] = osloIso.split("-").map(Number);
  const start = maaned >= 8 ? aar + 1 : aar;
  return `${start}/${String((start + 1) % 100).padStart(2, "0")}`;
}

/** Stjernemerkede først, deretter navn. Det finnes ingen samlet poeng (vurderingspunktene D1 er ikke avgjort). */
export function sorterKandidater<T extends { navn: string; stjerneEgen: boolean }>(rader: T[]): T[] {
  return [...rader].sort((a, b) => Number(b.stjerneEgen) - Number(a.stjerneEgen) || a.navn.localeCompare(b.navn, "nb"));
}

export function kontaktTekst(k: { skole: string; personRolle: string; personNavn: string; mottaker: WangKontaktMottaker }): string {
  const hvem = k.mottaker === "FORESATTE" ? "foresatte" : "kandidaten";
  return `${k.skole}, ${k.personRolle.toLowerCase()} ${k.personNavn}, snakket med ${hvem}.`;
}
