import { Check, Target } from "lucide-react";
import type { LiveV2Drill, DrillRepState } from "./types";
import { RepCounter } from "./RepCounter";
import { FysDrillLogger } from "./FysDrillLogger";
import { L_FASER } from "@/lib/taxonomy";
import { T } from "@/lib/v2/tokens";

export type DrillLoggerProps = {
  drill: LiveV2Drill;
  state: DrillRepState;
  onChange: (state: DrillRepState) => void;
  onComplete: () => void;
  /** Er dette siste drill? Styrer CTA-tekst. */
  isLast: boolean;
  /** Viser fremdrift. */
  completedCount: number;
  totalCount: number;
  /** Tid brukt på DENNE drillen — nullstilles når neste drill starter (økt-tiden totalt går uavbrutt videre). */
  drillSeconds: number;
};

function fmtDrillMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const AXIS_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

// Rettet 2026-07-16 (samme bug som LiveBrief.tsx hadde): drill.lFase er typet
// LFase (L-Kropp/Arm/Kølle/Ball/Auto), ikke den separate LPhase-enumen.
const L_PHASE_LABEL: Record<string, string> = Object.fromEntries(
  L_FASER.map((f) => [f.kode, f.label]),
);

const AXIS_DOT: Record<string, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

export function DrillLogger({
  drill,
  state,
  onChange,
  onComplete,
  isLast,
  completedCount,
  totalCount,
  drillSeconds,
}: DrillLoggerProps) {
  const computedTotal =
    state.repsWithoutBall + state.repsLowSpeed + state.repsAutomatic + state.repsHit;

  const setField = <K extends keyof DrillRepState>(key: K, value: number) => {
    if (key === "repsTotal") {
      onChange({ ...state, repsTotal: Math.max(0, value) });
      return;
    }
    const next = { ...state, [key]: Math.max(0, value) } as DrillRepState;
    next.repsTotal = next.repsWithoutBall + next.repsLowSpeed + next.repsAutomatic + next.repsHit;
    onChange(next);
  };

  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const axisDot = AXIS_DOT[drill.pyramide] ?? "bg-accent";
  const erFys = drill.pyramide === "FYS";

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Drillinfo-kort */}
      <div className="rounded-2xl border p-4" style={{ borderColor: T.border, background: T.panel }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-6 items-center gap-2 rounded-md border px-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ borderColor: T.border, color: T.fg }}>
                <span className={`h-2 w-2 rounded-full ${axisDot}`} aria-hidden />
                {AXIS_LABEL[drill.pyramide] ?? drill.pyramide}
              </span>
              {drill.lFase && (
                <span className="inline-flex h-6 items-center rounded-md border px-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ borderColor: T.border, color: T.mut }}>
                  {L_PHASE_LABEL[drill.lFase] ?? drill.lFase}
                </span>
              )}
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold leading-[1.1] -tracking-[0.02em]" style={{ color: T.fg }}>
              {drill.name}
            </h2>
            {drill.description && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: T.mut }}>
                {drill.description}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border" style={{ borderColor: T.border, background: T.panel2 }}>
            <Target className="h-5 w-5" style={{ color: T.handling }} strokeWidth={2} aria-hidden />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-sm font-semibold tabular-nums" style={{ color: T.mut }}>
          <span style={{ color: T.handling }}>{fmtDrillMSS(drillSeconds)} på denne drillen</span>
          <span style={{ color: T.mut }}>·</span>
          <span>{drill.durationMinutes} min mål</span>
          <span style={{ color: T.mut }}>·</span>
          <span>{drill.plannedReps > 0 ? `${drill.plannedReps} reps mål` : "Ingen reps-mål"}</span>
        </div>

        {drill.notes && (
          <div className="mt-4 rounded-lg border px-4 py-2 text-sm leading-relaxed" style={{ borderColor: T.border, background: T.panel2, color: T.fg2 }}>
            {drill.notes}
          </div>
        )}

        {/* Fremdriftslinje */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-extrabold uppercase tracking-[0.12em]" style={{ color: T.mut }}>
            <span>Drills fullført</span>
            <span>
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: T.panel2 }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, background: T.handling }}
            />
          </div>
        </div>
      </div>

      {/* Rep-tellere golf, eller FYS-modalitetslogger for fysiske drills */}
      {erFys ? (
        <FysDrillLogger drill={drill} onChange={onChange} />
      ) : (
        <>
          <RepCounter
            label="Totalt"
            value={computedTotal}
            primary
            hideDecrement
            readOnly
          />

          <div className="grid gap-4">
            <RepCounter
              label="Uten ball"
              value={state.repsWithoutBall}
              onChange={(v) => setField("repsWithoutBall", v)}
            />
            <RepCounter
              label="Lav hastighet"
              value={state.repsLowSpeed}
              onChange={(v) => setField("repsLowSpeed", v)}
            />
            <RepCounter
              label="Automatikk"
              value={state.repsAutomatic}
              onChange={(v) => setField("repsAutomatic", v)}
            />
            <RepCounter
              label="Golfballer slått"
              value={state.repsHit}
              onChange={(v) => setField("repsHit", v)}
            />
          </div>
        </>
      )}

      {/* Fullfør-knapp — ink, ikke clay: skjermens ene clay-CTA er
          «Avslutt og logg økta» i dokken (fasit playerhq-live-okt.html). */}
      <button
        type="button"
        onClick={onComplete}
        className="mt-2 flex w-full items-center justify-center gap-2 font-sans text-[14px] font-semibold active:scale-[0.98] v2-press"
        style={{ background: "var(--p-cta)", color: "var(--p-on-cta)", minHeight: 56, borderRadius: 12, border: "none" }}
      >
        <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        {isLast ? "Fullfør økt" : "Fullfør drill"}
      </button>
    </div>
  );
}
