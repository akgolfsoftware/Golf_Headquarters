"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import type { Tier } from "@/generated/prisma/client";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { FEATURES } from "@/lib/features";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NavItem = {
  href: string;
  label: string;
  matchPrefixes?: string[];
  badge?: boolean;
};

// ---------------------------------------------------------------------------
// Navigation — 5 hoved-punkter + Talent (betinget)
// ---------------------------------------------------------------------------

const MAIN_ITEMS: NavItem[] = [
  { href: "/portal",            label: "Hjem" },
  {
    href: "/portal/tren",
    label: "Tren",
    matchPrefixes: ["/portal/tren", "/portal/ny-okt"],
  },
  {
    href: "/portal/statistikk",
    label: "Statistikk",
    matchPrefixes: ["/portal/statistikk", "/portal/mal"],
  },
  {
    href: "/portal/coach",
    label: "Coach",
    matchPrefixes: [
      "/portal/coach",
      "/portal/onskeligokt",
      "/portal/booking",
    ],
  },
  {
    href: "/portal/meg",
    label: "Profil",
    matchPrefixes: ["/portal/meg", "/portal/varsler"],
    badge: true,
  },
];

const TALENT_ITEM: NavItem = {
  href: "/portal/talent",
  label: "Talent",
  matchPrefixes: ["/portal/talent"],
};

// ---------------------------------------------------------------------------
// Active-link helper
// ---------------------------------------------------------------------------

function isActive(path: string, item: NavItem): boolean {
  if (item.href === "/portal") return path === "/portal";
  const prefixes = item.matchPrefixes ?? [item.href];
  return prefixes.some(
    (p) => path === p || path.startsWith(p + "/"),
  );
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
      <div className="px-6 py-8">
        <Link
          href="/portal"
          aria-label="AK Golf — PlayerHQ"
          className="inline-flex flex-col gap-2"
        >
          <AkGolfLogo variant="white" width={48} />
          <span className="font-display text-base font-bold leading-none tracking-tight">
            <em className="font-normal text-accent md:italic">player</em>
          </span>
        </Link>
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
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktiv ? "page" : undefined}
                className={`flex items-center justify-between rounded-md px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-player-sidebar)] ${
                  aktiv
                    ? "bg-white/10 font-semibold text-white"
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
              </Link>
            );
          })}
        </div>
      </nav>

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
