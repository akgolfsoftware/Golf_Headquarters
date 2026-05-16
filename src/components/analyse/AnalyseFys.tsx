"use client";

/**
 * FYS — topp 10 mest brukte øvelser med vekt-progresjon + muskelgruppe-balanse.
 */
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FysProgresjonRad } from "@/app/admin/analyse/actions";

const MUSKEL_FARGER = [
  "#005840",
  "#D1F843",
  "#0A5C8A",
  "#A32D2D",
  "#7F4F00",
  "#5E5C57",
  "#8DC498",
  "#003B2A",
];

export function AnalyseFys({
  data,
  muskelfordeling,
}: {
  data: FysProgresjonRad[];
  muskelfordeling: Record<string, number>;
}) {
  const muskelData = Object.entries(muskelfordeling)
    .filter(([, v]) => v > 0)
    .map(([navn, value]) => ({ navn, value }));

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">
          Fysisk progresjon
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Topp {data.length} mest brukte FYS-øvelser i perioden.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.map((rad) => {
          const punkter = rad.punkter.map((p) => ({
            dato: p.dato.slice(5),
            vektKg: p.vektKg,
            reps: p.reps,
          }));
          const sisteVekt = rad.punkter[rad.punkter.length - 1]?.vektKg ?? null;
          const forsteVekt = rad.punkter[0]?.vektKg ?? null;
          const delta =
            sisteVekt !== null && forsteVekt !== null
              ? sisteVekt - forsteVekt
              : null;
          return (
            <div
              key={rad.ovelse}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold">
                    {rad.ovelse}
                  </h3>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {rad.muskelgruppe ?? "?"} · {rad.treningstype ?? "?"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-semibold tabular-nums text-foreground">
                    {sisteVekt === null ? "–" : `${sisteVekt} kg`}
                  </div>
                  {delta !== null && (
                    <div
                      className={`mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                        delta > 0
                          ? "text-primary"
                          : delta < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {delta > 0 ? "+" : ""}
                      {delta} kg
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={punkter}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="dato" tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }} />
                    <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }} width={36} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontFamily: "var(--font-geist-mono)", fontSize: 11 }} />
                    <Line type="monotone" dataKey="vektKg" stroke="#005840" strokeWidth={2} dot={{ r: 3 }} name="kg" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Muskelgruppe-balanse</h2>
        <p className="mt-1 text-sm text-muted-foreground">Minutter trent per muskelgruppe i perioden.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={muskelData} dataKey="value" nameKey="navn" innerRadius={50} outerRadius={90}>
                  {muskelData.map((_, i) => (
                    <Cell key={i} fill={MUSKEL_FARGER[i % MUSKEL_FARGER.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontFamily: "var(--font-geist-mono)", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 self-center">
            {muskelData.sort((a, b) => b.value - a.value).map((m, i) => (
              <li key={m.navn} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: MUSKEL_FARGER[i % MUSKEL_FARGER.length] }} />
                  <span className="text-foreground">{m.navn}</span>
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">{m.value} min</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
