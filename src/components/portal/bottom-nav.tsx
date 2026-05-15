"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, BarChart2, MessageCircle, User } from "lucide-react";

const NAV = [
  { href: "/portal",           label: "Hjem",        icon: Home,          exact: true },
  { href: "/portal/tren",      label: "Planlegging",  icon: CalendarDays,  exact: false },
  { href: "/portal/statistikk",label: "Statistikk",   icon: BarChart2,     exact: false },
  { href: "/portal/coach",     label: "Coach",        icon: MessageCircle, exact: false },
  { href: "/portal/meg",       label: "Profil",       icon: User,          exact: false },
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
          const aktiv = item.exact
            ? path === item.href
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
