/**
 * Hjelpefunksjoner og domenemodeller for PlayerHQ PH-24 (Meg / Profil & Utstyrsbag).
 * Kilde: AK Golf Precision Athletics PH-24 (Meg, Profil, Utstyrsbag).
 */

export type KolleKategori = "driver" | "wood" | "hybrid" | "jern" | "wedge" | "putter" | "annet";

export type BagKolleVisning = {
  kategori: KolleKategori;
  label: string;
  kode: string;
  verdi: string;
};

export type GapStatus = "normal" | "for-tett" | "for-stort";

export type AnalysertGap = {
  fra: string;
  til: string;
  meter: number;
  status: GapStatus;
  forklaring: string;
};

/**
 * Kategoriserer en kølle ut fra navn eller kode.
 */
export function kategoriserKolle(navn: string): KolleKategori {
  const n = navn.toLowerCase();
  if (n.includes("driver") || n === "dr") return "driver";
  if (n.includes("wood") || n.includes("fairway") || n.includes("spoon") || /\b[3579]w\b/.test(n) || /^[3579]w$/.test(n)) return "wood";
  if (n.includes("hybrid") || n.includes("rescue") || /\b[2345]h\b/.test(n) || /^[2345]h$/.test(n)) return "hybrid";
  if (n.includes("jern") || n.includes("iron") || /\b[1-9]i\b/.test(n) || /\b[1-9]-jern\b/.test(n) || /\b[1-9]j\b/.test(n)) return "jern";
  if (n.includes("wedge") || n.includes("pw") || n.includes("gw") || n.includes("sw") || n.includes("lw") || /\d{2}°/.test(n)) return "wedge";
  if (n.includes("putter") || n === "pt") return "putter";
  return "annet";
}

/**
 * Analyserer avstandsgap mellom to målte køller i meter carry.
 * Anbefalt gap mellom påfølgende køller er typisk 8-15 meter.
 */
export function analyserGap(fraKolle: string, tilKolle: string, meterFra: number, meterTil: number): AnalysertGap {
  const diff = Math.abs(meterTil - meterFra);
  let status: GapStatus = "normal";
  let forklaring = "Jevnt avstandsgap";

  if (diff < 7) {
    status = "for-tett";
    forklaring = "Mindre enn 7 m — køllene overlapper sannsynligvis i carry";
  } else if (diff > 16) {
    status = "for-stort";
    forklaring = "Over 16 m — fare for avstandshull i banespill";
  }

  return {
    fra: fraKolle,
    til: tilKolle,
    meter: Math.round(diff * 10) / 10,
    status,
    forklaring,
  };
}

/**
 * Formaterer fødselsdato fra Date til ISO YYYY-MM-DD for input-felt.
 */
export function tilIsoDato(d: Date | null | undefined): string {
  if (!d) return "";
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

/**
 * Finner profil-kompletthet i prosent (0–100) og lister manglende felt.
 */
export function beregnProfilKompletthet(profil: {
  navn: string;
  epost: string;
  mobil?: string | null;
  fodselsdatoISO?: string | null;
  homeClub?: string | null;
  ambition?: string | null;
}): { prosent: number; mangler: string[] } {
  const mangler: string[] = [];
  let score = 0;
  const total = 5;

  if (profil.navn && profil.navn.trim().length >= 2) score += 1;
  else mangler.push("Fullt navn");

  if (profil.epost && profil.epost.includes("@")) score += 1;
  else mangler.push("Gyldig e-post");

  if (profil.mobil && profil.mobil.trim().length >= 8) score += 1;
  else mangler.push("Mobilnummer");

  if (profil.fodselsdatoISO && /^\d{4}-\d{2}-\d{2}$/.test(profil.fodselsdatoISO)) score += 1;
  else mangler.push("Fødselsdato");

  if (profil.homeClub && profil.homeClub.trim().length > 0) score += 1;
  else mangler.push("Hjemmeklubb");

  return {
    prosent: Math.round((score / total) * 100),
    mangler,
  };
}
