"use client";

/**
 * Trender — stacked area chart over tid.
 *
 * Viser hvordan en valgt dimensjon (default Pyramide) fordeler seg uke
 * for uke. Bytter dim via dropdown.
 */
import { useMemo, useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Dimensjon, TrendPunkt } from "@/app/admin/analyse/actions";
import { getTrendData } from "@/app/admin/analyse/actions";

const PYRAMID_FARGER: Record<string, string> = {
  FYS: "hsl(var(--destructive))",
  TEK: "hsl(var(--primary))",
  SLAG: "hsl(var(--accent))",
  SPILL: "#0A5C8A",
  TURN: "#7F4F00",
};

const DIM_LABELS: Record<Dimensjon, string> = {
  pyramide: "Pyramide",
  omraade: "Område",
  lFase: "L-fase",
  csNivaa: "CS-nivå",
  miljo: "Miljø",
  prPress: "Pressnivå",
  praksistype: "Praksistype",
  componentFocus: "Komponentfokus",
};

function parsePeriode(s: string): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  const dager = s === "7d" ? 7 : s === "90d" ? 90 : s === "365d" ? 365 : 30;
  from.setDate(from.getDate() - dager);
  return { from, to };
}

function fargeFor(serie: string, idx: number): string {
  if (PYRAMID_FARGER[serie]) return PYRAMID_FARGER[serie];
  const palette = ["hsl(var(--primary))", "hsl(var(--accent))", "#0A5C8A", "hsl(var(--destructive))", "#7F4F00", "hsl(var(--muted-foreground))"];
  return palette[idx % palette.length];
}

export function AnalyseTrender({
  data: initData,
  valgtAgg,
  studentId,
  periodeKey,
}: {
  data: TrendPunkt[];
  valgtAgg: "uke" | "maaned";
  studentId: string;
  periodeKey: string;
}) {
  const [data, setData] = useState<TrendPunkt[]>(initData);
  const [dim, setDim] = useState<Dimensjon>("pyramide");
  const [agg, setAgg] = useState<"uke" | "maaned">(valgtAgg);
  const [pending, startTransition] = useTransition();

  const { flat, serier } = useMemo(() => {
    const alleSerier = new Set<string>();
    const flatData = data.map((p) => {
      Object.keys(p.data).forEach((k) => alleSerier.add(k));
      return { bucket: p.bucket, ...p.data };
    });
    return { flat: flatData, serier: Array.from(alleSerier).sort() };
  }, [data]);

  function bytt(nyDim: Dimensjon, nyAgg: "uke" | "maaned") {
    setDim(nyDim);
    setAgg(nyAgg);
    const periode = parsePeriode(periodeKey);
    startTransition(async () => {
      try {
        const ny = await getTrendData(studentId, periode, nyDim, nyAgg);
        if (ny.length > 0) setData(ny);
      } catch {
        // behold
      }
    });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Trender</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hvordan fordelingen utvikler seg over tid.
            </p>
          </div>
          <div className="flex gap-2">
            <label className="text-sm">
              <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Dimensjon
              </span>
              <select
                value={dim}
                onChange={(e) => bytt(e.target.value as Dimensjon, agg)}
                disabled={pending}
                className="mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
              >
                {Object.entries(DIM_LABELS).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Bucket
              </span>
              <select
                value={agg}
                onChange={(e) => bytt(dim, e.target.value as "uke" | "maaned")}
                disabled={pending}
                className="mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
              >
                <option value="uke">Per uke</option>
                <option value="maaned">Per måned</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={flat}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 11, fontFamily: "var(--font-geist-mono)" }}
              />
              <YAxis
                tick={{ fontSize: 11, fontFamily: "var(--font-geist-mono)" }}
                label={{ value: "min", angle: -90, position: "insideLeft", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {serier.map((s, i) => (
                <Area
                  key={s}
                  type="monotone"
                  dataKey={s}
                  stackId="1"
                  stroke={fargeFor(s, i)}
                  fill={fargeFor(s, i)}
                  fillOpacity={0.7}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
