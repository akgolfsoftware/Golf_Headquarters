"use client";

import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import { useState } from "react";
import type { SgLie } from "@/lib/domain/sg";
import { meterTilFot } from "@/lib/min-golf/format";

const LIES: ReadonlyArray<{ value: SgLie | "HOLED"; label: string }> = [
  { value: "TEE", label: "Tee" },
  { value: "FAIRWAY", label: "Fairway" },
  { value: "ROUGH", label: "Rough" },
  { value: "BUNKER", label: "Bunker" },
  { value: "GREEN", label: "Green" },
  { value: "HOLED", label: "I hull" },
];
const MORE_LIES: ReadonlyArray<{ value: SgLie; label: string }> = [
  { value: "SEMI_ROUGH", label: "Semirough" },
  { value: "DEEP_ROUGH", label: "Dyp rough" },
  { value: "TREES", label: "Trær" },
  { value: "WATER", label: "Vann" },
  { value: "OOB", label: "Utenfor bane" },
];

export type ShotEntryValue = {
  startLie: SgLie;
  startDistanceM: number;
  endLie: SgLie | null;
  endDistanceM: number;
  holed: boolean;
  club: string | null;
  penaltyStrokes: 0 | 1 | 2;
};

type Props = {
  shotNumber: number;
  startLie: SgLie;
  startDistanceM: number;
  suggestedClubs?: ReadonlyArray<string>;
  onSave: (value: ShotEntryValue) => void;
  onCancel?: () => void;
  onUndo?: () => void;
};

/** Utkast til rask slagføring. Klienten sender meter; green vises i fot. */
export function ShotEntryNumpad({
  shotNumber, startLie: initialLie, startDistanceM, suggestedClubs = [], onSave, onCancel, onUndo,
}: Props) {
  const [startLie, setStartLie] = useState<SgLie>(initialLie);
  const [endLie, setEndLie] = useState<SgLie | "HOLED" | null>(null);
  const [distance, setDistance] = useState("");
  const [club, setClub] = useState<string | null>(suggestedClubs[0] ?? null);
  const [penalties, setPenalties] = useState<0 | 1 | 2>(0);
  const [error, setError] = useState<string | null>(null);
  const [showMoreLies, setShowMoreLies] = useState(MORE_LIES.some((item) => item.value === initialLie));
  const isPuttDistance = endLie === "GREEN";

  function append(key: string) {
    setError(null);
    setDistance((previous) => {
      if (key === "backspace") return previous.slice(0, -1);
      if (key === ",") return previous.includes(",") ? previous : `${previous || "0"},`;
      return `${previous}${key}`.slice(0, 6);
    });
  }

  function selectEndLie(value: SgLie | "HOLED") {
    setEndLie(value);
    setDistance("");
    setError(null);
  }

  function save() {
    if (endLie == null) {
      setError("Velg hvor ballen endte.");
      return;
    }
    const entered = Number(distance.replace(",", "."));
    if (endLie !== "HOLED" && (!distance || !Number.isFinite(entered) || entered <= 0)) {
      setError("Tast inn restavstanden.");
      return;
    }
    const endDistanceM = endLie === "HOLED" ? 0 : isPuttDistance ? entered / 3.28084 : entered;
    onSave({ startLie, startDistanceM, endLie: endLie === "HOLED" ? null : endLie,
      endDistanceM, holed: endLie === "HOLED", club, penaltyStrokes: penalties });
  }

  return (
    <section className="pa-root mx-auto w-full max-w-md rounded-lg bg-[var(--surface-card)] p-4 text-[var(--text-primary)]"
      data-theme="night" aria-label={`Registrer slag ${shotNumber}`}>
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold">Slag {shotNumber}</h2>
        <span className="font-mono text-sm text-[var(--text-secondary)]">
          Fra {startLie === "GREEN" ? `${Math.round(meterTilFot(startDistanceM))} fot` : `${Math.round(startDistanceM)} m`}
        </span>
      </header>

      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-semibold">Startunderlag</legend>
        <div className="grid grid-cols-3 gap-2">
          {[...LIES.filter((item) => item.value !== "HOLED"), ...(showMoreLies ? MORE_LIES : [])].map((item) => (
            <button key={item.value} type="button" className="pa-choice min-h-14 w-full px-2"
              aria-pressed={startLie === item.value} onClick={() => setStartLie(item.value as SgLie)}>
              {item.label}
            </button>
          ))}
        </div>
        <button type="button" className="mt-2 min-h-11 text-sm underline" onClick={() => setShowMoreLies(!showMoreLies)}>
          {showMoreLies ? "Færre underlag" : "Flere underlag"}
        </button>
      </fieldset>

      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-semibold">Hvor endte ballen?</legend>
        <div className="grid grid-cols-3 gap-2">
          {[...LIES.filter((item) => item.value !== "TEE"),
            ...(showMoreLies ? [{ value: "TEE" as const, label: "Tilbake til tee" }, ...MORE_LIES] : [])].map((item) => (
            <button key={item.value} type="button" className="pa-choice min-h-14 w-full px-2"
              aria-pressed={endLie === item.value} onClick={() => selectEndLie(item.value)}>
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      {endLie && endLie !== "HOLED" && (
        <div className="mb-4">
          <label htmlFor="shot-entry-distance" className="mb-2 block text-sm font-semibold">
            Restavstand til flagg ({isPuttDistance ? "fot" : "meter"})
          </label>
          <div className="pa-control pa-control--lg pa-control--mono mb-2">
            <input id="shot-entry-distance" inputMode="decimal" autoComplete="off"
              value={distance} onChange={(event) => {
                setDistance(event.target.value.replace(/[^0-9,.]/g, "").slice(0, 6));
                setError(null);
              }} aria-invalid={error != null} aria-describedby={error ? "shot-entry-error" : undefined} />
            <span className="pa-control__affix">{isPuttDistance ? "fot" : "m"}</span>
          </div>
          <div className="grid grid-cols-3 gap-2" aria-label="Tallknapper">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "backspace"].map((key) => (
              <button key={key} type="button" className="pa-btn pa-btn--secondary min-h-14 font-mono text-lg"
                aria-label={key === "backspace" ? "Slett siste siffer" : key}
                onClick={() => append(key)}>{key === "backspace" ? "Slett" : key}</button>
            ))}
          </div>
        </div>
      )}

      {suggestedClubs.length > 0 && (
        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-semibold">Kølle</legend>
          <div className="flex flex-wrap gap-2">
            {suggestedClubs.map((item) => (
              <button key={item} type="button" className="pa-choice min-h-14"
                aria-pressed={club === item} onClick={() => setClub(item)}>{item}</button>
            ))}
          </div>
        </fieldset>
      )}
      <label htmlFor="shot-entry-club" className="mb-2 block text-sm font-semibold">Annen kølle</label>
      <div className="pa-control mb-4">
        <input id="shot-entry-club" value={club ?? ""} maxLength={30}
          onChange={(event) => setClub(event.target.value || null)} placeholder="Velg eller skriv kølle" />
      </div>

      <button type="button" className="pa-btn pa-btn--secondary mb-4 min-h-14 w-full"
        onClick={() => setPenalties(((penalties + 1) % 3) as 0 | 1 | 2)}>
        Straffeslag: {penalties}
      </button>
      {error && <p id="shot-entry-error" role="alert" className="mb-3 text-sm text-[var(--signal-ink)]">{error}</p>}
      <div className="flex gap-2 pb-[env(safe-area-inset-bottom)]">
        {onUndo && <button type="button" className="pa-btn pa-btn--secondary min-h-14 flex-1" onClick={onUndo}>Angre</button>}
        {onCancel && <button type="button" className="pa-btn pa-btn--secondary min-h-14 flex-1" onClick={onCancel}>Avbryt</button>}
        <button type="button" className="pa-btn pa-btn--primary min-h-14 flex-1" onClick={save}>Lagre slag</button>
      </div>
    </section>
  );
}
