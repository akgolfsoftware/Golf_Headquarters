/**
 * PlayerPlanMobile — lys mobil-visning av spillerens ukeplan (/portal/planlegge).
 *
 * Fersk fasit (PlayerHQ Plan-Workbench terminal-lys): «Planen din» + vertikal
 * dag-liste (Man–Fre) med økt-kort/Hviledag + status-pill, AI-banner og
 * «Generelt»-kort. ALLTID LYST tema (PlayerHQ-regel) — den mørke Workbench-en
 * brukes kun på desktop/coach.
 *
 * Ærlige valg: AI-banneret er en ekte CTA til coachen (ingen fabrikkert
 * «AI foreslår …»-anbefaling). Zoom-toggle (År/Uke/Økt) utelatt — den hører til
 * Workbench-en og ville enten vært døde knapper eller ledet til mørkt tema.
 */

import Link from "next/link";
import { ChevronRight, Dumbbell, MessageSquarePlus, Moon } from "lucide-react";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import type { WeekDay } from "@/lib/workbench/week-types";
import { cn } from "@/lib/utils";

const AKSE_LABEL: Record<string, string> = {
  fys: "Fysisk",
  tek: "Teknisk",
  slag: "Slag",
  spill: "Spill",
  turn: "Turnering",
};

function DayCard({ day }: { day: WeekDay }) {
  const events = day.events ?? [];
  const first = events[0];
  const ekstra = events.length - 1;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[14px] border bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(10,31,23,.04)]",
        day.today ? "border-l-[3px] border-l-primary border-border" : "border-border",
      )}
    >
      {/* Dag + dato */}
      <div className="w-9 shrink-0 text-center">
        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {day.dow}
        </div>
        <div className="font-display text-[18px] font-bold leading-none text-foreground">
          {day.date}
        </div>
      </div>

      {/* Innhold */}
      <div className="min-w-0 flex-1">
        {first ? (
          <>
            <p className="truncate text-[13.5px] font-semibold text-foreground">
              {first.ttl}
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
              {first.durMin} min · {AKSE_LABEL[first.ax] ?? first.ax}
              {ekstra > 0 ? ` · +${ekstra} til` : ""}
            </p>
          </>
        ) : (
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Moon size={13} strokeWidth={1.6} aria-hidden />
            Hviledag
          </p>
        )}
      </div>

      {/* Status-pill */}
      {day.today ? (
        <span className="shrink-0 rounded-full bg-[var(--lime)] px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.05em] text-[var(--forest-deep)]">
          Nå
        </span>
      ) : first ? (
        <span className="shrink-0 rounded-full bg-[rgba(0,88,64,0.08)] px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.05em] text-primary">
          Planlagt
        </span>
      ) : null}
    </div>
  );
}

export function PlayerPlanMobile({ data }: { data?: WorkbenchData }) {
  const weekDays = data?.weekDays ?? [];
  const weekNumber = data?.summary?.weekNumber;
  const sessionCount = data?.summary?.sessionCount ?? 0;

  return (
    <div className="mx-auto max-w-[480px] space-y-4 px-4 pb-24 pt-1">
      {/* Header */}
      <header>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Workbench{weekNumber != null ? ` · Uke ${weekNumber}` : ""}
        </span>
        <h1 className="mt-1 font-display text-[26px] font-bold leading-tight tracking-[-0.025em] text-foreground">
          Planen{" "}
          <em
            className="font-medium not-italic"
            style={{ fontFamily: "'Inter Tight', sans-serif", fontStyle: "italic", color: "hsl(var(--primary))" }}
          >
            din
          </em>
        </h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {sessionCount} {sessionCount === 1 ? "økt" : "økter"} denne uka
        </p>
      </header>

      {/* AI/coach-banner — ekte CTA, ikke fabrikkert anbefaling */}
      <Link
        href="/portal/coach/sporsmal/ny"
        className="flex items-center gap-3 rounded-[14px] bg-[var(--lime)] px-4 py-3 transition-opacity hover:opacity-90"
      >
        <MessageSquarePlus size={18} strokeWidth={1.75} className="shrink-0 text-[var(--forest-deep)]" aria-hidden />
        <span className="flex-1 text-[13px] font-semibold leading-snug text-[var(--forest-deep)]">
          Be coachen om et planforslag
        </span>
        <ChevronRight size={16} className="shrink-0 text-[var(--forest-deep)]" aria-hidden />
      </Link>

      {/* Dag-liste */}
      <div className="space-y-2">
        {weekDays.length > 0 ? (
          weekDays.map((d) => <DayCard key={`${d.dow}-${d.date}`} day={d} />)
        ) : (
          <div className="rounded-[14px] border border-dashed border-border bg-card px-4 py-6 text-center text-[13px] text-muted-foreground">
            Ingen plan for denne uka ennå.
          </div>
        )}
      </div>

      {/* Generelt */}
      <section className="space-y-2">
        <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Generelt
        </span>
        <Link
          href="/portal/tren/fys-plan"
          className="flex items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(10,31,23,.04)] transition-colors hover:bg-secondary"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-primary">
            <Dumbbell size={17} strokeWidth={1.6} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-foreground">Fysisk trening &amp; tester</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
              FYS-plan · testbatteri
            </p>
          </div>
          <ChevronRight size={16} className="shrink-0 text-muted-foreground" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
