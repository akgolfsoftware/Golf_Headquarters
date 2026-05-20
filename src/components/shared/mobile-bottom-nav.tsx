"use client";

// Mobil-bunnmeny for PlayerHQ.
// Vises kun under md (< 768px). Sticky bottom, cream bg, border-top.
// 5 hovedseksjoner: Hjem, Tren, Kalender, Mål, Meg. Aktiv-state: lime accent.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Dumbbell,
  Home,
  Target,
  User as UserIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
  excludePrefixes?: string[];
};

const NAV: ReadonlyArray<NavItem> = [
  { href: "/portal", label: "Hjem", icon: Home, exact: true },
  {
    href: "/portal/tren",
    label: "Tren",
    icon: Dumbbell,
    excludePrefixes: ["/portal/tren/kalender"],
  },
  { href: "/portal/tren/kalender", label: "Kalender", icon: CalendarDays },
  { href: "/portal/mal", label: "Mål", icon: Target },
  { href: "/portal/meg", label: "Meg", icon: UserIcon },
];

export function MobileBottomNav() {
  const path = usePathname() ?? "";

  return (
    <nav
      aria-label="Hovednavigasjon"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {NAV.map((item) => {
          const matchSelf = item.exact
            ? path === item.href
            : path === item.href || path.startsWith(item.href + "/");
          const excluded =
            !item.exact && item.excludePrefixes
              ? item.excludePrefixes.some(
                  (p) => path === p || path.startsWith(p + "/"),
                )
              : false;
          const aktiv = matchSelf && !excluded;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={aktiv ? "page" : undefined}
                className={[
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  aktiv
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <Icon
                  width={22}
                  height={22}
                  strokeWidth={aktiv ? 2 : 1.75}
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
