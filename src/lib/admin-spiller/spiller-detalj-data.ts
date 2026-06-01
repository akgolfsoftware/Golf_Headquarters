/**
 * Data-loader for AgencyOS Spiller-detalj (/admin/spillere/[id] — oversikt).
 * Pixel-port av public/design-handover/agencyos/components-agency-player-panel.html.
 *
 * Henter ekte Prisma-data og mapper til SpillerDetaljOversiktProps. Skjermen
 * forteller spillerens 30-dagers-historie: KPI (økter/timer/SG-trend),
 * pyramide-adherence vs plan, uke-oversikt med bekreftede bookinger,
 * neste booking og siste kommunikasjon.
 *
 * Mangler data → tomt/utledet, ALDRI falske tall.
 */

import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import type { PyramidArea } from "@/generated/prisma/client";
import type { SpillerDetaljOversiktProps, PyrAxis } from "@/components/admin/spiller-detalj/spiller-detalj-oversikt";

const DOW = ["SØN", "MAN", "TIR", "ONS", "TOR", "FRE", "LØR"];

/** PyramidArea (Prisma) → komponentens akse-key. */
const AREA_TO_AXIS: Record<PyramidArea, PyrAxis> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};

const AXIS_LABEL: Record<PyrAxis, string> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

/** Best-effort pyramide-akse fra tjeneste/notat-tekst (samme heuristikk som daily-brief). */
function axisFromText(text: string): PyrAxis {
  const t = text.toLowerCase();
  if (/(putt|teknikk|sekvens|p[0-9]|gripp|sving|tek)/.test(t)) return "tek";
  if (/(fys|styrke|kondisjon|mobilitet|gym)/.test(t)) return "fys";
  if (/(turnering|konkurranse|cup|tour)/.test(t)) return "turn";
  if (/(spill|runde|bane|simulering|9-hull|18-hull)/.test(t)) return "spill";
  return "slag";
}

function hhmm(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Mandag 00:00 i inneværende ISO-uke. */
function startOfIsoWeek(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/** ISO-ukenummer. */
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

function whenLabel(d: Date, now: Date): string {
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return hhmm(d);
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "i går";
  return `${DOW[d.getDay()].toLowerCase()} ${hhmm(d)}`;
}

export async function loadSpillerDetaljOversikt(playerId: string): Promise<SpillerDetaljOversiktProps> {
  const now = new Date();

  const dagStart = new Date(now);
  dagStart.setHours(0, 0, 0, 0);

  const ukeStart = startOfIsoWeek(now);
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);
  const seksti = new Date(now);
  seksti.setDate(seksti.getDate() - 60);

  const [
    sessions30,
    sessions30Prev,
    ukeSessions,
    rounds30,
    nesteBooking,
    ukeBookinger,
    notifs,
  ] = await Promise.all([
    // Økter siste 30 d (for KPI + pyramide-akse-fordeling)
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId: playerId }, scheduledAt: { gte: tretti, lt: now } },
      select: { durationMin: true, status: true, pyramidArea: true },
    }),
    // Økter forrige 30 d (delta)
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId: playerId }, scheduledAt: { gte: seksti, lt: tretti } },
      select: { durationMin: true, status: true },
    }),
    // Denne ukas planlagte + gjennomførte økter (pyramide-adherence vs plan)
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId: playerId }, scheduledAt: { gte: ukeStart, lt: ukeSlutt } },
      select: { durationMin: true, status: true, pyramidArea: true },
    }),
    // Runder siste 30 d (SG-trend)
    prisma.round.findMany({
      where: { userId: playerId, playedAt: { gte: tretti, lt: now } },
      orderBy: { playedAt: "asc" },
    }),
    // Neste kommende booking
    prisma.booking.findFirst({
      where: { userId: playerId, startAt: { gte: now }, status: { in: ["CONFIRMED", "PENDING"] } },
      orderBy: { startAt: "asc" },
      include: {
        serviceType: { select: { name: true } },
        location: { select: { name: true } },
        facility: { select: { name: true } },
      },
    }),
    // Denne ukas bekreftede bookinger (uke-grid pips)
    prisma.booking.findMany({
      where: {
        userId: playerId,
        startAt: { gte: ukeStart, lt: ukeSlutt },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      orderBy: { startAt: "asc" },
      include: { serviceType: { select: { name: true } } },
    }),
    // Siste varsler/kommunikasjon knyttet til spilleren
    prisma.notification.findMany({
      where: { userId: playerId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  // ── KPI: økter siste 30 d ──────────────────────────────
  const done30 = sessions30.filter((s) => s.status === "COMPLETED");
  const okterNa = done30.length;
  const okterPlan30 = sessions30.length;
  const okterDiff = okterNa - okterPlan30;

  // ── KPI: timer trent siste 30 d ────────────────────────
  const minutter = (rows: { durationMin: number; status: string }[]) =>
    rows.filter((r) => r.status === "COMPLETED").reduce((s, r) => s + (r.durationMin ?? 0), 0);
  const timerNa = minutter(done30) / 60;
  const timerForrige = minutter(sessions30Prev) / 60;
  const timerDelta = timerNa - timerForrige;

  // ── KPI: SG-trend ──────────────────────────────────────
  const sgVals = rounds30.map((r) => r.sgTotal).filter((v): v is number => v != null);
  const sgAgg = aggregateSg(rounds30);
  // trend = snitt nyeste halvdel − snitt eldste halvdel
  let sgTrend: number | null = null;
  if (sgVals.length >= 2) {
    const mid = Math.floor(sgVals.length / 2);
    const eldre = sgVals.slice(0, mid);
    const nyere = sgVals.slice(mid);
    const snitt = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
    sgTrend = snitt(nyere) - snitt(eldre);
  }

  // ── Mini-pyramide: adherence vs plan (denne uka) ───────
  type PyrAcc = { done: number; plan: number };
  const pyrByAxis = new Map<PyrAxis, PyrAcc>();
  for (const s of ukeSessions) {
    const axis = AREA_TO_AXIS[s.pyramidArea];
    const acc = pyrByAxis.get(axis) ?? { done: 0, plan: 0 };
    acc.plan += s.durationMin ?? 0;
    if (s.status === "COMPLETED") acc.done += s.durationMin ?? 0;
    pyrByAxis.set(axis, acc);
  }
  // Fast akse-rekkefølge (matcher FASIT: TURN → SPILL → SLAG → TEK → FYS)
  const PYR_ORDER: PyrAxis[] = ["turn", "spill", "slag", "tek", "fys"];
  const pyramid = PYR_ORDER.filter((axis) => pyrByAxis.has(axis)).map((axis) => {
    const acc = pyrByAxis.get(axis)!;
    const doneH = acc.done / 60;
    const planH = acc.plan / 60;
    const ratio = planH > 0 ? doneH / planH : 0;
    return {
      axis,
      label: AXIS_LABEL[axis],
      doneHours: doneH,
      targetHours: planH,
      pct: Math.min(100, Math.round(ratio * 100)),
      alarm: planH > 0 && ratio < 0.5,
    };
  });

  // ── Uke-oversikt (7 dager, MAN→SØN) ────────────────────
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ukeStart);
    d.setDate(d.getDate() + i);
    const pips: PyrAxis[] = ukeBookinger
      .filter((b) => b.startAt.toDateString() === d.toDateString())
      .map((b) => axisFromText(`${b.serviceType?.name ?? ""} ${b.notes ?? ""}`));
    return {
      dow: DOW[d.getDay()],
      date: d.getDate(),
      today: d.toDateString() === dagStart.toDateString(),
      pips,
    };
  });

  // ── Neste booking ──────────────────────────────────────
  const nextBooking = nesteBooking
    ? (() => {
        const durMin = Math.max(
          1,
          Math.round((nesteBooking.endAt.getTime() - nesteBooking.startAt.getTime()) / 60000),
        );
        const sted = [nesteBooking.location?.name, nesteBooking.facility?.name].filter(Boolean).join(" · ");
        const axis = axisFromText(`${nesteBooking.serviceType?.name ?? ""} ${nesteBooking.notes ?? ""}`);
        return {
          dow: DOW[nesteBooking.startAt.getDay()],
          date: nesteBooking.startAt.getDate(),
          title: nesteBooking.serviceType?.name ?? "Økt",
          time: hhmm(nesteBooking.startAt),
          durMin,
          location: sted || null,
          axis,
          axisLabel: AXIS_LABEL[axis],
        };
      })()
    : null;

  // ── Siste kommunikasjon ────────────────────────────────
  const comms = notifs.map((n) => {
    const who = n.title.split(/[:·]/)[0]?.trim() || "System";
    const erRaad = n.type?.toLowerCase().includes("råd");
    return {
      id: n.id,
      initials: initials(who),
      coach: erRaad,
      who,
      type: erRaad ? "RÅD" : null,
      preview: n.body ?? n.title,
      when: whenLabel(n.createdAt, now),
    };
  });

  return {
    weekLabel: `UKE ${isoWeek(now)}`,
    kpi: {
      okter: { value: okterNa, plan: okterPlan30, diff: okterDiff },
      timer: { hours: timerNa, delta: timerDelta },
      sgTrend,
      sgTrendLabel: sgTrend != null ? formatSg(sgTrend) : "—",
      sgRoundCount: sgAgg.rundeAntall,
    },
    sgSparkline: sgVals,
    pyramid,
    week,
    nextBooking,
    comms,
  };
}
