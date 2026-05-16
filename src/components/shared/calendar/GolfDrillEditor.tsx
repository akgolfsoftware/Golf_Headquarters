"use client";

// GolfDrillEditor — redigerer én GOLF-drill (pyramide !== "FYS").
// Bruker AK-taksonomi: område, L-fase, CS-nivå, miljø, PR-press, P-posisjoner,
// LIFE-kode, komponentfokus og slow-motion. Returnerer endringer via onChange.

import { useId } from "react";
import { Gauge, Target, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRENINGSOMRADER,
  L_FASER,
  CS_NIVAER,
  M_MILJO,
  PR_PRESS,
} from "@/lib/portal/training/ak-taxonomy";
import { P_POSISJONER } from "@/lib/taxonomy";
import type {
  PyramidArea,
  LFase,
  CSNivaa,
  MMiljo,
  PRPress,
} from "@/generated/prisma/client";

export type GolfDrillData = {
  name: string;
  description: string;
  durationMinutes: number;
  repetitions: number | null;
  pyramide: Exclude<PyramidArea, "FYS">;
  omraade: string | null;
  lFase: LFase | null;
  csNivaa: CSNivaa | null;
  miljo: MMiljo | null;
  prPress: PRPress | null;
  pPosisjoner: string[];
  componentFocus: string | null;
  lifeKode: string | null;
  slowMotionMode: boolean;
};

type Props = {
  value: GolfDrillData;
  onChange: (v: GolfDrillData) => void;
};

export function GolfDrillEditor({ value, onChange }: Props) {
  const baseId = useId();
  const set = <K extends keyof GolfDrillData>(k: K, v: GolfDrillData[K]) =>
    onChange({ ...value, [k]: v });

  const togglePosisjon = (kode: string) => {
    const harDet = value.pPosisjoner.includes(kode);
    set(
      "pPosisjoner",
      harDet
        ? value.pPosisjoner.filter((p) => p !== kode)
        : [...value.pPosisjoner, kode],
    );
  };

  return (
    <div className="space-y-4">
      {/* Drill-navn + beskrivelse */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Drill-navn</span>
          <input
            id={`${baseId}-name`}
            type="text"
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Eks. 9-ball putt-rutine"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Varighet (min)</span>
            <input
              type="number"
              min={1}
              max={300}
              value={value.durationMinutes}
              onChange={(e) => set("durationMinutes", Math.max(1, Number(e.target.value)))}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-mono tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Repetisjoner</span>
            <input
              type="number"
              min={0}
              value={value.repetitions ?? ""}
              onChange={(e) =>
                set("repetitions", e.target.value === "" ? null : Number(e.target.value))
              }
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-mono tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="—"
            />
          </label>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Beskrivelse</span>
        <textarea
          value={value.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Hva skal spilleren gjøre, og hvordan måles det?"
        />
      </label>

      {/* Område */}
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />
          Område
        </span>
        <select
          value={value.omraade ?? ""}
          onChange={(e) => set("omraade", e.target.value || null)}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">— Velg område —</option>
          {TRENINGSOMRADER.map((o) => (
            <option key={o.kode} value={o.kode}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* L-fase */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">L-fase</span>
        <div className="flex flex-wrap gap-2">
          {L_FASER.map((l) => {
            const aktiv = value.lFase === l.kode;
            return (
              <button
                key={l.kode}
                type="button"
                onClick={() => set("lFase", aktiv ? null : (l.kode as LFase))}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                  aktiv
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
                title={l.beskrivelse}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CS-nivå med visualisering */}
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Gauge className="h-3.5 w-3.5" strokeWidth={1.8} />
          CS-nivå (svinghastighet)
        </span>
        <div className="grid grid-cols-6 gap-2">
          {CS_NIVAER.map((cs) => {
            const aktiv = value.csNivaa === cs.kode;
            return (
              <button
                key={cs.kode}
                type="button"
                onClick={() => set("csNivaa", aktiv ? null : (cs.kode as CSNivaa))}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border px-2 py-2 transition-colors",
                  aktiv
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
                title={cs.beskrivelse}
              >
                <span className="font-mono text-sm tabular-nums">{cs.label}</span>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full", aktiv ? "bg-primary" : "bg-foreground/30")}
                    style={{ width: `${cs.verdi}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Miljø + PR */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Miljø</span>
          <div className="flex flex-wrap gap-2">
            {M_MILJO.map((m) => {
              const aktiv = value.miljo === m.kode;
              return (
                <button
                  key={m.kode}
                  type="button"
                  onClick={() => set("miljo", aktiv ? null : (m.kode as MMiljo))}
                  className={cn(
                    "rounded-full border px-2 py-2 font-mono text-xs",
                    aktiv
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary",
                  )}
                  title={`${m.label} — ${m.beskrivelse}`}
                >
                  {m.kode}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Target className="h-3.5 w-3.5" strokeWidth={1.8} />
            Press
          </span>
          <div className="flex flex-wrap gap-2">
            {PR_PRESS.map((p) => {
              const aktiv = value.prPress === p.kode;
              return (
                <button
                  key={p.kode}
                  type="button"
                  onClick={() => set("prPress", aktiv ? null : (p.kode as PRPress))}
                  className={cn(
                    "rounded-full border px-2 py-2 font-mono text-xs",
                    aktiv
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary",
                  )}
                  title={`${p.label} — ${p.beskrivelse}`}
                >
                  {p.kode}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* P-posisjoner multi-select */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          P-posisjoner ({value.pPosisjoner.length} valgt)
        </span>
        <div className="flex flex-wrap gap-2">
          {P_POSISJONER.map((p) => {
            const aktiv = value.pPosisjoner.includes(p.kode);
            return (
              <button
                key={p.kode}
                type="button"
                onClick={() => togglePosisjon(p.kode)}
                className={cn(
                  "rounded-sm border px-2 py-2 font-mono text-[11px]",
                  aktiv
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
                title={p.label}
              >
                {p.kode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Komponentfokus + LIFE-kode + slowmotion */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Komponentfokus</span>
          <input
            type="text"
            value={value.componentFocus ?? ""}
            onChange={(e) => set("componentFocus", e.target.value || null)}
            placeholder="Eks. skulderrotasjon"
            className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">LIFE-kode</span>
          <input
            type="text"
            value={value.lifeKode ?? ""}
            onChange={(e) => set("lifeKode", e.target.value || null)}
            placeholder="Eks. L-ARM-P4"
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.slowMotionMode}
          onChange={(e) => set("slowMotionMode", e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <span>Slow-motion-modus</span>
      </label>
    </div>
  );
}
