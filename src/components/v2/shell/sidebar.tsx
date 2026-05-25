"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  LineChart,
  Layers,
  MessageSquare,
  Plus,
  User,
} from "lucide-react";
import type { Player } from "@/lib/v2-fixtures";

export type SidebarProps = {
  player: Player;
};

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

const SIDEBAR_NAV: NavGroup[] = [
  {
    group: "PORTAL",
    items: [
      { id: "/", label: "Hjem", icon: <Home size={18} /> },
      { id: "/kalender", label: "Kalender", icon: <Calendar size={18} /> },
      { id: "/stats", label: "Statistikk", icon: <LineChart size={18} /> },
    ],
  },
  {
    group: "TRENING",
    items: [
      { id: "/drills", label: "Drills", icon: <Layers size={18} /> },
      { id: "/coach", label: "Coach", icon: <MessageSquare size={18} /> },
      { id: "/booking", label: "Booking", icon: <Plus size={18} /> },
    ],
  },
  {
    group: "MEG",
    items: [{ id: "/profil", label: "Profil", icon: <User size={18} /> }],
  },
];

function matchRoute(navId: string, pathname: string): boolean {
  if (navId === "/") return pathname === "/";
  return pathname === navId || pathname.startsWith(navId + "/");
}

export default function Sidebar({ player }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 h-screen border-r border-border flex flex-col gap-2 px-4 py-5"
      style={{
        background: "color-mix(in oklab, var(--background) 70%, var(--card))",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-[10px] px-2 pb-4 mb-2 border-b border-border">
        <div
          className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0 font-display italic font-bold text-[18px]"
          style={{ background: "var(--foreground)", color: "var(--accent)" }}
        >
          AK
        </div>
        <div className="flex flex-col leading-[1.15]">
          <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            PLAYERHQ · PRO
          </span>
          <span className="font-display text-[14px] font-bold tracking-[-0.01em] text-foreground">
            AK Golf
          </span>
        </div>
      </div>

      {/* Nav groups */}
      {SIDEBAR_NAV.map((group) => (
        <div key={group.group} className="flex flex-col gap-[2px] mt-1">
          <div className="font-mono text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase px-[10px] py-3">
            {group.group}
          </div>
          {group.items.map((item) => {
            const active = matchRoute(item.id, pathname);
            return (
              <Link
                key={item.id}
                href={item.id}
                className={[
                  "flex items-center gap-[10px] px-[10px] py-[9px] rounded-[10px]",
                  "text-[14px] transition-[background,color] duration-[160ms]",
                  "focus-visible:outline-2 focus-visible:outline-ring",
                  active
                    ? "font-semibold text-foreground bg-[color-mix(in_oklab,var(--accent)_20%,transparent)]"
                    : "font-medium text-muted-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] hover:text-foreground",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}

      {/* Player card */}
      <div
        className="mt-auto flex items-center gap-[10px] p-2 rounded-[12px]"
        style={{
          background: "color-mix(in oklab, var(--foreground) 4%, transparent)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0 font-display font-bold text-[13px]"
          style={{ background: "var(--primary)", color: "var(--accent)" }}
        >
          {player.initials}
        </div>
        <div className="flex flex-col leading-[1.2] min-w-0">
          <span className="text-[13px] font-semibold text-foreground">
            {player.name}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground tracking-[0.06em]">
            HCP{" "}
            <span className="tabular">{Math.abs(player.hcp).toFixed(1)}</span>{" "}
            · {player.ngfKategori}
          </span>
        </div>
      </div>
    </aside>
  );
}
