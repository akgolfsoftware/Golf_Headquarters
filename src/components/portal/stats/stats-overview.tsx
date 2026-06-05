/**
 * <StatsOverview> — PlayerHQ Stats-oversikt (default-tab på /portal/stats).
 *
 * Mobile-first (430px). Pixel-port av prompt-spec (SKJERMER-RUNDE-2 §3) med
 * DS-token-stil fra components-stats-sg.html (mono-eyebrow m/pulse, italic
 * display, tabular-nums, variance→success/destructive-mapping).
 *
 * Server component — all data utledes i lib/portal-stats/overview-data.ts.
 * Ingen hardkodet hex, ingen emoji (kun lucide).
 */

import Link from "next/link";
import {
  ArrowRight,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatSg } from "@/lib/sg";
import { cn } from "@/lib/utils";
import type { HcpTrendPunkt, SgFordelingRad, StatsOverview as StatsData } from "@/lib/portal-stats/overview-data";
import { StatsTabs } from "./stats-tabs";

// ── helpers ─────────────────────────────────────────────────────
function nf(v: number, decimals = 1): string {
  return v.toFixed(decimals).replace(".", ",");
}

/** Delta-pill: lavere = bedre for HCP/score (down=grønn), høyere = bedre for SG (up=grønn). */
type DeltaDir = "up" | "down" | "flat";
function deltaDir(value: number | null, lowerIsBetter: boolean): DeltaDir {
  if (value == null || value === 0) return "flat";
  const better = lowerIsBetter ? value < 0 : value > 0;
  return better ? (lowerIsBetter ? "down" : "up") : lowerIsBetter ? "up" : "down";
}

function DeltaPill({
  value,
  lowerIsBetter,
  suffix,
  decimals = 1,
}: {
  value: number | null;
  lowerIsBetter: boolean;
  suffix?: string;
  decimals?: number;
}) {
  if (value == null) {
    return <span className="font-mono text-[11px] tracking-[0.02em] text-muted-foreground">{suffix ?? "—"}</span>;
  }
  const dir = deltaDir(value, lowerIsBetter);
  const better = (lowerIsBetter && value < 0) || (!lowerIsBetter && value > 0);
  const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
  const tone = value === 0 ? "text-muted-foreground" : better ? "text-success" : "text-destructive";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-[11px] font-bold tabular-nums tracking-[0.02em]", tone)}>
      <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
      {sign}
      {nf(Math.abs(value), decimals)}
      {suffix ? <span className="ml-0.5 font-medium text-muted-foreground">{suffix}</span> : null}
    </span>
  );
}

// ── KPI-strip 2x2 ───────────────────────────────────────────────
function KpiCard({
  label,
  value,
  valueTone,
  children,
}: {
  label: string;
  value: React.ReactNode;
  valueTone?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className={cn("font-mono text-[28px] font-bold leading-none tabular-nums tracking-[-0.02em]", valueTone ?? "text-foreground")}>
        {value}
      </span>
      <div className="min-h-[16px]">{children}</div>
    </div>
  );
}

function KpiStrip({ data }: { data: StatsData }) {
  const sgPositiv = data.sg.total != null && data.sg.total >= 0;
  return (
    <div className="grid grid-cols-2 gap-3">
      <KpiCard label="HCP" value={data.hcp != null ? nf(data.hcp) : "—"}>
        {data.hcpDeltaIAar != null ? (
          <DeltaPill value={data.hcpDeltaIAar} lowerIsBetter suffix="i år" />
        ) : (
          <span className="font-mono text-[11px] text-muted-foreground">nåværende</span>
        )}
      </KpiCard>

      <KpiCard
        label="SG Total"
        value={formatSg(data.sg.total).replace("-", "−")}
        valueTone={data.sg.total == null ? "text-muted-foreground" : sgPositiv ? "text-success" : "text-destructive"}
      >
        {data.sgTotalDelta != null ? (
          <DeltaPill value={data.sgTotalDelta} lowerIsBetter={false} suffix="trend" decimals={2} />
        ) : (
          <span className="font-mono text-[11px] text-muted-foreground">siste 90 d</span>
        )}
      </KpiCard>

      <KpiCard label="Runder" value={data.runderSiste90}>
        <span className="font-mono text-[11px] text-muted-foreground">siste 90 dager</span>
      </KpiCard>

      <KpiCard label="Snitt" value={data.snittSiste90 != null ? nf(data.snittSiste90) : "—"}>
        {data.snittDelta != null ? (
          <DeltaPill value={data.snittDelta} lowerIsBetter suffix="vs forrige" />
        ) : (
          <span className="font-mono text-[11px] text-muted-foreground">brutto snitt</span>
        )}
      </KpiCard>
    </div>
  );
}

// ── HCP-trend-kort (server-SVG sparkline m/lime sluttdott) ──────
function HcpTrendCard({ punkter, hcpNa }: { punkter: HcpTrendPunkt[]; hcpNa: number | null }) {
  const W = 320;
  const H = 96;
  const PAD = 8;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const verdier = punkter.map((p) => p.hcp);
  const min = Math.min(...verdier);
  const max = Math.max(...verdier);
  const range = max - min || 1;
  // HCP: lavere = bedre → tegn lavt nederst (invertert mot SG-grafer)
  const coords = punkter.map((p, i) => {
    const x = punkter.length === 1 ? W / 2 : PAD + (i / (punkter.length - 1)) * innerW;
    const y = PAD + ((p.hcp - min) / range) * innerH;
    return { x, y };
  });
  const linje = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const sisteIdx = coords.length - 1;

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          HCP-trend
        </span>
        <span className="font-mono text-2xl font-bold leading-none tabular-nums tracking-[-0.02em] text-primary">
          {hcpNa != null ? nf(hcpNa) : "—"}
        </span>
      </div>

      {punkter.length < 2 ? (
        <p className="py-6 text-center text-[13px] text-muted-foreground">
          Trend vises når du har flere HCP-registreringer over tid.
        </p>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" role="img" aria-label="HCP-utvikling over tid">
            <polyline
              points={linje}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {coords.map((c, i) => {
              const erSiste = i === sisteIdx;
              return (
                <circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r={erSiste ? 5 : 2.5}
                  fill={erSiste ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                  stroke={erSiste ? "hsl(var(--primary))" : "var(--card)"}
                  strokeWidth={erSiste ? 2 : 1}
                />
              );
            })}
          </svg>
          <div className="mt-1 flex justify-between font-mono text-[9px] font-semibold tracking-[0.04em] text-muted-foreground">
            {punkter.map((p, i) => (
              <span key={i}>{p.label}</span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ── SG-fordeling-kort (bars fra senter → Link til /sg) ──────────
const SG_MAX = 2;
function sgPct(v: number): number {
  const klemt = Math.max(-SG_MAX, Math.min(SG_MAX, v));
  return (Math.abs(klemt) / SG_MAX) * 100;
}

function SgFordelingCard({ rader }: { rader: SgFordelingRad[] }) {
  const harData = rader.some((r) => r.verdi != null);
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          SG-fordeling · siste 5
        </span>
        <Link
          href="/portal/analysere"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary hover:underline"
        >
          Detaljer
        </Link>
      </div>

      {!harData ? (
        <p className="py-6 text-center text-[13px] text-muted-foreground">
          Ingen SG-data registrert ennå.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {rader.map((r) => {
            const v = r.verdi;
            const positiv = v != null && v >= 0;
            const dir = v == null || v === 0 ? "flat" : positiv ? "up" : "down";
            const DirIcon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
            const dirTone = v == null ? "text-muted-foreground" : positiv ? "text-success" : "text-destructive";
            return (
              <Link
                key={r.key}
                href="/portal/analysere"
                className="group grid grid-cols-[44px_1fr_auto] items-center gap-3"
                aria-label={`${r.full} — se detaljer`}
              >
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground group-hover:text-foreground">
                  {r.label}
                </span>
                {/* Bar fra senter — negativ venstre (destructive), positiv høyre (primary) */}
                <span className="relative grid h-2.5 grid-cols-[1fr_2px_1fr] overflow-hidden rounded-full">
                  <span className="relative overflow-hidden rounded-l-full bg-destructive/[0.08]">
                    {v != null && !positiv && (
                      <span
                        className="absolute inset-y-0 right-0 rounded-l-full bg-destructive"
                        style={{ width: `${Math.max(sgPct(v), 3)}%` }}
                      />
                    )}
                  </span>
                  <span className="bg-foreground/40" />
                  <span className="relative overflow-hidden rounded-r-full bg-success/[0.08]">
                    {v != null && positiv && (
                      <span
                        className="absolute inset-y-0 left-0 rounded-r-full bg-primary"
                        style={{ width: `${Math.max(sgPct(v), 3)}%` }}
                      />
                    )}
                  </span>
                </span>
                <span className="inline-flex w-[58px] items-center justify-end gap-1 font-mono text-[12px] font-bold tabular-nums">
                  <span className={v == null ? "text-muted-foreground" : positiv ? "text-success" : "text-destructive"}>
                    {formatSg(v).replace("-", "−")}
                  </span>
                  <DirIcon className={cn("h-3 w-3", dirTone)} strokeWidth={2} aria-hidden />
                </span>
              </Link>
            );
          })}
          <div className="mt-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
            <span>← taper</span>
            <span>0</span>
            <span>tjener →</span>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Broadie-kontekst-kort ───────────────────────────────────────
function BroadieCard({ data }: { data: StatsData }) {
  if (data.hcp == null) return null;
  const maxProsent = Math.max(1, ...data.broadieTap.map((t) => t.prosent));
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        Broadie-kontekst
      </span>

      <p className="mt-3 text-[15px] leading-snug tracking-[-0.01em] text-foreground">
        HCP <b className="font-mono font-bold tabular-nums">{nf(data.hcp)}</b>
        {" → SG Total "}
        <em className="font-mono font-bold not-italic tabular-nums text-primary">
          ≈ {data.broadieEstSgTotal != null ? nf(data.broadieEstSgTotal) : "—"}
        </em>
      </p>

      {data.broadieTap.length > 0 ? (
        <div className="mt-4">
          <div className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            Hvor du taper mest
          </div>
          <div className="flex flex-col gap-2.5">
            {data.broadieTap.map((t) => (
              <div key={t.key} className="grid grid-cols-[44px_1fr_38px] items-center gap-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {t.label}
                </span>
                <span className="relative h-2.5 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                    style={{ width: `${(t.prosent / maxProsent) * 100}%` }}
                  />
                </span>
                <span className="text-right font-mono text-[12px] font-bold tabular-nums text-foreground">
                  {t.prosent} %
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-muted-foreground">
          Ingen SG-tap registrert ennå — logg runder med SG-data for å se hvor du taper mest mot scratch.
        </p>
      )}
    </section>
  );
}

// ── Tomstate ────────────────────────────────────────────────────
function TomState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <p className="text-[15px] text-foreground">Statistikk vises når du har logget runder.</p>
      <Link
        href="/portal/gjennomfore"
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-accent transition hover:opacity-90"
      >
        Logg første runde
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function StatsOverview({
  data,
  aar,
  hcpNa,
}: {
  data: StatsData;
  aar: number;
  hcpNa: number | null;
}) {
  // Header-tittel: hvis vi har HCP-delta, vis den editorialt; ellers nøytral.
  const deltaTekst =
    data.hcpDeltaIAar != null
      ? `${data.hcpDeltaIAar > 0 ? "+" : "−"}${nf(Math.abs(data.hcpDeltaIAar))}`
      : null;

  return (
    <div className="mx-auto flex max-w-[480px] flex-col gap-4">
      {/* Header */}
      <header>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.6)]" />
          </span>
          STATS · {aar} · {data.runderSiste90} RUNDE{data.runderSiste90 === 1 ? "" : "R"}
        </span>
        <h1 className="mt-1.5 font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
          {deltaTekst != null ? (
            <>
              HCP <em className="font-normal italic text-primary">{deltaTekst}</em> siden januar.
            </>
          ) : data.hcp != null ? (
            <>
              HCP <em className="font-normal italic text-primary">{nf(data.hcp)}</em> akkurat nå.
            </>
          ) : (
            <>
              Din <em className="font-normal italic text-primary">statistikk</em>.
            </>
          )}
        </h1>
      </header>

      {/* Tab-bar */}
      <StatsTabs />

      {!data.harData ? (
        <TomState />
      ) : (
        <>
          <KpiStrip data={data} />
          <HcpTrendCard punkter={data.hcpTrend} hcpNa={hcpNa} />
          <SgFordelingCard rader={data.sgFordeling} />
          <BroadieCard data={data} />
        </>
      )}
    </div>
  );
}
