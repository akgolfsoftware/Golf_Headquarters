"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, LineChart, MessageSquare, User } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const BOTTOM_NAV: NavItem[] = [
  {
    id: "/",
    label: "Hjem",
    icon: (active) => (
      <Home size={20} strokeWidth={active ? 2.25 : 1.75} />
    ),
  },
  {
    id: "/kalender",
    label: "Plan",
    icon: (active) => (
      <Calendar size={20} strokeWidth={active ? 2.25 : 1.75} />
    ),
  },
  {
    id: "/stats",
    label: "Analyse",
    icon: (active) => (
      <LineChart size={20} strokeWidth={active ? 2.25 : 1.75} />
    ),
  },
  {
    id: "/coach",
    label: "Coach",
    icon: (active) => (
      <MessageSquare size={20} strokeWidth={active ? 2.25 : 1.75} />
    ),
  },
  {
    id: "/profil",
    label: "Meg",
    icon: (active) => (
      <User size={20} strokeWidth={active ? 2.25 : 1.75} />
    ),
  },
];

function matchRoute(navId: string, pathname: string): boolean {
  if (navId === "/") return pathname === "/";
  return pathname === navId || pathname.startsWith(navId + "/");
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 grid grid-cols-5 border-t border-border z-30"
      style={{
        background: "color-mix(in oklab, var(--background) 86%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "8px 4px 14px",
      }}
    >
      {BOTTOM_NAV.map((item) => {
        const active = matchRoute(item.id, pathname);
        return (
          <Link
            key={item.id}
            href={item.id}
            className={[
              "flex flex-col items-center gap-1 py-[6px] px-1",
              "font-mono text-[10px] font-bold tracking-[0.06em] uppercase",
              active ? "text-foreground" : "text-muted-foreground",
            ].join(" ")}
          >
            {item.icon(active)}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
