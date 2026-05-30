"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PresenceDot, type PresenceState } from "@/components/athletic/presence-dot";

export type AgencyNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: { value: string | number; tone?: "neutral" | "alert" | "lime" };
  kbd?: string;
  primary?: boolean;
};

export type AgencyNavGroup = { label: string; items: AgencyNavItem[] };

export type AgencyOrg = { initials: string; name: string; sub?: string };
export type AgencyUser = {
  initials: string;
  name: string;
  role: string;
  presence?: PresenceState;
};

type AgencySidebarProps = {
  groups: AgencyNavGroup[];
  org: AgencyOrg;
  user: AgencyUser;
  mode?: "expanded" | "rail";
  onToggle?: () => void;
  onSwitchOrg?: () => void;
  statusLine?: string;
  className?: string;
};

const badgeTone = {
  neutral: "bg-white/10 text-white",
  alert: "bg-destructive text-white",
  lime: "bg-accent text-coach-sidebar",
} as const;

export function AgencySidebar({
  groups,
  org,
  user,
  mode = "expanded",
  onToggle,
  onSwitchOrg,
  statusLine,
  className,
}: AgencySidebarProps) {
  const pathname = usePathname();
  const rail = mode === "rail";

  return (
    <aside
      aria-label="AgencyOS-navigasjon"
      className={cn(
        "flex h-full flex-col overflow-hidden bg-coach-sidebar text-white",
        rail ? "w-14" : "w-60",
        className,
      )}
    >
      {/* Brand-header */}
      <div className={cn("flex items-center gap-2.5 border-b border-white/10 px-3.5 py-3.5", rail && "justify-center px-0")}>
        <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent font-display text-[13px] font-bold lowercase text-coach-sidebar">
          ak
        </span>
        {!rail && (
          <>
            <span className="flex min-w-0 flex-1 flex-col leading-[1.1]">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/55">AgencyOS</span>
              <span className="mt-0.5 font-display text-[13px] font-bold tracking-[-0.015em] text-white">AK Golf HQ</span>
            </span>
            <button
              type="button"
              onClick={onToggle}
              aria-label="Skjul sidemeny"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 text-white/65 hover:bg-white/5 hover:text-white"
            >
              <PanelLeftClose className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {rail && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Vis sidemeny"
          className="mx-auto mt-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-white/55 hover:bg-white/5 hover:text-white"
        >
          <PanelLeftOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}

      {/* Org-switcher (kun utvidet) */}
      {!rail && (
        <button
          type="button"
          onClick={onSwitchOrg}
          className="mx-2.5 mb-1.5 mt-2.5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-left hover:bg-white/[0.07]"
        >
          <span className="inline-flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-md bg-accent font-display text-[11px] font-bold text-coach-sidebar">
            {org.initials}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-bold leading-[1.15] tracking-[-0.005em] text-white">
            {org.name}
            {org.sub && (
              <span className="mt-0.5 block font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-white/55">{org.sub}</span>
            )}
          </span>
          <ChevronsUpDown className="h-3 w-3 flex-shrink-0 text-white/55" strokeWidth={1.5} />
        </button>
      )}

      {/* Nav */}
      <nav aria-label="Hovedmeny" className={cn("flex-1 overflow-y-auto pb-4 pt-2", rail ? "px-1" : "px-2")}>
        {groups.map((group, gi) => (
          <div
            key={group.label}
            className={cn(
              !rail && "mt-3.5 first:mt-0",
              rail && gi > 0 && "mt-2.5 border-t border-white/10 pt-2.5",
            )}
          >
            {!rail && (
              <div className="px-2.5 pb-2.5 pt-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/40">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={rail ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center rounded-lg transition-colors",
                    rail ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-accent/[0.08] text-white"
                      : item.primary
                        ? "text-white hover:bg-white/5"
                        : "text-white/75 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {active && (
                    <span className="absolute -left-2 bottom-2 top-2 w-[3px] rounded-full bg-accent [box-shadow:0_0_8px_rgba(209,248,67,0.5)]" />
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center justify-center",
                      rail ? "h-9 w-9 rounded-lg" : "h-[18px] w-[18px]",
                      active && "text-accent",
                      active && rail && "bg-accent/[0.12]",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </span>
                  {!rail && (
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium tracking-[-0.005em]">{item.label}</span>
                  )}
                  {!rail && item.kbd && (
                    <span className="rounded-[3px] bg-white/[0.06] px-1.5 py-px font-mono text-[9px] font-bold tracking-[0.04em] text-white/45">
                      {item.kbd}
                    </span>
                  )}
                  {item.badge && (
                    <span
                      className={cn(
                        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 font-mono text-[9px] font-extrabold tabular-nums",
                        rail && "absolute right-1.5 top-1 h-3.5 min-w-3.5 px-1 text-[8px] ring-2 ring-coach-sidebar",
                        active && item.badge.tone !== "alert"
                          ? "bg-accent/20 text-accent"
                          : badgeTone[item.badge.tone ?? "neutral"],
                      )}
                    >
                      {item.badge.value}
                    </span>
                  )}
                  {rail && (
                    <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Coach-footer */}
      <div className={cn("flex flex-col gap-2 border-t border-white/10 px-2.5 pb-3 pt-2.5", rail && "items-center px-1")}>
        {!rail && statusLine && (
          <div className="flex items-center justify-between px-2 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-white/55">
            <span className="inline-flex items-center gap-1.5 text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent [box-shadow:0_0_6px_rgba(209,248,67,0.7)]" />ONLINE
            </span>
            <span>{statusLine}</span>
          </div>
        )}
        <div className={cn("flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/5", rail && "px-0")}>
          <span className="relative inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-foreground">
            {user.initials}
            <PresenceDot state={user.presence ?? "online"} overlay ringClassName="ring-coach-sidebar" />
          </span>
          {!rail && (
            <>
              <span className="flex min-w-0 flex-1 flex-col leading-[1.15]">
                <span className="truncate text-[13px] font-bold tracking-[-0.005em] text-white">{user.name}</span>
                <span className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-white/55">{user.role}</span>
              </span>
              <button
                type="button"
                aria-label="Profilmeny"
                className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-md text-white/55 hover:bg-white/[0.06] hover:text-white"
              >
                <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
