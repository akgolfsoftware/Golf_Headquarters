import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyosSidebar, type SidebarCounts } from "./agencyos-sidebar";
import { AgencyosTopbar, type ScopeGroup, type ScopePlayer } from "./agencyos-topbar";
import { AgencyosMobileNav } from "./agencyos-mobile-nav";
import { GlobalSearchModal } from "./global-search-modal";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * AgencyOS-skall — fasit `agencyos-app` (mørkt, desktop). `.dark`-scopen her er
 * det som håndhever «AgencyOS alltid mørkt» (låst beslutning) for hele /admin.
 */
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const dagStart = new Date();
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);

  const [
    playerCount,
    groupCount,
    bookingCount,
    requestCount,
    approvalCount,
    sessionsToday,
    openTasks,
    unreadNotifications,
    scopePlayers,
    scopeGroups,
  ] = await Promise.all([
      prisma.user.count({ where: { role: "PLAYER" } }),
      prisma.group.count(),
      prisma.booking.count({ where: { startAt: { gte: new Date() } } }).catch(() => 0),
      prisma.sessionRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.planAction.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.booking
        .count({ where: { startAt: { gte: dagStart, lt: dagSlutt }, status: { not: "CANCELLED" } } })
        .catch(() => 0),
      prisma.oppgaveCache
        .count({ where: { NOT: { status: { in: ["DONE", "Ferdig", "Gjort"] } } } })
        .catch(() => 0),
      prisma.notification.count({ where: { userId: user.id, readAt: null } }).catch(() => 0),
      prisma.user.findMany({
        where: { role: "PLAYER" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          homeClub: true,
          groupMemberships: {
            take: 1,
            select: { group: { select: { name: true, level: true } } },
          },
        },
      }),
      prisma.group.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          members: { take: 3, select: { user: { select: { name: true } } } },
          _count: { select: { members: true } },
        },
      }),
    ]);

  const counts: SidebarCounts = {
    tasks: openTasks,
    assigned: approvalCount + requestCount,
    players: playerCount,
    groups: groupCount,
    bookings: bookingCount,
    requests: requestCount,
    approvals: approvalCount,
  };

  const dagensSpillere = new Set(
    (
      await prisma.booking
        .findMany({
          where: { startAt: { gte: dagStart, lt: dagSlutt }, userId: { not: null } },
          select: { userId: true },
        })
        .catch(() => [] as { userId: string | null }[])
    ).map((b) => b.userId),
  );

  const players: ScopePlayer[] = scopePlayers
    .map((p) => {
      const g = p.groupMemberships[0]?.group;
      const meta = g ? [g.name, g.level].filter(Boolean).join(" · ") : (p.homeClub ?? "AK Golf");
      return {
        id: p.id,
        name: p.name,
        initials: initialsOf(p.name),
        meta: meta.toUpperCase(),
        tone: dagensSpillere.has(p.id) ? ("pri" as const) : ("neu" as const),
      };
    })
    .sort((a, b) => Number(b.tone === "pri") - Number(a.tone === "pri"));

  const groups: ScopeGroup[] = scopeGroups.map((g) => ({
    id: g.id,
    name: g.name,
    players: g._count.members,
    initials: g.members.map((m) => initialsOf(m.user.name)),
  }));

  const workbenchHref = players[0]
    ? `/admin/spillere/${players[0].id}/workbench`
    : "/admin/coach-workbench";

  return (
    <div className="dark flex min-h-screen min-h-dvh bg-background text-foreground antialiased [color-scheme:dark]">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Hopp til hovedinnhold
      </a>
      <div className="hidden md:flex">
        <AgencyosSidebar
          counts={counts}
          sessionsToday={sessionsToday}
          coach={{ name: user.name, role: "Head coach · PGA Pro", initials: initialsOf(user.name) }}
          org={{ name: "GFGK Akademi", players: playerCount, tier: "PRO" }}
          workbenchHref={workbenchHref}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobil-topbar (< md): brand-mark + AGENCYOS + varselklokke */}
        <div className="flex items-center gap-2.5 border-b border-[var(--color-coach-sidebar-border)] bg-[var(--color-coach-sidebar)] px-4 py-2 md:hidden">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent">
            <Image src="/logos/ak-golf-logo-primary-mono.svg" alt="AK" width={20} height={20} />
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-foreground">
            AgencyOS
          </span>
          <Link
            href="/admin/foresporsler"
            aria-label="Varsler"
            className="relative ml-auto inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
            {unreadNotifications > 0 && (
              <span
                className="absolute right-[11px] top-[10px] h-[7px] w-[7px] rounded-full border-2 border-[var(--color-coach-sidebar)] bg-[var(--color-alert-coral)]"
                aria-hidden
              />
            )}
          </Link>
        </div>
        <div className="hidden md:block">
          <AgencyosTopbar
            players={players}
            groups={groups}
            coachInitials={initialsOf(user.name)}
            hasUnread={unreadNotifications > 0}
          />
        </div>
        <main
          id="admin-main"
          tabIndex={-1}
          className="flex-1 pb-24 focus:outline-none focus-visible:outline-none md:pb-0"
        >
          {children}
        </main>
      </div>
      <AgencyosMobileNav inboxPending={requestCount + approvalCount} />
      <GlobalSearchModal />
    </div>
  );
}
