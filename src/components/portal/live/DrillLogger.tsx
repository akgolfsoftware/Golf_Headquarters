"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import type { LiveV2Drill, DrillRepState } from "./types";
import type { RepBucket } from "@/lib/portal-live/live-state";
import { FysDrillLogger } from "./FysDrillLogger";
import "@/styles/precision-athletics.css";

export type DrillLoggerProps = {
  drill: LiveV2Drill;
  state: DrillRepState;
  onChange: (state: DrillRepState) => void;
  onAdjust: (bucket: RepBucket, delta: number) => void;
  onComplete: () => void;
  done: boolean;
};

function repBucket(phase: string | null): RepBucket {
  const value = phase?.toUpperCase() ?? "";
  if (["UTEN", "KROPP", "ARM", "KØLLE", "KOLLE"].some((s) => value.includes(s))) return "repsWithoutBall";
  if (["LAV", "BALL"].some((s) => value.includes(s))) return "repsLowSpeed";
  return "repsAutomatic";
}
const buckets: [RepBucket, string][] = [["repsWithoutBall", "Uten ball"], ["repsLowSpeed", "Lav hastighet"], ["repsAutomatic", "Automatisk"], ["repsHit", "Treff"]];

/** PH-05s store trykkflater; kategoriene følger dagens persistente rep-modell. */
export function DrillLogger({ drill, state, onChange, onAdjust, onComplete, done }: DrillLoggerProps) {
  const taps = useRef<RepBucket[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const add = (bucket: RepBucket) => { taps.current.push(bucket); setCanUndo(true); onAdjust(bucket, 1); };
  const undo = () => { const last = taps.current.pop(); if (last) onAdjust(last, -1); setCanUndo(taps.current.length > 0); };
  return <div>
    {drill.pyramide === "FYS" ? <>
      {state.logNotes && <p className="ph05-brod">Registrert: {state.logNotes}</p>}
      <FysDrillLogger drill={drill} onChange={onChange} />
    </> : <>
      <p className="ph05-kicker">Logg repetisjon</p>
      <output className="ph05-reps" data-testid={`count-${drill.id}`} aria-live="polite">{state.repsTotal} reps · {state.repsHit} treff</output>
      <div className="ph05-tapp">
        <button type="button" data-od-id="live-tap-rep" className="ph05-tappknapp" onClick={() => add(repBucket(drill.lFase))}>+1 rep</button>
        <button type="button" data-od-id="live-tap-treff" className="ph05-tappknapp" onClick={() => add("repsHit")}>+1 treff</button>
      </div>
      <button type="button" className="pa-btn pa-btn--ghost" disabled={!canUndo} onClick={undo}>Angre siste</button>
      <details className="ph05-rett">
        <summary>Rett antall</summary>
        {buckets.map(([bucket, label]) => <div key={bucket} className="ph05-rett-rad">
          <span>{label}</span>
          <button type="button" className="pa-btn pa-btn--ghost" aria-label={`Trekk fra én: ${label}`} disabled={state[bucket] === 0} onClick={() => { taps.current = []; setCanUndo(false); onAdjust(bucket, -1); }}>−</button>
          <output>{state[bucket]}</output>
          <button type="button" className="pa-btn pa-btn--ghost" aria-label={`Legg til én: ${label}`} onClick={() => { taps.current = []; setCanUndo(false); onAdjust(bucket, 1); }}>+</button>
        </div>)}
      </details>
    </>}
    <button type="button" className="pa-btn pa-btn--primary pa-btn--lg pa-btn--full" onClick={onComplete}><Check size={20} aria-hidden />{done ? "Fjern ferdigmarkering" : "Marker øvelsen ferdig"}</button>
  </div>;
}
