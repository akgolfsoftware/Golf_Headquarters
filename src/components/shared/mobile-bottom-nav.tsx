"use client";

// Mobil-bunnmeny for PlayerHQ.
// Vises kun under md (< 768px). Sticky bottom, cream bg, border-top.
// Aktiv-state: lime accent. Notification-badge på "Coach" når uleste meldinger.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Home,
  MessageSquare,
  Target,
  User as UserIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
  badgeKey?: "coach";
};

const NAV: ReadonlyArray<NavItem> = [
  { href: "/portal", label: "Hjem", icon: Home, exact: true },
  { href: "/portal/tren", label: "Trening", icon: Calendar },
  { href: "/portal/mal", label: "Mål", icon: Target },
  { href: "/portal/coach", label: "Coach", icon: MessageSquare, badgeKey: "coach" },
  { href: "/portal/meg", label: "Meg", icon: UserIcon },
];

type Props = {
  /** Antall uleste coach-meldinger. 0 eller undefined skjuler badge. */
  coachUnread?: number;
};

export function MobileBottomNav({ coachUnread = 0 }: Props) {
  const path = usePathname() ?? "";

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
          const badge =
            item.badgeKey === "coach" && coachUnread > 0 ? coachUnread : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={aktiv ? "page" : undefined}
                className={[
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  aktiv ? "text-primary" : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <span className="relative">
                  <Icon
                    width={22}
                    height={22}
                    strokeWidth={aktiv ? 2 : 1.75}
                    aria-hidden
                  />
                  {badge > 0 && (
                    <span
                      aria-label={`${badge} uleste`}
                      className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 font-mono text-[9px] font-semibold text-destructive-foreground"
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </span>
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
