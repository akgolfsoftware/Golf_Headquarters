import Link from "next/link";
import { CheckCircle2, Lock, Play } from "lucide-react";
import type { LiveSessionData } from "@/lib/portal-live/types";
import { AXIS_LABEL, formatDateTimeEyebrow } from "@/lib/portal-live/format";
import { LiveSessionShell } from "./LiveSessionShell";
import { LiveLoopNav } from "./LiveLoopNav";
import { startPlanSession } from "@/lib/portal-live/actions";
import { T } from "@/lib/v2/tokens";

const L_PHASE_LABEL: Record<string, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialiseringsperiode",
  TURNERING: "Turneringsperiode",
};

export type PlanSessionBriefProps = {
  data: LiveSessionData;
  canStart: boolean;
  blockReason: "completed" | "tier" | "coach" | null;
};

export function PlanSessionBrief({ data, canStart, blockReason }: PlanSessionBriefProps) {
  const startButton = canStart ? (
    <form action={startPlanSession.bind(null, data.sessionId)}>
      <button
        type="submit"
        data-od-id="brief-start"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] font-sans text-[14px] font-semibold active:scale-[0.98]"
        style={{ background: T.handling, color: T.onHandling, width: "100%", border: "none" }}
      >
        <Play className="h-[17px] w-[17px]" fill="currentColor" strokeWidth={0} aria-hidden />
        Start økt
      </button>
    </form>
  ) : (
    <div className="flex h-16 w-full items-center justify-center gap-2 rounded-full border border-background/25 font-mono text-sm font-bold uppercase tracking-[0.06em] text-background/65">
      {blockReason === "completed" ? (
        <>
          <CheckCircle2 className="h-5 w-5 text-accent" strokeWidth={2} aria-hidden />
          Økten er fullført
        </>
      ) : blockReason === "coach" ? (
        <>Coach-visning — kun spilleren kan starte</>
      ) : (
        <>
          <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
          Live krever PRO
        </>
      )}
    </div>
  );

  const goalLines = data.rationale
    ? data.rationale
        .split(/\n|·/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <LiveSessionShell variant="paper" closeHref="/portal/planlegge/workbench" footer={startButton}>
      <div data-paper-portal-live-brief className="flex flex-col gap-0 px-5 pt-2 pb-4" style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <LiveLoopNav aktiv="for" sessionId={data.sessionId} />
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-accent">
          Økt-intro · {formatDateTimeEyebrow(data.scheduledAtISO)}
        </span>

        <h1 className="mt-3 font-display text-[30px] font-bold leading-[1.07] -tracking-[0.035em] text-background">
          {data.title}
        </h1>

        <p className="mt-2 font-mono text-[12px] text-background/55">
          {data.planName} · {AXIS_LABEL[data.axis]}
        </p>

        <div className="mt-5 flex gap-[9px]">
          <div className="flex-1 rounded-xl border border-background/10 bg-background/5 p-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.10em] text-background/45">
              Varighet
            </div>
            <div className="mt-[5px] font-mono text-[19px] font-semibold text-background">
              {data.durationMin > 0 ? `${data.durationMin} min` : "—"}
            </div>
          </div>
          <div className="flex-1 rounded-xl border border-background/10 bg-background/5 p-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.10em] text-background/45">
              Øvelser
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
              {data.totalPlannedReps > 0 ? `${data.totalPlannedReps}` : "—"}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-background/45">
            Plan
          </span>

          {data.drills.length === 0 ? (
            <div className="mt-3 rounded-lg border border-dashed border-background/20 px-6 py-8 text-center text-sm text-background/50">
              Ingen øvelser lagt til.
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
                      {AXIS_LABEL[drill.axis]}
                      {drill.lPhase ? ` · ${L_PHASE_LABEL[drill.lPhase] ?? drill.lPhase}` : ""}
                      {drill.plannedReps > 0 ? ` · ${drill.repsLabel}` : ""}
                    </div>
                  </div>
                  {drill.csTarget != null && (
                    <span className="font-mono text-[11px] font-semibold text-background/60">
                      CS {drill.csTarget}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        {goalLines.length > 0 && (
          <div className="mt-6">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-background/45">
              Mål for økta
            </span>
            <ul className="mt-[10px] flex flex-col gap-2">
              {goalLines.map((line, i) => (
                <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-background/85">
                  <span
                    className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.status === "ACTIVE" || data.status === "PAUSED" ? (
          <div className="mt-6">
            <Link
              href={`/portal/live/${data.sessionId}/tapper`}
              className="inline-flex font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-accent underline-offset-2 hover:underline"
            >
              Fortsett pågående økt →
            </Link>
          </div>
        ) : null}

        <div className="h-4" />
      </div>
    </LiveSessionShell>
  );
}