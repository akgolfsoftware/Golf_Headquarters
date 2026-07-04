import Link from "next/link";
import { CheckCircle2, Lock, Play } from "lucide-react";
import type { LiveV2Session } from "./types";
import { plannedVolumText } from "./types";
import { LiveSessionShell } from "./LiveSessionShell";

export type LiveBriefProps = {
  data: LiveV2Session;
  canStart: boolean;
  blockReason: "completed" | "tier" | null;
};

const AXIS_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const L_PHASE_LABEL: Record<string, string> = {
  GRUNN: "Grunnfase",
  SPESIAL: "Spesialfase",
  TURNERING: "Turneringsfase",
};

function formatDateTimeEyebrow(iso: string): string {
  const d = new Date(iso);
  const date = d
    .toLocaleDateString("nb-NO", { weekday: "short", day: "2-digit", month: "short" })
    .toUpperCase()
    .replace(/\.$/, "")
    .replace(/\./g, "");
  const time = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

export function LiveBrief({ data, canStart, blockReason }: LiveBriefProps) {
  const totalPlannedReps = data.drills.reduce((sum, d) => sum + d.plannedReps, 0);
  const totalDurationMin = data.drills.reduce((sum, d) => sum + d.durationMinutes, 0);

  const startButton = canStart ? (
    <Link
      href={`/portal/live/${data.sessionId}/active`}
      className="flex h-16 w-full items-center justify-center gap-2 rounded-full bg-accent font-mono text-[13px] font-bold uppercase tracking-[0.04em] text-accent-foreground active:scale-[0.98]"
      style={{ boxShadow: "0 4px 18px rgba(209, 248, 67, 0.28)" }}
    >
      <Play className="h-[17px] w-[17px]" fill="currentColor" strokeWidth={0} aria-hidden />
      START ØKT
    </Link>
  ) : (
    <div className="flex h-16 w-full items-center justify-center gap-2 rounded-full border border-background/25 font-mono text-sm font-bold uppercase tracking-[0.06em] text-background/65">
      {blockReason === "completed" ? (
        <>
          <CheckCircle2 className="h-5 w-5 text-accent" strokeWidth={2} aria-hidden />
          Økten er fullført
        </>
      ) : (
        <>
          <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
          Live krever PRO
        </>
      )}
    </div>
  );

  return (
    <LiveSessionShell
      variant="dark"
      closeHref="/portal/planlegge"
      footer={startButton}
    >
      <div className="flex flex-col gap-0 px-5 pt-2 pb-4">
        {/* Eyebrow */}
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-accent">
          Brief · {formatDateTimeEyebrow(data.scheduledAtISO)}
        </span>

        {/* Title */}
        <h1 className="mt-3 font-display text-[30px] font-bold leading-[1.07] -tracking-[0.035em] text-background">
          {data.title}{" "}
          {data.studentName && (
            <em className="font-medium not-italic text-accent">
              med {data.studentName.split(" ")[0]}
            </em>
          )}
        </h1>

        {/* Focus/meta */}
        {data.focus && (
          <p className="mt-2 text-[13px] text-background/65">{data.focus}</p>
        )}

        {/* KPI-chips */}
        <div className="mt-5 flex gap-[9px]">
          <div className="flex-1 rounded-xl border border-background/10 bg-background/5 p-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.10em] text-background/45">
              Varighet
            </div>
            <div className="mt-[5px] font-mono text-[19px] font-semibold text-background">
              {totalDurationMin > 0 ? `${totalDurationMin} min` : "—"}
            </div>
          </div>
          <div className="flex-1 rounded-xl border border-background/10 bg-background/5 p-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.10em] text-background/45">
              Drills
            </div>
            <div className="mt-[5px] font-mono text-[19px] font-semibold text-background">
              {data.drills.length}
            </div>
          </div>
          <div className="flex-1 rounded-xl border border-background/10 bg-background/5 p-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.10em] text-background/45">
              Reps
            </div>
            <div className="mt-[5px] font-mono text-[19px] font-semibold text-accent">
              {totalPlannedReps > 0 ? `${totalPlannedReps}` : "—"}
            </div>
          </div>
        </div>

        {/* Coach comment */}
        {data.coachComment && (
          <div className="mt-5 rounded-xl border border-accent/15 bg-accent/10 px-4 py-3">
            <div className="mb-2 font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-accent">
              Coach
            </div>
            <p className="text-[13px] leading-relaxed text-background/90">
              {data.coachComment}
            </p>
          </div>
        )}

        {/* Program */}
        <div className="mt-6">
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-background/45">
            Program
          </span>

          {data.drills.length === 0 ? (
            <div className="mt-3 rounded-lg border border-dashed border-background/20 px-6 py-8 text-center text-sm text-background/50">
              Ingen drills lagt til.
            </div>
          ) : (
            <ol className="mt-[10px] flex flex-col gap-2">
              {data.drills.map((drill) => (
                <li
                  key={drill.id}
                  className="flex items-center gap-3 rounded-xl border border-background/10 bg-background/5 px-[14px] py-3"
                >
                  <span className="grid h-[26px] w-[26px] flex-shrink-0 place-items-center rounded-lg bg-background/10 font-mono text-[12px] font-bold text-accent">
                    {drill.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold text-background">
                      {drill.name}
                    </div>
                    <div className="mt-[2px] font-mono text-[10px] text-background/45">
                      {AXIS_LABEL[drill.pyramide] ?? drill.pyramide}
                      {drill.lFase ? ` · ${L_PHASE_LABEL[drill.lFase] ?? drill.lFase}` : ""}
                      {drill.durationMinutes > 0 ? ` · ${drill.durationMinutes} min` : ""}
                    </div>
                  </div>
                  {(plannedVolumText(drill) ?? (drill.plannedReps > 0 ? `${drill.plannedReps}r` : null)) && (
                    <span className="whitespace-nowrap font-mono text-[11px] font-semibold text-background/60">
                      {plannedVolumText(drill) ?? `${drill.plannedReps}r`}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="h-4" />
      </div>
    </LiveSessionShell>
  );
}
