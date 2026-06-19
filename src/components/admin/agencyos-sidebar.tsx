"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronsUpDown, MoreHorizontal } from "lucide-react";
import { buildAdminNav, leafActive, type SidebarCounts } from "@/lib/admin-nav";

/**
 * AgencyOS-sidebar — port av fasit `agencyos-app/core.jsx` (Sidebar + NAV).
 * Mørk forest-900-flate med ekspanderbare grupper og live badge-tall.
 * Nav-strukturen kommer fra delt config i `@/lib/admin-nav` (samme kilde
 * som mobil-skuffen). Badge-tallene kommer fra AdminShell (ekte Prisma-tellinger).
 */

type Props = {
  counts: SidebarCounts;
  sessionsToday: number;
  coach: { name: string; role: string; initials: string };
  org: { name: string; players: number; tier: string };
  workbenchHref: string;
};

function Badge({ value, cls }: { value: number; cls?: "alert" | "lime" }) {
  if (!value) return null;
  const tone =
    cls === "alert"
      ? "bg-[var(--color-alert-coral)] text-[var(--color-coach-sidebar)]"
      : cls === "lime"
        ? "bg-accent text-accent-foreground"
        : "bg-foreground/10 text-foreground";
  return (
    <span
      className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[5px] font-mono text-[9px] font-extrabold tabular-nums ${tone}`}
    >
      {value}
    </span>
  );
}

export function AgencyosSidebar({ counts, sessionsToday, coach, org, workbenchHref }: Props) {
  const path = usePathname();
  const nav = buildAdminNav(workbenchHref);

  // Finn gruppen som eier aktiv rute — den starter ekspandert (fasit-oppførsel).
  const activeGroup = (() => {
    for (const section of nav)
      for (const it of section.items)
        if (it.type === "group" && it.children.some((c) => leafActive(path, c))) return it.key;
    return null;
  })();
  // Når ruten flytter til en annen gruppe, åpnes den gruppen (fasit-oppførsel).
  // Justering under render (ikke effect) per React-anbefalingen.
  const [expanded, setExpanded] = useState<string | null>(activeGroup);
  const [prevActiveGroup, setPrevActiveGroup] = useState(activeGroup);
  if (activeGroup !== prevActiveGroup) {
    setPrevActiveGroup(activeGroup);
    if (activeGroup) setExpanded(activeGroup);
  }

  return (
    <aside
      aria-label="AgencyOS sidemeny"
      className="sticky top-0 flex h-screen w-[244px] shrink-0 flex-col bg-[var(--color-coach-sidebar)] text-foreground"
    >
      {/* Brand */}
      <div className="flex items-center gap-[10px] px-4 pb-[14px] pt-4">
        <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-accent">
          <Image src="/logos/ak-golf-logo-primary-mono.svg" alt="AK" width={22} height={22} />
        </span>
        <span className="flex min-w-0 flex-col leading-[1.1]">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-foreground/55">
            AgencyOS
          </span>
          <span className="mt-[2px] font-display text-sm font-bold tracking-[-0.015em]">AK Golf HQ</span>
        </span>
      </div>

      {/* Org-velger */}
      <div
        className="mx-3 mb-2 mt-[2px] flex items-center gap-[9px] rounded-[9px] border border-[var(--color-coach-sidebar-border)] bg-foreground/[0.04] px-[11px] py-[9px] text-left"
      >
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-accent font-display text-[11px] font-bold text-accent-foreground">
          {org.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-bold tracking-[-0.005em]">
          {org.name}
          <span className="mt-[2px] block font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-foreground/50">
            {org.players} spillere · {org.tier.toLowerCase()}
          </span>
        </span>
        <ChevronsUpDown className="h-[13px] w-[13px] shrink-0 text-foreground/50" strokeWidth={1.5} />
      </div>

      {/* Nav */}
      <nav aria-label="Hovednavigasjon" className="flex-1 overflow-y-auto px-[10px] pb-[14px] pt-[6px]">
        {nav.map((section, si) => (
          <div key={section.label} className={si === 0 ? "mt-[2px]" : "mt-3"}>
            <div className="px-[10px] pb-2 pt-[6px] font-mono text-[9px] font-extrabold uppercase leading-none tracking-[0.12em] text-foreground/[0.38]">
              {section.label}
            </div>
            {section.items.map((it) => {
              if (it.type === "item") {
                const active = leafActive(path, it);
                return (
                  <Link
                    key={it.key}
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative grid w-full grid-cols-[18px_1fr_auto] items-center gap-x-3 rounded-lg px-3 py-[9px] text-left transition-colors ${
                      active
                        ? "bg-accent/[0.08] text-foreground before:absolute before:-left-[10px] before:bottom-2 before:top-2 before:w-[3px] before:rounded-full before:bg-accent before:shadow-[0_0_8px_rgba(209,248,67,0.5)]"
                        : it.primary
                          ? "text-foreground hover:bg-foreground/5"
                          : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <span className={`inline-flex h-[18px] w-[18px] items-center justify-center ${active ? "text-accent" : ""}`}>
                      <it.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </span>
                    <span className="truncate text-[13px] font-medium leading-[1.2] tracking-[-0.005em]">{it.label}</span>
                    {it.badge ? <Badge value={counts[it.badge]} cls={it.badgeCls} /> : null}
                  </Link>
                );
              }

              const exp = expanded === it.key;
              const gActive = it.children.some((c) => leafActive(path, c));
              return (
                <div key={it.key}>
                  <button
                    type="button"
                    onClick={() => setExpanded(exp ? null : it.key)}
                    aria-expanded={exp}
                    className={`relative grid w-full grid-cols-[18px_1fr_auto] items-center gap-x-3 rounded-lg px-3 py-[9px] text-left transition-colors ${
                      gActive && !exp
                        ? "bg-accent/[0.08] text-foreground before:absolute before:-left-[10px] before:bottom-2 before:top-2 before:w-[3px] before:rounded-full before:bg-accent before:shadow-[0_0_8px_rgba(209,248,67,0.5)]"
                        : it.primary
                          ? "text-foreground hover:bg-foreground/5"
                          : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <span className={`inline-flex h-[18px] w-[18px] items-center justify-center ${gActive && !exp ? "text-accent" : ""}`}>
                      <it.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </span>
                    <span className="truncate text-[13px] font-medium leading-[1.2] tracking-[-0.005em]">{it.label}</span>
                    <ChevronRight
                      className={`h-[14px] w-[14px] opacity-55 transition-transform duration-[180ms] ${exp ? "rotate-90" : ""}`}
                      strokeWidth={1.5}
                    />
                  </button>
                  {exp && (
                    <div className="overflow-hidden">
                      {it.children.map((c) => {
                        const childActive = leafActive(path, c);
                        return (
                          <Link
                            key={c.key}
                            href={c.href}
                            aria-current={childActive ? "page" : undefined}
                            className={`relative flex w-full items-center rounded-[7px] py-[7px] pl-[42px] pr-3 text-left text-[12.5px] font-medium leading-[1.2] transition-colors ${
                              childActive
                                ? "font-semibold text-white before:absolute before:left-6 before:top-1/2 before:h-[5px] before:w-[5px] before:-translate-y-1/2 before:rounded-full before:bg-accent before:shadow-[0_0_6px_rgba(209,248,67,0.5)]"
                                : "text-foreground/[0.58] hover:bg-foreground/5 hover:text-foreground/90"
                            }`}
                          >
                            {c.label}
                            {c.badge && counts[c.badge] ? (
                              <span className="ml-auto font-mono text-[9px] font-extrabold text-foreground/50">
                                {counts[c.badge]}
                              </span>
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — status + hvem */}
      <div className="border-t border-[var(--color-coach-sidebar-border)] px-3 pb-3 pt-[10px]">
        <div className="flex items-center justify-between px-[6px] pb-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-foreground/55">
          <span className="inline-flex items-center gap-[5px] text-accent before:h-[6px] before:w-[6px] before:rounded-full before:bg-accent before:shadow-[0_0_6px_rgba(209,248,67,0.7)] before:content-['']">
            Online
          </span>
          <span>
            {sessionsToday} {sessionsToday === 1 ? "økt" : "økter"} i dag
          </span>
        </div>
        <Link
          href="/admin/settings"
          className="grid grid-cols-[32px_1fr_22px] items-center gap-x-[10px] rounded-lg px-[6px] py-[6px] hover:bg-foreground/5"
        >
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-secondary-foreground after:absolute after:bottom-[1px] after:right-[1px] after:h-2 after:w-2 after:rounded-full after:border-2 after:border-[var(--color-coach-sidebar)] after:bg-success after:content-['']">
            {coach.initials}
          </span>
          <span className="flex min-w-0 flex-col leading-[1.15]">
            <span className="truncate text-[13px] font-bold tracking-[-0.005em]">{coach.name}</span>
            <span className="mt-[2px] font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-foreground/55">
              {coach.role}
            </span>
          </span>
          <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-md text-foreground/55">
            <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={1.5} />
          </span>
        </Link>
      </div>
    </aside>
  );
}
