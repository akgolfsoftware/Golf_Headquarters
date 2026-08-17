// Domenetyper for Jarvis (/meg) — «venter på deg»-kø på tvers av kanaler.
// Sak/SakKanal/SakStatus er portet fra prisma/schema.prisma (steg 1, PR #518),
// re-eksportert herfra så resten av Jarvis-modulen har én importkilde.
// Avvik/LoggRad/InnsamlerStatus har ingen egen tabell ennå — UI-typer inntil
// et senere steg gir dem en kilde (triage-agent for Avvik, revisjonslogg for
// LoggRad, innsamler-helsesjekk for InnsamlerStatus).

export type { Sak } from "@/generated/prisma/client";
export { SakKanal, SakStatus } from "@/generated/prisma/enums";

import type { SakKanal } from "@/generated/prisma/enums";

/** Kalendervaktens avvikstyper — konflikt (dobbeltbooking), reisetid (rekker ikke), varsel (annet). */
export type AvvikType = "KONFLIKT" | "REISETID" | "VARSEL";

export interface Avvik {
  id: string;
  type: AvvikType;
  tittel: string;
  forklaring: string;
  /** Kalenderen slik den var — fritekst diff-blokk («før»-siden). */
  for: string;
  /** Kalenderen slik den blir hvis foreslått endring godkjennes — diff-blokk («etter»-siden). */
  etter: string;
  opprettet: string; // ISO
  /** null = ikke avgjort ennå. */
  godkjent: boolean | null;
}

export interface LoggRad {
  id: string;
  tidspunkt: string; // ISO
  handling: string;
  kanal: SakKanal | null;
  godkjentAv: string;
  sakId: string | null;
}

export type InnsamlerHelse = "OK" | "FEILET" | "KJORER";

export interface InnsamlerStatus {
  id: string;
  /** Visningsnavn — «Gmail», «iMessage/SMS», «Kalendervakt» osv. */
  navn: string;
  helse: InnsamlerHelse;
  sistKjort: string | null; // ISO
  feilmelding: string | null;
}
