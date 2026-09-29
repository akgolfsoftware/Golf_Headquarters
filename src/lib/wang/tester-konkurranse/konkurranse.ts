/**
 * Rene regler for WANG Konkurranse (WANG-09, 10, 11, 27).
 *
 * Turneringsresultater kommer fra den offentlige turneringsbasen (pipelines,
 * beslutninger.md §PIPELINES ER ENESTE KILDE) via `lesTurneringsresultat`.
 * Alt er brutto. En runde uten brutto teller ikke i snittet.
 */
import type { Resultatrunde } from "@/lib/domain/turneringsresultat";

import { dagerMellom } from "./format";

export type ElevResultat = {
  elevId: string;
  navn: string;
  klasse: string | null;
  status: string;
  runder: Resultatrunde[];
  brutto: number | null;
  motPar: number | null;
  plasseringTekst: string | null;
  plassering: number | null;
  kildeDato: Date | null;
};

export type GjennomfortTurnering = {
  turneringId: string;
  navn: string;
  startDato: Date;
  sted: string | null;
  kilde: string | null;
  deltakere: ElevResultat[];
};

/** Brutto per fullførte runde (ingen null, bare positive heltall). */
export function bruttoRunder(runder: Resultatrunde[]): number[] {
  return runder.map((r) => r.brutto).filter((b): b is number => b !== null && Number.isSafeInteger(b) && b > 0);
}

/** Gruppas snitt brutto per runde, og antall runder bak snittet. */
export function gruppeSnitt(deltakere: ElevResultat[]): { snitt: number | null; runder: number } {
  const alle = deltakere.flatMap((d) => bruttoRunder(d.runder));
  if (alle.length === 0) return { snitt: null, runder: 0 };
  return { snitt: Math.round((alle.reduce((a, b) => a + b, 0) / alle.length) * 10) / 10, runder: alle.length };
}

/** Elevene som faktisk spilte (minst én runde med brutto, eller fullført). */
export function spilte(deltakere: ElevResultat[]): number {
  return deltakere.filter((d) => d.brutto !== null || bruttoRunder(d.runder).length > 0).length;
}

/** Resultatlista sortert slik den offisielle lista står: plass, så navn. Uten plass til slutt. */
export function sorterResultater(deltakere: ElevResultat[]): ElevResultat[] {
  return deltakere.toSorted((a, b) => (a.plassering ?? Infinity) - (b.plassering ?? Infinity) || a.navn.localeCompare(b.navn, "nb"));
}

export type KommendePamelding = {
  elevId: string;
  navn: string;
  klasse: string | null;
  status: "PLANNED" | "CLAIMED_REGISTERED" | "CONFIRMED" | "WITHDRAWN" | "COMPLETED" | "DNF";
};

/** Påmeldt = spilleren har bekreftet (ikke bare satt på planen). */
export function erPameldt(s: KommendePamelding["status"]): boolean {
  return s === "CLAIMED_REGISTERED" || s === "CONFIRMED";
}

export function pameldingEtikett(s: KommendePamelding["status"]): { tekst: string; tone: "planlagt" | "pagar" | "ferdig" | "fravaer" | "varsel" } {
  switch (s) {
    case "CONFIRMED": return { tekst: "Påmeldt", tone: "ferdig" };
    case "CLAIMED_REGISTERED": return { tekst: "Venter bekreftelse", tone: "pagar" };
    case "PLANNED": return { tekst: "På planen", tone: "planlagt" };
    case "WITHDRAWN": return { tekst: "Trukket", tone: "fravaer" };
    case "DNF": return { tekst: "Brøt", tone: "fravaer" };
    case "COMPLETED": return { tekst: "Gjennomført", tone: "ferdig" };
  }
}

/** Fristen: passert, snart (7 dager) eller god tid. Mangler den, er det «—». */
export function fristTone(frist: Date | null, naa: Date): "passert" | "snart" | "ok" | "mangler" {
  if (!frist) return "mangler";
  const dager = dagerMellom(naa, frist);
  if (dager < 0) return "passert";
  return dager <= 7 ? "snart" : "ok";
}

// ---------------------------------------------------------------- WANG-09

export type SamlingStatus = { tekst: string; tone: "planlagt" | "pagar" | "ferdig" };

/** Samlingens status fra datoene alene — publisering og uttak har ingen modell ennå. */
export function samlingStatus(start: Date, slutt: Date, naa: Date): SamlingStatus {
  if (naa.getTime() < start.getTime()) return { tekst: "Planlagt", tone: "planlagt" };
  if (naa.getTime() <= slutt.getTime()) return { tekst: "Pågår", tone: "pagar" };
  return { tekst: "Gjennomført", tone: "ferdig" };
}

// ---------------------------------------------------------------- WANG-27

export type StatRunde = { dato: Date; turnering: string; sted: string | null; brutto: number; motPar: number | null; hull: number | null };

/**
 * Siste ti runder, eldst først. Bare 18-hullsrunder (eller ukjent antall
 * hull fra kilden) — en 9-hullsrunde ville trukket snittet ned.
 */
export function sisteRunder(runder: StatRunde[], antall = 10): StatRunde[] {
  return runder
    .filter((r) => r.hull === null || r.hull === 18)
    .toSorted((a, b) => a.dato.getTime() - b.dato.getTime())
    .slice(-antall);
}

export function rundeOppsummering(runder: StatRunde[]): { snitt: number | null; beste: StatRunde | null } {
  if (runder.length === 0) return { snitt: null, beste: null };
  const snitt = Math.round((runder.reduce((a, r) => a + r.brutto, 0) / runder.length) * 10) / 10;
  const beste = runder.reduce((b, r) => (r.brutto < b.brutto ? r : b));
  return { snitt, beste };
}
