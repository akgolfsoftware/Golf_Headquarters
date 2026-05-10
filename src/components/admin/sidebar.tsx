"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Hub" },
  { href: "/admin/brief", label: "Daglig brief" },
  { href: "/admin/elever", label: "Spillere" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/calendar", label: "Kalender" },
  { href: "/admin/bookings", label: "Bookinger" },
  { href: "/admin/finance", label: "Økonomi" },
  { href: "/admin/innstillinger", label: "Innstillinger" },
];

export function AdminSidebar() {
  const path = usePathname();
  return (
    <aside className="flex w-56 shrink-0 flex-col bg-[var(--color-coach-sidebar)] text-white">
      <div className="px-6 py-8 font-display text-lg font-bold leading-tight tracking-tight">
        AK Golf
        <br />
        <em className="font-normal text-accent md:italic">coach</em>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const aktiv =
            path === n.href || (n.href !== "/admin" && path.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                aktiv
                  ? "bg-white/10 font-semibold text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-md bg-accent/10 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent">
        CoachHQ
      </div>
    </aside>
  );
}
