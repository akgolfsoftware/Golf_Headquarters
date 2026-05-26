"use client";

/**
 * Strokes Gained — 4 kategori-kort (OTT, APP, ARG, PUTT) med trend-graf
 * og enkel korrelasjon-tekst (slope + retning).
 */
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import type { SGCouplingPunkt } from "@/app/admin/analyse/actions";

type Kategori = {
  navn: string;
  kode: "sgTotal" | "sgOtt" | "sgApp" | "sgArg" | "sgPutt";
  beskrivelse: string;
  farge: string;
};

const KATEGORIER: Kategori[] = [
  { navn: "OTT", kode: "sgOtt", beskrivelse: "Off the tee — utslag.", farge: "hsl(var(--primary))" },
  { navn: "APP", kode: "sgApp", beskrivelse: "Tilnærming inn på greenen.", farge: "#0A5C8A" },
  { navn: "ARG", kode: "sgArg", beskrivelse: "Around the green — chip/pitch/bunker.", farge: "#7F4F00" },
  { navn: "PUTT", kode: "sgPutt", beskrivelse: "Putting på green.", farge: "hsl(var(--destructive))" },
];

function snitt(verdier: number[]): number {
  if (verdier.length === 0) return 0;
  return verdier.reduce((s, n) => s + n, 0) / verdier.length;
}

function trendRetning(punkter: { dato: string; verdi: number | null }[]) {
  const med = punkter.filter((p) => p.verdi !== null) as {
    dato: string;
    verdi: number;
  }[];
  if (med.length < 2) return { slope: 0, retning: "flat" as const };
  const first3 = snitt(med.slice(0, 3).map((p) => p.verdi));
  const last3 = snitt(med.slice(-3).map((p) => p.verdi));
  const slope = last3 - first3;
  return {
    slope,
    retning: Math.abs(slope) < 0.05 ? ("flat" as const) : slope > 0 ? ("opp" as const) : ("ned" as const),
  };
}

export function AnalyseSG({ data }: { data: SGCouplingPunkt[] }) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">
          Strokes Gained — kobling mot trening
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.length} runder i perioden. Trend per kategori.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {KATEGORIER.map((k) => {
          const punkter = data.map((p) => ({ dato: p.dato, verdi: p[k.kode] }));
          const { slope, retning } = trendRetning(punkter);
          const sisteVerdi = punkter[punkter.length - 1]?.verdi ?? null;
          const retningLabel =
            retning === "opp" ? "Bedrer seg" : retning === "ned" ? "Forverres" : "Flat";
          const retningFarge =
            retning === "opp"
              ? "text-primary"
              : retning === "ned"
                ? "text-destructive"
                : "text-muted-foreground";
          return (
            <div key={k.kode} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold">{k.navn}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{k.beskrivelse}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-semibold tabular-nums text-foreground">
                    {sisteVerdi === null ? "–" : sisteVerdi.toFixed(2)}
                  </div>
                  <div className={`mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${retningFarge}`}>
                    {retningLabel} ({slope > 0 ? "+" : ""}{slope.toFixed(2)})
                  </div>
                </div>
              </div>
              <div className="mt-3 h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={punkter}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="dato"
                      tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                      tickFormatter={(d) => String(d).slice(5)}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: 11,
                      }}
                    />
                    <ReferenceLine y={0} stroke="var(--color-muted-foreground)" />
                    <Line type="monotone" dataKey="verdi" stroke={k.farge} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Tips: kryssjekk denne kategorien mot tids-investering i krysstabellen
                for å se om trening matcher resultat.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
