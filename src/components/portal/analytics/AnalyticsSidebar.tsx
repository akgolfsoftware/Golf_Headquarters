"use client";

import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Crosshair,
  Dumbbell,
  Flag,
  GitCompare,
  Radar,
  Settings,
  Target,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { CATEGORIES } from "./categories";
import type { AnalyticsCategory, CategoryMeta } from "./categories";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  activity: Activity,
  dumbbell: Dumbbell,
  target: Target,
  "circle-dot": CircleDot,
  flag: Flag,
  "git-compare": GitCompare,
  "trending-up": TrendingUp,
  trophy: Trophy,
  "calendar-days": CalendarDays,
  "clipboard-check": ClipboardCheck,
  bullseye: Crosshair,
  radar: Radar,
};

const TONE_CLASSES: Record<NonNullable<CategoryMeta["tone"]>, string> = {
  fys: "bg-[var(--color-pyr-fys-track)] text-[var(--pyr-fys)]",
  tek: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  slag: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
  spill: "bg-[var(--color-pyr-spill-track)] text-[var(--accent-foreground)]",
  turn: "bg-[var(--color-pyr-turn-track)] text-[var(--pyr-turn)]",
};

export type AnalyticsSidebarProps = {
  active: AnalyticsCategory;
  onSelect: (c: AnalyticsCategory) => void;
};

export function AnalyticsSidebar({ active, onSelect }: AnalyticsSidebarProps) {
  return (
    <aside className="sb">
      <div className="grp is-open">
        <button type="button" className="grp-head">
          <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="lbl">Analysekategorier</span>
          <span className="ct">{CATEGORIES.length}</span>
          <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
        </button>
        <div className="grp-body">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] ?? Activity;
            const isActive = active === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onSelect(cat.key)}
                className={
                  "flex w-full items-center gap-4 rounded-lg px-4 py-2 text-left transition-colors " +
                  (isActive
                    ? "bg-[var(--color-accent-fill)] font-semibold text-[var(--foreground)]"
                    : "text-[var(--foreground)] hover:bg-[var(--color-brand-primary-soft)]"
                )}
              >
                <span
                  className={"flex h-7 w-7 items-center justify-center rounded-md " +
                    (cat.tone ? TONE_CLASSES[cat.tone] : "bg-[var(--secondary)] text-[var(--muted-foreground)]")
                  }
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                </span>
                <span className="text-xs leading-tight tracking-[-0.005em]">{cat.label}</span>
                {isActive && <ChevronRight className="ml-auto h-3 w-3 text-[var(--muted-foreground)]" strokeWidth={1.5} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grp">
        <button type="button" className="grp-head">
          <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="lbl">Rapporter</span>
          <span className="ct">V2</span>
          <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
