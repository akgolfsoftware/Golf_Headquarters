"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ChevronDown, UserCircle } from "lucide-react";
import type { Tier } from "@/generated/prisma/client";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import { FEATURES } from "@/lib/features";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NavChild = {
  href: string;
  label: string;
};

type NavItem = {
  href: string;
  label: string;
  matchPrefixes?: string[];
  badge?: boolean;
  children?: NavChild[];
};

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

// PlayerHQ 5-seksjons IA (validerings-runde 2026-05-22)
// Plan-IA: Oversikt · Planlegge · Gjennomføre · Analysere · Coach
const MAIN_ITEMS: NavItem[] = [
  { href: "/portal", label: "Oversikt" },
  {
    href: "/portal/planlegge",
    label: "Planlegge",
    matchPrefixes: [
      "/portal/planlegge",
      "/portal/tren",
      "/portal/trening",
      "/portal/mal",
    ],
    children: [
      { href: "/portal/tren/aarsplan", label: "Årsplan" },
      { href: "/portal/tren/teknisk-plan", label: "Treningsplan" },
      { href: "/portal/tren/fys-plan", label: "Fysplan" },
      { href: "/portal/mal", label: "Mål" },
      { href: "/portal/tren/turneringer", label: "Turneringer" },
      { href: "/portal/drills", label: "Drills" },
      { href: "/portal/trening/logg", label: "Logg treningsøkt" },
      { href: "/portal/trening/putte-laboratoriet", label: "Putte-laboratoriet" },
    ],
  },
  {
    href: "/portal/gjennomfore",
    label: "Gjennomføre",
    matchPrefixes: [
      "/portal/gjennomfore",
      "/portal/kalender",
      "/portal/booking",
      "/portal/ny-okt",
      "/portal/onskeligokt",
    ],
    children: [
      { href: "/portal/kalender", label: "Kalender" },
      { href: "/portal/booking", label: "Booking" },
    ],
  },
  {
    href: "/portal/analysere",
    label: "Analysere",
    matchPrefixes: [
      "/portal/analysere",
      "/portal/innsikt",
      "/portal/statistikk",
      "/portal/trackman",
      "/portal/talent",
    ],
    children: [
      { href: "/portal/analysere", label: "Statistikk" },
      { href: "/portal/mal/sg-hub", label: "Strokes gained" },
      { href: "/portal/mal/runder", label: "Runder" },
      { href: "/portal/mal/trackman", label: "TrackMan" },
      { href: "/portal/tren/tester", label: "Tester" },
      { href: "/portal/analysere/hull", label: "Innsikt" },
    ],
  },
  {
    href: "/portal/coach",
    label: "Coach",
    matchPrefixes: ["/portal/coach"],
    children: [
      { href: "/portal/coach/melding", label: "Meldinger" },
      { href: "/portal/coach/melding/ny", label: "Ny melding" },
      { href: "/portal/coach/plans", label: "Planer" },
    ],
  },
];

const TALENT_ITEM: NavItem = {
  href: "/portal/talent",
  label: "Talent",
  matchPrefixes: ["/portal/talent"],
};

// ---------------------------------------------------------------------------
// Active-link helpers
// ---------------------------------------------------------------------------

function isActive(path: string, item: NavItem): boolean {
  if (item.href === "/portal") return path === "/portal";
  const prefixes = item.matchPrefixes ?? [item.href];
  return prefixes.some(
    (p) => path === p || path.startsWith(p + "/"),
  );
}

function isChildActive(path: string, child: NavChild): boolean {
  if (child.href === "/portal/tren") return path === "/portal/tren";
  return path === child.href || path.startsWith(child.href + "/");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PortalSidebar({
  tier,
  varslerUlest = 0,
}: {
  tier: Tier;
  varslerUlest?: number;
}) {
  const path = usePathname();

  const items: NavItem[] = FEATURES.TALENT
    ? [...MAIN_ITEMS, TALENT_ITEM]
    : MAIN_ITEMS;

  return (
    <aside
      aria-label="PlayerHQ sidemeny"
      className="flex w-52 shrink-0 flex-col bg-[var(--color-player-sidebar)] text-white lg:w-64"
    >
      {/* Logo */}
      <div className="flex justify-center px-4 py-6">
        <SidebarBrand
          variant="player"
          role={tier === "PRO" ? "PRO" : "SPILLER"}
        />
      </div>

      {/* Ny økt — rask handling */}
      <div className="px-4 pb-4">
        <Link
          href="/portal/ny-okt"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Ny økt
        </Link>
      </div>

      {/* Nav */}
      <nav
        aria-label="Hovednavigasjon"
        className="flex-1 overflow-y-auto px-4 pb-4"
      >
        <div className="space-y-0.5">
          {items.map((item) => {
            const aktiv = isActive(path, item);
            const visBadge = item.badge && varslerUlest > 0;
            const hasChildren = item.children && item.children.length > 0;
            const expanded = hasChildren && aktiv;

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  aria-current={aktiv && !hasChildren ? "page" : undefined}
                  className={`relative flex items-center justify-between rounded-md px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-player-sidebar)] ${
                    aktiv
                      ? "bg-[var(--color-accent-fill)] font-semibold text-white before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-[var(--color-brand-accent)]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {visBadge && (
                    <span
                      aria-label={`${varslerUlest} uleste varsler`}
                      className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 font-mono text-[10px] font-semibold text-destructive-foreground"
                    >
                      {varslerUlest}
                    </span>
                  )}
                  {hasChildren && (
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""} ${aktiv ? "text-white/60" : "text-white/40"}`}
                      strokeWidth={2}
                    />
                  )}
                </Link>

                {/* Sub-items */}
                {expanded && item.children && (
                  <div className="mt-0.5 space-y-0.5 pl-4">
                    {item.children.map((child) => {
                      const childAktiv = isChildActive(path, child);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          aria-current={childAktiv ? "page" : undefined}
                          className={`block rounded-md px-4 py-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-player-sidebar)] ${
                            childAktiv
                              ? "font-medium text-white"
                              : "text-white/50 hover:text-white/80"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Profil-lenke */}
      <div className="px-4 pb-2">
        <Link
          href="/portal/meg"
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
            path === "/portal/meg"
              ? "bg-[var(--color-accent-fill)] font-semibold text-white"
              : "text-white/50 hover:bg-white/5 hover:text-white"
          }`}
        >
          <UserCircle className="h-4 w-4" strokeWidth={1.75} />
          Min profil
        </Link>
      </div>

      {/* Tier-badge */}
      <div
        aria-label={`Abonnement: ${tier}`}
        className="m-4 rounded-md bg-accent/10 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        {tier}
      </div>
    </aside>
  );
}
