/**
 * TrackMan · Trend-seksjon — port av components-trackman-trend.html.
 *
 * Viser utvikling over tid: KPI-strip (carry, klubbhastighet) + per-kølle
 * sparklines fra CLUB_AVG-signaler. Krever ≥ 2 sesjoner for å vise.
 * Alle tall fra ekte DB-data — aldri hardkodet.
 */

import { TrendingDown, TrendingUp, Minus } from "lucide-react";

// ── Typer ───────────────────────────────────────────────────────────────────

type SesjonSummary = {
  recordedAt: Date;
  avgCarry: number | null;
  avgClubSpeed: number | null;
};

type KlubbTrend = {
  navn: string;
  punkter: number[]; // avgCarry per sesjon, eldste først
  naa: number;
  delta: number | null;
};

export type TrackManTrendData = {
  sesjoner: SesjonSummary[];
  klubber: KlubbTrend[];
};

// ── SVG Sparkline ───────────────────────────────────────────────────────────

function Sparkline({
  values,
  tone,
}: {
  values: number[];
  tone: "up" | "flat" | "down";
}) {
  if (values.length < 2) return <span className="h-8 flex-1 rounded bg-secondary" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 100;
  const H = 32;
  const pad = 2;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = pad + (H - pad * 2) - ((v - min) / range) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke =
    tone === "up"
      ? "var(--success)"
      : tone === "down"
        ? "var(--warning)"
        : "var(--muted-foreground)";
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden
    >
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Hjelpere ─────────────────────────────────────────────────────────────────

function deltaTone(d: number | null): "up" | "flat" | "down" {
  if (d === null) return "flat";
  if (d > 0.5) return "up";
  if (d < -0.5) return "down";
  return "flat";
}

function DeltaChip({ delta, unit = "" }: { delta: number | null; unit?: string }) {
  const tone = deltaTone(delta);
  if (delta === null) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-muted-foreground">
        <Minus className="h-[11px] w-[11px]" />
        —
      </span>
    );
  }
  const cls =
    tone === "up"
      ? "text-success"
      : tone === "down"
        ? "text-warning"
        : "text-muted-foreground";
  const Icon = tone === "up" ? TrendingUp : tone === "down" ? TrendingDown : Minus;
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${cls}`}>
      <Icon className="h-[11px] w-[11px]" />
      {delta > 0 ? "+" : ""}
      {delta.toFixed(1)}
      {unit}
    </span>
  );
}

// ── KPI-celle ─────────────────────────────────────────────────────────────────

function KpiCelle({
  label,
  value,
  unit,
  delta,
  deltaUnit,
  sparkValues,
}: {
  label: string;
  value: number | null;
  unit: string;
  delta: number | null;
  deltaUnit?: string;
  sparkValues: number[];
}) {
  const tone = deltaTone(delta);
  return (
    <div className="flex flex-col gap-2 border-r border-border p-4 last:border-r-0">
      <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        {value !== null ? (
          <>
            <span className="font-mono text-[22px] font-bold tabular-nums leading-none tracking-[-0.015em] text-foreground">
              {value.toFixed(0)}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">{unit}</span>
          </>
        ) : (
          <span className="font-mono text-[22px] font-bold text-muted-foreground">—</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <DeltaChip delta={delta} unit={deltaUnit} />
        {sparkValues.length >= 2 && (
          <span className="flex-1">
            <Sparkline values={sparkValues} tone={tone} />
          </span>
        )}
      </div>
    </div>
  );
}

// ── Hovudkomponent ────────────────────────────────────────────────────────────

export function TrackManTrendSeksjon({ data }: { data: TrackManTrendData }) {
  const { sesjoner, klubber } = data;
  if (sesjoner.length < 2) return null;

  const siste = sesjoner[sesjoner.length - 1];
  const forrige = sesjoner[sesjoner.length - 2];

  const carryNaa = siste.avgCarry;
  const carryDelta =
    carryNaa !== null && forrige.avgCarry !== null ? carryNaa - forrige.avgCarry : null;
  const carryVerdier = sesjoner.map((s) => s.avgCarry ?? 0).filter((v) => v > 0);

  const speedNaa = siste.avgClubSpeed;
  const speedDelta =
    speedNaa !== null && forrige.avgClubSpeed !== null
      ? speedNaa - forrige.avgClubSpeed
      : null;
  const speedVerdier = sesjoner.map((s) => s.avgClubSpeed ?? 0).filter((v) => v > 0);

  const fraLabel = sesjoner[0].recordedAt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
  const tilLabel = siste.recordedAt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });

  return (
    <section
      aria-label="TrackMan-trendanalyse"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      {/* Header */}
      <header className="flex items-end justify-between gap-4 border-b border-border px-5 pb-3.5 pt-4">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="relative h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(209,248,67,0.6)]" />
            TrackMan · Trend · {sesjoner.length} økter
          </span>
          <h2 className="mt-1 font-display text-[19px] font-bold leading-[1.1] tracking-[-0.015em] text-foreground">
            Utvikling over tid{" "}
            <em className="font-normal italic text-muted-foreground">
              · {fraLabel} → {tilLabel}
            </em>
          </h2>
        </div>
        <span className="shrink-0 rounded-md bg-secondary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {sesjoner.length} sess
        </span>
      </header>

      {/* KPI-strip */}
      <div className="grid grid-cols-2 border-b border-border sm:grid-cols-3">
        <KpiCelle
          label="Avg. Carry"
          value={carryNaa}
          unit="m"
          delta={carryDelta}
          deltaUnit=" m"
          sparkValues={carryVerdier}
        />
        <KpiCelle
          label="Klubbhastighet"
          value={speedNaa}
          unit="m/s"
          delta={speedDelta}
          deltaUnit=" m/s"
          sparkValues={speedVerdier}
        />
        <div className="col-span-2 flex flex-col justify-between border-t border-border p-4 sm:col-span-1 sm:border-l sm:border-t-0">
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Registrerte sesjoner
          </span>
          <span className="font-mono text-[22px] font-bold tabular-nums leading-none tracking-[-0.015em] text-foreground">
            {sesjoner.length}
          </span>
          <span className="font-mono text-[10.5px] text-muted-foreground">
            Første: {fraLabel}
          </span>
        </div>
      </div>

      {/* Per-kølle sparklines */}
      {klubber.length > 0 && (
        <div className="px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-[14px] font-bold tracking-[-0.015em] text-foreground">
              Utvikling per kølle
            </h3>
            <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
              Avg. carry (m) over tid
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {klubber.map((k) => {
              const tone = deltaTone(k.delta);
              return (
                <div
                  key={k.navn}
                  className="flex flex-col gap-1.5 rounded-lg border border-border bg-background p-2.5"
                >
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-foreground">
                      {k.navn}
                    </span>
                    <span className="font-mono text-[17px] font-bold tabular-nums leading-none tracking-[-0.025em] text-foreground">
                      {k.naa.toFixed(0)}
                      <small className="ml-0.5 text-[9px] font-semibold text-muted-foreground">
                        m
                      </small>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <DeltaChip delta={k.delta} unit=" m" />
                    <span className="flex-1">
                      <Sparkline values={k.punkter} tone={tone} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Data-builder (kjøres i page.tsx) ─────────────────────────────────────────

type RawSignalPayload = {
  sessionId?: string;
  klubb?: string;
  antallSlag?: number;
};

type RawSessionJson = {
  summary?: {
    avgCarry?: number | null;
    avgClubSpeed?: number | null;
  };
};

export function byggTrendData(
  okter: Array<{ id: string; recordedAt: Date; rawJson: unknown }>,
  signaler: Array<{ value: number | null; payload: unknown; computedAt: Date }>,
): TrackManTrendData {
  // Sesjoner eldste → nyeste, maks 8
  const sorterte = [...okter]
    .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
    .slice(-8);

  const sesjoner: SesjonSummary[] = sorterte.map((o) => {
    const raw = o.rawJson as RawSessionJson | null;
    return {
      recordedAt: o.recordedAt,
      avgCarry: raw?.summary?.avgCarry ?? null,
      avgClubSpeed: raw?.summary?.avgClubSpeed ?? null,
    };
  });

  const sesjonIds = new Set(sorterte.map((o) => o.id));

  // Bygg per-kølle-trender fra CLUB_AVG-signaler
  const klubbMap = new Map<
    string,
    Array<{ dato: Date; snitt: number }>
  >();
  for (const sig of signaler) {
    if (sig.value === null) continue;
    const p = sig.payload as RawSignalPayload | null;
    if (!p?.sessionId || !sesjonIds.has(p.sessionId) || !p.klubb) continue;
    const navn = p.klubb;
    if (!klubbMap.has(navn)) klubbMap.set(navn, []);
    klubbMap.get(navn)!.push({ dato: sig.computedAt, snitt: sig.value });
  }

  const klubber: KlubbTrend[] = [];
  for (const [navn, pts] of klubbMap.entries()) {
    if (pts.length < 2) continue;
    const sortert = [...pts].sort((a, b) => a.dato.getTime() - b.dato.getTime());
    const punkter = sortert.map((p) => p.snitt);
    const naa = punkter[punkter.length - 1];
    const forrige = punkter[punkter.length - 2];
    klubber.push({ navn, punkter, naa, delta: naa - forrige });
  }

  // Sorter etter størst nåverdi (lengst kølle først)
  klubber.sort((a, b) => b.naa - a.naa);

  return { sesjoner, klubber: klubber.slice(0, 8) };
}
