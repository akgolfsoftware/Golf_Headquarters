"use client";

/**
 * PuttExplorer — interaktiv putt-statistikk per avstand.
 *
 * Bruker:
 *  1. Drar slider fra 1 til 20 meter
 *  2. Ser tour-snitt synkeprosent + topp-10 for valgt avstand
 *  3. Ser kontekstuell forklaring (X av 100 ble misset)
 *  4. Ser bar-chart med alle avstander (Recharts BarChart)
 */

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CircleDot, Target, Trophy } from "lucide-react";

type PuttDataRow = {
  distanceMeters: number;
  tourAvgSunkPct: number;
  top10AvgSunkPct: number | null;
  proximityNext: number | null;
  source: string;
};

// Tilgjengelige diskrete avstander vi kan velge mellom
const DISCRETE_DISTANCES = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20];

/** Finn nærmeste datapunkt for en gitt slider-verdi */
function naermestePunkt(data: PuttDataRow[], meter: number): PuttDataRow {
  let best = data[0];
  let bestDiff = Math.abs(data[0].distanceMeters - meter);
  for (const row of data) {
    const d = Math.abs(row.distanceMeters - meter);
    if (d < bestDiff) {
      best = row;
      bestDiff = d;
    }
  }
  return best;
}

export function PuttExplorer({ data }: { data: PuttDataRow[] }) {
  // Default til 3 meter — typisk scoring-putt
  const [sliderMeter, setSliderMeter] = useState(3);

  const valgtPunkt = useMemo(
    () => naermestePunkt(data, sliderMeter),
    [data, sliderMeter],
  );

  const missed = 100 - valgtPunkt.tourAvgSunkPct;
  const missedInt = Math.round(missed);
  const sunkInt = Math.round(valgtPunkt.tourAvgSunkPct);
  const top10Int = valgtPunkt.top10AvgSunkPct !== null
    ? Math.round(valgtPunkt.top10AvgSunkPct)
    : null;

  // Bar-chart-data: alle tilgjengelige datapunkter
  const chartData = data.map((row) => ({
    avstand: `${row.distanceMeters}m`,
    tourSnitt: row.tourAvgSunkPct,
    topp10: row.top10AvgSunkPct ?? row.tourAvgSunkPct,
    distanceMeters: row.distanceMeters,
  }));

  return (
    <>
      {/* SLIDER-SEKSJON */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Velg{" "}
              <em className="font-normal italic text-primary">putt-avstand</em>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Dra slideren og se hva PGA Tour-snittet er fra den avstanden.
            </p>
          </div>

          {/* Slider */}
          <div className="mt-10">
            <div className="text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Valgt avstand
              </p>
              <p className="mt-1 font-mono text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
                {sliderMeter}
                <span className="ml-1 text-2xl text-muted-foreground">m</span>
              </p>
            </div>

            <div className="mt-6">
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={sliderMeter}
                onChange={(e) => setSliderMeter(Number(e.target.value))}
                className="w-full accent-primary"
                aria-label="Putt-avstand i meter"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>1 m</span>
                <span>20 m</span>
              </div>
            </div>

            {/* Hurtigvalg-knapper */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {DISCRETE_DISTANCES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSliderMeter(d)}
                  className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
                    valgtPunkt.distanceMeters === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>

            {/* Resultatkort */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {/* Tour-snitt */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                      Tour-snitt synket
                    </p>
                    <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-foreground">
                      {sunkInt}
                      <span className="ml-0.5 text-xl text-muted-foreground">%</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      fra {valgtPunkt.distanceMeters} meter
                    </p>
                  </div>
                </div>
              </div>

              {/* Topp 10 */}
              <div className="rounded-lg border border-border bg-secondary/30 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/40 text-accent-foreground">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Topp 10 putters
                    </p>
                    {top10Int !== null ? (
                      <>
                        <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-foreground">
                          {top10Int}
                          <span className="ml-0.5 text-xl text-muted-foreground">%</span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          +{top10Int - sunkInt}% over snitt
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">N/A</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Misset */}
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                    <CircleDot className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Misset av 100
                    </p>
                    <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-foreground">
                      {missedInt}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      putter fra {valgtPunkt.distanceMeters}m
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kontekstuell forklaring */}
            <div className="mt-6 rounded-lg border border-border bg-secondary/20 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Fra {valgtPunkt.distanceMeters} meter:
                </span>{" "}
                PGA Tour-snittet synker{" "}
                <span className="font-semibold text-foreground">{sunkInt} av 100</span>{" "}
                putter. Det betyr at{" "}
                <span className="font-semibold text-foreground">{missedInt} av 100</span>{" "}
                blir misset — selv av verdens beste.
                {top10Int !== null && (
                  <>
                    {" "}
                    Topp 10 putters synker{" "}
                    <span className="font-semibold text-foreground">{top10Int} av 100</span>{" "}
                    fra samme avstand.
                  </>
                )}
                {valgtPunkt.proximityNext !== null && sunkInt < 100 && (
                  <>
                    {" "}
                    Ved miss er gjennomsnittlig neste putt{" "}
                    <span className="font-semibold text-foreground">
                      {valgtPunkt.proximityNext.toFixed(1)} meter
                    </span>
                    .
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BAR-CHART — alle bøtter */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Synkeprosent per{" "}
              <em className="font-normal italic text-primary">avstand</em>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              PGA Tour-snitt (grønn) og topp 10 putters (lime) · Sesong {new Date().getUTCFullYear()}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                barGap={2}
                barCategoryGap="20%"
              >
                <XAxis
                  dataKey="avstand"
                  tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains-mono)", fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)", fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--secondary))", opacity: 0.5 }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "var(--font-jetbrains-mono)",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value, name) => [
                    `${Math.round(Number(value))}%`,
                    name === "tourSnitt" ? "Tour-snitt" : "Topp 10",
                  ]}
                />
                <Bar dataKey="tourSnitt" name="tourSnitt" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-tour-${entry.distanceMeters}`}
                      fill={
                        entry.distanceMeters === valgtPunkt.distanceMeters
                          ? "hsl(var(--primary))"
                          : "hsl(var(--secondary))"
                      }
                    />
                  ))}
                </Bar>
                <Bar dataKey="topp10" name="topp10" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-top10-${entry.distanceMeters}`}
                      fill={
                        entry.distanceMeters === valgtPunkt.distanceMeters
                          ? "hsl(var(--accent))"
                          : "hsl(var(--muted))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* DATATABELL — fullstendig oversikt */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Komplett{" "}
              <em className="font-normal italic text-primary">statistikk</em>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Alle målte avstander · kilde:{" "}
              {data[0]?.source === "broadie-estimate"
                ? "Broadie (2014) + PGA Tour ShotLink"
                : "DataGolf"}
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Avstand
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Tour-snitt
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Topp 10
                  </th>
                  <th className="hidden px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:table-cell">
                    Neste putt
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const erValgt = row.distanceMeters === valgtPunkt.distanceMeters;
                  return (
                    <tr
                      key={row.distanceMeters}
                      className={`border-b border-border/60 last:border-0 ${
                        erValgt ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold tabular-nums text-foreground">
                          {row.distanceMeters} m
                        </span>
                        {erValgt && (
                          <span className="ml-2 rounded-full bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                            valgt
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="hidden w-20 sm:flex">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{ width: `${row.tourAvgSunkPct}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums text-foreground">
                            {Math.round(row.tourAvgSunkPct)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.top10AvgSunkPct !== null ? (
                          <span className="font-mono tabular-nums text-foreground">
                            {Math.round(row.top10AvgSunkPct)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell">
                        {row.proximityNext !== null && Math.round(row.tourAvgSunkPct) < 100 ? (
                          <span className="font-mono tabular-nums text-muted-foreground">
                            {row.proximityNext.toFixed(1)} m
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
