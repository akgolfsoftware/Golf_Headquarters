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
        data-paper-en-ting="true"
        className="flex w-full items-center justify-center gap-2 font-sans text-[14px] font-semibold active:scale-[0.98] v2-press"
        style={{ background: T.handling, color: T.onHandling, width: "100%", border: "none", minHeight: 56, borderRadius: 12 }}
      >
        <Play className="h-[17px] w-[17px]" fill="currentColor" strokeWidth={0} aria-hidden />
        Start økta
      </button>
    </form>
  ) : (
    <div className="flex w-full items-center justify-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.06em]" style={{ minHeight: 56, borderRadius: 12, border: `1px solid ${T.border}`, color: T.mut, background: T.panel2 }}>
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
    <LiveSessionShell
      variant="paper"
      odId="playerhq-live-brief-plan"
      title="Før økta"
      subtitle={formatDateTimeEyebrow(data.scheduledAtISO)}
      backHref="/portal/planlegge"
      closeHref="/portal/planlegge/workbench"
      footer={startButton}
    >
      <div data-paper-portal-live-brief className="flex flex-col gap-0 px-5 pt-2 pb-4" style={{ maxWidth: 720, margin: "0 auto", width: "100%", color: T.fg }}>
        <LiveLoopNav aktiv="for" sessionId={data.sessionId} />
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: T.handling }}>
          Økt-intro · {formatDateTimeEyebrow(data.scheduledAtISO)}
        </span>

        <h1 className="mt-3 font-display text-[18px] font-semibold leading-[1.15]" style={{ color: T.fg }}>
          {data.title}
        </h1>

        <p className="mt-2 font-mono text-[12px]" style={{ color: T.mut }}>
          {data.planName} · {AXIS_LABEL[data.axis]}
        </p>

        <div className="mt-5 flex gap-[9px]">
          <div className="flex-1 rounded-xl p-3" style={{ border: `1px solid ${T.border}`, background: T.panel }}>
            <div className="font-mono text-[8px] uppercase tracking-[0.10em]" style={{ color: T.mut }}>
              Varighet
            </div>
            <div className="mt-[5px] font-mono text-[19px] font-semibold" style={{ color: T.fg }}>
              {data.durationMin > 0 ? `${data.durationMin} min` : "—"}
            </div>
          </div>
          <div className="flex-1 rounded-xl p-3" style={{ border: `1px solid ${T.border}`, background: T.panel }}>
            <div className="font-mono text-[8px] uppercase tracking-[0.10em]" style={{ color: T.mut }}>
              Øvelser
            </div>
            <div className="mt-[5px] font-mono text-[19px] font-semibold" style={{ color: T.fg }}>
              {data.drills.length}
            </div>
          </div>
          <div className="flex-1 rounded-xl p-3" style={{ border: `1px solid ${T.border}`, background: T.panel }}>
            <div className="font-mono text-[8px] uppercase tracking-[0.10em]" style={{ color: T.mut }}>
              Reps
            </div>
            <div className="mt-[5px] font-mono text-[19px] font-semibold" style={{ color: T.handling }}>
              {data.totalPlannedReps > 0 ? `${data.totalPlannedReps}` : "—"}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.10em]" style={{ color: T.mut }}>
            Plan
          </span>

          {data.drills.length === 0 ? (
            <div className="mt-3 rounded-lg px-6 py-8 text-center text-sm" style={{ border: `1px dashed ${T.border}`, color: T.mut }}>
              Ingen øvelser lagt til.
            </div>
          ) : (
            <ol className="mt-[10px] flex flex-col gap-2">
              {data.drills.map((drill) => (
                <li
                  key={drill.id}
                  className="flex items-center gap-3 rounded-xl px-[14px] py-3" style={{ border: `1px solid ${T.border}`, background: T.panel }}
                >
                  <span className="grid h-[26px] w-[26px] flex-shrink-0 place-items-center rounded-lg font-mono text-[12px] font-bold" style={{ background: T.panel2, color: T.handling }}>
                    {drill.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold" style={{ color: T.fg }}>
                      {drill.name}
                    </div>
                    <div className="mt-[2px] font-mono text-[10px] ">
                      {AXIS_LABEL[drill.axis]}
                      {drill.lPhase ? ` · ${L_PHASE_LABEL[drill.lPhase] ?? drill.lPhase}` : ""}
                      {drill.plannedReps > 0 ? ` · ${drill.repsLabel}` : ""}
                    </div>
                  </div>
                  {drill.csTarget != null && (
                    <span className="font-mono text-[11px] font-semibold" style={{ color: T.mut }}>
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
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.10em]" style={{ color: T.mut }}>
              Mål for økta
            </span>
            <ul className="mt-[10px] flex flex-col gap-2">
              {goalLines.map((line, i) => (
                <li key={i} className="flex gap-3 text-[13px] leading-relaxed" style={{ color: T.fg2 }}>
                  <span
                    className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: T.handling }}
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
              className="inline-flex font-mono text-[11px] font-bold uppercase tracking-[0.06em] underline-offset-2 hover:underline" style={{ color: T.handling }}
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