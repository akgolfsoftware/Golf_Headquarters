/**
 * Hovedvisning: Oversikt (server component).
 *
 * KPI-strip (5 kort) + fordelinger + topp-drills.
 */
import { Clock, Layers, ListChecks, MapPin, Target } from "lucide-react";
import type { OversiktData, DrillUsage } from "@/app/admin/analyse/actions";

const PYRAMID_FARGER: Record<string, string> = {
  FYS: "hsl(var(--destructive))",
  TEK: "hsl(var(--primary))",
  SLAG: "hsl(var(--accent))",
  SPILL: "#0A5C8A",
  TURN: "#7F4F00",
};

const MILJO_FARGER: Record<string, string> = {
  M0: "hsl(var(--border))",
  M1: "#CFE5C7",
  M2: "#8DC498",
  M3: "#4FA470",
  M4: "#2C7A4B",
  M5: "#003B2A",
};

function FordelingsLinje({
  label,
  verdi,
  total,
  farge,
}: {
  label: string;
  verdi: number;
  total: number;
  farge: string;
}) {
  const pct = total === 0 ? 0 : Math.round((verdi / total) * 100);
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 shrink-0 text-foreground">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: farge }}
        />
      </div>
      <span className="w-20 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {verdi} min · {pct}%
      </span>
    </div>
  );
}

function Kpi({
  label,
  verdi,
  enhet,
  ikon: Icon,
}: {
  label: string;
  verdi: string | number;
  enhet?: string;
  ikon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
        <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
          {label}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
          {verdi}
        </span>
        {enhet && (
          <span className="text-xs text-muted-foreground">{enhet}</span>
        )}
      </div>
    </div>
  );
}

export function AnalyseOversikt({
  data,
  drillBruk,
}: {
  data: OversiktData;
  drillBruk: DrillUsage[];
}) {
  const totalPyr = Object.values(data.pyramidFordeling).reduce(
    (s, n) => s + n,
    0,
  );
  const totalOmr = Object.values(data.omraadeFordeling).reduce(
    (s, n) => s + n,
    0,
  );
  const totalMiljo = Object.values(data.miljoFordeling).reduce(
    (s, n) => s + n,
    0,
  );
  const totalPraks = Object.values(data.praksistypeFordeling).reduce(
    (s, n) => s + n,
    0,
  );

  return (
    <div className="space-y-6">
      {/* KPI-strip */}
      <section
        aria-label="Nøkkeltall"
        className="grid grid-cols-2 gap-3 md:grid-cols-5"
      >
        <Kpi
          label="Total tid"
          verdi={Math.round(data.totalMinutes / 60)}
          enhet="t"
          ikon={Clock}
        />
        <Kpi label="Økter" verdi={data.totalSessions} ikon={Layers} />
        <Kpi label="Drills" verdi={data.totalDrills} ikon={ListChecks} />
        <Kpi
          label="CS-snitt"
          verdi={data.csSnitt ?? "–"}
          enhet={data.csSnitt ? "%" : undefined}
          ikon={Target}
        />
        <Kpi
          label="Miljø-spenn"
          verdi={Object.keys(data.miljoFordeling).length}
          enhet="nivåer"
          ikon={MapPin}
        />
      </section>

      {/* Pyramide-fordeling */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">
          Pyramide-fordeling
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hvor mye tid brukt i hvert nivå.
        </p>
        <div className="mt-4 space-y-2">
          {Object.entries(data.pyramidFordeling)
            .sort((a, b) => b[1] - a[1])
            .map(([kode, min]) => (
              <FordelingsLinje
                key={kode}
                label={kode}
                verdi={min}
                total={totalPyr}
                farge={PYRAMID_FARGER[kode] ?? "hsl(var(--muted-foreground))"}
              />
            ))}
        </div>
      </section>

      {/* Område-fordeling */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">
          Område-fordeling
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Treningsområder (fra taksonomien).
        </p>
        <div className="mt-4 space-y-2">
          {Object.entries(data.omraadeFordeling)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([navn, min]) => (
              <FordelingsLinje
                key={navn}
                label={navn}
                verdi={min}
                total={totalOmr}
                farge="hsl(var(--primary))"
              />
            ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Miljø */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Miljø (M0–M5)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fra ro-trening (M0) til turnering (M5).
          </p>
          <div className="mt-4 space-y-2">
            {["M0", "M1", "M2", "M3", "M4", "M5"].map((m) => (
              <FordelingsLinje
                key={m}
                label={m}
                verdi={data.miljoFordeling[m] ?? 0}
                total={totalMiljo}
                farge={MILJO_FARGER[m] ?? "hsl(var(--muted-foreground))"}
              />
            ))}
          </div>
        </section>

        {/* Praksistype */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Praksistype</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Blokk / Random / Konkurranse / Spill-test.
          </p>
          <div className="mt-4 space-y-2">
            {Object.entries(data.praksistypeFordeling)
              .sort((a, b) => b[1] - a[1])
              .map(([kode, min]) => (
                <FordelingsLinje
                  key={kode}
                  label={kode}
                  verdi={min}
                  total={totalPraks}
                  farge="hsl(var(--primary))"
                />
              ))}
          </div>
        </section>
      </div>

      {/* Topp 10 drills */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Mest brukte drills</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Topp 10 fra perioden, sortert på antall ganger gjort.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 font-mono text-[10px] uppercase tracking-[0.1em]">
                  Drill
                </th>
                <th className="py-2 font-mono text-[10px] uppercase tracking-[0.1em]">
                  Nivå
                </th>
                <th className="py-2 text-right font-mono text-[10px] uppercase tracking-[0.1em]">
                  Antall
                </th>
                <th className="py-2 text-right font-mono text-[10px] uppercase tracking-[0.1em]">
                  Min
                </th>
              </tr>
            </thead>
            <tbody>
              {drillBruk.slice(0, 10).map((d) => (
                <tr key={`${d.navn}-${d.pyramide}`} className="border-b border-border/50 last:border-0">
                  <td className="py-2 text-foreground">{d.navn}</td>
                  <td className="py-2">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em]"
                      style={{
                        backgroundColor: `${PYRAMID_FARGER[d.pyramide] ?? "hsl(var(--muted-foreground))"}22`,
                        color: PYRAMID_FARGER[d.pyramide] ?? "hsl(var(--muted-foreground))",
                      }}
                    >
                      {d.pyramide}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono tabular-nums">
                    {d.count}
                  </td>
                  <td className="py-2 text-right font-mono tabular-nums text-muted-foreground">
                    {d.totalMinutter}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
