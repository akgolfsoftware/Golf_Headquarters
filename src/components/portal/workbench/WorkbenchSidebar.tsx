"use client";

import { useState } from "react";
import {
  CalendarRange,
  Layers,
  LayoutGrid,
  Trophy,
  Target,
  BarChart3,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StandardSessionItem } from "./StandardSessionItem";
import type {
  Axis,
  WorkbenchGoal,
  WorkbenchPyramidRow,
  WorkbenchStandardSession,
  WorkbenchTournament,
} from "./types";

type WorkbenchSidebarProps = {
  standardSessions: WorkbenchStandardSession[];
  tournaments: WorkbenchTournament[];
  goals: WorkbenchGoal[];
  axisHours: WorkbenchPyramidRow[];
  onDragStartStandard?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
};

type SectionProps = {
  icon: React.ElementType;
  label: string;
  count?: string;
  open?: boolean;
  children: React.ReactNode;
};

function Section({ icon: Icon, label, count, open = true, children }: SectionProps) {
  const [expanded, setExpanded] = useState(open);
  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((s) => !s)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-white/5"
      >
        <Icon size={14} className="text-white/60" aria-hidden />
        <span className="flex-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white/90">
          {label}
        </span>
        {count && <span className="font-mono text-[10px] text-white/50">{count}</span>}
        <ChevronRight
          size={12}
          className={cn("text-white/50 transition", expanded && "rotate-90")}
          aria-hidden
        />
      </button>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export function WorkbenchSidebar({
  standardSessions,
  tournaments,
  goals,
  axisHours,
  onDragStartStandard,
}: WorkbenchSidebarProps) {
  const pyrTotal = axisHours.reduce((a, r) => a + r.hours, 0);

  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-[var(--color-player-sidebar)]">
      {/* Sesong */}
      <Section icon={CalendarRange} label="Sesong" count="2026">
        <div className="space-y-1">
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5 text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs">2026-sesongen</span>
            <span className="ml-auto font-mono text-[10px] text-white/50">42 u</span>
          </div>
          <div className="space-y-1 pl-4">
            <div className="flex items-center gap-2 rounded-md px-2 py-1 text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--pyr-fys)]" />
              <span className="text-xs">Grunnperiode</span>
              <span className="ml-auto font-mono text-[10px] text-white/50">u. 1–14</span>
            </div>
            <div className="flex items-center gap-2 rounded-md px-2 py-1 text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--pyr-tek)]" />
              <span className="text-xs">Spesialisering</span>
              <span className="ml-auto font-mono text-[10px] text-white/50">u. 15–28</span>
            </div>
            <div className="flex items-center gap-2 rounded-md px-2 py-1 text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--pyr-turn)]" />
              <span className="text-xs">Turnering</span>
              <span className="ml-auto font-mono text-[10px] text-white/50">u. 29–42</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Planer */}
      <Section icon={Layers} label="Planer" count="A / B">
        <div className="space-y-1">
          <div className="flex items-center gap-2 rounded-lg bg-accent/20 px-2 py-1.5 text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium">Plan A · grunnperiode</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="text-xs">Plan B · alternativ</span>
          </div>
        </div>
      </Section>

      {/* Standardøkter */}
      <Section icon={LayoutGrid} label="Standardøkter" count={String(standardSessions.length)}>
        <div className="space-y-2">
          {standardSessions.map((s) => (
            <StandardSessionItem
              key={s.id}
              session={s}
              onDragStart={(e) => onDragStartStandard?.(e, s.id)}
            />
          ))}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-white/40 hover:text-white/80"
          >
            <Plus size={12} />
            Opprett standardøkt
          </button>
        </div>
      </Section>

      {/* Turneringer */}
      <Section icon={Trophy} label="Turneringer" count={String(tournaments.filter((t) => t.soon).length)}>
        <div className="space-y-1">
          {tournaments.length === 0 && (
            <div className="text-xs text-white/50">Ingen kommende turneringer</div>
          )}
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-white/80 hover:bg-white/5"
            >
              <span className="min-w-0 truncate text-xs">{t.name}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold",
                  t.soon ? "bg-destructive/20 text-destructive-foreground" : "bg-white/10 text-white/60",
                )}
              >
                {t.daysLeft != null ? `${t.daysLeft} dg` : "—"}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Mål */}
      <Section icon={Target} label="Mål" count={String(goals.length)}>
        <div className="space-y-2">
          {goals.length === 0 && <div className="text-xs text-white/50">Ingen aktive mål</div>}
          {goals.map((g) => (
            <div key={g.id} className="rounded-lg bg-white/5 px-2 py-1.5">
              <div className="text-xs text-white/90">{g.title}</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-white/50">
                {goalCategoryLabel(g.category)} · {axisLabel(g.type)}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-white/40 hover:text-white/80"
          >
            <Plus size={12} />
            Ny målsetting
          </button>
        </div>
      </Section>

      {/* Statspyramide */}
      <Section icon={BarChart3} label="Statspyramide" count="30 d">
        <div className="space-y-2">
          {axisHours.map((row) => (
            <div key={row.ax} className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-mono font-bold uppercase tracking-wider text-white/80">
                  {row.lbl}
                </span>
                <span className="font-mono text-white/50">{row.hours} t</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn("h-full rounded-full", pyrBarColor(row.ax))}
                  style={{ width: `${pyrTotal > 0 ? (row.hours / pyrTotal) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </aside>
  );
}

function goalCategoryLabel(category: string): string {
  if (category === "PROCESS") return "Prosessmål";
  if (category === "OUTCOME") return "Resultatmål";
  return category;
}

function axisLabel(type: string): Axis {
  if (type === "SG_AREA") return "spill";
  if (type === "HCP_TARGET") return "tek";
  return "fys";
}

function pyrBarColor(ax: Axis): string {
  switch (ax) {
    case "fys":
      return "bg-[var(--pyr-fys)]";
    case "tek":
      return "bg-[var(--pyr-tek)]";
    case "slag":
      return "bg-[var(--pyr-slag)]";
    case "spill":
      return "bg-[var(--pyr-spill)]";
    case "turn":
      return "bg-[var(--pyr-turn)]";
  }
}
