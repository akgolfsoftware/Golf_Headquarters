"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ChevronDown } from "lucide-react";
import type { Tier } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { SidebarBrand } from "@/components/shared/sidebar-brand";

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

// PlayerHQ 5-seksjons IA — Hjem · Plan · Gjør · Analyse · Meg
// Samme fem seksjoner som bunn-nav på mobil.
const MAIN_ITEMS: NavItem[] = [
  { href: "/portal", label: "Hjem" },
  {
    href: "/portal/planlegge",
    label: "Plan",
    matchPrefixes: [
      "/portal/planlegge",
      "/portal/tren",
      "/portal/trening",
      "/portal/mal",
      "/portal/drills",
      "/portal/turneringer",
      "/portal/coach",
    ],
    children: [
      { href: "/portal/tren/aarsplan", label: "Årsplan" },
      { href: "/portal/tren/teknisk-plan", label: "Treningsplan" },
      { href: "/portal/tren/fys-plan", label: "Fysplan" },
      { href: "/portal/mal", label: "Mål" },
      { href: "/portal/tren/turneringer", label: "Turneringer" },
      { href: "/portal/drills", label: "Drills" },
      { href: "/portal/coach/plans", label: "Coach-planer" },
      { href: "/portal/coach/melding", label: "Coach-meldinger" },
    ],
  },
  {
    href: "/portal/gjennomfore",
    label: "Gjør",
    matchPrefixes: [
      "/portal/gjennomfore",
      "/portal/ny-okt",
      "/portal/onskeligokt",
      "/portal/tren/feiring",
      "/portal/tren/kalender",
    ],
    children: [
      { href: "/portal/ny-okt", label: "Ny økt" },
      { href: "/portal/gjennomfore", label: "Øktlogg" },
      { href: "/portal/trening/logg", label: "Treningslogg" },
    ],
  },
  {
    href: "/portal/analysere",
    label: "Analyse",
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
  { href: "/portal/meg", label: "Meg", matchPrefixes: ["/portal/meg"] },
];

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

  const items: NavItem[] = MAIN_ITEMS;

  return (
    <aside
      aria-label="PlayerHQ sidemeny"
      className="flex w-52 shrink-0 flex-col bg-[var(--color-player-sidebar)] text-background lg:w-64"
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
          className={cn(buttonClasses({ variant: "primary", size: "md" }), "w-full")}
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
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
                      ? "bg-[var(--color-accent-fill)] font-semibold text-background before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-[var(--color-brand-accent)]"
                      : "text-background/70 hover:bg-background/5 hover:text-background"
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
                      className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""} ${aktiv ? "text-background/60" : "text-background/40"}`}
                      strokeWidth={1.5}
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
                              ? "font-medium text-background"
                              : "text-background/50 hover:text-background/80"
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

      {/* Tier-badge */}
      <div
        aria-label={`Abonnement: ${tier === "GRATIS" ? "GRATIS" : "PRO"}`}
        className="m-4 rounded-md bg-accent/10 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-primary"
      >
        {tier === "GRATIS" ? "GRATIS" : "PRO"}
      </div>
    </aside>
  );
}
