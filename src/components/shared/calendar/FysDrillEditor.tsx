"use client";

// FysDrillEditor — redigerer én FYS-drill (pyramide === "FYS").
// Felt-settet varierer med treningstype: STYRKE, KONDISJON, BEVEGELIGHET,
// POWER, STABILITET. Treningstypene kommer fra FYS_TRENINGSTYPER i
// base-taxonomy (BEVEGELIGHET inkluderer typene STATISK/DYNAMISK/PNF og
// AKTIV_MOBILITET).

import { useId } from "react";
import { Dumbbell, Activity, Wind, Zap, Anchor } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FYS_MUSKELGRUPPER,
  KONDISJON_SONER,
  KONDISJON_AKTIVITETER,
  BEVEGELIGHET_TYPER,
} from "@/lib/taxonomy";

export type FysDrillData = {
  name: string;
  durationMinutes: number;
  fysTreningstype: FysType;
  fysMuskelgruppe: string[]; // multi-select
  fysOvelse: string | null;
  fysSett: number | null;
  fysReps: number | null;
  fysVektKg: number | null;
  fysVektProsent: number | null;
  fysTempo: string | null;
  fysPauseSek: number | null;
  fysVarighetMin: number | null;
  fysIntensitetsSone: number | null;
  fysDistanseM: number | null;
  fysAktivitet: string | null;
  fysBevegelighetType: string | null;
  fysHoldSek: number | null;
};

export type FysType = "STYRKE" | "KONDISJON" | "BEVEGELIGHET" | "POWER" | "STABILITET";

const FYS_TYPER: Array<{ kode: FysType; label: string; ikon: typeof Dumbbell }> = [
  { kode: "STYRKE", label: "Styrke", ikon: Dumbbell },
  { kode: "KONDISJON", label: "Kondisjon", ikon: Activity },
  { kode: "BEVEGELIGHET", label: "Bevegelighet", ikon: Wind },
  { kode: "POWER", label: "Power", ikon: Zap },
  { kode: "STABILITET", label: "Stabilitet", ikon: Anchor },
];

const STYRKE_EKSEMPLER = ["Knebøy", "Markløft", "Benkpress", "Pull-up", "Rumensk markløft"];
const POWER_EKSEMPLER = ["Box jump", "Medisinballkast", "Trap-bar hopp", "Kettlebell swing"];
const STABILITET_EKSEMPLER = ["Pallof press", "Dead bug", "Bird-dog", "Sideplanke"];
const BEVEGELIGHET_EKSEMPLER = ["Hofteflexor-strekk", "90/90", "Thoracic spine rotation"];

type Props = {
  value: FysDrillData;
  onChange: (v: FysDrillData) => void;
};

export function FysDrillEditor({ value, onChange }: Props) {
  const baseId = useId();
  const set = <K extends keyof FysDrillData>(k: K, v: FysDrillData[K]) =>
    onChange({ ...value, [k]: v });

  const toggleMuskel = (kode: string) => {
    const har = value.fysMuskelgruppe.includes(kode);
    set(
      "fysMuskelgruppe",
      har
        ? value.fysMuskelgruppe.filter((m) => m !== kode)
        : [...value.fysMuskelgruppe, kode],
    );
  };

  const eksempler =
    value.fysTreningstype === "STYRKE"
      ? STYRKE_EKSEMPLER
      : value.fysTreningstype === "POWER"
        ? POWER_EKSEMPLER
        : value.fysTreningstype === "STABILITET"
          ? STABILITET_EKSEMPLER
          : value.fysTreningstype === "BEVEGELIGHET"
            ? BEVEGELIGHET_EKSEMPLER
            : [];

  return (
    <div className="space-y-4">
      {/* Treningstype chips */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Treningstype</span>
        <div className="flex flex-wrap gap-2">
          {FYS_TYPER.map((t) => {
            const aktiv = value.fysTreningstype === t.kode;
            const Ikon = t.ikon;
            return (
              <button
                key={t.kode}
                type="button"
                onClick={() => set("fysTreningstype", t.kode)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                  aktiv
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
              >
                <Ikon className="h-3.5 w-3.5" strokeWidth={1.8} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drill-navn + varighet */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Drill-navn</span>
          <input
            id={`${baseId}-name`}
            type="text"
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Eks. Knebøy 5×5"
            className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Varighet (min)</span>
          <input
            type="number"
            min={1}
            max={300}
            value={value.durationMinutes}
            onChange={(e) => set("durationMinutes", Math.max(1, Number(e.target.value)))}
            className="w-24 rounded-md border border-input bg-background px-4 py-2 text-sm font-mono tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      {/* Muskelgruppe (multi) */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Muskelgrupper ({value.fysMuskelgruppe.length} valgt)
        </span>
        <div className="flex flex-wrap gap-2">
          {FYS_MUSKELGRUPPER.map((m) => {
            const aktiv = value.fysMuskelgruppe.includes(m.kode);
            return (
              <button
                key={m.kode}
                type="button"
                onClick={() => toggleMuskel(m.kode)}
                className={cn(
                  "rounded-sm border px-2 py-2 text-xs transition-colors",
                  aktiv
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
                title={m.golfRelevans}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Øvelse (autocomplete-light: input + datalist) */}
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Øvelse</span>
        <input
          type="text"
          value={value.fysOvelse ?? ""}
          onChange={(e) => set("fysOvelse", e.target.value || null)}
          placeholder="Skriv eller velg fra listen"
          list={`${baseId}-ovelse-list`}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {eksempler.length > 0 && (
          <datalist id={`${baseId}-ovelse-list`}>
            {eksempler.map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        )}
      </label>

      {/* Type-spesifikke felt */}
      {value.fysTreningstype === "STYRKE" && (
        <StyrkeFelt value={value} set={set} />
      )}
      {value.fysTreningstype === "POWER" && <StyrkeFelt value={value} set={set} />}
      {value.fysTreningstype === "STABILITET" && (
        <StabilitetFelt value={value} set={set} />
      )}
      {value.fysTreningstype === "KONDISJON" && (
        <KondisjonFelt value={value} set={set} />
      )}
      {value.fysTreningstype === "BEVEGELIGHET" && (
        <BevegelighetFelt value={value} set={set} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Underkomponenter per treningstype
// ---------------------------------------------------------------------------

type SubProps = {
  value: FysDrillData;
  set: <K extends keyof FysDrillData>(k: K, v: FysDrillData[K]) => void;
};

function NumInput({
  label,
  value,
  onChange,
  placeholder,
  min = 0,
  max,
  className,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        placeholder={placeholder ?? "—"}
        className="rounded-md border border-input bg-background px-4 py-2 text-sm font-mono tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

function StyrkeFelt({ value, set }: SubProps) {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-md border border-border bg-muted/30 p-4 sm:grid-cols-4">
      <NumInput label="Sett" value={value.fysSett} onChange={(v) => set("fysSett", v)} min={1} max={20} />
      <NumInput label="Reps" value={value.fysReps} onChange={(v) => set("fysReps", v)} min={1} max={100} />
      <NumInput label="Vekt (kg)" value={value.fysVektKg} onChange={(v) => set("fysVektKg", v)} min={0} />
      <NumInput
        label="% av 1RM"
        value={value.fysVektProsent}
        onChange={(v) => set("fysVektProsent", v)}
        min={0}
        max={100}
      />
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Tempo</span>
        <input
          type="text"
          value={value.fysTempo ?? ""}
          onChange={(e) => set("fysTempo", e.target.value || null)}
          placeholder="3-1-1-0"
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <NumInput
        label="Pause (sek)"
        value={value.fysPauseSek}
        onChange={(v) => set("fysPauseSek", v)}
        min={0}
      />
    </div>
  );
}

function StabilitetFelt({ value, set }: SubProps) {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-md border border-border bg-muted/30 p-4 sm:grid-cols-4">
      <NumInput label="Sett" value={value.fysSett} onChange={(v) => set("fysSett", v)} min={1} max={20} />
      <NumInput label="Reps" value={value.fysReps} onChange={(v) => set("fysReps", v)} min={1} max={100} />
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Tempo</span>
        <input
          type="text"
          value={value.fysTempo ?? ""}
          onChange={(e) => set("fysTempo", e.target.value || null)}
          placeholder="2-0-2-0"
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <NumInput
        label="Hold (sek)"
        value={value.fysHoldSek}
        onChange={(v) => set("fysHoldSek", v)}
        min={0}
      />
    </div>
  );
}

function KondisjonFelt({ value, set }: SubProps) {
  return (
    <div className="grid gap-4 rounded-md border border-border bg-muted/30 p-4 sm:grid-cols-2">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Aktivitet</span>
        <select
          value={value.fysAktivitet ?? ""}
          onChange={(e) => set("fysAktivitet", e.target.value || null)}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">— Velg —</option>
          {KONDISJON_AKTIVITETER.map((a) => (
            <option key={a.kode} value={a.kode}>
              {a.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Sone</span>
        <select
          value={value.fysIntensitetsSone ?? ""}
          onChange={(e) =>
            set("fysIntensitetsSone", e.target.value === "" ? null : Number(e.target.value))
          }
          className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">— Velg sone —</option>
          {KONDISJON_SONER.map((s, i) => (
            <option key={s.kode} value={i + 1}>
              {s.label} ({s.hrProsent})
            </option>
          ))}
        </select>
      </label>
      <NumInput
        label="Varighet (min)"
        value={value.fysVarighetMin}
        onChange={(v) => set("fysVarighetMin", v)}
        min={1}
      />
      <NumInput
        label="Distanse (m)"
        value={value.fysDistanseM}
        onChange={(v) => set("fysDistanseM", v)}
        min={0}
      />
    </div>
  );
}

function BevegelighetFelt({ value, set }: SubProps) {
  return (
    <div className="grid gap-4 rounded-md border border-border bg-muted/30 p-4 sm:grid-cols-3">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Type</span>
        <select
          value={value.fysBevegelighetType ?? ""}
          onChange={(e) => set("fysBevegelighetType", e.target.value || null)}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">— Velg type —</option>
          {BEVEGELIGHET_TYPER.map((b) => (
            <option key={b.kode} value={b.kode}>
              {b.label}
            </option>
          ))}
          <option value="AKTIV_MOBILITET">Aktiv mobilitet</option>
        </select>
      </label>
      <NumInput
        label="Varighet (min)"
        value={value.fysVarighetMin}
        onChange={(v) => set("fysVarighetMin", v)}
        min={1}
      />
      <NumInput
        label="Hold (sek)"
        value={value.fysHoldSek}
        onChange={(v) => set("fysHoldSek", v)}
        min={0}
      />
    </div>
  );
}
