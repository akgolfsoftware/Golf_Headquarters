"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import { FEATURES } from "@/lib/features";

type NavItem = { href: string; label: string };

// CoachHQ 7-seksjons IA (master-plan 2026-05-22)
// Oversikt / Stall / Planlegge / Gjennomføre / Analysere / Kommunikasjon / Organisasjon
const ALL_NAV_GROUPS: { label: string; href: string; items: NavItem[] }[] = [
  {
    label: "Oversikt",
    href: "/admin/agencyos",
    items: [],
  },
  {
    label: "Stall",
    href: "/admin/stall",
    items: [
      { href: "/admin/spillere", label: "Alle spillere" },
      { href: "/admin/talent", label: "Talent-radar" },
      { href: "/admin/talent/sammenligning", label: "Sammenligning" },
      { href: "/admin/talent/wagr-import", label: "WAGR" },
    ],
  },
  {
    label: "Planlegge",
    href: "/admin/planlegge",
    items: [
      { href: "/admin/plans", label: "Treningsplaner" },
      { href: "/admin/plan-templates", label: "Plan-maler" },
      { href: "/admin/grupper", label: "Grupper" },
      { href: "/admin/tournaments", label: "Turneringer" },
      { href: "/admin/drills", label: "Drill-bibliotek" },
    ],
  },
  {
    label: "Gjennomføre",
    href: "/admin/gjennomfore",
    items: [
      { href: "/admin/kalender", label: "Kalender" },
      { href: "/admin/bookinger", label: "Bookinger" },
      { href: "/admin/anlegg", label: "Anlegg" },
      { href: "/admin/availability", label: "Tilgjengelighet" },
      { href: "/admin/services", label: "Tjenester" },
    ],
  },
  {
    label: "Analysere",
    href: "/admin/analysere",
    items: [
      { href: "/admin/analyse", label: "Stall-analyse" },
      { href: "/admin/lag-snitt", label: "Lag-snitt" },
      { href: "/admin/foresporsler", label: "Forespørsler" },
      { href: "/admin/godkjenninger", label: "Godkjenninger" },
      { href: "/admin/reports", label: "Rapporter" },
    ],
  },
  {
    label: "Kommunikasjon",
    href: "/admin/kommunikasjon",
    items: [
      { href: "/admin/innboks", label: "Innboks" },
      { href: "/admin/email-templates", label: "E-postmaler" },
      { href: "/admin/notion-prosjekter", label: "Notion-prosjekter" },
      { href: "/admin/notion-oppgaver", label: "Notion-oppgaver" },
    ],
  },
  {
    label: "Organisasjon",
    href: "/admin/organisasjon",
    items: [
      { href: "/admin/team", label: "Team" },
      { href: "/admin/finance", label: "Økonomi" },
      { href: "/admin/agents", label: "AI-agenter" },
      { href: "/admin/integrasjoner", label: "Integrasjoner" },
      { href: "/admin/audit-log", label: "Audit-log" },
      { href: "/admin/settings", label: "Innstillinger" },
    ],
  },
];

// Talent-gruppen er bak FEATURES.TALENT-flagget — skjules når flagget er av.
const NAV_GROUPS = ALL_NAV_GROUPS.filter(
  (g) => g.label !== "Talent" || FEATURES.TALENT,
);

export function AdminSidebar() {
  const path = usePathname();
  return (
    <aside
      aria-label="CoachHQ sidemeny"
      className="flex w-52 shrink-0 flex-col bg-[var(--color-coach-sidebar)] text-white lg:w-64"
    >
      <div className="flex justify-center px-4 py-6">
        <SidebarBrand variant="coach" role="HEAD COACH" />
      </div>
      <nav
        aria-label="Hovednavigasjon"
        className="flex-1 space-y-6 overflow-y-auto px-4 pb-4"
      >
        {NAV_GROUPS.map((group) => {
          const groupActive =
            path === group.href || path.startsWith(group.href + "/");
          return (
          <div key={group.label}>
            <Link
              href={group.href}
              aria-current={groupActive ? "page" : undefined}
              className={`relative mb-0.5 flex items-center justify-between rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-coach-sidebar)] ${
                groupActive
                  ? "bg-[var(--color-accent-fill)] text-white before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-[var(--color-brand-accent)]"
                  : "text-white hover:bg-white/5"
              }`}
            >
              <span>{group.label}</span>
            </Link>
            <div className="ml-3 space-y-0.5 border-l border-white/10 pl-1">
              {group.items.map((n) => {
                const aktiv =
                  path === n.href ||
                  (n.href !== "/admin" && path.startsWith(n.href + "/")) ||
                  (n.href !== "/admin" && path === n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={aktiv ? "page" : undefined}
                    className={`relative block rounded-md px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-coach-sidebar)] ${
                      aktiv
                        ? "bg-[var(--color-accent-fill)] font-semibold text-white before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-[var(--color-brand-accent)]"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
        })}
      </nav>
      <div
        aria-hidden="true"
        className="m-4 rounded-md bg-accent/10 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        CoachHQ
      </div>
    </aside>
  );
}
