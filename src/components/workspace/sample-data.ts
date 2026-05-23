/**
 * Sample-data for Workspace-skjermene.
 *
 * Brukes mens NotionConnection + OppgaveCache + ProsjektCache er under
 * utvikling. Erstattes med ekte Prisma-queries når sync er på plass.
 *
 * Eksakt match til Claude Design-bundle _SEBg4QyodvbW2k06JWiGw.
 */

import type {
  CompanyKind,
  PrioKind,
  SourceKind,
  VisibilityKind,
  StatusKind,
} from "./primitives";

export type SampleTask = {
  id: number;
  title: string;
  project: { company: CompanyKind; name?: string };
  prio: PrioKind;
  due: string;
  today?: boolean;
  vis: VisibilityKind;
  source: SourceKind;
  brenner?: boolean;
  done: boolean;
  status: StatusKind;
  assigned: string[];
  est: string;
};

export const SAMPLE_TASKS: SampleTask[] = [
  // I dag
  {
    id: 1,
    title: "Forberede Markus' økt 14:00 — putt-fokus",
    project: { company: "AK", name: "AK COACHING" },
    prio: "BRENNER",
    due: "I dag 13:30",
    today: true,
    vis: "AK",
    source: "N",
    brenner: true,
    done: false,
    status: "DOING",
    assigned: ["AK"],
    est: "0,5t",
  },
  {
    id: 2,
    title: "Sende faktura Mulligan · mai",
    project: { company: "MULLIGAN", name: "MULLIGAN" },
    prio: "BRENNER",
    due: "I dag",
    today: true,
    vis: "SELSKAP",
    source: "N",
    brenner: true,
    done: false,
    status: "TODO",
    assigned: ["AK"],
    est: "1t",
  },
  {
    id: 3,
    title: "Avklare Trackman-leie sommer 2026",
    project: { company: "AK", name: "AK COACHING" },
    prio: "HOY",
    due: "I dag 17:00",
    today: true,
    vis: "AK",
    source: "M",
    done: false,
    status: "TODO",
    assigned: ["AK", "MR"],
    est: "1t",
  },
  {
    id: 4,
    title: "Svare Olyo Tour om sponsorpakke",
    project: { company: "AK", name: "OLYO 2026" },
    prio: "HOY",
    due: "I dag",
    today: true,
    vis: "AK",
    source: "N",
    done: false,
    status: "TODO",
    assigned: ["AK"],
    est: "0,5t",
  },
  {
    id: 5,
    title: "Junior NM · registrering Ada N-B.",
    project: { company: "AK", name: "AK COACHING" },
    prio: "MED",
    due: "I dag",
    today: true,
    vis: "JUNIOR",
    source: "N",
    done: true,
    status: "DONE",
    assigned: ["MR"],
    est: "0,5t",
  },
  // Denne uka
  {
    id: 6,
    title: "Onboarde Sofie i Trackman-konto",
    project: { company: "AK", name: "AK COACHING" },
    prio: "MED",
    due: "Ons 29.05",
    vis: "JUNIOR",
    source: "N",
    done: false,
    status: "TODO",
    assigned: ["MR"],
    est: "1t",
  },
  {
    id: 7,
    title: "Booke Mulligan-bay 4 til Wang-camp",
    project: { company: "WANG", name: "WANG SAMLING" },
    prio: "HOY",
    due: "Tor 30.05",
    vis: "SELSKAP",
    source: "N",
    done: false,
    status: "TODO",
    assigned: ["AK"],
    est: "0,5t",
  },
  {
    id: 8,
    title: "Skrive sommerplan for talent-spillere",
    project: { company: "AK", name: "AK COACHING" },
    prio: "MED",
    due: "Fre 31.05",
    vis: "AK",
    source: "M",
    done: false,
    status: "DOING",
    assigned: ["AK"],
    est: "3t",
  },
  {
    id: 9,
    title: "Oppdatere Skarpnord års-strategi",
    project: { company: "SKARP", name: "SKARPNORD" },
    prio: "MED",
    due: "Lør 01.06",
    vis: "SELSKAP",
    source: "N",
    done: false,
    status: "TODO",
    assigned: ["AK"],
    est: "2t",
  },
  {
    id: 10,
    title: "Privat: bestille båt-sjekk · Bjøllerud",
    project: { company: "PRIVAT", name: "PRIVAT" },
    prio: "LAV",
    due: "Søn 02.06",
    vis: "PRIVAT",
    source: "M",
    done: false,
    status: "TODO",
    assigned: ["AK"],
    est: "0,5t",
  },
  // Senere
  {
    id: 11,
    title: "Lese gjennom Wang sommer-CV",
    project: { company: "WANG", name: "WANG TOPP" },
    prio: "LAV",
    due: "04.06",
    vis: "SELSKAP",
    source: "N",
    done: false,
    status: "TODO",
    assigned: ["AK"],
    est: "1,5t",
  },
  {
    id: 12,
    title: "Lufte ny pricing for privattimer",
    project: { company: "AK", name: "AK COACHING" },
    prio: "MED",
    due: "06.06",
    vis: "AK",
    source: "M",
    done: false,
    status: "TODO",
    assigned: ["AK"],
    est: "2t",
  },
  {
    id: 13,
    title: "Innspilling: short-game-serie ep. 3",
    project: { company: "AK", name: "AK CONTENT" },
    prio: "MED",
    due: "08.06",
    vis: "ALLE",
    source: "N",
    done: false,
    status: "TODO",
    assigned: ["AK", "MR"],
    est: "4t",
  },
  {
    id: 14,
    title: "Lese ut Capto-data fra mai",
    project: { company: "AK", name: "AK COACHING" },
    prio: "LAV",
    due: "10.06",
    vis: "AK",
    source: "M",
    done: false,
    status: "TODO",
    assigned: ["AK"],
    est: "1,5t",
  },
];

export type SampleProject = {
  id: string;
  company: CompanyKind;
  title: string;
  desc: string;
  open: number;
  doing: number;
  done: number;
  total: number;
  pct: number;
  assigned: string[];
  vis: VisibilityKind;
  status: "AKTIV" | "PAUSE" | "ARKIVERT";
  due: string;
};

export const SAMPLE_PROJECTS: SampleProject[] = [
  { id: "p1", company: "AK", title: "AK Coaching · Sesong 2026", desc: "Daglig drift, økt-planlegging, spiller-utvikling. Hovedmotoren.", open: 14, doing: 6, done: 42, total: 62, pct: 68, assigned: ["AK", "MR"], vis: "AK", status: "AKTIV", due: "AUG 2026" },
  { id: "p2", company: "MULLIGAN", title: "Mulligan Studio · drift", desc: "Bay-bookinger, vedlikehold, Trackman-konfig. Co-eier med AK.", open: 8, doing: 2, done: 24, total: 34, pct: 76, assigned: ["AK"], vis: "SELSKAP", status: "AKTIV", due: "KONT." },
  { id: "p3", company: "WANG", title: "Wang Toppidrett · samarbeid", desc: "Coach-pool, sommer-camp, evaluering av talent.", open: 5, doing: 1, done: 12, total: 18, pct: 72, assigned: ["AK"], vis: "SELSKAP", status: "AKTIV", due: "JUN 2026" },
  { id: "p4", company: "AK", title: "Olyo Tour · norske spillere", desc: "Påmelding, reiselogistikk og resultatoppfølging.", open: 9, doing: 3, done: 8, total: 20, pct: 55, assigned: ["AK", "MR"], vis: "AK", status: "AKTIV", due: "OKT 2026" },
  { id: "p5", company: "SKARP", title: "Skarpnord · års-strategi", desc: "Investerings-thesis og pipeline-oppdatering 2026.", open: 4, doing: 0, done: 6, total: 10, pct: 60, assigned: ["AK"], vis: "SELSKAP", status: "PAUSE", due: "DES 2026" },
  { id: "p6", company: "AK", title: "AK Content · short-game serie", desc: "10 episoder · YouTube + Instagram. Filming Q2–Q3.", open: 6, doing: 2, done: 4, total: 12, pct: 50, assigned: ["AK", "MR"], vis: "ALLE", status: "AKTIV", due: "SEP 2026" },
  { id: "p7", company: "PRIVAT", title: "Bjøllerud · oppussing", desc: "Personlig prosjekt. Bad og kjøkken sommeren 2026.", open: 3, doing: 1, done: 7, total: 11, pct: 73, assigned: ["AK"], vis: "PRIVAT", status: "AKTIV", due: "AUG 2026" },
  { id: "p8", company: "AK", title: "AK Foreldre-portal v2", desc: "Re-design og tekniske endringer for foreldre-onboarding.", open: 2, doing: 0, done: 18, total: 20, pct: 90, assigned: ["AK"], vis: "AK", status: "ARKIVERT", due: "MAR 2026" },
  { id: "p9", company: "AK", title: "AK Talent · scout 2026/27", desc: "Identifisere juniorer for neste-års pulje.", open: 7, doing: 1, done: 3, total: 11, pct: 36, assigned: ["MR"], vis: "JUNIOR", status: "AKTIV", due: "NOV 2026" },
];

export const SAMPLE_PEOPLE: Record<string, { name: string; initials: string }> = {
  AK: { name: "Anders Kvam", initials: "AK" },
  MR: { name: "Markus R.P.", initials: "MR" },
  SL: { name: "Sofie L.", initials: "SL" },
  HT: { name: "Henrik T.", initials: "HT" },
  IB: { name: "Ingrid B.", initials: "IB" },
};
