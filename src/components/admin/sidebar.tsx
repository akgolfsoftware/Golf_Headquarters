"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ChevronDown, UserCircle } from "lucide-react";
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
  children?: NavChild[];
};

// ---------------------------------------------------------------------------
// Navigation — CoachHQ 7-seksjons IA (master-plan 2026-05-22)
// Oversikt · Stall · Planlegge · Gjennomføre · Analysere · Kommunikasjon · Organisasjon
// ---------------------------------------------------------------------------

const MAIN_ITEMS: NavItem[] = [
  { href: "/admin/agencyos", label: "Oversikt", matchPrefixes: ["/admin/agencyos", "/admin"] },
  {
    href: "/admin/workspace",
    label: "Workspace",
    matchPrefixes: ["/admin/workspace"],
    children: [
      { href: "/admin/workspace", label: "Min uke" },
      { href: "/admin/workspace/oppgaver", label: "Oppgaver" },
      { href: "/admin/workspace/prosjekter", label: "Prosjekter" },
      { href: "/admin/workspace/tildelt-meg", label: "Tildelt meg" },
      { href: "/admin/workspace/notion", label: "Notion-tilkobling" },
    ],
  },
  {
    href: "/admin/stall",
    label: "Stall",
    matchPrefixes: ["/admin/stall", "/admin/spillere", "/admin/talent"],
    children: [
      { href: "/admin/spillere", label: "Alle spillere" },
      { href: "/admin/talent", label: "Talent-radar" },
      { href: "/admin/talent/sammenligning", label: "Sammenligning" },
      { href: "/admin/talent/wagr-import", label: "WAGR" },
    ],
  },
  {
    href: "/admin/planlegge",
    label: "Planlegge",
    matchPrefixes: [
      "/admin/planlegge",
      "/admin/plans",
      "/admin/plan-templates",
      "/admin/grupper",
      "/admin/tournaments",
      "/admin/drills",
    ],
    children: [
      { href: "/admin/plans", label: "Treningsplaner" },
      { href: "/admin/plan-templates", label: "Plan-maler" },
      { href: "/admin/grupper", label: "Grupper" },
      { href: "/admin/tournaments", label: "Turneringer" },
      { href: "/admin/drills", label: "Drill-bibliotek" },
    ],
  },
  {
    href: "/admin/gjennomfore",
    label: "Gjennomføre",
    matchPrefixes: [
      "/admin/gjennomfore",
      "/admin/kalender",
      "/admin/bookinger",
      "/admin/anlegg",
      "/admin/availability",
      "/admin/services",
    ],
    children: [
      { href: "/admin/kalender", label: "Kalender" },
      { href: "/admin/bookinger", label: "Bookinger" },
      { href: "/admin/anlegg", label: "Anlegg" },
      { href: "/admin/availability", label: "Tilgjengelighet" },
      { href: "/admin/services", label: "Tjenester" },
    ],
  },
  {
    href: "/admin/analysere",
    label: "Analysere",
    matchPrefixes: [
      "/admin/analysere",
      "/admin/analyse",
      "/admin/lag-snitt",
      "/admin/foresporsler",
      "/admin/godkjenninger",
      "/admin/reports",
    ],
    children: [
      { href: "/admin/analyse", label: "Stall-analyse" },
      { href: "/admin/lag-snitt", label: "Lag-snitt" },
      { href: "/admin/foresporsler", label: "Forespørsler" },
      { href: "/admin/godkjenninger", label: "Godkjenninger" },
      { href: "/admin/reports", label: "Rapporter" },
    ],
  },
  {
    href: "/admin/kommunikasjon",
    label: "Kommunikasjon",
    matchPrefixes: [
      "/admin/kommunikasjon",
      "/admin/innboks",
      "/admin/email-templates",
    ],
    children: [
      { href: "/admin/innboks", label: "Innboks" },
      { href: "/admin/email-templates", label: "E-postmaler" },
    ],
  },
  {
    href: "/admin/organisasjon",
    label: "Organisasjon",
    matchPrefixes: [
      "/admin/organisasjon",
      "/admin/team",
      "/admin/finance",
      "/admin/agents",
      "/admin/integrasjoner",
      "/admin/audit-log",
      "/admin/settings",
    ],
    children: [
      { href: "/admin/team", label: "Team" },
      { href: "/admin/finance", label: "Økonomi" },
      { href: "/admin/agents", label: "AI-agenter" },
      { href: "/admin/integrasjoner", label: "Integrasjoner" },
      { href: "/admin/audit-log", label: "Audit-log" },
      { href: "/admin/settings", label: "Innstillinger" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Active-link helpers
// ---------------------------------------------------------------------------

function isActive(path: string, item: NavItem): boolean {
  if (item.href === "/admin/agencyos") {
    return path === "/admin" || path === "/admin/agencyos";
  }
  const prefixes = item.matchPrefixes ?? [item.href];
  return prefixes.some((p) => path === p || path.startsWith(p + "/"));
}

function isChildActive(path: string, child: NavChild): boolean {
  return path === child.href || path.startsWith(child.href + "/");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminSidebar() {
  const path = usePathname();

  const items = FEATURES.TALENT ? MAIN_ITEMS : MAIN_ITEMS;

  return (
    <aside
      aria-label="CoachHQ sidemeny"
      className="flex w-52 shrink-0 flex-col bg-[var(--color-coach-sidebar)] text-white lg:w-64"
    >
      {/* Logo */}
      <div className="flex justify-center px-4 py-6">
        <SidebarBrand variant="coach" role="HEAD COACH" />
      </div>

      {/* Ny økt — rask handling */}
      <div className="px-4 pb-4">
        <Link
          href="/admin/plans/ny"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Ny plan
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
            const hasChildren = item.children && item.children.length > 0;
            const expanded = hasChildren && aktiv;

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  aria-current={aktiv && !hasChildren ? "page" : undefined}
                  className={`relative flex items-center justify-between rounded-md px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-coach-sidebar)] ${
                    aktiv
                      ? "bg-[var(--color-accent-fill)] font-semibold text-white before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-[var(--color-brand-accent)]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {hasChildren && (
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""} ${aktiv ? "text-white/60" : "text-white/40"}`}
                      strokeWidth={2}
                    />
                  )}
                </Link>

                {/* Sub-items — kun synlig når seksjon er aktiv (matcher PlayerHQ) */}
                {expanded && item.children && (
                  <div className="mt-0.5 space-y-0.5 pl-4">
                    {item.children.map((child) => {
                      const childAktiv = isChildActive(path, child);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          aria-current={childAktiv ? "page" : undefined}
                          className={`block rounded-md px-4 py-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-coach-sidebar)] ${
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
          href="/admin/settings"
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
            path === "/admin/settings"
              ? "bg-[var(--color-accent-fill)] font-semibold text-white"
              : "text-white/50 hover:bg-white/5 hover:text-white"
          }`}
        >
          <UserCircle className="h-4 w-4" strokeWidth={1.75} />
          Min profil
        </Link>
      </div>

      {/* Rolle-badge */}
      <div
        aria-label="CoachHQ"
        className="m-4 rounded-md bg-accent/10 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        COACHHQ
      </div>
    </aside>
  );
}
