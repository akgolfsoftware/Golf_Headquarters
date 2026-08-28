"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { LiveV2Drill, DrillRepState } from "./types";
import { FysDrillLogger } from "./FysDrillLogger";

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

/**
 * Reps-kortet fra fasiten (playerhq-live-okt.html §Rep-telling): eyebrow med
 * drillnavn → stor tallstatus «N av M reps · X treff» → to store tappere
 * «+1 rep» / «+1 treff» → «Angre siste». Store treffmål for én hånd på rangen.
 *
 * Datamodellen beholdes: «+1 rep» øker motorikk-bøtta som matcher drillens
 * fase (uten ball / lav hastighet / auto), «+1 treff» øker repsHit — feltet
 * successRate allerede regnes fra (logDrillReps: repsHit/repsTotal). Totalen
 * er summen av bøttene, som før. Angre husker rekkefølgen lokalt i økta.
 *
 * FYS-drills bruker fortsatt FysDrillLogger (utenfor fasitens reps-seksjon).
 */

type Bucket = "repsWithoutBall" | "repsLowSpeed" | "repsAutomatic" | "repsHit";

/** Motorikk-bøtte for «+1 rep» ut fra drillens fase. Uten fase: auto. */
function repBucket(lFase: string | null): Bucket {
  if (!lFase) return "repsAutomatic";
  const f = lFase.toUpperCase();
  if (f.includes("UTEN") || f.includes("KROPP") || f.includes("ARM") || f.includes("KØLLE") || f.includes("KOLLE")) {
    return "repsWithoutBall";
  }
  if (f.includes("LAV") || f.includes("BALL")) return "repsLowSpeed";
  return "repsAutomatic";
}

function medTotal(state: DrillRepState): DrillRepState {
  return {
    ...state,
    repsTotal:
      state.repsWithoutBall + state.repsLowSpeed + state.repsAutomatic + state.repsHit,
  };
}

export function DrillLogger({
  drill,
  state,
  onChange,
  onComplete,
  isLast,
}: DrillLoggerProps) {
  // Angre-stakk: hvilke bøtter de siste tappene gikk til (kun denne økta).
  const [tapp, setTapp] = useState<Bucket[]>([]);

  const erFys = drill.pyramide === "FYS";

  const total =
    state.repsWithoutBall + state.repsLowSpeed + state.repsAutomatic + state.repsHit;

  const leggTil = (bucket: Bucket) => {
    setTapp((s) => [...s, bucket]);
    onChange(medTotal({ ...state, [bucket]: state[bucket] + 1 }));
  };

  const angre = () => {
    const siste = tapp[tapp.length - 1];
    if (!siste) return;
    setTapp((s) => s.slice(0, -1));
    onChange(medTotal({ ...state, [siste]: Math.max(0, state[siste] - 1) }));
  };

  const tapperStil: React.CSSProperties = {
    minHeight: 88,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    border: "1px solid var(--tl-hair)",
    borderRadius: "var(--tl-r-card)",
    background: "var(--tl-dim)",
    cursor: "pointer",
    fontFamily: "var(--tl-font-sans)",
    fontSize: 15,
    fontWeight: 600,
    color: "var(--tl-text)",
  };
  const tapperSmall: React.CSSProperties = {
    fontFamily: "var(--tl-font-mono)",
    fontSize: 10,
    fontWeight: 400,
    color: "var(--tl-mute)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {erFys ? (
        <FysDrillLogger drill={drill} onChange={onChange} />
      ) : (
        /* Fasitens repkort */
        <div
          style={{
            background: "var(--tl-elev)",
            border: "1px solid var(--tl-hair)",
            borderRadius: "var(--tl-r-card)",
            padding: 16,
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: "var(--tl-font-mono)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--tl-mute)",
            }}
          >
            {drill.name}
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "10px 0 12px", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--tl-font-mono)",
                fontVariantNumeric: "tabular-nums",
                fontSize: 40,
                fontWeight: 500,
                lineHeight: 1,
                color: "var(--tl-text)",
              }}
            >
              {total}
            </span>
            <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 13, color: "var(--tl-mute)" }}>
              av {drill.plannedReps > 0 ? drill.plannedReps : "—"} reps
              {state.repsHit > 0 ? ` · ${state.repsHit} treff` : ""}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              type="button"
              data-od-id="live-tap-rep"
              onClick={() => leggTil(repBucket(drill.lFase))}
              className="active:translate-y-px"
              style={tapperStil}
            >
              +1
              <small style={tapperSmall}>rep</small>
            </button>
            <button
              type="button"
              data-od-id="live-tap-treff"
              onClick={() => leggTil("repsHit")}
              className="active:translate-y-px"
              style={{ ...tapperStil, borderColor: "var(--tl-ok)" }}
            >
              +1
              <small style={tapperSmall}>treff</small>
            </button>
          </div>
          <button
            type="button"
            data-od-id="live-angre"
            onClick={angre}
            disabled={tapp.length === 0}
            className="w-full"
            style={{
              marginTop: 8,
              minHeight: 44,
              borderRadius: "var(--tl-r-row)",
              border: "1px solid var(--tl-hair)",
              background: "var(--tl-elev)",
              fontFamily: "var(--tl-font-sans)",
              fontSize: 13,
              fontWeight: 500,
              color: tapp.length === 0 ? "var(--tl-mute)" : "var(--tl-text)",
              cursor: tapp.length === 0 ? "default" : "pointer",
              opacity: tapp.length === 0 ? 0.6 : 1,
            }}
          >
            Angre siste
          </button>
        </div>
      )}

      {/* Fullfør-knapp — ink, ikke clay: skjermens ene clay-CTA er
          «Avslutt og logg økta» i dokken (fasit playerhq-live-okt.html). */}
      <button
        type="button"
        onClick={onComplete}
        className="mt-2 flex w-full items-center justify-center gap-2 font-sans text-[14px] font-semibold active:scale-[0.98] v2-press"
        style={{ background: "var(--tl-fill)", color: "var(--tl-on-fill)", minHeight: 56, borderRadius: 12, border: "none" }}
      >
        <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        {isLast ? "Fullfør økt" : "Fullfør drill"}
      </button>
    </div>
  );
}
