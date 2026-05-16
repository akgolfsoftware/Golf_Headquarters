"use client";

import { useMemo, useState } from "react";
import { Thermometer, Wind, Mountain, RotateCcw } from "lucide-react";
import type { YardageRow } from "@/lib/sg-hub/yardage-calc";
import {
  adjustYardageRows,
  DEFAULT_CONDITIONS,
  type Conditions,
} from "@/lib/sg-hub/conditions-adjust";
import { formatNumber } from "@/lib/sg-hub/format";

type Props = {
  rows: YardageRow[];
};

const WIND_DIRECTIONS: { label: string; deg: number }[] = [
  { label: "Motvind", deg: 0 },
  { label: "Sidevind H", deg: 90 },
  { label: "Medvind", deg: 180 },
  { label: "Sidevind V", deg: 270 },
];

export function ConditionsSlider({ rows }: Props) {
  const [c, setC] = useState<Conditions>(DEFAULT_CONDITIONS);

  const adjusted = useMemo(() => adjustYardageRows(rows, c), [rows, c]);

  const reset = () => setC(DEFAULT_CONDITIONS);

  const isDefault =
    c.tempC === DEFAULT_CONDITIONS.tempC &&
    c.windMs === DEFAULT_CONDITIONS.windMs &&
    c.elevationM === DEFAULT_CONDITIONS.elevationM &&
    c.windDirectionDeg === DEFAULT_CONDITIONS.windDirectionDeg;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Forhold
            </p>
            <h3 className="mt-1 text-base font-semibold">
              Tilpass distansen til vær og bane
            </h3>
          </div>
          <button
            type="button"
            onClick={reset}
            disabled={isDefault}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-3 w-3" />
            Tilbakestill
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <SliderRow
            icon={Thermometer}
            label="Temperatur"
            min={-10}
            max={40}
            step={1}
            value={c.tempC}
            unit="°C"
            onChange={(v) => setC({ ...c, tempC: v })}
            hint={c.tempC > 15 ? "Varmere = lengre" : c.tempC < 15 ? "Kaldere = kortere" : "Baseline"}
          />
          <SliderRow
            icon={Wind}
            label="Vindstyrke"
            min={0}
            max={20}
            step={1}
            value={c.windMs}
            unit="m/s"
            onChange={(v) => setC({ ...c, windMs: v })}
            hint={c.windMs > 0 ? "Effekt avhenger av retning" : "Ingen vind"}
          />
          <SliderRow
            icon={Mountain}
            label="Høyde"
            min={0}
            max={3000}
            step={50}
            value={c.elevationM}
            unit="m"
            onChange={(v) => setC({ ...c, elevationM: v })}
            hint={c.elevationM > 0 ? `+${(c.elevationM / 100).toFixed(1)} m carry` : "Havoverflate"}
          />
        </div>

        {c.windMs > 0 && (
          <div className="mt-5 border-t border-border pt-5">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Vindretning
            </p>
            <div className="flex flex-wrap gap-2">
              {WIND_DIRECTIONS.map((d) => (
                <button
                  key={d.deg}
                  type="button"
                  onClick={() => setC({ ...c, windDirectionDeg: d.deg })}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    c.windDirectionDeg === d.deg
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left">
              <Th>Kølle</Th>
              <Th className="text-right">Stock total</Th>
              <Th className="text-right">Justert total</Th>
              <Th className="text-right">Delta</Th>
              <Th className="text-right">Justert carry</Th>
            </tr>
          </thead>
          <tbody>
            {adjusted.map((r, i) => (
              <tr
                key={r.club}
                className={i % 2 === 0 ? "bg-card" : "bg-secondary/20"}
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-base font-semibold">
                    {r.club}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    {formatNumber(r.totalAvg, 0)} m
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono tabular-nums font-semibold">
                    {formatNumber(r.adjTotal, 0)} m
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DeltaBadge delta={r.delta} />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono tabular-nums">
                    {formatNumber(r.adjCarry, 0)} m
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.5) {
    return (
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        ±0
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs tabular-nums ${
        positive
          ? "bg-accent/30 text-accent-foreground"
          : "bg-destructive/15 text-destructive"
      }`}
    >
      {positive ? "+" : ""}
      {formatNumber(delta, 1)} m
    </span>
  );
}

function SliderRow({
  icon: Icon,
  label,
  min,
  max,
  step,
  value,
  unit,
  onChange,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  onChange: (v: number) => void;
  hint: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-2xl font-semibold tabular-nums">
          {formatNumber(value, 0)}
        </span>
        <span className="ml-1 font-mono text-xs text-muted-foreground">
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer accent-primary"
      />
      <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.10em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}
