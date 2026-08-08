import { CheckCircle2, Clock, Dumbbell, Target, TrendingUp, ArrowRight, CircleCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { LiveV2Summary } from "./types";
import { HjelpTips } from "@/components/v2/hjelp";
import { SpillerVurderingForm } from "./SpillerVurderingForm";
import { T } from "@/lib/v2/tokens";
import { LiveLoopNav } from "./LiveLoopNav";

export type SessionSummaryProps = {
  data: LiveV2Summary;
  nesteOkt?: { tekst: string; href: string };
  spillerVurdering?: {
    kvalitet: number;
    nesteFokus: string;
    folelse?: string | null;
  } | null;
};

const AXIS_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Verdict({ pct }: { pct: number }) {
  const onPlan = pct >= 70;
  return (
    <div
      className="flex items-start gap-3 rounded-2xl p-3.5"
      style={{
        border: `1px solid ${onPlan ? T.border : T.down}`,
        background: onPlan ? T.handlingSoft : T.panel2,
      }}
    >
      <span
        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full"
        style={{
          background: onPlan ? T.panel : T.panel2,
          color: onPlan ? T.handling : T.down,
        }}
      >
        {onPlan ? (
          <CircleCheck className="h-4 w-4" strokeWidth={2} aria-hidden />
        ) : (
          <TriangleAlert className="h-4 w-4" strokeWidth={2} aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <span
          className="inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: onPlan ? T.handling : T.down }}
        >
          {onPlan ? "På plan" : "Avvik fra plan"}
          <HjelpTips k="planEtterlevelse" size={12} />
        </span>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: T.mut }}>
          {onPlan
            ? `Du gjennomførte ${pct} % av planen. Økta teller som gjennomført på plan.`
            : `Du gjennomførte ${pct} % av planen. Logges som avvik — coachen ser hva som skjedde, helt greit.`}
        </p>
      </div>
    </div>
  );
}

export function SessionSummary({ data, nesteOkt, spillerVurdering }: SessionSummaryProps) {
  const firstName = data.studentName?.split(" ")[0] ?? "spiller";
  const completionPct =
    data.drills.length > 0 ? Math.round((data.drillsCompleted / data.drills.length) * 100) : 0;

  const pyramidEntries = Object.entries(data.pyramidSummary)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <div
      data-paper-portal-live-summary
      className="flex flex-col gap-4 px-4 py-6"
      style={{ maxWidth: 720, margin: "0 auto", width: "100%", color: T.fg }}
    >
      <LiveLoopNav aktiv="etter" sessionId={data.sessionId} />

      <div className="text-center">
        <div
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full"
          style={{ background: T.handlingSoft }}
        >
          <CheckCircle2 className="h-8 w-8" style={{ color: T.handling }} strokeWidth={2} aria-hidden />
        </div>
        <h1
          className="font-display text-[22px] font-semibold leading-[1.15]"
          style={{ color: T.fg }}
        >
          Bra jobba, {firstName}!
        </h1>
        <p className="mt-2 text-sm" style={{ color: T.mut }}>
          {completionPct === 100
            ? "Du fullførte hele økta."
            : `Du fullførte ${data.drillsCompleted} av ${data.drills.length} drills.`}
        </p>
      </div>

      <Verdict pct={completionPct} />

      <SpillerVurderingForm sessionId={data.sessionId} eksisterende={spillerVurdering} />

      <div className="grid grid-cols-3 gap-3">
        {[
          { Icon: Dumbbell, v: String(data.totalReps), l: "Reps", tip: "repsHastighet" as const },
          { Icon: Clock, v: fmtMSS(data.durationSec), l: "Tid", tip: null },
          { Icon: Target, v: String(data.drillsCompleted), l: "Drills", tip: null },
        ].map(({ Icon, v, l, tip }) => (
          <div
            key={l}
            className="rounded-2xl p-4 text-center"
            style={{ border: `1px solid ${T.border}`, background: T.panel }}
          >
            <Icon className="mx-auto h-5 w-5" style={{ color: T.handling }} strokeWidth={2} aria-hidden />
            <div className="mt-3 font-mono text-2xl font-bold leading-none" style={{ color: T.fg }}>
              {v}
            </div>
            <div
              className="mt-2 flex items-center justify-center gap-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em]"
              style={{ color: T.mut }}
            >
              {l}
              {tip && <HjelpTips k={tip} size={11} />}
            </div>
          </div>
        ))}
      </div>

      {pyramidEntries.length > 0 && (
        <div className="rounded-2xl p-4" style={{ border: `1px solid ${T.border}`, background: T.panel }}>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{ color: T.handling }} strokeWidth={2} aria-hidden />
            <span
              className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em]"
              style={{ color: T.mut }}
            >
              Fordeling etter pyramide
            </span>
            <HjelpTips k="pyramideAkse" size={11} />
          </div>
          <div className="flex flex-col gap-4">
            {pyramidEntries.map(([axis, reps]) => {
              const pct = data.totalReps > 0 ? (reps / data.totalReps) * 100 : 0;
              const col = T.ax[axis as keyof typeof T.ax] ?? T.mut;
              return (
                <div key={axis}>
                  <div className="mb-2 flex items-center justify-between font-mono text-xs font-semibold">
                    <span style={{ color: col }}>{AXIS_LABEL[axis] ?? axis}</span>
                    <span style={{ color: T.fg }}>{reps} reps</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: T.track }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: col }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-4" style={{ border: `1px solid ${T.border}`, background: T.panel }}>
        <div
          className="mb-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em]"
          style={{ color: T.mut }}
        >
          Drills fullført
        </div>
        <ul className="flex flex-col gap-2">
          {data.drills.map((drill) => {
            const log = data.existingLogs.find((l) => l.drillId === drill.id);
            return (
              <li
                key={drill.id}
                className="flex items-center justify-between gap-4 rounded-lg px-4 py-2"
                style={{ border: `1px solid ${T.border}`, background: T.panel2 }}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm font-semibold" style={{ color: T.fg }}>
                    {drill.name}
                  </div>
                  <div className="mt-0.5 font-mono text-xs font-semibold" style={{ color: T.mut }}>
                    {AXIS_LABEL[drill.pyramide] ?? drill.pyramide}
                    {drill.actualDurationSec != null && drill.actualDurationSec > 0 && (
                      <> · {fmtMSS(drill.actualDurationSec)}</>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {log ? (
                    <>
                      <div className="font-mono text-lg font-bold" style={{ color: T.handling }}>
                        {log.repsTotal}
                      </div>
                      <div
                        className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em]"
                        style={{ color: T.mut }}
                      >
                        reps
                      </div>
                    </>
                  ) : (
                    <span className="font-mono text-xs font-semibold" style={{ color: T.mut }}>
                      Ikke logget
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-2.5">
        <Link
          href={nesteOkt ? nesteOkt.href : "/portal"}
          data-od-id="etter-neste"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] font-sans text-[14px] font-semibold active:scale-[0.98]"
          style={{ background: T.handling, color: T.onHandling, textDecoration: "none" }}
        >
          {nesteOkt ? nesteOkt.tekst : "Tilbake til hjem"}
          {nesteOkt && <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />}
        </Link>
        <Link
          href={nesteOkt ? "/portal" : "/portal/planlegge/workbench?zoom=uke"}
          className="flex h-11 w-full items-center justify-center font-mono text-xs font-bold uppercase tracking-[0.06em] active:opacity-80"
          style={{ color: T.mut, textDecoration: "none" }}
        >
          {nesteOkt ? "Tilbake til hjem" : "Planlegg i Workbench"}
        </Link>
      </div>
    </div>
  );
}
