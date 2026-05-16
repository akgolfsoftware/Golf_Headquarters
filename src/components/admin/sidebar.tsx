"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { FEATURES } from "@/lib/features";

type NavItem = { href: string; label: string };

const ALL_NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Daglig",
    items: [
      { href: "/admin/agencyos", label: "Hub" },
      { href: "/admin/calendar", label: "Kalender" },
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
      { href: "/admin/elever", label: "Spillere" },
      { href: "/admin/plans", label: "Treningsplaner" },
      { href: "/admin/anlegg", label: "Anlegg" },
      { href: "/admin/services", label: "Tjenester" },
      { href: "/admin/tournaments", label: "Turneringer" },
    ],
  },
  {
    label: "Evaluering",
    items: [
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/reports", label: "Rapporter" },
    ],
  },
  {
    label: "Talent",
    items: [
      { href: "/admin/talent", label: "Talent" },
      { href: "/admin/talent/wagr-benchmark", label: "WAGR-benchmark" },
      { href: "/admin/talent/wagr-import", label: "WAGR-import" },
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
      { href: "/admin/videoer", label: "Videoer" },
      { href: "/admin/recording", label: "Sesjonsopptak" },
      { href: "/admin/email-templates", label: "E-postmaler" },
      { href: "/admin/team", label: "Team" },
      { href: "/admin/integrasjoner", label: "Integrasjoner" },
      { href: "/admin/settings", label: "Innstillinger" },
      { href: "/admin/settings/tilgang", label: "Tilgang & roller" },
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
      <div className="px-6 py-8">
        <Link href="/admin" aria-label="AK Golf — CoachHQ" className="inline-flex flex-col gap-2">
          <AkGolfLogo variant="white" width={48} />
          <span className="font-display text-base font-bold leading-none tracking-tight">
            <em className="font-normal text-accent md:italic">coach</em>
          </span>
        </Link>
      </div>
      <nav
        aria-label="Hovednavigasjon"
        className="flex-1 space-y-6 overflow-y-auto px-4 pb-4"
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
                  (n.href !== "/admin" && path.startsWith(n.href + "/")) ||
                  (n.href !== "/admin" && path === n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={aktiv ? "page" : undefined}
                    className={`block rounded-md px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-coach-sidebar)] ${
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
      <div
        aria-hidden="true"
        className="m-4 rounded-md bg-accent/10 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        CoachHQ
      </div>
    </aside>
  );
}
