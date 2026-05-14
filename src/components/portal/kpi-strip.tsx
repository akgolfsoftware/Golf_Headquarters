import { formatSg } from "@/lib/sg";

type Kpi = {
  label: string;
  value: string;
  sub?: string;
};

export function KpiStrip({
  hcp,
  sgTotal,
  streakAktiv,
  pyramideUkeProsent,
}: {
  hcp: number | null;
  sgTotal: number | null;
  streakAktiv: number;
  pyramideUkeProsent: number;
}) {
  const kpier: Kpi[] = [
    {
      label: "HCP",
      value: hcp != null ? hcp.toFixed(1).replace(".", ",") : "—",
      sub: "Nåværende",
    },
    {
      label: "SG total",
      value: formatSg(sgTotal),
      sub: "Siste 30 dager",
    },
    {
      label: "Streak",
      value: String(streakAktiv),
      sub: streakAktiv === 1 ? "dag" : "dager",
    },
    {
      label: "Pyramide uke",
      value: `${pyramideUkeProsent}%`,
      sub: "Av målfordeling",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {kpier.map((k) => (
        <div
          key={k.label}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {k.label}
          </div>
          <div className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
            {k.value}
          </div>
          {k.sub && (
            <div className="mt-0.5 text-[11px] text-muted-foreground">{k.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
