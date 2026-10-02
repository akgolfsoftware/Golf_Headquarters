/**
 * Visningstyper for Spiller 360 (AG-08) i Precision Athletics. Serveren fyller
 * dem i spiller360-data.ts; visningen og prøvefilene bruker dem direkte.
 * Alt som ikke finnes i basen er null og vises som «—».
 */
import type { Datagrunnlag, S360Fane, Snittscore, AkseKode } from "./spiller360-visning";
import type { SpillerTesterData } from "@/lib/admin/spiller-tester-data";
import type { Treningsvolum } from "@/lib/workbench/treningsvolum";
import type { TpPlan } from "@/lib/teknisk-plan/tp-visning";

export type { S360Fane };

export type S360Hode = {
  id: string;
  navn: string;
  avatarUrl: string | null;
  grupper: string[];
  /** A–K fra snittscore. null under 4 tellende runder. */
  kategori: string | null;
  hcp: string;
  fodtAar: number | null;
  /** «AK GOLF» eller «WANG · TEAM NORWAY» — fra gruppenes program. */
  tilhorighet: string;
  /** Gjennomført tid mot planlagt tid, siste fire uker (beslutninger 26.09). */
  etterlevelse: { pct: number | null; kilde: string };
  avtale: { verdi: string; hint: string } | null;
  nesteTurnering: { navn: string; dato: string } | null;
  sisteBooking: { dato: string; tjeneste: string } | null;
  kreverDeg: { id: string; tittel: string; sub: string }[];
};

export type S360RailSpiller = { id: string; navn: string; sub: string };

export type S360Plan = {
  ukeLabel: string;
  uke: { id: string; dag: string; tittel: string; akse: AkseKode | null; minutter: number; status: string }[];
  iDag: { id: string; tittel: string; klokke: string; omrade: string; sted: string | null }[];
  naa: { tittel: string; tidspunkt: string; sted: string | null } | null;
  aktivPlan: { navn: string; periode: string; okter: string; venter: string | null } | null;
  sesong: { navn: string; naa: { navn: string; til: string } | null; neste: { navn: string; fra: string } | null } | null;
  kommende: { navn: string; dato: string }[];
  resultater: { navn: string; dato: string; plassering: number | null; score: number | null }[];
  permisjoner: { id: string; aarsak: string; fra: string; til: string; beskrivelse: string; status: string }[];
};

export type S360Runde = {
  id: string;
  dato: string;
  bane: string;
  brutto: number;
  tilPar: string;
  hull: number | null;
  sg: number | null;
  type: "Turnering" | "Trening";
  grunnlag: string;
};

export type S360SgOmrade = {
  kode: "OTT" | "APP" | "ARG" | "PUTT";
  navn: string;
  sg: number | null;
  /** Slag til neste HCP-nivå på Broadie-stigen (estimat). */
  motNeste: number | null;
  nesteNivaa: number | null;
  /** Snitt av coachens egne spillere siste åtte uker. Bare coach ser dette. */
  stallen: number | null;
};

export type S360Stats = {
  snitt: Snittscore & { kilde: string };
  runder: S360Runde[];
  tigerFive: { navn: string; verdi: string; status: "god" | "varsel" | "risiko" | "noytral" }[];
  sg: {
    verdi: string | null;
    trend: string | null;
    runder: number;
    baseline: string;
    grunnlag: string | null;
    kilde: string | null;
    datagrunnlag: Datagrunnlag;
    omrader: S360SgOmrade[];
    stallKilde: string;
    motSegSelv: { harSvar: boolean; grunnlag: string; akser: { navn: string; nylig: number | null; tidligere: number | null; endring: number | null }[]; verst: string | null };
    nesteFokus: { omrade: string; sgTap: string; grunnlag: string; lekkasje: { label: string; sg: number }[] } | null;
    uker: { kode: string; navn: string; siste: number; trend: number | null; antall: number }[];
  };
  trening: {
    analyse: { planlagteOkter: number; gjennomforteOkter: number; etterlevelsePct: number | null; planlagteReps: number; faktiskeReps: number; ballerSlatt: number; svingerUtenBall: number } | null;
    volumOmrader: { kode: string; navn: string; minutter: number }[];
    volumTotal: number;
    volumUker: { uke: string; minutter: number }[];
    korrelasjon: { navn: string; r: number | null; datapunkter: number; tolkning: string }[];
    /** Bare akser med registrert faktisk tid; 0 bevares. */
    planMotFaktisk: { akse: AkseKode; plan: number; faktisk: number }[];
    /** Alle fem akser, inklusive plan, ukjent, legacyanslag, framtid og øktantall. */
    volumMetadata?: Treningsvolum;
    planKilde: string;
  };
  trackman: {
    koller: { club: string; shots: number; avgTotal: number | null; avgSmash: number | null; avgBallSpeed: number | null }[];
    okter: { id: string; dato: string; slag: number; kolle: string | null }[];
  };
  putting: { band: { band: string; pct: number }[]; baseline: string };
  progresjon: { nivaa: string; nesteNivaa: string | null; krav: { navn: string; bestatt: boolean; verdi?: string; mal?: string }[] } | null;
  vekstrate: { egenRate: number | null; kohortRate: number | null; fraAar: number | null; tilAar: number | null; harSvar: boolean; harKohort: boolean; grunnlag: string };
  turneringer: { antall: number; bestePlassering: number | null; kilder: string[]; tomGrunn: string; aar: { aar: number; rader: { navn: string; dato: string; plassering: number | null; motPar: number | null }[] }[] };
  tester: { id: string; navn: string; dato: string; score: string }[];
};

export type S360Tp = {
  planer: { id: string; navn: string; status: string; periode: string; oppdatert: string }[];
  aktiv: TpPlan | null;
  aktivId: string | null;
};

export type S360Tester = {
  profil: SpillerTesterData;
  testdager: { id: string; dato: string; tittel: string; gjennomfort: boolean }[];
  tildelinger: { id: string; navn: string; frist: string | null }[];
  resultater: {
    id: string;
    navn: string;
    score: string;
    dato: string;
    trend: string;
    forslag: { id: string; navn: string; beskrivelse: string | null; begrunnelse: string; kanLeggesTil: boolean; okter: { id: string; label: string }[] }[];
  }[];
  tn: { id: string; navn: string; forsok: number; score: string; dato: string }[];
  workbenchHref: string;
};

export type S360Iup = {
  ak: boolean;
  person: { navn: string; fodt: string | null; klubb: string | null; skole: string | null; hovedcoach: string | null; telefon: string | null; epost: string; spilteAar: string | null; ambisjon: string | null; grupper: string[] };
  foreldre: { id: string; navn: string; relasjon: string; kontakt: string | null }[];
  ranking: { navn: string; verdi: string | null; kilde: string }[];
  resultatmaal: { id: string; tittel: string; frist: string | null; pct: number | null }[];
  prosessmaal: { id: string; tittel: string; frist: string | null; pct: number | null }[];
  perioder: { navn: string; uker: string; timer: string }[];
  turneringer: { navn: string; dato: string; resultat: string }[];
  uke: { dag: string; tittel: string; meta: string }[];
  trening: { gjennomfort: number; planlagt: number; timer: { akse: AkseKode; timer: number }[]; kilde: string; volumMetadata?: Treningsvolum } | null;
  tester: { navn: string; verdi: string; kilde: string }[];
  teknikk: { p: string; tittel: string; status: string }[];
  teknikkKilde: string | null;
  fys: { navn: string; verdi: string; kilde: string }[];
};

export type S360Samtaler = {
  traader: { id: string; type: string; antall: number; sist: string }[];
  notat: { tekst: string; coach: string; dato: string } | null;
  videoer: { id: string; tittel: string; dato: string; kilde: string }[];
  caddie: { antall: number; sisteTittel: string | null; sist: string | null };
};

export type S360Talent = {
  radar: { akse: string; verdi: number }[] | null;
  kilde: string;
  niva: string | null;
  region: string | null;
  klubb: string | null;
  inkludertFra: string | null;
  notater: string | null;
  milepaeler: { tittel: string; dato: string | null }[];
};

export type S360FaneData =
  | { fane: "plan"; data: S360Plan }
  | { fane: "stats"; data: S360Stats }
  | { fane: "tp"; data: S360Tp }
  | { fane: "test"; data: S360Tester }
  | { fane: "iup"; data: S360Iup }
  | { fane: "samtaler"; data: S360Samtaler }
  | { fane: "talent"; data: S360Talent };
