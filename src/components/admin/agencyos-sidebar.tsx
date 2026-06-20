"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { buildAdminNav, leafActive, type SidebarCounts } from "@/lib/admin-nav";

/**
 * AgencyOS desktop sidebar — 54px ikon-rail som ekspanderer til 244px på hover.
 * Ikon alltid synlig; tekst og section-labels fader inn ved hover.
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

const ITEM_BASE =
  "group/item relative flex h-10 w-full items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const ITEM_ACTIVE =
  "bg-accent/[0.08] text-foreground before:absolute before:left-0 before:bottom-2 before:top-2 before:w-[3px] before:rounded-full before:bg-accent before:shadow-[0_0_8px_rgba(209,248,67,0.5)]";
const ITEM_PRIMARY = "text-foreground hover:bg-foreground/5";
const ITEM_DEFAULT = "text-foreground/65 hover:bg-foreground/5 hover:text-foreground";

const TEXT_FADE =
  "opacity-0 transition-opacity duration-100 group-hover/sbar:opacity-100";

export function AgencyosSidebar({ counts, sessionsToday, coach, org, workbenchHref }: Props) {
  const path = usePathname();
  const nav = buildAdminNav(workbenchHref);

  const activeGroup = (() => {
    for (const section of nav)
      for (const it of section.items)
        if (it.type === "group" && it.children.some((c) => leafActive(path, c))) return it.key;
    return null;
  })();
  const [expanded, setExpanded] = useState<string | null>(activeGroup);
  const [prevActiveGroup, setPrevActiveGroup] = useState(activeGroup);
  if (activeGroup !== prevActiveGroup) {
    setPrevActiveGroup(activeGroup);
    if (activeGroup) setExpanded(activeGroup);
  }

  return (
    <aside
      aria-label="AgencyOS sidemeny"
      className="group/sbar sticky top-0 flex h-screen w-[54px] shrink-0 flex-col overflow-hidden bg-[var(--color-coach-sidebar)] text-foreground transition-[width] duration-200 hover:w-[244px]"
    >
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center gap-[10px] overflow-hidden pl-[10px]">
        <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-accent">
          <Image src="/logos/ak-golf-logo-primary-mono.svg" alt="AK" width={22} height={22} />
        </span>
        <span className={`flex min-w-0 flex-col leading-[1.1] ${TEXT_FADE}`}>
          <span className="whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-foreground/55">
            AgencyOS
          </span>
          <span className="mt-[2px] whitespace-nowrap font-display text-sm font-bold tracking-[-0.015em]">
            AK Golf HQ
          </span>
        </span>
      </div>

      {/* Org-velger (kun synlig ekspandert) */}
      <div className={`mx-[7px] mb-2 ${TEXT_FADE}`}>
        <div className="flex items-center gap-[9px] rounded-[9px] border border-[var(--color-coach-sidebar-border)] bg-foreground/[0.04] px-[11px] py-[9px]">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-accent font-display text-[11px] font-bold text-accent-foreground">
            {org.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-bold tracking-[-0.005em]">
            {org.name}
            <span className="mt-[2px] block font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-foreground/50">
              {org.players} spillere · {org.tier.toLowerCase()}
            </span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav
        aria-label="Hovednavigasjon"
        className="flex-1 overflow-y-auto overflow-x-hidden px-[7px] pb-[14px] pt-[6px]"
      >
        {nav.map((section, si) => (
          <div key={section.label} className={si === 0 ? "" : "mt-3"}>
            {/* Section-label */}
            <div className="mb-1 h-5 overflow-hidden pl-[10px]">
              <span
                className={`whitespace-nowrap font-mono text-[9px] font-extrabold uppercase leading-none tracking-[0.12em] text-foreground/[0.38] ${TEXT_FADE}`}
              >
                {section.label}
              </span>
            </div>

            {section.items.map((it) => {
              if (it.type === "item") {
                const active = leafActive(path, it);
                return (
                  <Link
                    key={it.key}
                    href={it.href}
                    title={it.label}
                    aria-current={active ? "page" : undefined}
                    className={`${ITEM_BASE} ${active ? ITEM_ACTIVE : it.primary ? ITEM_PRIMARY : ITEM_DEFAULT}`}
                  >
                    {/* Ikon — alltid synlig, sentrert i 40px */}
                    <span className="flex w-[40px] shrink-0 items-center justify-center">
                      <it.icon
                        className={`h-[18px] w-[18px] ${active ? "text-accent" : ""}`}
                        strokeWidth={1.5}
                      />
                    </span>
                    {/* Tekst — fader inn ved hover */}
                    <span className={`flex min-w-0 flex-1 items-center gap-2 pr-2 ${TEXT_FADE}`}>
                      <span className="truncate whitespace-nowrap text-[13px] font-medium leading-[1.2] tracking-[-0.005em]">
                        {it.label}
                      </span>
                      {it.badge ? <Badge value={counts[it.badge]} cls={it.badgeCls} /> : null}
                    </span>
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
                    title={it.label}
                    className={`${ITEM_BASE} ${gActive && !exp ? ITEM_ACTIVE : it.primary ? ITEM_PRIMARY : ITEM_DEFAULT}`}
                  >
                    <span className="flex w-[40px] shrink-0 items-center justify-center">
                      <it.icon
                        className={`h-[18px] w-[18px] ${gActive && !exp ? "text-accent" : ""}`}
                        strokeWidth={1.5}
                      />
                    </span>
                    <span className={`flex min-w-0 flex-1 items-center gap-2 pr-2 ${TEXT_FADE}`}>
                      <span className="truncate whitespace-nowrap text-[13px] font-medium leading-[1.2] tracking-[-0.005em]">
                        {it.label}
                      </span>
                      <ChevronRight
                        className={`ml-auto h-[14px] w-[14px] shrink-0 opacity-55 transition-transform duration-[180ms] ${exp ? "rotate-90" : ""}`}
                        strokeWidth={1.5}
                      />
                    </span>
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
                            className={`relative flex h-9 w-full items-center rounded-[7px] transition-colors ${
                              childActive
                                ? "font-semibold text-white before:absolute before:left-[36px] before:top-1/2 before:h-[5px] before:w-[5px] before:-translate-y-1/2 before:rounded-full before:bg-accent before:shadow-[0_0_6px_rgba(209,248,67,0.5)]"
                                : "text-foreground/[0.58] hover:bg-foreground/5 hover:text-foreground/90"
                            }`}
                          >
                            <span className="w-[40px] shrink-0" />
                            <span className={`flex min-w-0 flex-1 items-center pr-3 ${TEXT_FADE}`}>
                              <span className="truncate whitespace-nowrap text-[12.5px] font-medium leading-[1.2]">
                                {c.label}
                              </span>
                              {c.badge && counts[c.badge] ? (
                                <span className="ml-auto font-mono text-[9px] font-extrabold text-foreground/50">
                                  {counts[c.badge]}
                                </span>
                              ) : null}
                            </span>
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

      {/* Footer */}
      <div className="shrink-0 border-t border-[var(--color-coach-sidebar-border)] pb-3 pt-[10px]">
        {/* Online-status — kun synlig ekspandert */}
        <div className={`mb-1 flex items-center justify-between px-[10px] font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-foreground/55 ${TEXT_FADE}`}>
          <span className="inline-flex items-center gap-[5px] text-accent before:h-[6px] before:w-[6px] before:rounded-full before:bg-accent before:shadow-[0_0_6px_rgba(209,248,67,0.7)] before:content-['']">
            Online
          </span>
          <span>
            {sessionsToday} {sessionsToday === 1 ? "økt" : "økter"} i dag
          </span>
        </div>
        <Link
          href="/admin/settings"
          title={`${coach.name} – ${coach.role}`}
          className="flex h-10 w-full items-center rounded-lg hover:bg-foreground/5"
        >
          <span className="flex w-[40px] shrink-0 items-center justify-center">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-secondary-foreground after:absolute after:bottom-[1px] after:right-[1px] after:h-2 after:w-2 after:rounded-full after:border-2 after:border-[var(--color-coach-sidebar)] after:bg-success after:content-['']">
              {coach.initials}
            </span>
          </span>
          <span className={`flex min-w-0 flex-1 items-center pr-3 ${TEXT_FADE}`}>
            <span className="flex min-w-0 flex-col leading-[1.15]">
              <span className="truncate whitespace-nowrap text-[13px] font-bold tracking-[-0.005em]">
                {coach.name}
              </span>
              <span className="mt-[2px] whitespace-nowrap font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-foreground/55">
                {coach.role}
              </span>
            </span>
            <MoreHorizontal
              className="ml-auto h-[14px] w-[14px] shrink-0 text-foreground/55"
              strokeWidth={1.5}
            />
          </span>
        </Link>
      </div>
    </aside>
  );
}
