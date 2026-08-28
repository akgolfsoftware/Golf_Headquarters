/**
 * DataGolf-spillerkort (DG-01 / C10) — rene funksjoner.
 *
 * Motor-skille (HANDOFF): Broadie-SG, DataGolf og PEI blandes ALDRI i samme
 * tall. PGA-putt per avstand fra syncPgaPuttDistance er Broadie-tabell og
 * skal merkes som det. Mangler et tall = «mangler», aldri gjett.
 */

export const DG_KILDE = "DATAGOLF";
export const BROADIE_PUTT_KILDE = "broadie-estimate";

export type DgMotorKilde = "DATAGOLF" | "BROADIE" | "PEI" | "UKJENT";

export function klassifiserKilde(source: string | null | undefined): DgMotorKilde {
  if (!source) return "UKJENT";
  const s = source.toLowerCase();
  if (s.includes("broadie")) return "BROADIE";
  if (s === "pei" || s.startsWith("pei-") || s.startsWith("pei_")) return "PEI";
  if (s.includes("datagolf")) return "DATAGOLF";
  return "UKJENT";
}

export function erDataGolfKilde(source: string | null | undefined): boolean {
  return klassifiserKilde(source) === "DATAGOLF";
}

export function kunDataGolf<T extends { source: string | null | undefined }>(rader: T[]): T[] {
  return rader.filter((r) => erDataGolfKilde(r.source));
}

export function pgaPuttKildeTekst(source: string | null | undefined): string {
  const k = klassifiserKilde(source);
  if (k === "BROADIE" || source === BROADIE_PUTT_KILDE) {
    return "PGA-putt per avstand er Broadie-tabell, ikke DataGolf.";
  }
  if (k === "DATAGOLF") return "PGA-putt per avstand · DataGolf.";
  return "PGA-putt per avstand · kilde mangler.";
}

export function snitt(verdier: Array<number | null | undefined>): number | null {
  const tall = verdier.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (tall.length === 0) return null;
  return tall.reduce((a, b) => a + b, 0) / tall.length;
}

/** Rest = True SG − Skill. Begge må være DataGolf-tall; ellers null. */
export function restAv(trueSg: number | null, skill: number | null): number | null {
  if (trueSg == null || skill == null) return null;
  return trueSg - skill;
}

export function feltRelativ(verdi: number | null, feltSnitt: number | null): number | null {
  if (verdi == null || feltSnitt == null) return null;
  return verdi - feltSnitt;
}

/** DG-01: +0,41 / −0,05 / mangler. To desimaler, norsk komma, minus-tegn. */
export function fmtDgTall(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "mangler";
  const abs = Math.abs(v).toFixed(2).replace(".", ",");
  if (v > 0) return `+${abs}`;
  if (v < 0) return `−${abs}`;
  return abs;
}

export type FeltRad = {
  id: string;
  erDu: boolean;
  verdi: number;
};

export type FeltVisning = {
  plass: number;
  label: string;
  verdi: number;
  erDu: boolean;
};

/**
 * Rangering mot feltsnitt (0 = snitt). Andre spillere anonymiseres A–E.
 * Under to rader: tom liste — ett tall gir ikke et ærlig feltsnitt.
 */
export function byggFeltRader(rader: FeltRad[], feltSnitt: number | null): FeltVisning[] {
  if (rader.length < 2 || feltSnitt == null) return [];
  const sorted = [...rader].sort((a, b) => b.verdi - a.verdi);
  let anonym = 0;
  return sorted.map((r, i) => ({
    plass: i + 1,
    label: r.erDu ? "Du" : `Spiller ${String.fromCharCode(65 + anonym++)}`,
    verdi: r.verdi - feltSnitt,
    erDu: r.erDu,
  }));
}

export function svakesteBotte(
  botter: Array<{ label: string; verdi: number | null }>,
): { label: string; verdi: number } | null {
  const med = botter.filter((b): b is { label: string; verdi: number } => b.verdi != null);
  if (med.length === 0) return null;
  return med.reduce((min, b) => (b.verdi < min.verdi ? b : min));
}

export function initialer(navn: string): string {
  const parts = navn.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0] ?? "";
  const b = parts[parts.length - 1][0] ?? "";
  return (a + b).toUpperCase();
}

export function fornavnAv(navn: string): string {
  return navn.trim().split(/\s+/).filter(Boolean)[0] ?? navn;
}

export function fmtDatoNb(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Oslo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  return parts.replace(/\//g, ".");
}
