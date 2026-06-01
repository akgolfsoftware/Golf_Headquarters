/**
 * <StatsTabs> — rute-baserte tabs for Stats-seksjonen.
 *
 * 5 tabs som navigerer til separate ruter (ikke query-state). Aktiv rute får
 * accent-underline. Mobil: horisontal scroll. Desktop: full bredde.
 * Egen komponent fordi athletic/TabBar er query-param-basert (?tab=X) og
 * ikke passer rute-navigasjon.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/portal/stats", label: "Oversikt" },
  { href: "/portal/stats/sg", label: "Strokes Gained" },
  { href: "/portal/stats/trackman", label: "TrackMan" },
  { href: "/portal/stats/tester", label: "Tester" },
  { href: "/portal/stats/runder", label: "Runder" },
] as const;

export function StatsTabs() {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label="Statistikk-seksjoner"
      className="-mx-4 flex items-center gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/portal/stats"
            ? pathname === "/portal/stats"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "relative shrink-0 whitespace-nowrap px-3 py-3 font-display text-[13px] font-semibold tracking-[-0.005em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {isActive && (
              <span
                aria-hidden
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
