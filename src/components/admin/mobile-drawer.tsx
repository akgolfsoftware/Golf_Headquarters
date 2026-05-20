"use client";

/**
 * Mobile drawer for CoachHQ — hamburger-knapp + slide-in fra venstre.
 * Vises kun på < lg. Speiler AdminSidebar med samme nav-grupper.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

type NavItem = { href: string; label: string };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Daglig",
    items: [
      { href: "/admin", label: "Hub" },
      { href: "/admin/kalender", label: "Kalender" },
      { href: "/admin/foresporsler", label: "Forespørsler" },
    ],
  },
  {
    label: "Produktivitet",
    items: [
      { href: "/admin/innboks", label: "Innboks" },
      { href: "/admin/notion-prosjekter", label: "Notion-prosjekter" },
      { href: "/admin/notion-oppgaver", label: "Notion-oppgaver" },
    ],
  },
  {
    label: "Planlegge",
    items: [
      { href: "/admin/spillere", label: "Spillere" },
      { href: "/admin/plans", label: "Treningsplaner" },
      { href: "/admin/anlegg", label: "Anlegg" },
      { href: "/admin/services", label: "Tjenester" },
      { href: "/admin/tournaments", label: "Turneringer" },
    ],
  },
  {
    label: "Evaluering",
    items: [
      { href: "/admin/analyse", label: "Analytics" },
      { href: "/admin/reports", label: "Rapporter" },
    ],
  },
  {
    label: "Økonomi",
    items: [{ href: "/admin/finance", label: "Økonomi" }],
  },
  {
    label: "Verktøy",
    items: [
      { href: "/admin/agents", label: "AI-agenter" },
      { href: "/admin/recording", label: "Sesjonsopptak" },
      { href: "/admin/email-templates", label: "E-postmaler" },
      { href: "/admin/team", label: "Team" },
      { href: "/admin/integrasjoner", label: "Integrasjoner" },
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
            <div className="flex items-center justify-between px-6 py-6">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                aria-label="AK Golf — CoachHQ"
                className="inline-flex flex-col gap-2"
              >
                <AkGolfLogo variant="white" width={48} />
                <span className="font-display text-base font-bold leading-none tracking-tight">
                  <em className="font-normal text-accent md:italic">coach</em>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Lukk meny"
                className="grid h-11 w-11 place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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
                          className={`block min-h-11 rounded-md px-4 py-2.5 text-base transition-colors ${
                            aktiv
                              ? "bg-white/10 font-semibold text-white"
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
