/**
 * Mapper: ekte Prisma/loader-data → v10 SpillerDetaljData.
 *
 * Oversetter spillerens identitet (User) + SpillerDetaljOversiktProps
 * (fra loadSpillerDetaljOversikt) til prop-shapen <SpillerDetalj> forventer.
 * Tom-tilstander bevares: booking=null, comms=[], pyramid=[] gir tomme
 * seksjoner i komponenten. ALDRI liksom-tall — alt utledes fra ekte data.
 *
 * Følger samme mønster som mapHjemData i src/app/portal/page.tsx.
 */

import { Trophy } from "lucide-react";
import type { SpillerDetaljOversiktProps } from "@/components/admin/spiller-detalj/spiller-detalj-oversikt";
import type {
  SpillerDetaljData,
  SpillerKpi,
} from "@/components/admin/spiller-detalj/spiller-detalj";

/** Spillerens identitet hentet fra User-raden. */
export type SpillerIdent = {
  id: string;
  name: string;
  initials: string;
  /** Formatert HCP, f.eks. "+1,4". */
  hcp: string;
  /** Hjemmeklubb/gruppe-label. Tom streng → utelates. */
  group: string;
  tierLabel: string;
  /** Coach-navn (aktiv enrolling). Tom streng → "—". */
  coachName: string;
};

/** "−2,4 t" / "+1 vs plan"-stil delta-tekst. */
function deltaTone(diff: number): "up" | "down" | "flat" {
  if (diff > 0) return "up";
  if (diff < 0) return "down";
  return "flat";
}

function signed(value: number, decimals = 0): string {
  const rounded = value.toFixed(decimals).replace(".", ",");
  return value > 0 ? `+${rounded}` : rounded;
}

export function mapSpillerDetalj(
  ident: SpillerIdent,
  o: SpillerDetaljOversiktProps,
): SpillerDetaljData {
  // ── KPI-tiles (siste 30 dager) ──────────────────────────
  const kpis: SpillerKpi[] = [
    {
      label: "ØKTER",
      value: String(o.kpi.okter.value),
      delta:
        o.kpi.okter.diff !== 0
          ? { text: `${signed(o.kpi.okter.diff)} vs plan`, tone: deltaTone(o.kpi.okter.diff) }
          : undefined,
    },
    {
      label: "TIM. TRENT",
      value: `${o.kpi.timer.hours.toFixed(1).replace(".", ",")} t`,
      delta:
        Math.abs(o.kpi.timer.delta) >= 0.1
          ? { text: `${signed(o.kpi.timer.delta, 1)} t`, tone: deltaTone(o.kpi.timer.delta) }
          : undefined,
    },
    {
      label: "SG-TREND",
      value: o.kpi.sgTrendLabel,
      tone: o.kpi.sgTrend == null ? "flat" : o.kpi.sgTrend > 0 ? "pos" : o.kpi.sgTrend < 0 ? "neg" : "flat",
      delta:
        o.kpi.sgRoundCount > 0
          ? { text: `${o.kpi.sgRoundCount} runder`, tone: "flat" }
          : undefined,
    },
  ];

  // ── Status-pille: utledet fra pyramide-alarm (ekte adherence) ──
  const harAlarm = o.pyramid.some((p) => p.alarm);
  const status: SpillerDetaljData["status"] = harAlarm
    ? { label: "Bak plan", tone: "warn" }
    : { label: "På plan", tone: "ok" };

  // ── Pyramide-rader: targetPct alltid 100 (full target = barens lengde) ──
  const pyramid = o.pyramid.map((p) => ({
    key: p.axis,
    label: p.label,
    pct: p.pct,
    targetPct: 100,
    value: `${p.doneHours.toFixed(1).replace(".", ",")} / ${p.targetHours
      .toFixed(1)
      .replace(".", ",")} t`,
    alarm: p.alarm,
  }));

  const week = o.week.map((d) => ({
    dow: d.dow,
    date: String(d.date),
    pips: d.pips,
    today: d.today,
  }));

  const booking: SpillerDetaljData["booking"] = o.nextBooking
    ? {
        dow: o.nextBooking.dow,
        date: String(o.nextBooking.date),
        title: o.nextBooking.title,
        time: `${o.nextBooking.time} · ${o.nextBooking.durMin} m`,
        location: o.nextBooking.location ?? "—",
        axis: { label: o.nextBooking.axisLabel, key: o.nextBooking.axis },
      }
    : null;

  const comms = o.comms.map((c) => ({
    id: c.id,
    initials: c.initials,
    coach: c.coach,
    who: c.who,
    type: c.type ? { label: c.type, appr: c.type.toUpperCase() === "GODKJENN" } : undefined,
    preview: c.preview,
    when: c.when,
  }));

  return {
    id: ident.id,
    initials: ident.initials,
    name: ident.name,
    hcp: ident.hcp,
    group: ident.group || "—",
    tier: { label: ident.tierLabel, icon: Trophy },
    coachName: ident.coachName || "—",
    status,
    // Ingen alarm-pille uten konkret hendelse — utelates (tom-tilstand).
    kpiHeading: "SISTE 30 DAGER",
    kpis,
    pyramidHeading: `PYRAMIDE · ${o.weekLabel} / PLAN`,
    pyramid,
    weekHeading: `${o.weekLabel} · MAN → SØN`,
    week,
    booking,
    comms,
  };
}
