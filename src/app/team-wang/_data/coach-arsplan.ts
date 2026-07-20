// WANG Årsplan (Coach) — datamodell portert fra Claude Design-skjermen
// «WANG Årsplan - Coach». Trenerens periodiserte årsplan for golfgruppa med
// AK-metodikk (pyramide FYS/TEK/SLAG/SPILL/TURN, læringsfaser, press).
// Hardkodet demo (AK Golf HQ er master; kobling til ekte gruppe-/spillerdata
// er et senere steg).

import type { WangFarge } from "./wang-plan";

export const TIPS = {
  pyr: "Hva du trener på. Fem akser (FYS · TEK · SLAG · SPILL · TURN) som til sammen blir 100 % per periode.",
  fase: "Læringsfase — øverste prioritet, styrer resten. Uten ball → Lav hastighet → Auto. Tidlig fase prioriteres over data og turnering.",
  cs: "Køllehastighet i % av maks. Uten ball = lav, Lav hastighet = CS50–80, Auto = CS80–100. Høyere = høyere presisjonskrav.",
  miljo: "Miljø/kontekst fra M0 (isolert) til M5 (helt banelikt). Følger fasen: Uten ball M0–M2, Lav M2–M4, Auto M4–M5.",
  press: "Konsekvens-trapp: 1 Fri (feil er gratis) → 2 Krav (score mot deg selv) → 3 Utfordring (én sjanse) → 4 Konkurranse (poeng teller).",
  p: "MORAD svingposisjon P1–P10 (halvsteg tillatt). P1 Setup · P4 Top · P7 Impact er viktigst diagnostisk.",
} as const;

export interface CoachPeriode {
  key: string;
  name: string;
  color: string;
  tint: string;
  fg: string;
  start: string;
  end: string;
  fokus: string;
  pyr: { FYS: number; TEK: number; SLAG: number; SPILL: number; TURN: number };
  faseFokus: string;
  maal: string[];
  tester: string[];
  iup: string;
  turneringer: string[];
}

export const COACH_PERIODS: CoachPeriode[] = [
  {
    key: "turnr", name: "TURN-rest", color: "var(--cat-orange)", tint: "var(--tint-orange)", fg: "var(--cat-orange)", start: "2026-08-17", end: "2026-09-30",
    fokus: "Runde av høstens konkurransesesong og gli over i grunntrening. Vedlikehold av spill, gradvis økt fysisk volum.",
    pyr: { FYS: 10, TEK: 10, SLAG: 20, SPILL: 25, TURN: 35 }, faseFokus: "Auto",
    maal: ["Fullføre høstturneringene skadefri", "Etablere NGF-baseline på fysiske tester", "Beholde scoringsspill mens FYS-volum øker"],
    tester: ["NGF fysiske inngangstester (aug)", "Baseline TrackMan 7-jern"], iup: "IUP-checkpoint oktober",
    turneringer: ["Klubbmesterskap GFGK"],
  },
  {
    key: "grunn", name: "GRUNN", color: "var(--wang-navy)", tint: "var(--tint-navy)", fg: "var(--wang-navy)", start: "2026-10-01", end: "2027-03-15",
    fokus: "Bygg teknisk og fysisk fundament. Mest FYS og TEK. Læringsfasen «Uten ball» og «Lav hastighet» prioriteres over data og turnering.",
    pyr: { FYS: 50, TEK: 35, SLAG: 10, SPILL: 5, TURN: 0 }, faseFokus: "Uten ball / Lav hastighet",
    maal: ["Øke CS-baseline 3 % på driver", "Knebøy 1RM +7,5 kg med bevart teknikk", "Automatisere nøytral P1/P4 uten ball"],
    tester: ["Vintertester teknikk + fysisk (jan)", "Retest maksstyrke (des)"], iup: "IUP-checkpoints des + mars",
    turneringer: ["Vintersimulator-cup (intern)"],
  },
  {
    key: "spes", name: "SPES", color: "var(--wang-teal)", tint: "var(--tint-teal)", fg: "var(--wang-teal-text)", start: "2027-03-16", end: "2027-04-30",
    fokus: "Spesialisér mot slag og scoringsspill. Mer «Auto»-fase, høyere CS og miljø. Press økes mot Krav og Utfordring.",
    pyr: { FYS: 15, TEK: 20, SLAG: 35, SPILL: 25, TURN: 5 }, faseFokus: "Lav hastighet / Auto",
    maal: ["Wedge-spredning 60 m under 6 m", "Smash factor 7-jern ≥ 1,38", "«Auto»-fase på tre nøkkelslag"],
    tester: ["Sesongtester (mai)", "Launch monitor – full wedge-matrise"], iup: "IUP-checkpoint mars",
    turneringer: ["Sesongåpning Srixon Tour"],
  },
  {
    key: "turn", name: "TURN", color: "var(--cat-orange)", tint: "var(--tint-orange)", fg: "var(--cat-orange)", start: "2027-05-01", end: "2027-06-21",
    fokus: "Omsett trening til score. Konkurransesimulering, «Auto»-fase, press mot Konkurranse. Toppe form mot prioriterte turneringer.",
    pyr: { FYS: 10, TEK: 10, SLAG: 20, SPILL: 25, TURN: 35 }, faseFokus: "Auto",
    maal: ["Snittscore under 76 i tellende runder", "GIR ≥ 55 % i turnering", "Opp-og-inn ≥ 60 %"],
    tester: ["Konkurransestatistikk per runde"], iup: "IUP-checkpoint juni",
    turneringer: ["Regionsmesterskap Øst", "Lag-NM kvalifisering", "NM Junior", "Srixon Tour finale"],
  },
];

// Pyramide-akser (fast farge per akse)
export const PY_AXES: [keyof CoachPeriode["pyr"], string][] = [
  ["FYS", "var(--wang-navy)"],
  ["TEK", "var(--wang-teal)"],
  ["SLAG", "var(--cat-orange)"],
  ["SPILL", "var(--cat-blue)"],
  ["TURN", "var(--cat-purple)"],
];

export const FASE_TRINN = [
  { n: 1, name: "Uten ball", desc: "Grunnbevegelse. Tørrsving, speil, ingen ball." },
  { n: 2, name: "Lav hastighet", desc: "Bevegelsen bygges opp med ball i redusert tempo." },
  { n: 3, name: "Auto", desc: "Automatisert, full fart under press." },
];

export const PERIOD_FASE_ACTIVE: Record<string, string[]> = {
  turnr: ["Auto"],
  grunn: ["Uten ball", "Lav hastighet"],
  spes: ["Lav hastighet", "Auto"],
  turn: ["Auto"],
};

export interface SidebarItem {
  key: string;
  icon: string;
  label: string;
}
export const SIDEBAR_GROUPS: { label: string; items: SidebarItem[] }[] = [
  {
    label: "Planlegg",
    items: [
      { key: "arsplan", icon: "flag", label: "Årsplan" },
      { key: "okter", icon: "calendar", label: "Økter" },
      { key: "treningsbank", icon: "dumbbell", label: "Treningsbank" },
      { key: "kalender", icon: "calendar", label: "Kalender" },
      { key: "konkurranser", icon: "trophy", label: "Konkurranser" },
    ],
  },
  {
    label: "Følg opp",
    items: [
      { key: "elever", icon: "users", label: "Elever" },
      { key: "testbatteri", icon: "target", label: "Testbatteri" },
      { key: "analyse", icon: "activity", label: "Analyse" },
    ],
  },
  {
    label: "Administrasjon",
    items: [
      { key: "kompetansemal", icon: "target", label: "Kompetansemål" },
      { key: "innstillinger", icon: "settings", label: "Innstillinger" },
    ],
  },
];

export const COACH_USER = { name: "Anders Kristiansen", role: "Hovedtrener golf" };

export interface AkAkse {
  label: string;
  value: string;
  tip: string;
  color: WangFarge;
}
