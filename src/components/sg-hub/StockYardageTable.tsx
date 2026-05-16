"use client";

import { useMemo, useState } from "react";
import { FileDown, Sliders } from "lucide-react";
import type { YardageRow } from "@/lib/sg-hub/yardage-calc";
import { adjustForConditions } from "@/lib/sg-hub/yardage-calc";
import { formatNumber } from "@/lib/sg-hub/format";

type Props = {
  rows: YardageRow[];
  playerName: string;
};

export function StockYardageTable({ rows, playerName }: Props) {
  const [tempC, setTempC] = useState(15);
  const [elevationM, setElevationM] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const adjustedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        adjCarry: round1(adjustForConditions(r.carryAvg, tempC, elevationM)),
        adjTotal: round1(adjustForConditions(r.totalAvg, tempC, elevationM)),
        adjThree: round1(adjustForConditions(r.threeQuarter, tempC, elevationM)),
        adjSoft: round1(adjustForConditions(r.soft, tempC, elevationM)),
      })),
    [rows, tempC, elevationM],
  );

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/portal/mal/sg-hub/yardage/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempC,
          elevationM,
        }),
      });
      if (!res.ok) throw new Error("Eksport feilet");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stock-yardage-${playerName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Værjustering
            </span>
          </div>
          <ConditionField
            label="Temperatur"
            unit="°C"
            min={-10}
            max={40}
            step={1}
            value={tempC}
            onChange={setTempC}
          />
          <ConditionField
            label="Høyde"
            unit="m"
            min={0}
            max={3000}
            step={50}
            value={elevationM}
            onChange={setElevationM}
          />
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileDown className="h-4 w-4" />
          {downloading ? "Lager PDF…" : "Last ned PDF"}
        </button>
      </div>

      {/* Desktop-tabell */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left">
              <Th>Kølle</Th>
              <Th className="text-right">Slag</Th>
              <Th className="text-right">Carry</Th>
              <Th className="text-right">Total</Th>
              <Th className="text-right">±1σ</Th>
              <Th className="text-right">3/4</Th>
              <Th className="text-right">Soft</Th>
              <Th className="text-right">Apex</Th>
              <Th className="text-right">Smash</Th>
            </tr>
          </thead>
          <tbody>
            {adjustedRows.map((r, i) => (
              <tr
                key={r.club}
                className={
                  i % 2 === 0 ? "bg-card" : "bg-secondary/20"
                }
              >
                <Td>
                  <span className="font-mono text-base font-semibold">
                    {r.club}
                  </span>
                </Td>
                <Td className="text-right text-muted-foreground">
                  <span className="font-mono tabular-nums">{r.shotCount}</span>
                </Td>
                <Td className="text-right">
                  <span className="font-mono tabular-nums font-semibold">
                    {formatNumber(r.adjCarry, 0)}
                  </span>
                </Td>
                <Td className="text-right">
                  <span className="font-mono tabular-nums">
                    {formatNumber(r.adjTotal, 0)}
                  </span>
                </Td>
                <Td className="text-right text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    ±{formatNumber(r.totalSigma, 1)}
                  </span>
                </Td>
                <Td className="text-right">
                  <span className="font-mono tabular-nums">
                    {formatNumber(r.adjThree, 0)}
                  </span>
                </Td>
                <Td className="text-right">
                  <span className="font-mono tabular-nums">
                    {formatNumber(r.adjSoft, 0)}
                  </span>
                </Td>
                <Td className="text-right text-muted-foreground">
                  <span className="font-mono tabular-nums">{r.apex}</span>
                </Td>
                <Td className="text-right text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    {formatNumber(r.smashAvg, 2)}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {adjustedRows.map((r) => (
          <div
            key={r.club}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-lg font-semibold">{r.club}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {r.shotCount} slag · ±{formatNumber(r.totalSigma, 1)} m
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MobileCell
                label="Carry"
                value={formatNumber(r.adjCarry, 0)}
                unit="m"
                highlight
              />
              <MobileCell
                label="Total"
                value={formatNumber(r.adjTotal, 0)}
                unit="m"
              />
              <MobileCell
                label="Apex"
                value={String(r.apex)}
                unit="m"
              />
              <MobileCell
                label="3/4"
                value={formatNumber(r.adjThree, 0)}
                unit="m"
              />
              <MobileCell
                label="Soft"
                value={formatNumber(r.adjSoft, 0)}
                unit="m"
              />
              <MobileCell
                label="Smash"
                value={formatNumber(r.smashAvg, 2)}
                unit=""
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConditionField({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-32 cursor-pointer accent-primary"
        />
        <span className="min-w-[3.5rem] font-mono text-sm tabular-nums">
          {formatNumber(value, 0)} {unit}
        </span>
      </div>
    </label>
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

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function MobileCell({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-base tabular-nums ${highlight ? "font-semibold text-foreground" : ""}`}
      >
        {value}
        {unit && (
          <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span>
        )}
      </p>
    </div>
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
