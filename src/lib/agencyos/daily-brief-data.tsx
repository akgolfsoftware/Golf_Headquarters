/**
 * Data-loader for AgencyOS-cockpiten (/admin/agencyos).
 * Henter ekte Prisma-data og mapper til CockpitData (serialiserbar —
 * ikoner som navn, rik tekst som segmenter; krysser server→client-grensen).
 *
 * KPI-kilder:
 *   - Aktive spillere: User(PLAYER) m/ innlogging siste 30 d
 *   - Økter i dag: Booking (CONFIRMED/PENDING) i dag
 *   - Ventende godkjenninger: PlanAction PENDING (haster = ESCALATION)
 *   - MRR: aktive PRO-abonnement × 299 kr (kanonisk formel, jf. /admin/agencyos/okonomi)
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type {
  CockpitData,
  CockpitFocusPlayer,
  CockpitInboxItem,
  CockpitKpi,
  CockpitTask,
  CockpitTimelineSession,
  CockpitAxis,
} from "@/components/admin/cockpit/agency-cockpit";

const DAGER = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
const DAGER_KORT = ["SØN", "MAN", "TIR", "ONS", "TOR", "FRE", "LØR"];
const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

/** Kanonisk PRO-pris (kr/mnd) — samme som /admin/agencyos/okonomi. */
const PRO_PRIS_KR = 299;

/** PlanAction.suggestion er JSON-blob — valider med zod før bruk (CLAUDE.md-regel). */
const suggestionSchema = z.object({ forklaring: z.string() });

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function firstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] ?? "Coach";
}

function hhmm(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function greetingFor(hour: number): string {
  if (hour < 10) return "God morgen";
  if (hour < 12) return "God formiddag";
  if (hour < 18) return "God ettermiddag";
  return "God kveld";
}

/**
 * Best-effort pyramide-akse fra tjeneste/notat-tekst.
 * Prioritert rekkefølge + ordgrenser så «Innspill» IKKE matcher «spill»:
 *   «Innspill 50–80» → SLAG · «9-hulls spillsimulering» → SPILL · «Putt-…» → TEK.
 */
function axisFromText(text: string): { axis: CockpitAxis; label: string } {
  const t = text.toLowerCase();
  if (/(turnering|konkurranse|cup|tour\b)/.test(t)) return { axis: "turn", label: "TURN" };
  if (/(fys|styrke|kondisjon|mobilitet)/.test(t)) return { axis: "fys", label: "FYS" };
  if (/(putt|teknikk|sekvens|p[0-9]|gripp|sving)/.test(t)) return { axis: "tek", label: "TEK" };
  if (/(innspill|wedge|chip|pitch|bunker|jern|driver|utslag|range)/.test(t)) return { axis: "slag", label: "SLAG" };
  if (/(\bspill|simulering|runde|bane|9-hull|18-hull)/.test(t)) return { axis: "spill", label: "SPILL" };
  return { axis: "slag", label: "SLAG" };
}

function dayDiff(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

/** Kort kr-format for KPI: 4 200 → «4,2» + k · 148 000 → «148» + k. */
function kpiMoney(kr: number): { value: string; unit?: string } {
  if (kr >= 100_000) return { value: String(Math.round(kr / 1000)), unit: "k" };
  if (kr >= 1000) {
    const k = Math.round((kr / 1000) * 10) / 10;
    return { value: k.toLocaleString("nb-NO", { maximumFractionDigits: 1 }), unit: "k" };
  }
  return { value: String(kr) };
}

function fmtKrKort(kr: number): string {
  if (kr >= 1000) {
    const k = Math.round((kr / 1000) * 10) / 10;
    return `${k.toLocaleString("nb-NO", { maximumFractionDigits: 1 })}k`;
  }
  return `${kr} kr`;
}

function relTid(d: Date | null, now: Date): string {
  if (!d) return "OK";
  const min = Math.max(1, Math.round((now.getTime() - d.getTime()) / 60000));
  if (min < 60) return `${min} m`;
  const t = Math.round(min / 60);
  if (t < 24) return `${t} t`;
  return `${Math.round(t / 24)} d`;
}

export async function loadDailyBrief(coach: {
  id: string;
  name: string | null;
}): Promise<CockpitData> {
  const now = new Date();
  const nowMin = minutesSinceMidnight(now);

  const dagStart = new Date(now);
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);

  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);
  const femDager = new Date(now);
  femDager.setDate(femDager.getDate() - 5);
  const toDognSiden = new Date(now);
  toDognSiden.setHours(toDognSiden.getHours() - 48);

  const [
    dagensBookinger,
    aktiveSpillereCount,
    nyeSpillereCount,
    notifs,
    pendingActions,
    sessionReqs,
    oppgaver,
    inaktiveSpillere,
    pendingApprovalsCount,
    hasterApprovalsCount,
    proAboCount,
    nyeProAbo30d,
    stallSgAgg,
    planScheduledCount,
    planCompletedCount,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: dagStart, lt: dagSlutt }, status: { in: ["CONFIRMED", "PENDING"] } },
      orderBy: { startAt: "asc" },
      include: {
        user: { select: { id: true, name: true } },
        serviceType: { select: { name: true } },
        location: { select: { name: true } },
        facility: { select: { name: true } },
      },
    }),
    prisma.user.count({ where: { role: "PLAYER", lastLoginAt: { gte: tretti } } }),
    prisma.user.count({ where: { role: "PLAYER", createdAt: { gte: tretti } } }),
    prisma.notification.findMany({
      where: { userId: coach.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.planAction.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.sessionRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.oppgaveCache.findMany({
      orderBy: [{ forfaller: { sort: "asc", nulls: "last" } }, { notionLastEdited: "desc" }],
      take: 8,
    }),
    // Fokus: spillere med REELL inaktivitet (har logget inn før, men falt av).
    // Brukere uten lastLoginAt er stubs/aldri-aktiverte — støy, ikke frafall.
    prisma.user.findMany({
      where: { role: "PLAYER", lastLoginAt: { lt: femDager } },
      select: { id: true, name: true, homeClub: true, lastLoginAt: true },
      orderBy: { lastLoginAt: "asc" },
      take: 4,
    }),
    prisma.planAction.count({ where: { status: "PENDING" } }),
    prisma.planAction.count({ where: { status: "PENDING", actionType: "ESCALATION" } }),
    prisma.subscription.count({
      where: { tier: "PRO", status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
    }),
    prisma.subscription.count({
      where: {
        tier: "PRO",
        status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] },
        createdAt: { gte: tretti },
      },
    }),
    // STALL-SG (Anders 2026-06-22): snitt sgTotal alle runder siste 30 d
    // (samme definisjon som /admin/runder — «ingen falske tall»).
    prisma.round.aggregate({
      _avg: { sgTotal: true },
      where: { playedAt: { gte: tretti }, sgTotal: { not: null } },
    }),
    // PLAN-ETTERLEVELSE: planlagte vs fullførte plan-økter siste 30 d (forfalt i vinduet).
    prisma.trainingPlanSession.count({
      where: { scheduledAt: { gte: tretti, lte: now } },
    }),
    prisma.trainingPlanSession.count({
      where: { scheduledAt: { gte: tretti, lte: now }, status: "COMPLETED" },
    }),
  ]);

  // STALL-SG + PLAN-ETTERLEVELSE → KPI-strenger (null/0 → «—», ingen fabrikering).
  const stallSgAvg = stallSgAgg._avg.sgTotal;
  const stallSgKpi =
    stallSgAvg == null
      ? "—"
      : `${stallSgAvg > 0 ? "+" : ""}${(Math.round(stallSgAvg * 10) / 10)
          .toString()
          .replace(".", ",")}`;
  const planAdherenceKpi =
    planScheduledCount > 0
      ? `${Math.round((planCompletedCount / planScheduledCount) * 100)} %`
      : "—";

  // ── Header ─────────────────────────────────────────────
  const aktivBk = dagensBookinger.find(
    (b) => minutesSinceMidnight(b.startAt) <= nowMin && minutesSinceMidnight(b.endAt) > nowMin,
  );
  const nesteBk = dagensBookinger.find((b) => minutesSinceMidnight(b.startAt) > nowMin);
  const aiContext = aktivBk
    ? `${firstName(aktivBk.user?.name)} er i økt nå.`
    : nesteBk
      ? `neste økt ${hhmm(nesteBk.startAt)} med ${firstName(nesteBk.user?.name)}.`
      : dagensBookinger.length === 0
        ? "ingen økter i dag — rom for planlegging."
        : "alle dagens økter er fullført.";

  // ── COL 1: timeline ────────────────────────────────────
  const timeline: CockpitTimelineSession[] = dagensBookinger.map((b, i) => {
    const startMin = minutesSinceMidnight(b.startAt);
    const durMin = Math.max(1, Math.round((b.endAt.getTime() - b.startAt.getTime()) / 60000));
    const isActive = startMin <= nowMin && startMin + durMin > nowMin;
    const title = b.serviceType?.name ?? "Økt";
    const { axis, label } = axisFromText(`${title} ${b.notes ?? ""}`);
    const sted = [b.location?.name, b.facility?.name].filter(Boolean).join(" · ");
    const meta: CockpitTimelineSession["meta"] = [{ icon: "user", text: "1-til-1" }];
    if (sted) meta.push({ icon: "map-pin", text: sted });
    return {
      id: b.id,
      startMin,
      durMin,
      time: hhmm(b.startAt),
      initials: initials(b.user?.name ?? b.guestName),
      avatarTone: isActive ? "primary" : i % 3 === 2 ? "accent" : "default",
      playerName: b.user?.name ?? b.guestName ?? "Gjest",
      axis,
      axisLabel: label,
      title,
      meta,
      href: `/admin/gjennomfore/okter/${b.id}`,
    };
  });

  // ── COL 2: innboks ─────────────────────────────────────
  type Raw = { ts: number; item: CockpitInboxItem };
  const raw: Raw[] = [];
  for (const r of sessionReqs) {
    raw.push({
      ts: r.createdAt.getTime(),
      item: {
        id: `req-${r.id}`,
        initials: initials(r.user?.name),
        name: r.user?.name ?? "Spiller",
        type: "req",
        typeLabel: "FORESPØRSEL",
        preview: r.reason || "Ønsker økt",
        unread: true,
        href: "/admin/foresporsler",
      },
    });
  }
  for (const a of pendingActions) {
    const parsed = suggestionSchema.safeParse(a.suggestion);
    raw.push({
      ts: a.createdAt.getTime(),
      item: {
        id: `appr-${a.id}`,
        initials: initials(a.user?.name ?? a.agentName),
        avatarTone: "primary",
        name: a.user?.name ?? a.agentName,
        type: "appr",
        typeLabel: "GODKJENN",
        preview: parsed.success ? parsed.data.forklaring : a.actionType,
        unread: true,
        href: `/admin/godkjenninger#${a.id}`,
      },
    });
  }
  for (const n of notifs) {
    raw.push({
      ts: n.createdAt.getTime(),
      item: {
        id: `notif-${n.id}`,
        initials: initials(n.title.split(/[:·]/)[0]),
        name: n.title.split(/[:·]/)[0] || "System",
        type: n.type?.toLowerCase().includes("råd") ? "advice" : "msg",
        typeLabel: n.type?.toLowerCase().includes("råd") ? "RÅD" : "MELDING",
        preview: n.body ?? n.title,
        unread: n.readAt == null,
        href: n.link ?? "/admin/innboks",
      },
    });
  }
  raw.sort((a, b) => b.ts - a.ts);
  const inbox = raw.slice(0, 5).map((r) => r.item);

  // ── COL 2: oppgaver (Notion-cache) ─────────────────────
  const tasks: CockpitTask[] = oppgaver.slice(0, 5).map((o) => {
    const done = (o.status ?? "").toLowerCase().includes("ferdig");
    const forfDag = o.forfaller && o.forfaller.toDateString() === now.toDateString();
    return {
      id: o.id,
      label: o.tittel,
      done,
      due: Boolean(forfDag),
      tag: o.forfaller
        ? forfDag
          ? "DAG"
          : o.forfaller.toLocaleDateString("nb-NO", { weekday: "short" }).slice(0, 3).toUpperCase()
        : done
          ? relTid(o.notionLastEdited, now)
          : "—",
    };
  });
  // Fasit-rekkefølge: gjorte øverst (dagens logg), deretter åpne med frist.
  tasks.sort((a, b) => Number(b.done) - Number(a.done));
  const tasksDoneToday = tasks.filter((t) => t.done).length;
  const tasksTotalToday = tasks.length;

  // ── COL 3: trenger oppmerksomhet ───────────────────────
  const focus: CockpitFocusPlayer[] = [];
  // 1) Ønsker veiledning (pending session request)
  for (const r of sessionReqs.slice(0, 1)) {
    focus.push({
      id: `f-req-${r.id}`,
      initials: initials(r.user?.name),
      avatarTone: "accent",
      name: r.user?.name ?? "Spiller",
      meta: "ØNSKER ØKT · FORESPØRSEL",
      signal: { label: "FORESPØRSEL", tone: "info", icon: "help-circle" },
      reason: [
        { text: "Spurt om: " },
        { text: r.reason || "ny økt", style: "b" },
        { text: " Venter på svar fra deg." },
      ],
      actions: [
        { label: "Book økt", icon: "calendar-plus", primary: true, href: "/admin/bookinger/ny" },
        { label: "Svar", icon: "reply", href: "/admin/foresporsler" },
      ],
    });
  }
  // 2) Spillere med reell inaktivitet (falt av — eldste innlogging først)
  for (const p of inaktiveSpillere) {
    if (focus.length >= 4) break;
    if (!p.lastLoginAt) continue;
    const dager = dayDiff(p.lastLoginAt, now);
    focus.push({
      id: `f-inakt-${p.id}`,
      initials: initials(p.name),
      avatarTone: "default",
      name: p.name || "Spiller",
      meta: `${(p.homeClub ?? "—").toUpperCase()} · INAKTIV`,
      alert: dager >= 7,
      signal: {
        label: `${dager} DG INAKTIV`,
        tone: dager >= 7 ? "alert" : "warn",
        icon: "zap-off",
      },
      reason: [
        { text: "Ingen registrert aktivitet siden " },
        {
          text: p.lastLoginAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }),
          style: "em",
        },
        { text: ". Sjekk inn." },
      ],
      actions: [
        { label: "Ring", icon: "phone", primary: true, confirm: `Ringer ${firstName(p.name)} …` },
        { label: "Melding", icon: "message-square", href: "/admin/innboks" },
        { label: "Profil", icon: "user", href: `/admin/spillere/${p.id}` },
      ],
    });
  }
  // Server-default for pinnet kort: mest kritiske (alert), ellers første.
  if (focus.length > 0) {
    const pinIx = focus.findIndex((f) => f.alert);
    focus[pinIx >= 0 ? pinIx : 0].pinned = true;
  }

  // ── KPI-strip ──────────────────────────────────────────
  const doneToday = dagensBookinger.filter((b) => minutesSinceMidnight(b.endAt) <= nowMin).length;
  const activeToday = dagensBookinger.filter(
    (b) => minutesSinceMidnight(b.startAt) <= nowMin && minutesSinceMidnight(b.endAt) > nowMin,
  ).length;
  const leftToday = dagensBookinger.length - doneToday - activeToday;
  const oktBreakdown =
    [
      doneToday ? `${doneToday} ferdig` : null,
      activeToday ? `${activeToday} pågår` : null,
      leftToday ? `${leftToday} igjen` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "ingen i dag";

  const mrrKr = proAboCount * PRO_PRIS_KR;
  const mrr = kpiMoney(mrrKr);
  const nyeMrrKr = nyeProAbo30d * PRO_PRIS_KR;

  const kpis: CockpitKpi[] = [
    {
      label: "AKTIVE SPILLERE",
      value: String(aktiveSpillereCount),
      delta: { text: `+${nyeSpillereCount} denne mnd.`, tone: nyeSpillereCount > 0 ? "up" : "flat" },
      icon: "users",
    },
    {
      label: "ØKTER I DAG",
      value: String(dagensBookinger.length),
      delta: { text: oktBreakdown, tone: "flat" },
      icon: "calendar-clock",
    },
    {
      label: "VENTENDE GODKJENNINGER",
      value: String(pendingApprovalsCount),
      delta:
        hasterApprovalsCount > 0
          ? { text: `${hasterApprovalsCount} haster`, tone: "down" }
          : {
              text: pendingApprovalsCount > 0 ? "ingen haster" : "alle behandlet",
              tone: "flat",
            },
      icon: "check-check",
    },
    {
      label: "MRR",
      value: mrr.value,
      unit: mrr.unit,
      delta:
        nyeProAbo30d > 0
          ? { text: `+${fmtKrKort(nyeMrrKr)} siste 30 d`, tone: "up" }
          : { text: "uendret siste 30 d", tone: "flat" },
      icon: "banknote",
    },
  ];

  const oktOrd = dagensBookinger.length === 1 ? "ØKT" : "ØKTER";

  // Antall live-pågående akkurat nå
  const liveSessionsCount = dagensBookinger.filter(
    (b) => minutesSinceMidnight(b.startAt) <= nowMin && minutesSinceMidnight(b.endAt) > nowMin,
  ).length;

  // Antall ventende forespørsler (sessionRequest PENDING)
  const requestsCount = sessionReqs.length;

  // Dag-label for hybrid topbar, f.eks. "Mandag 15. juni"
  const dayLabel = `${DAGER[now.getDay()]} ${now.getDate()}. ${MND_KORT[now.getMonth()]}`;

  return {
    greeting: greetingFor(now.getHours()),
    coachFirstName: firstName(coach.name),
    aiContext,
    liveLabel: `${DAGER[now.getDay()].toUpperCase()} ${now.getDate()} ${MND_KORT[now.getMonth()].toUpperCase()} · ${hhmm(now)}`,
    timelineDateLabel: `${DAGER_KORT[now.getDay()]} ${now.getDate()} ${MND_KORT[now.getMonth()].toUpperCase()} · ${dagensBookinger.length} ${oktOrd}`,
    now: nowMin,
    timeline,
    // Fasit: telleren ved «Siste 24 t» = antall viste rader (SE ALLE for resten).
    inboxCount: inbox.length,
    inbox,
    tasks,
    tasksDoneToday,
    tasksTotalToday,
    focus,
    focusCount: focus.length,
    kpis,
    activePlayersCount: aktiveSpillereCount,
    stallSgKpi,
    planAdherenceKpi,
    requestsCount,
    liveSessionsCount,
    dayLabel,
  };
}
