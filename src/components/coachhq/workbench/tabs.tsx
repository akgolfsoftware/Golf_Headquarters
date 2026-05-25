"use client";

/**
 * CoachTabs — horisontal tab-bar i Coach Workbench.
 *
 * 5 tabs: I dag, Plan, Analyse, Notater, Kommunikasjon.
 * Aktiv tab: bottom-border + foreground-color.
 * Inactive: muted-foreground med hover-state.
 * Mobil: horisontal scroll.
 * URL-state: ?tab=<key>.
 *
 * Bruker URL-search-params for state. Hvis onChange er gitt, kalles den i
 * tillegg til URL-oppdateringen — slik kan koordinator reagere uten å lese
 * URL-en selv.
 */

import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ClipboardList,
  BarChart3,
  StickyNote,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export type CoachTab = "idag" | "plan" | "analyse" | "notater" | "kommunikasjon";

export type CoachTabsProps = {
  active: CoachTab;
  onChange?: (tab: CoachTab) => void;
  spillerId: string;
  counts?: Partial<Record<CoachTab, number>>;
  className?: string;
};

// ---------- Tab-definisjoner ----------

type TabDef = {
  key: CoachTab;
  label: string;
  Icon: typeof CalendarIcon;
};

const TABS: ReadonlyArray<TabDef> = [
  { key: "idag", label: "I dag", Icon: CalendarIcon },
  { key: "plan", label: "Plan", Icon: ClipboardList },
  { key: "analyse", label: "Analyse", Icon: BarChart3 },
  { key: "notater", label: "Notater", Icon: StickyNote },
  { key: "kommunikasjon", label: "Kommunikasjon", Icon: MessageSquare },
];

// ---------- Komponent ----------

export function CoachTabs({
  active,
  onChange,
  spillerId,
  counts,
  className,
}: CoachTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick(tab: CoachTab) {
    if (tab === active) return;

    // Bygg ny URL med eksisterende search-params + oppdatert tab.
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", tab);
    // Sørg for at modus/spiller er bevart.
    if (!params.has("modus")) params.set("modus", "individuelt");
    if (spillerId) params.set("spiller", spillerId);

    router.push(`/admin/agencyos?${params.toString()}`);
    onChange?.(tab);
  }

  return (
    <div
      role="tablist"
      aria-label="Workbench-faner"
      className={cn(
        "flex items-end gap-1 overflow-x-auto scrollbar-none",
        className,
      )}
    >
      {TABS.map(({ key, label, Icon }) => {
        const isActive = key === active;
        const count = counts?.[key];

        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleClick(key)}
            className={cn(
              "group relative inline-flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "border-b-2",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span>{label}</span>
            {count !== undefined && count > 0 ? (
              <span
                className={cn(
                  "rounded-full px-1.5 font-mono text-[10px] font-semibold tabular-nums",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground",
                )}
                aria-label={`${count} elementer`}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
