"use client";

/**
 * PlayerHQ · Live-økt — FYS-modalitetslogger (2026-07-16-port).
 *
 * Gren av DrillLogger for fysiske drills (pyramide === "FYS"): styrke
 * (sett×reps×vekt), kondisjon (varighet + pulssone) og bevegelighet
 * (reps/hold). Gjenbruker v2-primitivene fra src/components/v2/fysisk.tsx
 * (SettRepsLogger/PulsSoneVelger) i stedet for å bygge en ny logger fra
 * bunnen, per Claude Design phq-live.jsx sin FysLogger-idé.
 *
 * Ærlighet: TrainingDrillV2 sine fys*-felt (vekt/muskelgruppe/sone) er i dag
 * ALDRI fylt ut av plan→live-speilingen — loggeren faller derfor tilbake til
 * de generiske repSett/repReps/plannedReps-feltene og lar spilleren fylle inn
 * vekt/sone selv. Kobles automatisk til ekte planlagte mål den dagen
 * autoring-pipelinen bygges.
 */

import { useState } from "react";
import type { LiveV2Drill, DrillRepState } from "./types";
import { SettRepsLogger, type SettRad, PulsSoneVelger, Stegteller, Caps } from "@/components/v2";
import { MicButton } from "@/components/shared/mic-button";
import { HjelpTips } from "@/components/v2/hjelp";

type FysModalitet = "styrke" | "kondisjon" | "bevegelighet";

function fysModalitet(drill: LiveV2Drill): FysModalitet {
  if (drill.fysBevegelighetType) return "bevegelighet";
  if (drill.fysTreningstype === "kondisjon" || drill.fysAktivitet || drill.repType === "TID") {
    return "kondisjon";
  }
  if (drill.fysTreningstype === "bevegelighet") return "bevegelighet";
  return "styrke";
}

function kgTekst(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

export type FysDrillLoggerProps = {
  drill: LiveV2Drill;
  onChange: (state: DrillRepState) => void;
};

/** Notat-felt m/ MicButton for talelogging — delt av alle tre modaliteter. */
function FysNotat({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-2xl border border-background/10 bg-background/5 p-4">
      <Caps>Notat (valgfritt)</Caps>
      <div className="relative mt-2 flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="F.eks. «kjentes tungt siste sett»"
          className="w-full rounded-xl border border-background/15 bg-background/5 py-2.5 pl-3 pr-12 text-sm text-background placeholder:text-background/40 focus:border-accent focus:outline-none"
        />
        <span className="absolute right-1.5">
          <MicButton variant="suffix" onResult={(t) => onChange(value ? `${value} ${t}` : t)} />
        </span>
      </div>
    </div>
  );
}

export function FysDrillLogger({ drill, onChange }: FysDrillLoggerProps) {
  const modalitet = fysModalitet(drill);
  const muskelgrupper = drill.fysMuskelgruppe
    ? drill.fysMuskelgruppe.split(",").map((s) => s.trim()).filter(Boolean)
    : ["Styrke"];
  const settTall = drill.fysSett ?? drill.repSett ?? 3;
  const repsMaal = drill.fysReps ?? drill.repReps ?? 8;
  const startVekt = drill.fysVektKg ?? 20;
  const startSett: SettRad[] = Array.from({ length: settTall }, () => ({ vekt: startVekt, reps: repsMaal }));

  const [sone, setSone] = useState("S3");
  const [varighetMin, setVarighetMin] = useState(drill.fysVarighetMin ?? drill.repMinutter ?? 10);
  const [bevegelseReps, setBevegelseReps] = useState(drill.fysReps ?? drill.plannedReps ?? 10);
  const [holdSek, setHoldSek] = useState(drill.fysHoldSek ?? 20);
  const [sisteSett, setSisteSett] = useState<SettRad[]>(startSett);
  const [notat, setNotat] = useState("");

  const erHold = drill.fysBevegelighetType === "hold";

  function medNotat(tekst: string): string {
    return notat.trim() ? `${tekst} — ${notat.trim()}` : tekst;
  }

  function meldStyrke(sett: SettRad[], nyttNotat?: string) {
    setSisteSett(sett);
    const totalReps = sett.reduce((s, r) => s + r.reps, 0);
    const kjerne = `Styrke: ${sett.map((r) => `${kgTekst(r.vekt)} kg × ${r.reps}`).join(" · ")}`;
    onChange({
      repsTotal: totalReps,
      repsWithoutBall: 0,
      repsLowSpeed: 0,
      repsAutomatic: 0,
      repsHit: totalReps,
      logNotes: nyttNotat !== undefined ? (nyttNotat.trim() ? `${kjerne} — ${nyttNotat.trim()}` : kjerne) : medNotat(kjerne),
    });
  }

  function meldKondisjon(nesteSone: string, nesteVarighet: number) {
    const kjerne = `Kondisjon: ${nesteVarighet} min i sone ${nesteSone.replace("S", "")}`;
    onChange({ repsTotal: nesteVarighet, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: nesteVarighet, logNotes: medNotat(kjerne) });
  }

  function meldBevegelighet(reps: number, hold: number) {
    const verdi = erHold ? hold : reps;
    const kjerne = erHold ? `Bevegelighet: hold ${hold} sek` : `Bevegelighet: ${reps} reps`;
    onChange({ repsTotal: verdi, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: verdi, logNotes: medNotat(kjerne) });
  }

  function håndterNotat(v: string) {
    setNotat(v);
    if (modalitet === "kondisjon") meldKondisjon(sone, varighetMin);
    else if (modalitet === "bevegelighet") meldBevegelighet(bevegelseReps, holdSek);
    else meldStyrke(sisteSett, v);
  }

  if (modalitet === "kondisjon") {
    return (
      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="rounded-2xl border border-background/10 bg-background/5 p-4">
          <Caps>Varighet</Caps>
          <div className="mt-2">
            <Stegteller
              label={null}
              value={varighetMin}
              min={0}
              max={180}
              step={1}
              enhet="min"
              onChange={(v) => { setVarighetMin(v); meldKondisjon(sone, v); }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-background/10 bg-background/5 p-4">
          <span className="inline-flex items-center gap-1.5">
            <Caps>Oppnådd puls-sone</Caps>
            <HjelpTips k="pulsSone" size={11} />
          </span>
          <div className="mt-3">
            <PulsSoneVelger valgt={sone} onChange={(id) => { setSone(id); meldKondisjon(id, varighetMin); }} />
          </div>
        </div>
        <FysNotat value={notat} onChange={håndterNotat} />
      </div>
    );
  }

  if (modalitet === "bevegelighet") {
    return (
      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="rounded-2xl border border-background/10 bg-background/5 p-4">
          <Caps>{erHold ? "Hold (sekunder)" : "Repetisjoner"}</Caps>
          <div className="mt-2">
            {erHold ? (
              <Stegteller
                label={null}
                value={holdSek}
                min={0}
                max={300}
                step={5}
                enhet="s"
                onChange={(v) => { setHoldSek(v); meldBevegelighet(bevegelseReps, v); }}
              />
            ) : (
              <Stegteller
                label={null}
                value={bevegelseReps}
                min={0}
                max={200}
                step={1}
                enhet="reps"
                onChange={(v) => { setBevegelseReps(v); meldBevegelighet(v, holdSek); }}
              />
            )}
          </div>
        </div>
        <FysNotat value={notat} onChange={håndterNotat} />
      </div>
    );
  }

  // styrke (default)
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <SettRepsLogger
        ovelse={drill.name}
        muskelgrupper={muskelgrupper}
        del={drill.fysTreningstype ?? "Styrke"}
        startSett={startSett}
        sist={[]}
        vektSteg={2.5}
        onChange={meldStyrke}
      />
      <FysNotat value={notat} onChange={håndterNotat} />
    </div>
  );
}
