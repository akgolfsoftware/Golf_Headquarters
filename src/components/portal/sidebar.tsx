"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Tier } from "@/generated/prisma/client";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

type NavLink = { type: "link"; href: string; label: string; badge?: boolean };
type NavDropdown = {
  type: "dropdown";
  label: string;
  basePath: string;
  items: { href: string; label: string }[];
};
type NavGroup = NavLink | NavDropdown;

const NAV: NavGroup[] = [
  { type: "link", href: "/portal", label: "Hjem" },
  {
    type: "dropdown",
    label: "Tren",
    basePath: "/portal/tren",
    items: [
      { href: "/portal/tren", label: "Plan" },
      { href: "/portal/tren/kalender", label: "Kalender" },
      { href: "/portal/tren/ovelser", label: "Øvelser" },
      { href: "/portal/tren/tester", label: "Tester" },
      { href: "/portal/ny-okt", label: "Ny økt" },
      { href: "/portal/onskeligokt", label: "Ønske om økt" },
    ],
  },
  {
    type: "dropdown",
    label: "Mål",
    basePath: "/portal/mal",
    items: [
      { href: "/portal/mal", label: "Oversikt" },
      { href: "/portal/mal/runder", label: "Runder" },
      { href: "/portal/mal/trackman", label: "TrackMan" },
      { href: "/portal/mal/baner", label: "Baner" },
      { href: "/portal/mal/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    type: "dropdown",
    label: "Coach",
    basePath: "/portal/coach",
    items: [
      { href: "/portal/coach", label: "Oversikt" },
      { href: "/portal/coach/plans", label: "Planer" },
      { href: "/portal/coach/melding", label: "Meldinger" },
      { href: "/portal/coach/notes", label: "Notater" },
      { href: "/portal/coach/ai", label: "AI-coach" },
      { href: "/portal/booking/ny", label: "Book økt" },
    ],
  },
  { type: "link", href: "/portal/meg/bookinger", label: "Bookinger" },
  { type: "link", href: "/portal/varsler", label: "Varsler", badge: true },
  {
    type: "dropdown",
    label: "Meg",
    basePath: "/portal/meg",
    items: [
      { href: "/portal/meg", label: "Profil" },
      { href: "/portal/meg/helse", label: "Helse" },
      { href: "/portal/meg/foreldre", label: "Foreldre" },
      { href: "/portal/meg/abonnement", label: "Abonnement" },
      { href: "/portal/meg/innstillinger", label: "Innstillinger" },
      { href: "/portal/meg/sikkerhet", label: "Sikkerhet" },
      { href: "/portal/meg/dokumenter", label: "Dokumenter" },
      { href: "/portal/meg/help", label: "Hjelp" },
    ],
  },
];

const STORAGE_KEY = "playerhq-sidebar-open";

function isPathInDropdown(path: string, d: NavDropdown): boolean {
  return d.items.some((it) =>
    it.href === path || (it.href !== d.basePath && path.startsWith(it.href + "/"))
  ) || path === d.basePath || path.startsWith(d.basePath + "/");
}

function isSubItemActive(path: string, href: string): boolean {
  if (path === href) return true;
  // Treat exact match only for base routes that have children
  return path.startsWith(href + "/");
}

export function PortalSidebar({
  tier,
  varslerUlest = 0,
}: {
  tier: Tier;
  varslerUlest?: number;
}) {
  const path = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage + auto-open active dropdown
  useEffect(() => {
    let stored: Record<string, boolean> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as Record<string, boolean>;
    } catch {
      stored = {};
    }
    const next = { ...stored };
    for (const g of NAV) {
      if (g.type === "dropdown" && isPathInDropdown(path, g)) {
        next[g.label] = true;
      }
    }
    setOpen(next);
    setHydrated(true);
  }, [path]);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch {
      // ignore
    }
  }, [open, hydrated]);

  function toggle(label: string) {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside
      aria-label="PlayerHQ sidemeny"
      className="flex w-56 shrink-0 flex-col bg-[var(--color-player-sidebar)] text-white"
    >
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
      <nav aria-label="Hovednavigasjon" className="flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          if (n.type === "link") {
            const aktiv =
              path === n.href ||
              (n.href !== "/portal" && path.startsWith(n.href));
            const visBadge = n.badge && varslerUlest > 0;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={aktiv ? "page" : undefined}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-player-sidebar)] ${
                  aktiv
                    ? "bg-white/10 font-semibold text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{n.label}</span>
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
          }

          // dropdown
          const inGroup = isPathInDropdown(path, n);
          const isOpen = open[n.label] ?? false;
          const panelId = `nav-${n.label.toLowerCase()}-panel`;
          return (
            <div key={n.label}>
              <button
                type="button"
                onClick={() => toggle(n.label)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-player-sidebar)] ${
                  inGroup
                    ? "bg-white/5 font-semibold text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{n.label}</span>
                <ChevronDown
                  width={16}
                  height={16}
                  strokeWidth={1.5}
                  aria-hidden
                  className={`transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                id={panelId}
                hidden={!isOpen}
                className="mt-1 space-y-1 pl-3"
              >
                {n.items.map((it) => {
                  const aktiv =
                    it.href === n.basePath
                      ? path === it.href
                      : isSubItemActive(path, it.href);
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      aria-current={aktiv ? "page" : undefined}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-player-sidebar)] ${
                        aktiv
                          ? "bg-white/10 font-semibold text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {it.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div
        aria-label={`Abonnement: ${tier}`}
        className="m-3 rounded-md bg-accent/10 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        {tier}
      </div>
    </aside>
  );
}
