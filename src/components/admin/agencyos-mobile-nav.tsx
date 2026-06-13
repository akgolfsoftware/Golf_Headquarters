"use client";

/**
 * AgencyOS mobil-bunnbar — vises kun under md (< 768px).
 * Mønster fra PlayerHQ `shared/mobile-bottom-nav.tsx`, oversatt til mørk
 * AgencyOS-flate (--color-coach-sidebar) med lime aktiv-state (fasit-tonen
 * fra sidebaren). 5 faner låst av Anders: Oversikt · Stall · Kalender ·
 * Innboks · Mer. Badge-dot (coral) på Innboks når noe venter — tallet
 * kommer fra AdminShell (ekte Prisma-tellinger, samme som sidebaren).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Inbox,
  LayoutDashboard,
  Menu,
  Users,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Menu;
  /** Prefikser som regnes som aktiv (i tillegg til href). */
  prefixes: string[];
  /** Eksakte stier som også er aktive (f.eks. /admin-roten). */
  exact?: string[];
};

const NAV: ReadonlyArray<NavItem> = [
  {
    href: "/admin/agencyos",
    label: "Oversikt",
    icon: LayoutDashboard,
    prefixes: ["/admin/agencyos"],
    exact: ["/admin"],
  },
  {
    href: "/admin/spillere",
    label: "Stall",
    icon: Users,
    prefixes: ["/admin/spillere", "/admin/grupper", "/admin/talent"],
  },
  {
    href: "/admin/kalender",
    label: "Kalender",
    icon: Calendar,
    prefixes: ["/admin/kalender"],
  },
  {
    href: "/admin/foresporsler",
    label: "Innboks",
    icon: Inbox,
    prefixes: [
      "/admin/foresporsler",
      "/admin/godkjenninger",
      "/admin/approvals",
      "/admin/innboks",
    ],
  },
  {
    href: "/admin/mer",
    label: "Mer",
    icon: Menu,
    // Ruter som kun nås via Mer-lista markerer Mer-fanen som aktiv.
    prefixes: [
      "/admin/mer",
      "/admin/workspace",
      "/admin/coach-workbench",
      "/admin/plans",
      "/admin/plan-templates",
      "/admin/drills",
      "/admin/tournaments",
      "/admin/bookinger",
      "/admin/anlegg",
      "/admin/availability",
      "/admin/services",
      "/admin/analyse",
      "/admin/lag-snitt",
      "/admin/tester",
      "/admin/reports",
      "/admin/settings",
    ],
  },
];

function erAktiv(path: string, item: NavItem): boolean {
  if ((item.exact ?? []).includes(path)) return true;
  return item.prefixes.some((p) => path === p || path.startsWith(p + "/"));
}

export function AgencyosMobileNav({ inboxPending }: { inboxPending: number }) {
  const path = usePathname() ?? "";

  return (
    <nav
      aria-label="Hovednavigasjon"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-coach-sidebar-border)] bg-[var(--color-coach-sidebar)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {NAV.map((item) => {
          const aktiv = erAktiv(path, item);
          const Icon = item.icon;
          const visDot = item.label === "Innboks" && inboxPending > 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={aktiv ? "page" : undefined}
                className={[
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  aktiv
                    ? "text-accent"
                    : "text-foreground/55 hover:text-foreground",
                ].join(" ")}
              >
                <span className="relative inline-flex">
                  <Icon
                    width={22}
                    height={22}
                    strokeWidth={aktiv ? 2 : 1.5}
                    aria-hidden
                  />
                  {visDot && (
                    <span
                      className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full border-2 border-[var(--color-coach-sidebar)] bg-[var(--color-alert-coral)]"
                      aria-hidden
                    />
                  )}
                </span>
                <span className="leading-none">
                  {item.label}
                  {visDot && <span className="sr-only"> — {inboxPending} venter</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
