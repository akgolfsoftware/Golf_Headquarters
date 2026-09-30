"use client";

import type { LiveV2Drill, DrillRepState } from "./types";
import type { RepBucket } from "@/lib/portal-live/live-state";
import { FysDrillLogger } from "./FysDrillLogger";
import { Meta } from "@/components/precision/pa";
import { Teller } from "@/components/portal/precision/PHOkt";

export type DrillLoggerProps = {
  drill: LiveV2Drill;
  state: DrillRepState;
  onChange: (state: DrillRepState) => void;
  onAdjust: (bucket: RepBucket, delta: number) => void;
};

/** Standard bøtte for «+1» når økta ikke sier noe annet (samme valg som før tegningen). */
function standardBotte(phase: string | null): RepBucket {
  const value = phase?.toUpperCase() ?? "";
  if (["UTEN", "KROPP", "ARM", "KØLLE", "KOLLE"].some((s) => value.includes(s))) return "repsWithoutBall";
  if (["LAV", "BALL"].some((s) => value.includes(s))) return "repsLowSpeed";
  return "repsAutomatic";
}
const botter: [RepBucket, string][] = [["repsWithoutBall", "Uten ball"], ["repsLowSpeed", "Lav hastighet"], ["repsAutomatic", "Automatikk"], ["repsHit", "Treff"]];

/**
 * PH-05: fire tellere per drill med −1, +5 og +1 (56 px). Kategoriene følger dagens
 * repetisjonsmodell. Tegningens fjerde teller heter «Slag»; modellen lagrer den som
 * treff og teller den med i totalen, så den heter «Treff» her.
 */
export function DrillLogger({ drill, state, onChange, onAdjust }: DrillLoggerProps) {
  const standard = standardBotte(drill.lFase);
  if (drill.pyramide === "FYS") return <>
    {state.logNotes && <p className="pa-okt-dempet">Registrert: {state.logNotes}</p>}
    <FysDrillLogger drill={drill} onChange={onChange} />
  </>;
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div role="group" aria-label="Tellere" style={{ display: "flex", flexDirection: "column" }}>
      {botter.map(([botte, etikett]) => <Teller key={botte} label={etikett} v={state[botte]} on={(n) => onAdjust(botte, n)}
        tapId={botte === standard ? "live-tap-rep" : botte === "repsHit" ? "live-tap-treff" : undefined} />)}
    </div>
    <output className="pa-okt-mono" data-testid={`count-${drill.id}`} aria-live="polite">{state.repsTotal} reps · {state.repsHit} treff</output>
    {drill.plannedReps > 0 && <Meta>TOTALT {state.repsTotal} AV {drill.plannedReps} REPS</Meta>}
  </div>;
}
