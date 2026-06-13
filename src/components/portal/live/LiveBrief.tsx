import Link from "next/link";
import { CheckCircle2, Lock, Target, Zap } from "lucide-react";
import type { LiveV2Session } from "./types";
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

  const startButton = canStart ? (
    <Link
      href={`/portal/live/${data.sessionId}/active`}
      className="flex h-16 w-full items-center justify-center gap-2 rounded-full bg-accent font-mono text-base font-extrabold uppercase tracking-[0.06em] text-foreground active:scale-[0.98]"
      style={{ boxShadow: "0 4px 18px rgba(209, 248, 67, 0.28)" }}
    >
      Start økt
      <Zap className="h-5 w-5" strokeWidth={2} aria-hidden />
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
      subtitle="Økt-intro"
      closeHref={`/portal/planlegge`}
      footer={startButton}
    >
      <div className="flex flex-col gap-6 px-4 py-4">
        {/* Hero */}
        <div>
          <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
            {formatDateTimeEyebrow(data.scheduledAtISO)} ·{" "}
            {AXIS_LABEL[data.pyramide] ?? data.pyramide}
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] -tracking-[0.02em] text-background">
            {data.title}
          </h1>
          <div className="mt-4 font-mono text-sm font-semibold tabular-nums text-background/65">
            {data.drills.length} {data.drills.length === 1 ? "drill" : "drills"}
            {totalPlannedReps > 0 ? ` · ${totalPlannedReps} reps planlagt` : ""}
          </div>
        </div>

        {/* Fokus / coach comment */}
        {(data.focus || data.coachComment) && (
          <div className="rounded-2xl border border-background/10 bg-background/5 p-4">
            {data.focus && (
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" strokeWidth={2} aria-hidden />
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/60">
                  Fokus
                </span>
              </div>
            )}
            {data.focus && <p className="text-base leading-relaxed text-background/90">{data.focus}</p>}
            {data.coachComment && (
              <div className="mt-4 rounded-lg border border-accent/15 bg-accent/10 px-4 py-2">
                <div className="mb-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
                  Coach
                </div>
                <p className="text-sm leading-relaxed text-background/90">{data.coachComment}</p>
              </div>
            )}
          </div>
        )}

        {/* Drills-liste */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/60">
              Plan
            </span>
            <span className="h-px flex-1 bg-background/12" aria-hidden />
          </div>
          {data.drills.length === 0 ? (
            <div className="rounded-lg border border-dashed border-background/20 px-6 py-10 text-center text-sm text-background/60">
              Ingen drills lagt til.
            </div>
          ) : (
            <ol className="flex flex-col gap-2">
              {data.drills.map((drill) => (
                <li
                  key={drill.id}
                  className="flex items-center gap-4 rounded-lg bg-background/5 px-4 py-4"
                >
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-accent font-display text-lg font-bold text-foreground">
                    {drill.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-background/55">
                      {AXIS_LABEL[drill.pyramide] ?? drill.pyramide}
                      {drill.lFase ? ` · ${L_PHASE_LABEL[drill.lFase] ?? drill.lFase}` : ""}
                    </div>
                    <div className="truncate font-display text-base font-semibold -tracking-[0.01em] text-background">
                      {drill.name}
                    </div>
                    <div className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-background/55">
                      {drill.plannedReps > 0 ? `${drill.plannedReps} reps` : "Ingen reps-mål"}
                      {drill.durationMinutes > 0 ? ` · ${drill.durationMinutes} min` : ""}
                    </div>
                  </div>
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
