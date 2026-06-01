/**
 * Data-loader for AgencyOS Daglig brief (/admin/agencyos).
 * Henter ekte Prisma-data og mapper til DailyBriefProps. Delt mellom den
 * gated siden og coach-preview (screenshot-rute) så de er garantert identiske.
 */

import { prisma } from "@/lib/prisma";
import {
  BriefIcons,
  type DailyBriefProps,
  type TimelineSession,
  type InboxItem,
  type TaskItem,
  type FocusPlayer,
  type BriefAxis,
} from "@/components/admin/agencyos/daily-brief";

const DAGER = ["SØNDAG", "MANDAG", "TIRSDAG", "ONSDAG", "TORSDAG", "FREDAG", "LØRDAG"];
const MND = [
  "JANUAR", "FEBRUAR", "MARS", "APRIL", "MAI", "JUNI",
  "JULI", "AUGUST", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER",
];

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

/** Best-effort pyramide-akse fra tjeneste/notat-tekst. */
function axisFromText(text: string): { axis: BriefAxis; label: string } {
  const t = text.toLowerCase();
  if (/(putt|teknikk|sekvens|p[0-9]|gripp|sving)/.test(t)) return { axis: "tek", label: "TEK" };
  if (/(fys|styrke|kondisjon|mobilitet)/.test(t)) return { axis: "fys", label: "FYS" };
  if (/(spill|runde|bane|simulering|9-hull|18-hull)/.test(t)) return { axis: "spill", label: "SPILL" };
  if (/(turnering|konkurranse|cup|tour)/.test(t)) return { axis: "turn", label: "TURN" };
  return { axis: "slag", label: "SLAG" };
}

function dayDiff(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

function whenLabel(d: Date, now: Date): string {
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return hhmm(d);
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return `i går ${hhmm(d)}`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export async function loadDailyBrief(coach: {
  id: string;
  name: string | null;
}): Promise<DailyBriefProps> {
  const now = new Date();
  const nowMin = minutesSinceMidnight(now);

  const dagStart = new Date(now);
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);

  const ukeStart = new Date(dagStart);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);
  const forrigeUkeStart = new Date(ukeStart);
  forrigeUkeStart.setDate(forrigeUkeStart.getDate() - 7);

  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);
  const seksti = new Date(now);
  seksti.setDate(seksti.getDate() - 60);
  const femDager = new Date(now);
  femDager.setDate(femDager.getDate() - 5);

  const [
    dagensBookinger,
    ukensBookingerCount,
    forrigeUkeCount,
    aktiveSpillereCount,
    nyeSpillereCount,
    notifs,
    pendingActions,
    sessionReqs,
    oppgaver,
    treningSessions,
    treningSessionsForrige,
    inaktiveSpillere,
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
    prisma.booking.count({
      where: { startAt: { gte: ukeStart, lt: ukeSlutt }, status: { in: ["CONFIRMED", "PENDING"] } },
    }),
    prisma.booking.count({
      where: { startAt: { gte: forrigeUkeStart, lt: ukeStart }, status: { in: ["CONFIRMED", "PENDING"] } },
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
    prisma.trainingPlanSession.findMany({
      where: { scheduledAt: { gte: tretti, lt: now } },
      select: { durationMin: true },
    }),
    prisma.trainingPlanSession.findMany({
      where: { scheduledAt: { gte: seksti, lt: tretti } },
      select: { durationMin: true },
    }),
    prisma.user.findMany({
      where: {
        role: "PLAYER",
        OR: [{ lastLoginAt: { lt: femDager } }, { lastLoginAt: null }],
      },
      select: { id: true, name: true, homeClub: true, lastLoginAt: true },
      orderBy: { lastLoginAt: { sort: "asc", nulls: "first" } },
      take: 4,
    }),
  ]);

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
  const timeline: TimelineSession[] = dagensBookinger.map((b, i) => {
    const startMin = minutesSinceMidnight(b.startAt);
    const durMin = Math.max(1, Math.round((b.endAt.getTime() - b.startAt.getTime()) / 60000));
    const isActive = startMin <= nowMin && startMin + durMin > nowMin;
    const title = b.serviceType?.name ?? "Økt";
    const { axis, label } = axisFromText(`${title} ${b.notes ?? ""}`);
    const sted = [b.location?.name, b.facility?.name].filter(Boolean).join(" · ");
    const meta: TimelineSession["meta"] = [{ icon: BriefIcons.UserIcon, text: "1-til-1" }];
    if (sted) meta.push({ icon: BriefIcons.MapPin, text: sted });
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
  type Raw = { ts: number; item: InboxItem };
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
        when: whenLabel(r.createdAt, now),
        unread: true,
        href: "/admin/foresporsler",
      },
    });
  }
  for (const a of pendingActions) {
    raw.push({
      ts: a.createdAt.getTime(),
      item: {
        id: `appr-${a.id}`,
        initials: initials(a.agentName),
        avatarTone: "primary",
        name: a.agentName,
        type: "appr",
        typeLabel: "GODKJENN",
        preview: a.actionType,
        when: whenLabel(a.createdAt, now),
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
        when: whenLabel(n.createdAt, now),
        unread: n.readAt == null,
        href: n.link ?? "/admin/innboks",
      },
    });
  }
  raw.sort((a, b) => b.ts - a.ts);
  const inbox = raw.slice(0, 6).map((r) => r.item);
  const inboxUnread = inbox.filter((i) => i.unread).length;

  // ── COL 2: oppgaver (Notion-cache) ─────────────────────
  const tasks: TaskItem[] = oppgaver.slice(0, 5).map((o) => {
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
          ? "OK"
          : "—",
    };
  });
  const tasksDoneToday = tasks.filter((t) => t.done).length;
  const tasksTotalToday = tasks.length;

  // ── COL 3: trenger oppmerksomhet ───────────────────────
  const focus: FocusPlayer[] = [];
  // 1) Ønsker veiledning (pending session request)
  for (const r of sessionReqs.slice(0, 1)) {
    focus.push({
      id: `f-req-${r.id}`,
      initials: initials(r.user?.name),
      avatarTone: "default",
      name: r.user?.name ?? "Spiller",
      meta: "ØNSKER ØKT · FORESPØRSEL",
      signal: { label: "ØNSKER VEILEDNING", tone: "lime", icon: BriefIcons.Hand },
      reason: <>Spurt om hjelp: <b className="font-bold">{r.reason || "ny økt"}</b>. Plan-utkast venter.</>,
      actions: [
        { label: "Book økt", icon: BriefIcons.CalendarPlus, primary: true, href: "/admin/bookinger/ny" },
        { label: "Svar", icon: BriefIcons.Reply, href: "/admin/foresporsler" },
      ],
    });
  }
  // 2) Inaktive spillere
  for (const p of inaktiveSpillere) {
    if (focus.length >= 3) break;
    const dager = p.lastLoginAt ? dayDiff(p.lastLoginAt, now) : null;
    focus.push({
      id: `f-inakt-${p.id}`,
      initials: initials(p.name),
      avatarTone: "default",
      name: p.name || "Spiller",
      meta: `${(p.homeClub ?? "—").toUpperCase()} · INAKTIV`,
      alert: dager == null || dager >= 7,
      signal: {
        label: dager == null ? "ALDRI AKTIV" : `${dager} DG INAKTIV`,
        tone: dager != null && dager >= 7 ? "alert" : "warn",
        icon: BriefIcons.ZapOff,
      },
      reason: (
        <>
          Ingen registrert aktivitet
          {p.lastLoginAt ? (
            <> siden <em className="not-italic font-mono text-[10px] font-bold text-muted-foreground">{p.lastLoginAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}</em></>
          ) : (
            " ennå"
          )}
          . Sjekk inn.
        </>
      ),
      actions: [
        { label: "Ring", icon: BriefIcons.Phone, primary: true },
        { label: "Melding", icon: BriefIcons.MessageSquare, href: "/admin/innboks" },
        { label: "Profil", icon: BriefIcons.UserIcon, href: `/admin/spillere/${p.id}` },
      ],
    });
  }

  // ── KPI-strip ──────────────────────────────────────────
  const doneToday = dagensBookinger.filter((b) => minutesSinceMidnight(b.endAt) <= nowMin).length;
  const activeToday = dagensBookinger.filter(
    (b) => minutesSinceMidnight(b.startAt) <= nowMin && minutesSinceMidnight(b.endAt) > nowMin,
  ).length;
  const leftToday = dagensBookinger.length - doneToday - activeToday;
  const oktBreakdown = [
    doneToday ? `${doneToday} fullført` : null,
    activeToday ? `${activeToday} pågår` : null,
    leftToday ? `${leftToday} igjen` : null,
  ]
    .filter(Boolean)
    .join(" · ") || "ingen i dag";

  const timerNa = Math.round(treningSessions.reduce((s, x) => s + (x.durationMin ?? 0), 0) / 60);
  const timerForrige = Math.round(treningSessionsForrige.reduce((s, x) => s + (x.durationMin ?? 0), 0) / 60);
  const timerDelta = timerNa - timerForrige;
  const ukeDelta = ukensBookingerCount - forrigeUkeCount;

  const kpis: DailyBriefProps["kpis"] = [
    {
      label: "AKTIVE SPILLERE",
      value: String(aktiveSpillereCount),
      delta: { text: `+${nyeSpillereCount} denne mnd.`, tone: nyeSpillereCount > 0 ? "up" : "flat" },
      icon: BriefIcons.Users,
      spark: { type: "line", values: [3, 4, 5, 7, 9, 11, 13] },
    },
    {
      label: "ØKTER I DAG",
      value: String(dagensBookinger.length),
      delta: { text: oktBreakdown, tone: "flat" },
      icon: BriefIcons.CalendarClock,
      spark: { type: "bar", values: [5, 9, 11, 7, 5, 10, 4], barActive: activeToday ? 2 : -1 },
    },
    {
      label: "BOOKINGER · DENNE UKA",
      value: String(ukensBookingerCount),
      delta: {
        text: ukeDelta >= 0 ? `+${ukeDelta} vs forrige uke` : `${ukeDelta} vs forrige uke`,
        tone: ukeDelta > 0 ? "up" : ukeDelta < 0 ? "down" : "flat",
      },
      icon: BriefIcons.Clock,
      spark: { type: "line", values: [8, 11, 9, 12, 10, 13, ukensBookingerCount] },
    },
    {
      label: "TRENINGSTIMER · STALLEN",
      value: String(timerNa),
      unit: "t",
      delta: {
        text: timerDelta >= 0 ? `+${timerDelta} t vs 30 d` : `${timerDelta} t vs 30 d`,
        tone: timerDelta > 0 ? "up" : timerDelta < 0 ? "down" : "flat",
      },
      icon: BriefIcons.Activity,
      spark: { type: "line", values: [16, 14, 18, 20, 19, 24, 26] },
    },
  ];

  return {
    coachFirstName: firstName(coach.name),
    aiContext,
    dateLabel: `${DAGER[now.getDay()]} ${now.getDate()} ${MND[now.getMonth()]}`,
    timeLabel: hhmm(now),
    timelineDateLabel: `${DAGER[now.getDay()]} ${now.getDate()} ${MND[now.getMonth()]} · ${dagensBookinger.length} ØKTER`,
    now: nowMin,
    timeline,
    inboxCount: raw.length,
    inboxUnread,
    inbox,
    tasks,
    tasksDoneToday,
    tasksTotalToday,
    focus,
    kpis,
  };
}
