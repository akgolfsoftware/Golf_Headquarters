/**
 * Elevens fokusområder — det andre sporet i årsplanen.
 *
 * Kilden er tabellen `group_period_goals`, fylt i IUP-samtalen. Er den tom
 * (ingen samtale gjennomført ennå) faller flaten tilbake til demoen under,
 * samme mønster som resten av WANG-flaten bruker for perioder og hendelser.
 *
 * Demoen er ikke pynt: den viser hva en ferdig utfylt periode ser ut som, så
 * skjermen kan vurderes før første ekte IUP-samtale er kjørt.
 */

import type { WangFokusomraadeDb } from "./hent-wang-gruppe";
import type { AkAkse, MaalStatus } from "../_components/ak-primitiver";
import type { PeriodeKey } from "./wang-plan";

export interface Fokusomraade {
  id: string;
  akse: AkAkse;
  tittel: string;
  egentidMinUke: number;
  maalemetode: string | null;
  status: MaalStatus;
  egenvurdering: number | null;
  trenervurdering: number | null;
}

export interface PeriodeFokus {
  omraader: Fokusomraade[];
  /** Hvordan fokusområdene måles ved periodeslutt. */
  maaling: string;
  /** Checkpoint midt i perioden — når treneren kommenterer skriftlig. */
  kommentar: string | null;
}

// ---- Demo: én ferdig utfylt IUP per periode ----------------------------

export const FOKUS_DEMO: Record<PeriodeKey, PeriodeFokus> = {
  grunn: {
    maaling:
      "Egenvurdering 1–5 ved periodeslutt 30. november. Måles i vintertesten 15. januar.",
    kommentar:
      "IUP-checkpoint desember: Anders kommenterer hvert fokusområde skriftlig.",
    omraader: [
      {
        id: "demo-grunn-1",
        akse: "TEK",
        tittel: "Nøytralt grep og oppsett i P1",
        egentidMinUke: 120,
        maalemetode: "Video forfra og bakfra mot referansebilde",
        status: "PAA_VEI",
        egenvurdering: null,
        trenervurdering: null,
      },
      {
        id: "demo-grunn-2",
        akse: "FYS",
        tittel: "Knebøy 1RM +7,5 kg med bevart teknikk",
        egentidMinUke: 180,
        maalemetode: "Retest maksstyrke i desember",
        status: "PAA_VEI",
        egenvurdering: null,
        trenervurdering: null,
      },
      {
        id: "demo-grunn-3",
        akse: "SLAG",
        tittel: "Samle treffpunktspredning på 7-jern",
        egentidMinUke: 90,
        maalemetode: "TrackMan – spredning i meter",
        status: "IKKE_STARTET",
        egenvurdering: null,
        trenervurdering: null,
      },
    ],
  },
  spes: {
    maaling:
      "Egenvurdering 1–5 ved periodeslutt 31. mars. Måles i sesongtesten 28. mai.",
    kommentar:
      "IUP-checkpoint februar: status på hvert fokusområde før turneringsperioden.",
    omraader: [
      {
        id: "demo-spes-1",
        akse: "SLAG",
        tittel: "Wedge-spredning 60 m under 6 m",
        egentidMinUke: 120,
        maalemetode: "Launch monitor – full wedge-matrise",
        status: "IKKE_STARTET",
        egenvurdering: null,
        trenervurdering: null,
      },
      {
        id: "demo-spes-2",
        akse: "SPILL",
        tittel: "Opp-og-inn over 60 % i scoringsspill",
        egentidMinUke: 90,
        maalemetode: "Turneringsstatistikk per runde",
        status: "IKKE_STARTET",
        egenvurdering: null,
        trenervurdering: null,
      },
      {
        id: "demo-spes-3",
        akse: "FYS",
        tittel: "Vedlikeholde maksstyrke gjennom vinteren",
        egentidMinUke: 120,
        maalemetode: "Retest maksstyrke i mai",
        status: "IKKE_STARTET",
        egenvurdering: null,
        trenervurdering: null,
      },
    ],
  },
  turn: {
    maaling:
      "Egenvurdering 1–5 ved sesongslutt. Måles på turneringsstatistikk per runde.",
    kommentar: "IUP-checkpoint juni: oppsummering og mål for neste sesong.",
    omraader: [
      {
        id: "demo-turn-1",
        akse: "SPILL",
        tittel: "Snittscore under 76 i tellende runder",
        egentidMinUke: 120,
        maalemetode: "Turneringsstatistikk per runde",
        status: "IKKE_STARTET",
        egenvurdering: null,
        trenervurdering: null,
      },
      {
        id: "demo-turn-2",
        akse: "TURN",
        tittel: "Fullføre preshot-rutinen på hvert slag",
        egentidMinUke: 90,
        maalemetode: "Egenvurdering per runde",
        status: "IKKE_STARTET",
        egenvurdering: null,
        trenervurdering: null,
      },
    ],
  },
};

// ---- Fra base til UI ---------------------------------------------------

/** Summen av planlagt egentrening i perioden, i minutter per uke. */
export function summerEgentid(omraader: Fokusomraade[]): number {
  return omraader.reduce((sum, o) => sum + o.egentidMinUke, 0);
}

/** DB-fasene som tilsvarer elevens tre perioder. Øvrige faser (testuke, ferie,
 *  samlinger) er ikke egne perioder i elevens årsplan. */
const FASE_TIL_PERIODE: Record<string, PeriodeKey> = {
  GRUNN: "grunn",
  SPESIAL: "spes",
  TURNERING: "turn",
};

/**
 * Kobler elevens lagrede fokusområder til de tre periodene flaten tegner.
 * Returnerer null når eleven ikke har noen — da viser skjermen demoen, merket
 * som eksempel, i stedet for en tom flate uten forklaring.
 */
export function fokusPerPeriode(
  perioder: { id: string; fase: string }[],
  rader: WangFokusomraadeDb[],
): Record<PeriodeKey, PeriodeFokus> | null {
  if (rader.length === 0) return null;

  const idTilKey = new Map<string, PeriodeKey>();
  for (const p of perioder) {
    const key = FASE_TIL_PERIODE[p.fase];
    if (key) idTilKey.set(p.id, key);
  }

  const kart: Record<PeriodeKey, PeriodeFokus> = {
    grunn: { omraader: [], maaling: "", kommentar: null },
    spes: { omraader: [], maaling: "", kommentar: null },
    turn: { omraader: [], maaling: "", kommentar: null },
  };

  let traff = false;
  for (const r of rader) {
    const key = idTilKey.get(r.periodeId);
    if (!key) continue;
    traff = true;
    kart[key].omraader.push({
      id: r.id,
      akse: r.akse,
      tittel: r.tittel,
      egentidMinUke: r.egentidMinUke,
      maalemetode: r.maalemetode,
      status: r.status,
      egenvurdering: r.egenvurdering,
      trenervurdering: r.trenervurdering,
    });
  }
  if (!traff) return null;

  // Målemetodene per periode utledes av områdene selv — det er dem eleven
  // faktisk måles på, og de er allerede avtalt i IUP-samtalen.
  for (const key of ["grunn", "spes", "turn"] as PeriodeKey[]) {
    const metoder = [
      ...new Set(
        kart[key].omraader
          .map((o) => o.maalemetode)
          .filter((m): m is string => !!m),
      ),
    ];
    kart[key].maaling =
      metoder.length > 0
        ? `Måles med: ${metoder.join(" · ")}. Egenvurdering 1–5 ved periodeslutt.`
        : "Egenvurdering 1–5 ved periodeslutt.";
  }

  return kart;
}
