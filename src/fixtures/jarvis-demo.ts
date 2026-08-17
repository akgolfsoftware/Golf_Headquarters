// Demodata for Jarvis (/meg), bak et repository-interface — se
// jarvis/claude-code-nattsesjon-prompt.md Fase 2 punkt 6: «samle universet
// fra HTML-filene i ÉN fil bak et repository-interface, så ekte innsamlere
// kan byttes inn uten UI-endring».
//
// Personene under er fiktive demo-personaer hentet fra fasit-mockupene
// (jarvis/meg-hjem.html, meg-saker.html, meg-sak.html, meg-kalendervakt.html,
// meg-maskinrom.html) — ikke sporet mot noen ekte spiller-, elev- eller
// kundedatabase. GDPR-regelen for Jarvis-fixtures («fiktive navn, aldri ekte
// spillerdata») er dermed holdt, ikke bare unngått.
import type { Sak } from "@/generated/prisma/client";
import { SakKanal, SakStatus } from "@/generated/prisma/enums";
import type { Avvik, DagenData, InnsamlerStatus, LoggRad, SystemHelse } from "@/lib/jarvis/types";
import type { KalenderHendelse } from "@/lib/meg/connectors/google";
import {
  osloDagGrenser,
  byggAvtaleElementer,
  byggInnboksblokker,
  byggLedigElementer,
  summerLedigMinutterIgjen,
} from "@/lib/jarvis/dagen";

const NA = () => new Date();
const timerFraNa = (t: number) => new Date(NA().getTime() + t * 60 * 60 * 1000);

export const demoSaker: Sak[] = [
  {
    id: "2026-0847",
    kanal: SakKanal.EPOST,
    avsender: "Øyvind Rossbach · WANG",
    emne: "Uttak til regionssamlingen",
    innhold:
      "Øyvind fra WANG spurte om uttaket til regionssamlingen i går kveld. Filip trenger fri fra 4. time fredag — kan du bekrefte at det går? Påmelding sender jeg i dag.",
    foreslattSvar:
      "Øyvind! Jeg tar Filip, Henrik og Sander til regionssamlingen. Filip trenger fri fra 4. time fredag — kan du bekrefte at det går? Påmelding sender jeg i dag.",
    status: SakStatus.VENTER,
    kildeId: "gmail-msg-8471",
    frist: timerFraNa(-1.5),
    opprettet: timerFraNa(-16),
    oppdatert: timerFraNa(-16),
    provenance: { agent: "saker-gmail", versjon: 1 },
  },
  {
    id: "2026-0848",
    kanal: SakKanal.SMS,
    avsender: "Mette Solheim · forelder",
    emne: null,
    innhold: "Hei! Kan Henrik bytte økt fra tirsdag til onsdag denne uka? Han har tannlege.",
    foreslattSvar: "Hei Mette — det går fint, jeg flytter Henrik til onsdag samme klokkeslett.",
    status: SakStatus.VENTER,
    kildeId: "sms-9021",
    frist: timerFraNa(3),
    opprettet: timerFraNa(3),
    oppdatert: timerFraNa(3),
    provenance: { agent: "saker-imessage", versjon: 1 },
  },
  {
    id: "2026-0849",
    kanal: SakKanal.ANROP,
    avsender: "GFGK juniorgruppa",
    emne: "Ubesvart anrop",
    innhold: "Ubesvart anrop fra klubbtelefonen — ingen talemelding.",
    foreslattSvar: null,
    status: SakStatus.VENTER,
    kildeId: null,
    frist: timerFraNa(4.5),
    opprettet: timerFraNa(1.5),
    oppdatert: timerFraNa(1.5),
    provenance: { agent: "saker-telefoni", versjon: 1 },
  },
  {
    id: "2026-0850",
    kanal: SakKanal.IMESSAGE,
    avsender: "Henrik Aas · spiller",
    emne: null,
    innhold: "Hva sa du om TrackMan-økten på torsdag? Var det 15:00 eller 15:30?",
    foreslattSvar: "15:00 på torsdag, Henrik — sett av 90 min.",
    status: SakStatus.VENTER,
    kildeId: "imessage-5512",
    frist: timerFraNa(5.5),
    opprettet: timerFraNa(0.5),
    oppdatert: timerFraNa(0.5),
    provenance: { agent: "saker-imessage", versjon: 1 },
  },
  {
    id: "2026-0841",
    kanal: SakKanal.EPOST,
    avsender: "Espen Kjølberg · GFGK",
    emne: "Baneprioritering neste uke",
    innhold: "Kan juniorgruppa få hull 1–9 tirsdag 16–18 neste uke?",
    foreslattSvar: "Ja, det går fint — jeg bekrefter med proshopen.",
    status: SakStatus.GODKJENT,
    kildeId: "gmail-msg-8390",
    frist: timerFraNa(-30),
    opprettet: timerFraNa(-32),
    oppdatert: timerFraNa(-28),
    provenance: { agent: "saker-gmail", versjon: 1 },
  },
  {
    id: "2026-0839",
    kanal: SakKanal.TELEGRAM,
    avsender: "Meg-boten",
    emne: "Kveldsjournal 15.08",
    innhold: "Kveldsjournalen for i går er klar til gjennomsyn.",
    foreslattSvar: null,
    status: SakStatus.UTFORT,
    kildeId: "telegram-3391",
    frist: timerFraNa(-40),
    opprettet: timerFraNa(-44),
    oppdatert: timerFraNa(-40),
    provenance: { agent: "meg-telegram", versjon: 1 },
  },
  {
    id: "2026-0830",
    kanal: SakKanal.KALENDER,
    avsender: "Google Kalender",
    emne: "Dobbeltbooking 14:00",
    innhold: "Booking Henrik overlapper juniorgruppa 14:00–15:00 på hull 10.",
    foreslattSvar: null,
    status: SakStatus.AVVIST,
    kildeId: "calendar-conflict-77",
    frist: timerFraNa(-60),
    opprettet: timerFraNa(-70),
    oppdatert: timerFraNa(-60),
    provenance: { agent: "saker-kalendervakt", versjon: 1 },
  },
  {
    id: "2026-0820",
    kanal: SakKanal.TASK,
    avsender: "Workbench",
    emne: "Ukeplan GFGK U15 ikke bekreftet",
    innhold: "Ukeplanen for GFGK U15 er generert, men ikke sendt til foreldrene.",
    foreslattSvar: null,
    status: SakStatus.UTLOPT,
    kildeId: "task-4471",
    frist: timerFraNa(-96),
    opprettet: timerFraNa(-120),
    oppdatert: timerFraNa(-96),
    provenance: { agent: "workbench-varsel", versjon: 1 },
  },
];

export const demoAvvik: Avvik[] = [
  {
    id: "avvik-1",
    type: "KONFLIKT",
    tittel: "Booking Henrik overlapper juniorgruppa",
    forklaring: "Henrik Aas er booket 14:00–15:00 på hull 10, samtidig som juniorgruppa har hullet reservert.",
    for: "14:00–15:00 · Hull 10 · Juniorgruppa (8 spillere)\n14:00–14:45 · Hull 10 · Henrik Aas (privattime)",
    etter: "14:00–15:00 · Hull 10 · Juniorgruppa (8 spillere)\n15:15–16:00 · Hull 6 · Henrik Aas (privattime, flyttet)",
    opprettet: timerFraNa(-2).toISOString(),
    godkjent: null,
  },
  {
    id: "avvik-2",
    type: "REISETID",
    tittel: "Juniorgruppa slutter 14:00 — møtet med Øyvind starter 14:00",
    forklaring: "Ingen reisetid mellom banen og møtet med Øyvind Rossbach (WANG) — begge er satt til nøyaktig 14:00.",
    for: "13:00–14:00 · Juniorgruppa, GFGK\n14:00–14:30 · Møte med Øyvind Rossbach",
    etter: "13:00–14:00 · Juniorgruppa, GFGK\n14:20–14:50 · Møte med Øyvind Rossbach (flyttet 20 min)",
    opprettet: timerFraNa(-1).toISOString(),
    godkjent: null,
  },
  {
    id: "avvik-3",
    type: "VARSEL",
    tittel: "Styremøtet 19:00 har ikke varsel",
    forklaring: "Styremøtet mangler påminnelse — de andre kalenderoppføringene i dag har alle 30-minutters varsel.",
    for: "19:00–20:30 · Styremøte GFGK (ingen påminnelse)",
    etter: "19:00–20:30 · Styremøte GFGK (30 min påminnelse lagt til)",
    opprettet: timerFraNa(-3).toISOString(),
    godkjent: null,
  },
];

export const demoLoggRader: LoggRad[] = demoSaker
  .filter((s) => s.status === SakStatus.GODKJENT || s.status === SakStatus.AVVIST || s.status === SakStatus.UTFORT)
  .map((s) => ({
    id: `logg-${s.id}`,
    tidspunkt: s.oppdatert.toISOString(),
    handling:
      s.status === SakStatus.GODKJENT ? "Godkjent og sendt" : s.status === SakStatus.AVVIST ? "Avvist" : "Utført",
    kanal: s.kanal,
    godkjentAv: "Anders Kristiansen",
    sakId: s.id,
  }));

export const demoInnsamlere: InnsamlerStatus[] = [
  {
    id: "gmail",
    navn: "Gmail",
    helse: "OK",
    sistKjort: timerFraNa(-0.1).toISOString(),
    feilmelding: null,
    frekvens: "hvert 10. min",
  },
  {
    id: "imessage",
    navn: "iMessage/SMS",
    helse: "FEILET",
    sistKjort: timerFraNa(-3.5).toISOString(),
    feilmelding: "Full Disk Access mangler — chat.db kan ikke åpnes.",
    frekvens: "manuell (ingen LaunchAgent ennå)",
  },
];

export const demoSystemHelse: SystemHelse = {
  innsamlere: demoInnsamlere,
  aiKostSum: { inputTokens: 84213, outputTokens: 19042, costUsd: 0.62, antallKall: 11 },
  lokalHelseTilgjengelig: false,
};

export const demoKalenderHendelser: KalenderHendelse[] = [
  { id: "cal-1", tittel: "Trening: Filip", sted: "GFGK simulator", start: timerFraNa(0.3).toISOString(), slutt: timerFraNa(1.8).toISOString(), heldag: false },
  { id: "cal-2", tittel: "Juniorgruppa", sted: "GFGK range", start: timerFraNa(2.8).toISOString(), slutt: timerFraNa(4.3).toISOString(), heldag: false },
  { id: "cal-3", tittel: "Møte: Øyvind Rossbach", sted: "WANG", start: timerFraNa(5).toISOString(), slutt: timerFraNa(6).toISOString(), heldag: false },
];

function byggDemoDagen(): DagenData {
  const na = NA();
  const grenser = osloDagGrenser(na);
  const avtaler = byggAvtaleElementer(demoKalenderHendelser, na);
  const innboksblokker = byggInnboksblokker(demoSaker, grenser.start, na);
  const opptatt = [...avtaler, ...innboksblokker];
  const ledig = byggLedigElementer(opptatt, grenser, na);
  const elementer = [...opptatt, ...ledig].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return {
    kalenderTilgjengelig: true,
    kalenderFeil: null,
    elementer,
    ledigMinutterIgjen: summerLedigMinutterIgjen(ledig, na),
  };
}

/** Repository-grensesnittet UI-en programmerer mot — bytt implementasjon uten UI-endring. */
export interface JarvisRepository {
  hentSaker(): Promise<Sak[]>;
  hentSak(id: string): Promise<Sak | null>;
  hentAvvik(): Promise<Avvik[]>;
  hentLogg(): Promise<LoggRad[]>;
  hentSystemHelse(): Promise<SystemHelse>;
  hentDagen(saker: Sak[]): Promise<DagenData>;
}

/** Demo-implementasjon — statisk fixture-data, ingen nettverk/DB. */
export function lagDemoRepository(): JarvisRepository {
  return {
    async hentSaker() {
      return demoSaker;
    },
    async hentSak(id: string) {
      return demoSaker.find((s) => s.id === id) ?? null;
    },
    async hentAvvik() {
      return demoAvvik;
    },
    async hentLogg() {
      return demoLoggRader;
    },
    async hentSystemHelse() {
      return demoSystemHelse;
    },
    async hentDagen() {
      return byggDemoDagen();
    },
  };
}
