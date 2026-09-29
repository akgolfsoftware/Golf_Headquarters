/**
 * Visningsdata for Cockpit (AG-01) i Precision Athletics. Ren omforming av
 * det sida allerede laster (loadDailyBrief, lastGodkjenninger,
 * lastCockpitTillegg, loadFokusSpillere) — ingen spørringer, ingen anslag.
 * Mangler et tall, blir det «—».
 */
import type { CockpitData } from "@/components/admin/cockpit/agency-cockpit";
import type { AdminGodkjenningV2Row } from "@/components/admin/v2/AdminGodkjenningerV2";
import type { FokusData } from "@/lib/agencyos/fokus-spillere";
import type { CockpitTillegg } from "./cockpit-tillegg-regler";

/** Kalenderstripen går fra 05:00 til 22:00 (beslutninger.md §SKJERMENE … RUNDE 8). */
export const KAL_START_MIN = 5 * 60;
export const KAL_SLUTT_MIN = 22 * 60;

export type KalenderStatus = "ferdig" | "pagar" | "neste" | "planlagt";
export type CockpitKalenderRad = {
  id: string;
  start: string;
  slutt: string;
  startMin: number;
  sluttMin: number;
  tittel: string;
  hvem: string;
  sted: string | null;
  status: KalenderStatus;
  href: string | null;
};
export type CockpitVenterRad = { id: string; hvem: string; tittel: string; detalj: string | null; nar: string; haster: boolean };
export type CockpitOppgave = { id: string; tittel: string; ferdig: boolean; fristIDag: boolean; tag: string };
export type CockpitNokkel = { label: string; verdi: string; kilde: string };

export type AG01Data = {
  kicker: string;
  klokke: string;
  naaMin: number;
  kalender: CockpitKalenderRad[];
  venter: { totalt: number; rader: CockpitVenterRad[] };
  oppgaver: CockpitOppgave[];
  turneringer: CockpitTillegg["turneringer"];
  utenforPlan: CockpitTillegg["utenforPlan"];
  utenforPlanUker: string;
  nokkeltall: CockpitNokkel[];
  /** Bare head coach (ADMIN). null = skjult. */
  okonomi: CockpitNokkel[] | null;
  /** null = fokusdata kunne ikke lastes. */
  fokus: FokusData | null;
};

export function hhmm(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Posisjon i prosent på stripen 05–22, klemt til 0–100. */
export function kalPst(min: number): number {
  const p = ((min - KAL_START_MIN) / (KAL_SLUTT_MIN - KAL_START_MIN)) * 100;
  return Math.max(0, Math.min(100, p));
}

export function kalenderRader(timeline: CockpitData["timeline"], naaMin: number): CockpitKalenderRad[] {
  const sortert = [...timeline].sort((a, b) => a.startMin - b.startMin);
  const nesteId = sortert.find((o) => o.startMin > naaMin)?.id ?? null;
  return sortert.map((o) => {
    const sluttMin = o.startMin + o.durMin;
    const status: KalenderStatus =
      naaMin >= sluttMin ? "ferdig" : naaMin >= o.startMin ? "pagar" : o.id === nesteId ? "neste" : "planlagt";
    const sted = o.meta.find((m) => m.icon === "map-pin")?.text ?? null;
    return {
      id: o.id,
      start: hhmm(o.startMin),
      slutt: hhmm(sluttMin),
      startMin: o.startMin,
      sluttMin,
      tittel: o.title,
      hvem: o.playerName,
      sted,
      status,
      href: o.href ?? null,
    };
  });
}

function kpi(data: CockpitData, label: string) {
  return data.kpis.find((k) => k.label === label) ?? null;
}

export function byggAG01Data(inn: {
  brief: CockpitData;
  ko: { totalt?: number | null; rows: AdminGodkjenningV2Row[] };
  tillegg: CockpitTillegg;
  fokus: FokusData | null;
  erHeadCoach: boolean;
  kicker: string;
  klokke: string;
}): AG01Data {
  const { brief, ko, tillegg } = inn;
  const okter = kpi(brief, "ØKTER I DAG");
  const nokkeltall: CockpitNokkel[] = [
    { label: "Aktive spillere", verdi: String(brief.activePlayersCount), kilde: "INNLOGGET SISTE 30 DAGER · EGEN STALL" },
    { label: "Økter i dag", verdi: okter?.value ?? "—", kilde: (okter?.delta?.text ?? "—").toUpperCase() },
    { label: "Strokes Gained, snitt", verdi: brief.stallSgKpi, kilde: "RUNDER SISTE 30 DAGER · EGEN STALL" },
    { label: "Planøkter gjennomført", verdi: brief.planAdherenceKpi, kilde: "FULLFØRTE AV PLANLAGTE · ALLE PLANER · 30 DAGER" },
  ];
  let okonomi: CockpitNokkel[] | null = null;
  if (inn.erHeadCoach) {
    const mrr = kpi(brief, "MRR");
    okonomi = [
      { label: "MRR", verdi: mrr ? `${mrr.value}${mrr.unit ?? ""}` : "—", kilde: "AKTIVE PRO-ABONNEMENT × 299 KR" },
      {
        label: "Dagens bookingverdi",
        verdi: brief.dagensVerdiKr == null ? "—" : `${brief.dagensVerdiKr.toLocaleString("nb-NO")} kr`,
        kilde: "BEKREFTEDE OG VENTENDE BOOKINGER I DAG",
      },
    ];
  }
  return {
    kicker: inn.kicker,
    klokke: inn.klokke,
    naaMin: brief.now,
    kalender: kalenderRader(brief.timeline, brief.now),
    venter: {
      totalt: ko.totalt ?? ko.rows.length,
      rader: ko.rows.slice(0, 4).map((r) => ({
        id: r.id,
        hvem: r.who,
        tittel: r.title,
        detalj: r.detail || null,
        nar: r.when,
        haster: Boolean(r.urgent),
      })),
    },
    oppgaver: brief.tasks.map((t) => ({ id: t.id, tittel: t.label, ferdig: Boolean(t.done), fristIDag: Boolean(t.due), tag: t.tag })),
    turneringer: tillegg.turneringer,
    utenforPlan: tillegg.utenforPlan,
    utenforPlanUker: tillegg.utenforPlanUker,
    nokkeltall,
    okonomi,
    fokus: inn.fokus,
  };
}
