/**
 * CoachHQ Hjem (/admin/agencyos) — pixel-perfekt v2 (sesjon-1)
 * Spec: sesjon-1-hjem-og-spiller.md, skjerm 2, Variant A · operations cockpit.
 *
 * Server Component med live Prisma + sample-fallback.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  CoachHome,
  type CoachHomeProps,
  type SgTile,
} from "@/components/admin/agencyos-v2/coach-home";
import { aggregateByArea, prosentPerArea, PYR_LABEL } from "@/lib/pyramide";

export const dynamic = "force-dynamic";

// Pyramide-visning topp→bunn: Turnering først, Fysisk sist (jf. designsystem).
const PYR_ORDER = ["TURN", "SPILL", "SLAG", "TEK", "FYS"] as const;
const PYR_TONE = {
  FYS: "pyr-fys",
  TEK: "pyr-tek",
  SLAG: "pyr-slag",
  SPILL: "pyr-spill",
  TURN: "pyr-turn",
} as const;

// SG-tile: norsk format med ekte fortegn + tone.
function sgTile(label: string, v: number | null | undefined): SgTile {
  if (v == null) return { label, value: "—", tone: "neutral" };
  const s = Math.abs(v).toFixed(2).replace(".", ",");
  return {
    label,
    value: v > 0 ? `+${s}` : v < 0 ? `−${s}` : s,
    tone: v > 0 ? "good" : v < 0 ? "bad" : "neutral",
  };
}

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

  // Fokus-spiller: neste spiller i dagens timeline, ellers første i stallen.
  const focusId =
    dagensBookinger.find((b) => b.user?.id)?.user?.id ?? stallSpillere[0]?.id ?? null;

  let focusPlayer: CoachHomeProps["focusPlayer"] = null;
  if (focusId) {
    const [fp, fpSessions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: focusId },
        select: {
          id: true,
          name: true,
          hcp: true,
          sgInputs: {
            orderBy: { dato: "desc" },
            take: 1,
            select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
          },
          _count: { select: { sgInputs: true } },
        },
      }),
      prisma.trainingPlanSession.findMany({
        where: { plan: { userId: focusId }, scheduledAt: { gte: tretti } },
        select: { pyramidArea: true, durationMin: true },
      }),
    ]);

    if (fp) {
      const sg = fp.sgInputs[0] ?? null;
      const nextBk = dagensBookinger.find(
        (b) => b.user?.id === fp.id && b.startAt >= now,
      );
      const pct = prosentPerArea(aggregateByArea(fpSessions));
      focusPlayer = {
        id: fp.id,
        name: fp.name || "Ukjent",
        hcpLabel: `Hcp ${fp.hcp != null ? fp.hcp.toFixed(1).replace(".", ",") : "—"}`,
        roundsLabel: `${fp._count.sgInputs} SG-runder`,
        nextLabel: nextBk
          ? `Klar ${nextBk.startAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`
          : "Ingen økt i dag",
        online: Boolean(nextBk),
        sg: [
          sgTile("SG Tee→green", sg?.sgOtt),
          sgTile("SG Approach", sg?.sgApp),
          sgTile("SG Nærspill", sg?.sgArg),
          sgTile("SG Putt", sg?.sgPutt),
        ],
        pyramid: PYR_ORDER.map((a) => ({
          label: PYR_LABEL[a],
          fillPercent: pct[a],
          value: `${pct[a]} %`,
          tone: PYR_TONE[a],
        })),
      };
    }
  }

  return (
    <CoachHome
      coachName={user.name}
      isoDateLabel={dato}
      todaysSessionCount={dagensBookinger.length}
      enrolledThisWeek={ukensBookingerCount}
      burningTaskCount={burningCount}
      stallHealthPct={stallHealthPct}
      focusPlayer={focusPlayer}
      timeline={timeline}
      burningTasks={burningTasks}
      stallOverview={stallOverview}
      workspaceTasks={workspaceTasks}
      recentMessages={finalMessages}
      recentApprovals={recentApprovals}
    />
  );
}
