"use client";

/**
 * Mobile drawer for CoachHQ — hamburger-knapp + slide-in fra venstre.
 * Vises kun på < lg. Speiler AdminSidebar med samme nav-grupper.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";

type NavItem = { href: string; label: string };

// CoachHQ 7-seksjons IA (master-plan) — speiler AdminSidebar
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Oversikt",
    items: [{ href: "/admin/agencyos", label: "Hub" }],
  },
  {
    label: "Stall",
    items: [
      { href: "/admin/spillere", label: "Alle spillere" },
      { href: "/admin/stall", label: "Stall-snitt" },
      { href: "/admin/talent", label: "Talent-radar" },
      { href: "/admin/talent/sammenligning", label: "Sammenligning" },
      { href: "/admin/talent/wagr-import", label: "WAGR" },
    ],
  },
  {
    label: "Planlegge",
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
    items: [
      { href: "/admin/analyse", label: "Stall-analyse" },
      { href: "/admin/lag-snitt", label: "Lag-snitt" },
      { href: "/admin/foresporsler", label: "Forespørsler" },
      { href: "/admin/godkjenninger", label: "Godkjenninger" },
      { href: "/admin/reports", label: "Rapporter" },
      { href: "/admin/kapasitet", label: "Kapasitet" },
    ],
  },
  {
    label: "Kommunikasjon",
    items: [
      { href: "/admin/innboks", label: "Innboks" },
      { href: "/admin/email-templates", label: "E-postmaler" },
      { href: "/admin/notion-prosjekter", label: "Notion-prosjekter" },
      { href: "/admin/notion-oppgaver", label: "Notion-oppgaver" },
    ],
  },
  {
    label: "Organisasjon",
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

export function AdminMobileDrawer() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Åpne meny"
        className="grid h-11 w-11 place-items-center rounded-md border border-border bg-card text-foreground hover:border-input active:border-input/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
      >
        <Menu width={20} height={20} aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        >
          <aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[var(--color-coach-sidebar)] text-white"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="CoachHQ-meny"
          >
            <div className="relative flex justify-center px-4 py-6">
              <div onClick={() => setOpen(false)}>
                <SidebarBrand variant="coach" role="HEAD COACH" />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Lukk meny"
                className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X width={20} height={20} aria-hidden />
              </button>
            </div>
            <nav
              aria-label="Hovednavigasjon"
              className="flex-1 space-y-6 overflow-y-auto px-4 pb-6"
            >
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="px-4 pb-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-white/40">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((n) => {
                      const aktiv =
                        path === n.href ||
                        (n.href !== "/admin" && path.startsWith(n.href + "/"));
                      return (
                        <Link
                          key={n.href}
                          href={n.href}
                          onClick={() => setOpen(false)}
                          aria-current={aktiv ? "page" : undefined}
                          className={`relative block min-h-11 rounded-md px-4 py-2.5 text-base transition-colors ${
                            aktiv
                              ? "bg-[var(--color-accent-fill)] font-semibold text-white before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-[var(--color-brand-accent)]"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {n.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
