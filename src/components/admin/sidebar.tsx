"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Daglig",
    items: [
      { href: "/admin", label: "Hub" },
      { href: "/admin/brief", label: "Daglig brief" },
      { href: "/admin/calendar", label: "Kalender" },
      { href: "/admin/bookings", label: "Bookinger" },
      { href: "/admin/queue", label: "Oppfølgingskø" },
      { href: "/admin/approvals", label: "Godkjennelser" },
    ],
  },
  {
    label: "Spillere",
    items: [
      { href: "/admin/elever", label: "Elever" },
      { href: "/admin/groups", label: "Grupper" },
      { href: "/admin/talent", label: "Talent" },
      { href: "/admin/messages", label: "Meldinger" },
    ],
  },
  {
    label: "Trening",
    items: [
      { href: "/admin/plans", label: "Planer" },
      { href: "/admin/plans/templates", label: "Maler" },
      { href: "/admin/board", label: "Trener-tavle" },
      { href: "/admin/recording", label: "Sesjonsopptak" },
    ],
  },
  {
    label: "Drift",
    items: [
      { href: "/admin/services", label: "Tjenester" },
      { href: "/admin/facilities", label: "Fasiliteter" },
      { href: "/admin/locations", label: "Lokasjoner" },
      { href: "/admin/availability", label: "Tilgjengelighet" },
      { href: "/admin/tournaments", label: "Turneringer" },
    ],
  },
  {
    label: "Innsikt",
    items: [
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/reports", label: "Rapporter" },
      { href: "/admin/finance", label: "Økonomi" },
      { href: "/admin/audit", label: "Audit-logg" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/agents", label: "AI-agenter" },
      { href: "/admin/email-templates", label: "E-postmaler" },
      { href: "/admin/team", label: "Team" },
      { href: "/admin/settings", label: "Innstillinger" },
    ],
  },
];

export function AdminSidebar() {
  const path = usePathname();
  return (
    <aside
      aria-label="CoachHQ sidemeny"
      className="flex w-56 shrink-0 flex-col bg-[var(--color-coach-sidebar)] text-white"
    >
      <div className="px-6 py-8 font-display text-lg font-bold leading-tight tracking-tight">
        AK Golf
        <br />
        <em className="font-normal text-accent md:italic">coach</em>
      </div>
      <nav
        aria-label="Hovednavigasjon"
        className="flex-1 space-y-5 overflow-y-auto px-3 pb-3"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-white/40">
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
                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-coach-sidebar)] ${
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
        className="m-3 rounded-md bg-accent/10 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        CoachHQ
      </div>
    </aside>
  );
}
