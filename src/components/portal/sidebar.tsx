"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Tier } from "@/generated/prisma/client";

const NAV = [
  { href: "/portal", label: "Hjem" },
  { href: "/portal/tren", label: "Tren" },
  { href: "/portal/mal", label: "Mål" },
  { href: "/portal/coach", label: "Coach" },
  { href: "/portal/meg", label: "Meg" },
];

export function PortalSidebar({ tier }: { tier: Tier }) {
  const path = usePathname();
  return (
    <aside
      aria-label="PlayerHQ sidemeny"
      className="flex w-56 shrink-0 flex-col bg-[var(--color-player-sidebar)] text-white"
    >
      <div className="px-6 py-8 font-display text-lg font-bold leading-tight tracking-tight">
        AK Golf
        <br />
        <em className="font-normal text-accent md:italic">player</em>
      </div>
      <nav aria-label="Hovednavigasjon" className="flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const aktiv = path === n.href || (n.href !== "/portal" && path.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={aktiv ? "page" : undefined}
              className={`block rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-player-sidebar)] ${
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
      <div
        aria-label={`Abonnement: ${tier}`}
        className="m-3 rounded-md bg-accent/10 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        {tier}
      </div>
    </aside>
  );
}
