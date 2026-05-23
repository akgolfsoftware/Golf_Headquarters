/**
 * CoachHQ Hjem (/admin/agencyos) — pixel-perfekt v2 (sesjon-1)
 * Spec: sesjon-1-hjem-og-spiller.md, skjerm 2, Variant A · operations cockpit.
 *
 * Server Component med live Prisma + sample-fallback.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CoachHome, type CoachHomeProps } from "@/components/admin/agencyos-v2/coach-home";

export const dynamic = "force-dynamic";

const DAGER = [
  "SØNDAG",
  "MANDAG",
  "TIRSDAG",
  "ONSDAG",
  "TORSDAG",
  "FREDAG",
  "LØRDAG",
];
const MND = [
  "JANUAR",
  "FEBRUAR",
  "MARS",
  "APRIL",
  "MAI",
  "JUNI",
  "JULI",
  "AUGUST",
  "SEPTEMBER",
  "OKTOBER",
  "NOVEMBER",
  "DESEMBER",
];

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min siden`;
  if (s < 86400) return `${Math.floor(s / 3600)} t siden`;
  if (s < 604800) return `${Math.floor(s / 86400)} d siden`;
  return d.toLocaleDateString("nb-NO");
}

export default async function AgencyOSPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const now = new Date();
  const dagStart = new Date(now);
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);

  const ukeStart = new Date(dagStart);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  // Parallell datafetch
  const [
    dagensBookinger,
    ukensBookingerCount,
    burningCount,
    aktiveSpillereCount,
    totaltSpillereCount,
    pendingActions,
    stallSpillere,
    recentMessages,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: {
        startAt: { gte: dagStart, lt: dagSlutt },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      orderBy: { startAt: "asc" },
      include: {
        user: { select: { id: true, name: true } },
        serviceType: { select: { name: true } },
        location: { select: { name: true } },
        facility: { select: { name: true } },
      },
    }),
    prisma.booking.count({
      where: {
        startAt: { gte: ukeStart, lt: ukeSlutt },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
    prisma.planAction.count({ where: { status: "PENDING" } }),
    prisma.user.count({
      where: { role: "PLAYER", lastLoginAt: { gte: tretti } },
    }),
    prisma.user.count({ where: { role: "PLAYER" } }),
    prisma.planAction.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        userStatus: true,
        lastLoginAt: true,
      },
      orderBy: { lastLoginAt: { sort: "desc", nulls: "last" } },
      take: 6,
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const stallHealthPct =
    totaltSpillereCount > 0
      ? Math.round((aktiveSpillereCount / totaltSpillereCount) * 100)
      : 0;

  const timeline: CoachHomeProps["timeline"] = dagensBookinger.map((b) => ({
    id: b.id,
    startTime: b.startAt,
    endTime: b.endAt,
    playerName: b.user?.name ?? b.guestName ?? "Gjest",
    serviceName: b.serviceType?.name ?? "Økt",
    locationName:
      b.location?.name + (b.facility ? ` · ${b.facility.name}` : ""),
  }));

  const burningTasks: CoachHomeProps["burningTasks"] = pendingActions.length
    ? pendingActions.map((a) => ({
        id: a.id,
        title: `${a.actionType} fra ${a.agentName}`,
        deadline: "I dag",
        href: `/admin/godkjenninger#${a.id}`,
      }))
    : [
        {
          id: "demo-1",
          title: "Avklare TrackMan-leie sommer 2026",
          deadline: "I dag 17:00",
          href: "/admin/workspace/tildelt-meg",
        },
        {
          id: "demo-2",
          title: "Send faktura Mulligan",
          deadline: "I dag",
          href: "/admin/finance",
        },
        {
          id: "demo-3",
          title: "Svare Olyo Tour om sponsor",
          deadline: "I dag",
          href: "/admin/innboks",
        },
      ];

  const stallOverview: CoachHomeProps["stallOverview"] = stallSpillere.map(
    (p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      status:
        p.userStatus === "SKADET"
          ? "skadet"
          : p.userStatus === "PERMISJON"
            ? "permisjon"
            : "aktiv",
    }),
  );

  // Workspace tasks — sample fra Notion-stub (lever vi har ikke MCP-data)
  const workspaceTasks: CoachHomeProps["workspaceTasks"] = [
    {
      id: "w1",
      title: "Forberedelse Sørlandsåpent (uke 22)",
      href: "/admin/workspace/tildelt-meg",
    },
    {
      id: "w2",
      title: "Sportsplan-utkast WANG 2026/27",
      href: "/admin/workspace/tildelt-meg",
    },
    {
      id: "w3",
      title: "Foreldremøte Mulligan U16",
      href: "/admin/workspace/tildelt-meg",
    },
  ];

  const formattedMessages: CoachHomeProps["recentMessages"] = recentMessages
    .filter((n) => n.body && n.body.length > 0)
    .map((n) => ({
      id: n.id,
      from: n.title.split(":")[0] ?? "System",
      preview: n.body ?? "",
      timeAgo: timeAgo(n.createdAt),
    }));

  // Hvis ingen meldinger — sample
  const finalMessages: CoachHomeProps["recentMessages"] =
    formattedMessages.length > 0
      ? formattedMessages
      : [
          {
            id: "d1",
            from: "Markus Pedersen",
            preview: "Hei, kan vi flytte onsdag til torsdag? Skole-test.",
            timeAgo: "2 t siden",
          },
          {
            id: "d2",
            from: "Sofie Larsen (forelder)",
            preview: "Påmelding Sørlandsåpent — er det fortsatt mulig?",
            timeAgo: "i går",
          },
          {
            id: "d3",
            from: "Julia Kjær",
            preview: "Test gjennomført — putt-resultat ser bra ut!",
            timeAgo: "i går",
          },
        ];

  const recentApprovals: CoachHomeProps["recentApprovals"] = pendingActions.map(
    (a) => ({
      id: a.id,
      title: `Plan-justering — ${a.agentName}`,
      timeAgo: timeAgo(a.createdAt),
    }),
  );

  const dato = `${DAGER[now.getDay()]} ${now.getDate()}. ${MND[now.getMonth()]} · UKE ${isoWeek(now)}`;

  return (
    <CoachHome
      coachName={user.name}
      isoDateLabel={dato}
      todaysSessionCount={dagensBookinger.length}
      enrolledThisWeek={ukensBookingerCount}
      burningTaskCount={burningCount}
      stallHealthPct={stallHealthPct}
      timeline={timeline}
      burningTasks={burningTasks}
      stallOverview={stallOverview}
      workspaceTasks={workspaceTasks}
      recentMessages={finalMessages}
      recentApprovals={recentApprovals}
    />
  );
}
