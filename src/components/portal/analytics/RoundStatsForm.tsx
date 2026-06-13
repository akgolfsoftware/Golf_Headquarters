"use client";

/**
 * RoundStatsForm — manuell registrering av runde med hull-for-hull og shot-by-shot.
 * Oppretter Round + HoleScore + Shot via saveRoundStats.
 */

import { useState, useTransition } from "react";
import { saveRoundStats } from "@/app/portal/analysere/actions";
import type { RoundHoleInput, RoundShotInput } from "@/app/portal/analysere/actions";
import type { ShotLie, WindDir, ShotType } from "@/generated/prisma/client";

const LIES: ShotLie[] = [
  "TEE",
  "FAIRWAY",
  "SEMI_ROUGH",
  "ROUGH",
  "DEEP_ROUGH",
  "BUNKER",
  "GREEN",
  "WATER",
  "OOB",
  "TREES",
];

const WINDS: WindDir[] = ["STILLE", "MEDVIND", "MOTVIND", "VENSTRE", "HOYRE"];

const SHOT_TYPES: ShotType[] = [
  "DRIVE",
  "APPROACH",
  "CHIP",
  "PITCH",
  "PUTT",
  "BUNKER",
  "RECOVERY",
  "DROP",
];

const CLUBS = [
  "Driver",
  "3-wood",
  "5-wood",
  "Hybrid",
  "2-jern",
  "3-jern",
  "4-jern",
  "5-jern",
  "6-jern",
  "7-jern",
  "8-jern",
  "9-jern",
  "PW",
  "GW",
  "SW",
  "LW",
  "Putter",
];

export type RoundStatsFormProps = {
  courses: { id: string; name: string; par: number }[];
  onSaved?: () => void;
};

export function RoundStatsForm({ courses, onSaved }: RoundStatsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [playedAt, setPlayedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [score, setScore] = useState("72");

  const [holes, setHoles] = useState<RoundHoleInput[]>(() =>
    Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      par: 4,
      strokes: 4,
      putts: 2,
      fairway: true,
      gir: true,
    })),
  );

  const [shots, setShots] = useState<RoundShotInput[]>([]);

  const updateHole = (idx: number, patch: Partial<RoundHoleInput>) => {
    setHoles((prev) => prev.map((h, i) => (i === idx ? { ...h, ...patch } : h)));
  };

  const addShot = () => {
    setShots((prev) => [
      ...prev,
      {
        holeNumber: 1,
        shotNumber: 1,
        club: "7-jern",
        lie: "FAIRWAY",
        distanceToPin: 150,
        distanceHit: 140,
        windDir: "STILLE",
        shotType: "APPROACH",
        mentalScore: 3,
      },
    ]);
  };

  const updateShot = (idx: number, patch: Partial<RoundShotInput>) => {
    setShots((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const removeShot = (idx: number) => {
    setShots((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await saveRoundStats({
        courseId,
        playedAt,
        score: Number(score) || 0,
        holes,
        shots,
      });
      if (result.success) {
        setMessage("Runde lagret!");
        onSaved?.();
      } else {
        setMessage(`Feil: ${result.error ?? "Ukjent"}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto p-2">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Runde-info
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-xs font-medium text-foreground">Bane</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-xs"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-medium text-foreground">Dato / tid</span>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-xs"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-medium text-foreground">Total score</span>
            <input
              type="number"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-xs"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Hull-for-hull
          </h3>
          <span className="text-xs text-muted-foreground">{holes.length} hull</span>
        </div>
        <div className="grid max-h-[240px] grid-cols-6 gap-2 overflow-y-auto pr-1">
          {holes.map((h, idx) => (
            <div key={h.holeNumber} className="rounded-lg border border-border bg-background p-2">
              <div className="mb-1 text-center font-mono text-[10px] font-bold text-muted-foreground">
                {h.holeNumber}
              </div>
              <div className="space-y-2">
                <input
                  type="number"
                  className="w-full rounded border border-border px-2 py-2 text-center text-xs"
                  value={h.strokes}
                  onChange={(e) => updateHole(idx, { strokes: Number(e.target.value) })}
                />
                <input
                  type="number"
                  className="w-full rounded border border-border px-2 py-2 text-center text-xs"
                  value={h.putts ?? ""}
                  placeholder="Putts"
                  onChange={(e) => updateHole(idx, { putts: Number(e.target.value) })}
                />
                <label className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={h.fairway ?? false}
                    onChange={(e) => updateHole(idx, { fairway: e.target.checked })}
                  />
                  FW
                </label>
                <label className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={h.gir ?? false}
                    onChange={(e) => updateHole(idx, { gir: e.target.checked })}
                  />
                  GIR
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Slag-for-slag
          </h3>
          <button
            type="button"
            onClick={addShot}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            + Legg til slag
          </button>
        </div>
        {shots.length === 0 && (
          <p className="py-2 text-sm text-muted-foreground">Ingen slag registrert ennå.</p>
        )}
        <div className="space-y-2">
          {shots.map((s, idx) => (
            <div key={idx} className="grid grid-cols-[repeat(9,1fr)_auto] items-end gap-2 rounded-lg border border-border bg-background p-2">
              <NumberField label="Hull" value={s.holeNumber} onChange={(v) => updateShot(idx, { holeNumber: v })} />
              <NumberField label="Slag" value={s.shotNumber} onChange={(v) => updateShot(idx, { shotNumber: v })} />
              <SelectField
                label="Kølle"
                value={s.club ?? ""}
                options={CLUBS}
                onChange={(v) => updateShot(idx, { club: v })}
              />
              <SelectField
                label="Lie"
                value={s.lie}
                options={LIES}
                onChange={(v) => updateShot(idx, { lie: v as ShotLie })}
              />
              <NumberField label="Avstand" value={s.distanceToPin ?? 0} onChange={(v) => updateShot(idx, { distanceToPin: v })} />
              <NumberField label="Slått" value={s.distanceHit ?? 0} onChange={(v) => updateShot(idx, { distanceHit: v })} />
              <SelectField
                label="Vind"
                value={s.windDir ?? "STILLE"}
                options={WINDS}
                onChange={(v) => updateShot(idx, { windDir: v as WindDir })}
              />
              <SelectField
                label="Type"
                value={s.shotType}
                options={SHOT_TYPES}
                onChange={(v) => updateShot(idx, { shotType: v as ShotType })}
              />
              <NumberField
                label="Mentalt"
                value={s.mentalScore ?? 3}
                onChange={(v) => updateShot(idx, { mentalScore: Math.min(5, Math.max(1, v)) })}
              />
              <button
                type="button"
                onClick={() => removeShot(idx)}
                className="mb-0.5 text-[10px] text-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <div
          className={
            "rounded-lg px-4 py-2 text-sm " +
            (message.startsWith("Feil")
              ? "bg-destructive/10 text-destructive"
              : "bg-success/10 text-success")
          }
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary py-4 text-xs font-semibold text-primary-foreground disabled:opacity-50"
      >
        {isPending ? "Lagrer..." : "Lagre runde"}
      </button>
    </form>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-[10px] text-muted-foreground">{label}</span>
      <input
        type="number"
        className="w-full rounded border border-border bg-card px-2 py-2 text-xs"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-[10px] text-muted-foreground">{label}</span>
      <select
        className="w-full rounded border border-border bg-card px-2 py-2 text-xs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
