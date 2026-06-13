import { CheckCircle2, Clock, Dumbbell, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { LiveV2Summary } from "./types";

export type SessionSummaryProps = {
  data: LiveV2Summary;
};

const AXIS_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const AXIS_BAR: Record<string, string> = {
  FYS: "hsl(154, 49%, 56%)",
  TEK: "hsl(34, 80%, 60%)",
  SLAG: "hsl(222, 100%, 76%)",
  SPILL: "hsl(72, 92%, 62%)",
  TURN: "hsl(2, 80%, 75%)",
};

function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SessionSummary({ data }: SessionSummaryProps) {
  const firstName = data.studentName?.split(" ")[0] ?? "spiller";
  const completionPct =
    data.drills.length > 0 ? Math.round((data.drillsCompleted / data.drills.length) * 100) : 0;

  const pyramidEntries = Object.entries(data.pyramidSummary)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {/* Hilsen */}
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-accent/15">
          <CheckCircle2 className="h-8 w-8 text-accent" strokeWidth={2} aria-hidden />
        </div>
        <h1 className="font-display text-3xl font-bold leading-[1.1] -tracking-[0.02em] text-background">
          Bra jobba, {firstName}!
        </h1>
        <p className="mt-2 text-sm text-background/65">
          {completionPct === 100
            ? "Du fullførte hele økta."
            : `Du fullførte ${data.drillsCompleted} av ${data.drills.length} drills.`}
        </p>
      </div>

      {/* KPI-kort */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-background/10 bg-background/5 p-4 text-center">
          <Dumbbell className="mx-auto h-5 w-5 text-accent" strokeWidth={2} aria-hidden />
          <div className="mt-4 font-mono text-3xl font-bold leading-none text-background">
            {data.totalReps}
          </div>
          <div className="mt-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/55">
            Reps
          </div>
        </div>
        <div className="rounded-2xl border border-background/10 bg-background/5 p-4 text-center">
          <Clock className="mx-auto h-5 w-5 text-accent" strokeWidth={2} aria-hidden />
          <div className="mt-4 font-mono text-3xl font-bold leading-none text-background">
            {fmtMSS(data.durationSec)}
          </div>
          <div className="mt-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/55">
            Tid
          </div>
        </div>
        <div className="rounded-2xl border border-background/10 bg-background/5 p-4 text-center">
          <Target className="mx-auto h-5 w-5 text-accent" strokeWidth={2} aria-hidden />
          <div className="mt-4 font-mono text-3xl font-bold leading-none text-background">
            {data.drillsCompleted}
          </div>
          <div className="mt-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/55">
            Drills
          </div>
        </div>
      </div>

      {/* Pyramide-oppsummering */}
      {pyramidEntries.length > 0 && (
        <div className="rounded-2xl border border-background/10 bg-background/5 p-4">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" strokeWidth={2} aria-hidden />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/70">
              Fordeling etter pyramide
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {pyramidEntries.map(([axis, reps]) => {
              const pct = data.totalReps > 0 ? (reps / data.totalReps) * 100 : 0;
              return (
                <div key={axis}>
                  <div className="mb-2 flex items-center justify-between font-mono text-xs font-semibold">
                    <span style={{ color: AXIS_BAR[axis] ?? "hsl(var(--background))" }}>
                      {AXIS_LABEL[axis] ?? axis}
                    </span>
                    <span className="text-background">{reps} reps</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-background/10">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: AXIS_BAR[axis] ?? "hsl(var(--accent))",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drill-liste */}
      <div className="rounded-2xl border border-background/10 bg-background/5 p-4">
        <div className="mb-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/70">
          Drills fullført
        </div>
        <ul className="flex flex-col gap-2">
          {data.drills.map((drill) => {
            const log = data.existingLogs.find((l) => l.drillId === drill.id);
            return (
              <li
                key={drill.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-background/10 bg-foreground/40 px-4 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm font-semibold text-background">
                    {drill.name}
                  </div>
                  <div className="mt-0.5 font-mono text-xs font-semibold text-background/50">
                    {AXIS_LABEL[drill.pyramide] ?? drill.pyramide}
                  </div>
                </div>
                <div className="text-right">
                  {log ? (
                    <>
                      <div className="font-mono text-lg font-bold text-accent">
                        {log.repsTotal}
                      </div>
                      <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-background/50">
                        reps
                      </div>
                    </>
                  ) : (
                    <span className="font-mono text-xs font-semibold text-background/40">
                      Ikke logget
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA */}
      <Link
        href="/portal/planlegge"
        className="flex h-16 w-full items-center justify-center gap-2 rounded-full bg-accent font-mono text-base font-extrabold uppercase tracking-[0.06em] text-foreground active:scale-[0.98]"
        style={{ boxShadow: "0 4px 18px rgba(209, 248, 67, 0.28)" }}
      >
        Gå til treningsplanen
      </Link>
    </div>
  );
}
