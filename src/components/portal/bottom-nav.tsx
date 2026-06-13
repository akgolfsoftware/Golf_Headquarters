"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarRange,
  BarChart3,
  MessageSquare,
  UserCircle,
} from "lucide-react";

type NavItemDef = {
  href: string;
  label: string;
  icon: typeof Home;
  exact: boolean;
};

// PlayerHQ 5-seksjons IA — forenklet mobil bottom-nav
const NAV: ReadonlyArray<NavItemDef> = [
  { href: "/portal", label: "Oversikt", icon: Home, exact: true },
  { href: "/portal/planlegge", label: "Planlegg", icon: CalendarRange, exact: false },
  { href: "/portal/analysere", label: "Analyser", icon: BarChart3, exact: false },
  { href: "/portal/coach", label: "Coach", icon: MessageSquare, exact: false },
  { href: "/portal/meg", label: "Meg", icon: UserCircle, exact: false },
];

function erAktiv(path: string, item: NavItemDef): boolean {
  if (item.exact) return path === item.href;
  return path === item.href || path.startsWith(item.href + "/");
}

export function BottomNav() {
  const path = usePathname() ?? "";

  return (
    <nav
      aria-label="Mobilnavigasjon"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {NAV.map((item) => {
          const aktiv = erAktiv(path, item);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={aktiv ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                  aktiv
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  size={24}
                  strokeWidth={1.5}
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
