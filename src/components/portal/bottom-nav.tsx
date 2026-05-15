"use client";

/**
 * Bottom navigation for PlayerHQ — vises kun på mobil (< md).
 * Speiler workflow-strukturen i sidebaren: Hjem / Plan / Gjennomfør / Evaluere / Coach.
 * Fast festet i bunn med safe-area-inset for iPhone-hak.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, Dumbbell, BarChart2, MessageCircle } from "lucide-react";

const NAV = [
  { href: "/portal",              label: "Hjem",      icon: Home },
  { href: "/portal/tren",         label: "Plan",       icon: CalendarCheck },
  { href: "/portal/tren/ovelser", label: "Gjennomfør", icon: Dumbbell },
  { href: "/portal/mal",          label: "Evaluere",   icon: BarChart2 },
  { href: "/portal/coach",        label: "Coach",      icon: MessageCircle },
];

export function BottomNav() {
  const path = usePathname();

  return (
    <nav
      aria-label="Hovednavigasjon"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {NAV.map((item) => {
          const aktiv =
            item.href === "/portal"
              ? path === "/portal"
              : path === item.href || path.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={aktiv ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                  aktiv
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  width={22}
                  height={22}
                  strokeWidth={aktiv ? 2 : 1.5}
                  aria-hidden
                />
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
