"use client";

import { useTransition } from "react";
import {
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  PlusCircle,
  Share2,
  Search,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { setActivePlan } from "@/app/portal/planlegge/actions";
import type { WorkbenchPlan, WorkbenchView } from "./types";

type WorkbenchTopbarProps = {
  plans: WorkbenchPlan[];
  activePlanId: string | null;
  view: WorkbenchView;
  weekNumber: number;
  onViewChange: (view: WorkbenchView) => void;
  onNewSession: () => void;
};

const VIEWS: { key: WorkbenchView; label: string; icon: typeof List }[] = [
  { key: "week", label: "Uke", icon: CalendarDays },
  { key: "day", label: "Dag", icon: CalendarDays },
  { key: "list", label: "Liste", icon: List },
  { key: "kanban", label: "Kanban", icon: List },
  { key: "dashboard", label: "Dashboard", icon: List },
];

export function WorkbenchTopbar({
  plans,
  activePlanId,
  view,
  weekNumber,
  onViewChange,
  onNewSession,
}: WorkbenchTopbarProps) {
  const [isPending, startTransition] = useTransition();

  const activePlan = plans.find((p) => p.id === activePlanId);
  const otherPlan = plans.find((p) => p.id !== activePlanId);

  const handlePlanSwitch = (planId: string | null) => {
    if (!planId || planId === activePlanId || isPending) return;
    startTransition(async () => {
      await setActivePlan(planId);
    });
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-[var(--color-player-sidebar)] px-4 text-white">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="font-display text-xs font-bold text-primary-foreground">AK</span>
        </div>
        <div className="hidden font-mono text-[10px] font-bold uppercase tracking-widest text-white/60 lg:block">
          Workbench · Planlegging
        </div>
      </div>

      {/* Plan A/B */}
      <div
        className="flex items-center rounded-full bg-white/10 p-1"
        style={isPending ? { opacity: 0.6, pointerEvents: "none" } : undefined}
      >
        <button
          type="button"
          onClick={() => handlePlanSwitch(activePlan?.id ?? null)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition",
            activePlan ? "bg-accent text-primary" : "text-white/70 hover:bg-white/10",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Plan A
        </button>
        <button
          type="button"
          onClick={() => handlePlanSwitch(otherPlan?.id ?? null)}
          disabled={!otherPlan}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-40",
            activePlanId === otherPlan?.id ? "bg-accent text-primary" : "text-white/70 hover:bg-white/10",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Plan B
        </button>
      </div>

      {/* View toggle */}
      <div className="hidden items-center rounded-lg bg-white/10 p-1 md:flex">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          const active = view === v.key;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => onViewChange(v.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition",
                active ? "bg-primary text-accent" : "text-white/70 hover:bg-white/10",
              )}
            >
              <Icon size={12} aria-hidden />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 lg:flex">
          <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:text-white" aria-label="Forrige uke">
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/90">
            Uke {weekNumber}
          </span>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:text-white" aria-label="Neste uke">
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10"
          aria-label="Søk"
        >
          <Search size={16} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="relative grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10"
          aria-label="Varsler"
        >
          <Bell size={16} strokeWidth={1.5} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <Button
          variant="lime"
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-3 text-[11px]"
          onClick={onNewSession}
        >
          <CalendarPlus size={14} strokeWidth={1.5} />
          <span className="hidden sm:inline">Ny økt</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="hidden h-8 gap-1.5 rounded-lg px-3 text-[11px] text-foreground sm:flex"
        >
          <PlusCircle size={14} strokeWidth={1.5} />
          Ny plan
        </Button>
        <Button
          variant="ghost-dark"
          size="sm"
          className="hidden h-8 gap-1.5 rounded-lg px-3 text-[11px] sm:flex"
        >
          <Share2 size={14} strokeWidth={1.5} />
          Del
        </Button>
      </div>
    </header>
  );
}
