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

/** UKJENT = ingen AgentRun-rad funnet ennå (aldri kjørt, eller ikke instrumentert). */
export type InnsamlerHelse = "OK" | "FEILET" | "KJORER" | "UKJENT";

export interface InnsamlerStatus {
  id: string;
  /** Visningsnavn — «Gmail», «iMessage/SMS», «Kalendervakt» osv. */
  navn: string;
  helse: InnsamlerHelse;
  sistKjort: string | null; // ISO
  feilmelding: string | null;
  /** Kjøreplan i klartekst, f.eks. «hvert 10. min» — vises uansett helse. */
  frekvens: string | null;
}

/** Status Jarvis leser fra Agentic OS (godkjenningskø + siste agentkjøring). */
export interface AgenticosBroStatus {
  ulosteGodkjenninger: number;
  planActions: number;
  caddieDrafts: number;
  sessionRequests: number;
  sisteAgentKjoring: {
    agentName: string;
    status: string;
    createdAt: string;
    error: string | null;
  } | null;
  feiledeSisteDognet: number;
}

/** Maskinrommets «Agent og kjøretid»-gruppe — helsesignaler Vercel kan/ikke kan lese selv. */
export interface SystemHelse {
  innsamlere: InnsamlerStatus[];
  agenticos: AgenticosBroStatus;
  /** Sum siste 7 dager for Jarvis-relaterte agentnavn (agentName som starter med «jarvis»). Tom = ingen kostnad logget ennå. */
  aiKostSum: { inputTokens: number; outputTokens: number; costUsd: number | null; antallKall: number };
  /** Ollama/LaunchAgent-helse kan aldri leses fra Vercel (Tailscale-only, se gotchas.md) — alltid "ukjent lokalt" herfra. */
  lokalHelseTilgjengelig: false;
}

/**
 * Dagen-artefaktets tidslinje. "avtale" = ekte Google-kalenderhendelse,
 * "innboksblokk" = fast rytmepunkt (11:30/16:00) med et snapshot av
 * Sak-køen, "ledig" = utledet luke mellom to opptatte elementer. "reise"
 * (fasitens reisetid-segmenter) og "vaktavvik"-kobling til en ekte Avvik
 * er bevisst utelatt inntil geokoding/kalendervakt-agent finnes — se
 * src/lib/jarvis/dagen.ts.
 */
export type DagenElementType = "avtale" | "innboksblokk" | "ledig";

export interface DagenElement {
  id: string;
  type: DagenElementType;
  start: string; // ISO
  slutt: string | null; // ISO — null for punkthendelser
  tittel: string;
  undertekst: string | null;
  /** slutt (eller start hvis punkthendelse) er før "nå". */
  ferdig: boolean;
  lenke?: "saker";
}

export interface DagenData {
  /** false = Google-tilkoblingen mangler eller kalender-kallet feilet — IKKE det samme som "ingen avtaler". */
  kalenderTilgjengelig: boolean;
  kalenderFeil: string | null;
  elementer: DagenElement[];
  /** Resterende ledig tid i dag (minutter), summert fra "ledig"-elementene som ikke er ferdig. */
  ledigMinutterIgjen: number;
}

/** Fangst-typene fra fasiten — styrer kun emne-teksten på den opprettede Saken (TASK-kanal), ingen egen kolonne. */
export const FANGST_TYPER = ["oppgave", "avtale", "notat", "husk"] as const;
export type FangstType = (typeof FANGST_TYPER)[number];

export const FANGST_TYPE_LABEL: Record<FangstType, string> = {
  oppgave: "Oppgave",
  avtale: "Avtale",
  notat: "Notat",
  husk: "Husk til i morgen",
};

/**
 * Morgenbrief/kveldsjournal-innhold — hentes fra `me_brief` i Meg-Supabase
 * (EGET prosjekt, ikke golf-DB'en /meg ellers bruker, se src/lib/meg/supabase.ts).
 * `innhold: null` dekker BEGGE "aldri generert ennå" OG "Meg-databasen er ikke
 * konfigurert" — samme ærlige, ikke-spesifiserende tomtilstand som resten av
 * Jarvis-portens datakilder som ikke finnes ennå (se Maskinrommet/Kalendervakt).
 */
export type BriefKind = "morgenbrief" | "kveldsjournal";

export interface BriefSnapshot {
  innhold: string | null;
  generert: string | null; // ISO
}

/**
 * Ukesreview — ren aggregat-statistikk, ingen AI-tekst. Fasitens «tre ting
 * som gledet»/«tre ting til neste uke» er bevisst utelatt: det er
 * menneskelig refleksjon appen ikke har noen kilde til, og å generere den
 * ville vært oppdiktet innhold presentert som ekte. Fasitens «118,4 M av
 * 150 M tokens» er også utelatt — 150M er et tall fra designprompten, ikke
 * et budsjett appen faktisk sporer noe sted i kode.
 */
export interface UkesreviewData {
  ukenummer: number;
  periodeStart: string; // ISO, mandag
  periodeSlutt: string; // ISO, søndag (eksklusiv)
  slaEtterlevelse: {
    /** null = ingen avgjorte saker med frist denne uken — ikke 0 %. */
    prosentUnderFrist: number | null;
    avgjorteMedFrist: number;
    /** Median tid fra opprettet til oppdatert for avgjorte saker denne uken, i minutter. Null = ingen data. */
    medianSvartidMin: number | null;
    /** Samme mål for forrige uke — til sammenligning. Null = ingen data den uken. */
    prosentUnderFristForrigeUke: number | null;
  };
  sakerPerKanal: { kanal: SakKanal; antall: number }[];
  kalenderavvikFanget: number;
  aiKost: { inputTokens: number; outputTokens: number; costUsd: number | null; antallKall: number };
}

/**
 * Innstillingene (skjerm 11) — «fire ting du kan skru på». Persisteres i
 * JarvisInnstilling og leses av src/lib/jarvis/innstillinger.ts (kø-filter,
 * kalender, SLA, stille tidsrom, innsamlere). STANDARD_INNSTILLINGER speiler
 * skjemaets @default-verdier — brukes når ingen rad finnes ennå.
 */
export interface Innstillinger {
  kanalGmail: boolean;
  kanalImessage: boolean;
  kanalTelegram: boolean;
  kanalAnrop: boolean;
  kanalKalender: boolean;
  slaTerskelTimer: number;
  stemmeAktivert: boolean;
  stilleTidsromAktivert: boolean;
}

export const STANDARD_INNSTILLINGER: Innstillinger = {
  kanalGmail: true,
  kanalImessage: true,
  kanalTelegram: true,
  kanalAnrop: true,
  kanalKalender: true,
  slaTerskelTimer: 6,
  stemmeAktivert: true,
  stilleTidsromAktivert: true,
};

export type InnstillingBoolFelt =
  | "kanalGmail"
  | "kanalImessage"
  | "kanalTelegram"
  | "kanalAnrop"
  | "kanalKalender"
  | "stemmeAktivert"
  | "stilleTidsromAktivert";

export type InnstillingEndring = { felt: InnstillingBoolFelt; verdi: boolean } | { felt: "slaTerskelTimer"; verdi: number };
