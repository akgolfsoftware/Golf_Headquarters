/**
 * B10 Multi-spiller sammenligning — presentasjonskomponent.
 * Pixel-port av public/design-handover/agencyos/components-multi-compare.html.
 *
 * Tre seksjoner:
 *   1. Side-om-side — 2-4 spillere, SG-kategorier + pyramide-fordeling + test,
 *      med BEST-badge per metrikk og delta mot Tour-baseline.
 *   2. Kohort-rangering — alle PLAYER på siste SG-total, bar mot null-linjen
 *      (skala ±2,0), valgte spillere lime-merket.
 *   3. Region-fordeling — antall spillere per region/hjemmeklubb.
 *
 * Server-rendert. DS-tokens kun (ingen hex), lucide-ikoner (ingen emoji).
 * Mangler data → tomt/«—», aldri falske tall.
 */

import Link from "next/link";
import { Lightbulb, MapPin, Trophy, UserPlus, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CohortRow,
  CompareAxis,
  CompareMetric,
  ComparePlayer,
  MultiCompareData,
  RegionRow,
} from "@/lib/admin-compare/multi-compare-data";

// ── Akse → token-klasser ────────────────────────────────────────
const axisSwatch: Record<CompareAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
  sg: "bg-foreground",
};

function fmtSigned(v: number | null, decimals: number, unit: string | null): string {
  if (v == null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(decimals).replace(".", ",")}${unit ?? ""}`;
}

function fmtPlain(v: number | null, decimals: number, unit: string | null): string {
  if (v == null) return "—";
  return `${v.toFixed(decimals).replace(".", ",")}${unit ?? ""}`;
}

function fmtHcp(v: number | null): string {
  if (v == null) return "—";
  return v.toFixed(1).replace(".", ",");
}

// ── Seksjons-overskrift (mono-caps + rule) ──────────────────────
function SecHead({ n, title, sub, count }: { n: number; title: string; sub: string; count: string }) {
  return (
    <div className="mb-3.5 mt-8 flex items-center gap-3 font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground first:mt-0">
      <span>
        {n} · {title}
      </span>
      <span className="font-bold tracking-[0.04em] text-muted-foreground">{sub}</span>
      <span className="h-px flex-1 bg-border" />
      <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] font-extrabold tracking-[0.06em] text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

function FootRule({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-border bg-background px-5 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground [&_b]:font-bold [&_b]:text-foreground [&_em]:not-italic [&_em]:font-bold [&_em]:text-primary">
      {children}
    </div>
  );
}

// ── SECTION 1 — SIDE OM SIDE ────────────────────────────────────
function SideBySide({
  players,
  metrics,
  verdict,
}: {
  players: ComparePlayer[];
  metrics: CompareMetric[];
  verdict: string | null;
}) {
  const n = players.length;
  // grid: metrikk-akse 180px, n spiller-kolonner, referanse 96px.
  // Inline-style fordi Tailwind ikke kan kompilere dynamiske arbitrary-klasser.
  const gridCols = `180px repeat(${n}, minmax(0, 1fr)) 96px`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* header */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-[18px]">
        <div>
          <div className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-foreground">
            Talent-<em className="font-normal italic text-primary">kohort</em> · konkurranseprofiler
          </div>
          <div className="mt-1 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
            <b className="font-extrabold text-foreground">{n}</b> spillere i sammenligning
            <span className="mx-1.5 text-border">·</span>
            SG fra siste registrerte periode
            <span className="mx-1.5 text-border">·</span>
            referanse <b className="font-extrabold text-foreground">PGA Tour-baseline</b>
          </div>
        </div>
        <Link
          href="/admin/talent"
          className="inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-secondary"
        >
          <UserPlus className="h-3 w-3" strokeWidth={2} aria-hidden />
          Endre utvalg
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* spiller-kolonner */}
          <div className="grid border-b border-border bg-background" style={{ gridTemplateColumns: gridCols }}>
            <div className="flex items-end border-r border-border px-4 py-[18px] font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              METRIKK
            </div>
            {players.map((p, i) => (
              <div key={p.id} className="flex flex-col gap-2 border-r border-border bg-card px-3.5 py-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
                      i % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                    )}
                  >
                    {p.initials}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <b className="block truncate font-display text-[15px] font-bold tracking-[-0.02em] text-foreground">
                      {p.name}
                    </b>
                    <small className="font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                      {(p.niva ?? "—")} · {(p.klubb ?? "—")}
                    </small>
                  </div>
                  <Link
                    href={`/admin/talent/sammenligning?ids=${players
                      .filter((q) => q.id !== p.id)
                      .map((q) => q.id)
                      .join(",")}`}
                    aria-label={`Fjern ${p.name} fra sammenligning`}
                    className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    <X className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.niva && (
                    <span className="rounded-[3px] bg-background px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-foreground">
                      {p.niva}
                    </span>
                  )}
                  <span className="rounded-[3px] bg-background px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-foreground">
                    HCP {fmtHcp(p.hcp)}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex flex-col items-start gap-1 bg-background px-3.5 py-4">
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                REFERANSE
              </span>
              <span className="font-display text-[15px] font-bold leading-tight tracking-[-0.02em] text-foreground">
                PGA Tour
                <small className="mt-0.5 block font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                  BASELINE 0,0
                </small>
              </span>
            </div>
          </div>

          {/* metrikk-rader */}
          {metrics.map((m) => {
            const present = m.values
              .map((v, i) => ({ v, i }))
              .filter((x): x is { v: number; i: number } => x.v != null);
            const leaderIdx =
              present.length > 0
                ? present.reduce((a, b) => (m.higherIsBetter ? (b.v > a.v ? b : a) : b.v < a.v ? b : a)).i
                : -1;
            // bar-skala: SG ±2,0 → 0..100 %; test (ingen ref) skaleres mot max i raden
            const maxAbs = Math.max(2, ...present.map((x) => Math.abs(x.v)));
            return <MetricRow key={m.key} m={m} leaderIdx={leaderIdx} maxAbs={maxAbs} gridCols={gridCols} n={n} />;
          })}

          {/* verdikt */}
          {verdict && (
            <div className="grid grid-cols-[22px_1fr] items-center gap-3.5 border-t border-border bg-background px-6 py-[18px]">
              <Lightbulb className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} aria-hidden />
              <p className="max-w-[880px] text-[13px] leading-relaxed tracking-[-0.005em] text-foreground">
                {verdict}
              </p>
            </div>
          )}
        </div>
      </div>

      <FootRule>
        <b>Prinsipp.</b> Hver rad er én metrikk, kolonnene er spillerne.{" "}
        <em>BEST</em>-merket peker på lederen per metrikk, søylene viser styrke mot{" "}
        <b>Tour-baseline (0,0)</b>. Verdier vises kun der spilleren har registrert data.
      </FootRule>
    </div>
  );
}

function MetricRow({
  m,
  leaderIdx,
  maxAbs,
  gridCols,
  n,
}: {
  m: CompareMetric;
  leaderIdx: number;
  maxAbs: number;
  gridCols: string;
  n: number;
}) {
  return (
    <div className="grid border-b border-border last:border-b-0" style={{ gridTemplateColumns: gridCols }}>
      <div className="flex flex-col justify-center gap-1 border-r border-border bg-background px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className={cn("h-4 w-1 shrink-0 rounded-sm", axisSwatch[m.axis])} />
          <span className="font-display text-[14px] font-bold leading-tight tracking-[-0.015em] text-foreground">
            {m.label}
          </span>
        </div>
        <span className="ml-3 font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">{m.sub}</span>
      </div>

      {m.values.map((v, i) => {
        const isLeader = i === leaderIdx && n > 1 && v != null;
        const delta = v != null && m.reference != null ? v - m.reference : null;
        const deltaTone =
          delta == null
            ? "flat"
            : Math.abs(delta) < 0.05
              ? "flat"
              : (delta > 0) === m.higherIsBetter
                ? "pos"
                : "neg";
        // søyle: nullpunkt midt (50 %), bredde proporsjonal med |verdi| mot maxAbs
        const widthPct = v != null ? Math.min(50, (Math.abs(v) / maxAbs) * 50) : 0;
        const barTone =
          v == null
            ? "flat"
            : m.reference == null
              ? "ok"
              : (v >= m.reference) === m.higherIsBetter
                ? v - (m.reference ?? 0) >= 0.3 || v - (m.reference ?? 0) <= -0.3
                  ? "over"
                  : "ok"
                : "bad";
        return (
          <div key={i} className="relative flex flex-col justify-center gap-1.5 border-r border-border px-3.5 py-3.5">
            {isLeader && (
              <span className="absolute right-2.5 top-2 rounded-[3px] bg-accent px-1.5 py-0.5 font-mono text-[8px] font-extrabold tracking-[0.10em] text-primary">
                BEST
              </span>
            )}
            <span
              className={cn(
                "font-mono text-[22px] font-extrabold leading-none tracking-[-0.02em] tabular-nums",
                v == null
                  ? "text-muted-foreground"
                  : deltaTone === "pos"
                    ? "text-success"
                    : deltaTone === "neg"
                      ? "text-destructive"
                      : "text-foreground",
              )}
            >
              {m.reference != null ? fmtSigned(v, m.decimals, m.unit) : fmtPlain(v, m.decimals, m.unit)}
            </span>
            <span
              className={cn(
                "font-mono text-[10px] font-extrabold tracking-[0.04em]",
                deltaTone === "pos"
                  ? "text-success"
                  : deltaTone === "neg"
                    ? "text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {delta != null
                ? `${fmtSigned(delta, m.decimals, null)} vs ${m.referenceLabel.toLowerCase()}`
                : v == null
                  ? "ingen data"
                  : "—"}
            </span>
            {v != null && (
              <div className="relative h-[5px] overflow-hidden rounded-sm bg-secondary">
                <div
                  className={cn(
                    "absolute bottom-0 top-0 rounded-sm",
                    barTone === "over"
                      ? "bg-success"
                      : barTone === "ok"
                        ? "bg-primary"
                        : barTone === "bad"
                          ? "bg-destructive"
                          : "bg-muted-foreground",
                  )}
                  style={
                    m.reference != null
                      ? v >= m.reference
                        ? { left: "50%", width: `${widthPct}%` }
                        : { right: "50%", width: `${widthPct}%` }
                      : { left: 0, width: `${Math.min(100, (Math.abs(v) / maxAbs) * 100)}%` }
                  }
                />
                {m.reference != null && <span className="absolute bottom-0 left-1/2 top-0 w-px bg-foreground/60" />}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex flex-col justify-center gap-1 bg-background px-3.5 py-3.5">
        <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {m.referenceLabel}
        </span>
        <b className="font-mono text-[16px] font-extrabold leading-none tracking-[-0.015em] tabular-nums text-foreground">
          {m.reference != null ? fmtSigned(m.reference, m.decimals, m.unit) : "—"}
        </b>
      </div>
    </div>
  );
}

// ── Pyramide-fordeling (under side-om-side) ─────────────────────
function PyramidSplit({ players }: { players: ComparePlayer[] }) {
  const hasAny = players.some((p) => p.pyramideTotal > 0);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <div className="font-display text-[18px] font-bold leading-tight tracking-[-0.02em] text-foreground">
          Pyramide-<em className="font-normal italic text-primary">fordeling</em>
        </div>
        <div className="mt-1 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
          ANDEL ØKTER PER AKSE · ALLE PLANER
        </div>
      </div>
      {hasAny ? (
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {players.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-[14px] font-bold tracking-[-0.015em] text-foreground">{p.name}</span>
                <span className="font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
                  {p.pyramideTotal} økter
                </span>
              </div>
              {p.pyramideTotal === 0 ? (
                <p className="font-mono text-[11px] text-muted-foreground">Ingen planlagte økter.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {p.pyramide.map((row) => {
                    const pct = p.pyramideTotal ? Math.round((row.count / p.pyramideTotal) * 100) : 0;
                    return (
                      <div key={row.axis} className="grid grid-cols-[52px_1fr_44px] items-center gap-2.5">
                        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                          {row.label}
                        </span>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div className={cn("h-full rounded-full", axisSwatch[row.axis])} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-right font-mono text-[11px] font-bold tabular-nums text-foreground">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="px-6 py-8 text-center font-mono text-[12px] text-muted-foreground">
          Ingen treningsplaner registrert for de valgte spillerne.
        </p>
      )}
    </div>
  );
}

// ── SECTION 2 — KOHORT-RANGERING ────────────────────────────────
function Cohort({
  cohort,
  stats,
}: {
  cohort: CohortRow[];
  stats: MultiCompareData["cohortStats"];
}) {
  // skala ±2,0 → bar-bredde; senter = 0
  const SCALE = 2.0;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-[18px]">
        <div>
          <div className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-foreground">
            <em className="font-normal italic text-primary">Hele stallen</em> · SG total
          </div>
          <div className="mt-1 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
            {stats.count} SPILLERE I KOHORT
            <span className="mx-1.5 text-border">·</span>
            SNITT <b className="font-extrabold text-foreground">{fmtSigned(stats.avg, 2, null)}</b>
            <span className="mx-1.5 text-border">·</span>
            SORTERT <b className="font-extrabold text-foreground">HØYEST FØRST</b>
          </div>
        </div>
        <div className="flex shrink-0">
          <div className="px-3.5">
            <span className="block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              BESTE
            </span>
            <span className="font-mono text-[20px] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-success">
              {fmtSigned(stats.best, 2, null)}
            </span>
          </div>
          <div className="border-l border-border px-3.5">
            <span className="block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              SVAKESTE
            </span>
            <span className="font-mono text-[20px] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-destructive">
              {fmtSigned(stats.worst, 2, null)}
            </span>
          </div>
        </div>
      </div>

      {/* skala-legende */}
      <div className="px-6 pt-3.5">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-3.5 border-t-[1.5px] border-foreground" />
            TOUR-BASELINE <b className="font-extrabold text-foreground">0,0</b> · senterlinje
          </span>
          <span className="inline-flex gap-3.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-success" />
              over
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-destructive" />
              under
            </span>
          </span>
        </div>
        <div className="grid grid-cols-[200px_1fr_100px]">
          <div />
          <div className="flex justify-between font-mono text-[9px] font-extrabold tabular-nums tracking-[0.04em] text-muted-foreground">
            <span>−2,0</span>
            <span>−1,0</span>
            <span>0</span>
            <span>+1,0</span>
            <span>+2,0</span>
          </div>
          <div />
        </div>
      </div>

      {cohort.length === 0 ? (
        <p className="px-6 py-10 text-center font-mono text-[12px] text-muted-foreground">
          Ingen spillere i kohorten.
        </p>
      ) : (
        cohort.map((c, i) => <CohortRowItem key={c.userId} c={c} rank={i + 1} scale={SCALE} />)
      )}

      <FootRule>
        <b>Prinsipp.</b> Én metrikk, hele kohorten på én skjerm. Søylene er tegnet mot skalaen{" "}
        <b>−2,0 → +2,0</b> med den svarte <em>senterlinjen som nullpunkt (Tour-baseline)</em> — søylen henger til
        høyre hvis positiv, venstre hvis negativ. Lime-merkede rader er med i side-om-side over. Spillere uten
        registrert SG vises nederst uten søyle.
      </FootRule>
    </div>
  );
}

function CohortRowItem({ c, rank, scale }: { c: CohortRow; rank: number; scale: number }) {
  const v = c.sgTotal;
  const widthPct = v != null ? Math.min(50, (Math.abs(v) / scale) * 50) : 0;
  const tone = v == null ? "flat" : v >= 0 ? "pos" : "neg";
  return (
    <div
      className={cn(
        "grid grid-cols-[200px_1fr_100px] items-center border-b border-border px-6 py-3 last:border-b-0 hover:bg-primary/[0.02]",
        c.selected && "border-l-[3px] border-l-accent bg-accent/10 pl-[21px]",
      )}
    >
      <div className="flex items-center gap-2.5 pr-3.5">
        <span
          className={cn(
            "w-[18px] text-center font-mono text-[11px] font-extrabold tabular-nums tracking-[0.04em]",
            rank === 1 ? "text-primary" : "text-muted-foreground",
          )}
        >
          {rank}
        </span>
        <span
          className={cn(
            "inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold",
            rank % 2 === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
            c.selected && "ring-2 ring-accent",
          )}
        >
          {c.initials}
        </span>
        <div className="min-w-0 leading-tight">
          <b className="block truncate text-[13px] font-bold text-foreground">{c.name}</b>
          <small className="font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {[c.klubb, c.niva, `HCP ${fmtHcp(c.hcp)}`].filter(Boolean).join(" · ")}
          </small>
        </div>
      </div>

      <div className="relative h-[30px] overflow-hidden rounded-lg bg-background">
        <span className="absolute bottom-0 left-1/2 top-0 z-[3] w-px bg-foreground" />
        {v != null && (
          <div
            className={cn(
              "absolute top-1/2 z-[2] flex h-[18px] -translate-y-1/2 items-center rounded px-2",
              tone === "pos" ? "bg-success text-background" : "bg-destructive text-background",
              tone === "neg" && "justify-end",
            )}
            style={tone === "pos" ? { left: "50%", width: `${widthPct}%` } : { right: "50%", width: `${widthPct}%` }}
          >
            <span className="font-mono text-[10px] font-extrabold tabular-nums tracking-[0.02em]">
              {fmtSigned(v, 2, null)}
            </span>
          </div>
        )}
      </div>

      <div className="pl-3.5 text-right font-mono text-[11px] font-bold tabular-nums tracking-[0.02em] text-muted-foreground">
        <b className="text-[13px] font-extrabold text-foreground">{v != null ? fmtSigned(v, 2, null) : "—"}</b>
        <small className="mt-0.5 block text-[9px] uppercase tracking-[0.06em]">
          {v != null ? "SG TOTAL" : "INGEN SG"}
        </small>
      </div>
    </div>
  );
}

// ── SECTION 3 — REGION-FORDELING ────────────────────────────────
function Regions({ regions, total }: { regions: RegionRow[]; total: number }) {
  const max = Math.max(1, ...regions.map((r) => r.count));
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-6 py-[18px]">
        <div className="font-display text-[20px] font-bold leading-tight tracking-[-0.02em] text-foreground">
          Spiller-<em className="font-normal italic text-primary">geografi</em>
        </div>
        <div className="mt-1 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
          VÅR STALL <b className="font-extrabold text-foreground">· {total} spillere</b>
          <span className="mx-1.5 text-border">·</span>
          {regions.length} REGIONER
        </div>
      </div>

      {regions.length === 0 ? (
        <p className="px-6 py-10 text-center font-mono text-[12px] text-muted-foreground">
          Ingen spillere registrert.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5 p-6">
          {regions.map((r) => {
            const pct = total ? Math.round((r.count / total) * 100) : 0;
            return (
              <div
                key={r.region}
                className="grid grid-cols-[160px_1fr_auto] items-center gap-3.5 rounded-lg border border-border bg-background px-4 py-3"
              >
                <div className="flex items-center gap-2 leading-tight">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
                  <span className="truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">{r.region}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(r.count / max) * 100}%` }} />
                </div>
                <div className="text-right font-mono text-[11px] font-bold tabular-nums text-muted-foreground">
                  <b className="text-[14px] font-extrabold text-foreground">{r.count}</b>
                  <span className="ml-1 text-[10px]">· {pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FootRule>
        <b>Prinsipp.</b> Fordelingen viser hvor i landet stallen er — basert på registrert region
        (talent-program) eller hjemmeklubb. Spillere uten region samles under «Uten region».
        Geografi er <em>kontekst</em>, ikke uttaks-grunnlag.
      </FootRule>
    </div>
  );
}

// ── Tom tilstand (ingen utvalg) ─────────────────────────────────
function NoSelection({ cohort }: { cohort: CohortRow[] }) {
  const suggestions = cohort.filter((c) => c.sgTotal != null).slice(0, 4);
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-12 text-center">
      <Users className="mx-auto h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
      <h2 className="mt-4 font-display text-[20px] font-bold tracking-[-0.02em] text-foreground">
        Velg <em className="font-normal italic text-primary">spillere</em> å sammenligne
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Legg til 2–4 spillere i sammenligningen via <code className="font-mono text-[12px]">?ids=…</code> i URL, eller
        velg fra kohort-rangeringen under.
      </p>
      {suggestions.length >= 2 && (
        <Link
          href={`/admin/talent/sammenligning?ids=${suggestions.map((s) => s.userId).join(",")}`}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Trophy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Sammenlign topp {suggestions.length}
        </Link>
      )}
    </div>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function MultiCompare({ data }: { data: MultiCompareData }) {
  const { players, metrics, verdict, cohort, cohortStats, regions, totalPlayers } = data;
  return (
    <div className="mx-auto max-w-[1240px] space-y-1">
      {/* SECTION 1 */}
      <SecHead
        n={1}
        title="Side om side"
        sub="samme parametre · best-badge per metrikk"
        count={`${players.length} SPILLERE`}
      />
      {players.length < 2 ? (
        <NoSelection cohort={cohort} />
      ) : (
        <div className="space-y-4">
          <SideBySide players={players} metrics={metrics} verdict={verdict} />
          <PyramidSplit players={players} />
        </div>
      )}

      {/* SECTION 2 */}
      <SecHead
        n={2}
        title="Kohort-rangering"
        sub="én metrikk · hele stallen · sortert"
        count={`${cohortStats.count} SPILLERE`}
      />
      <Cohort cohort={cohort} stats={cohortStats} />

      {/* SECTION 3 */}
      <SecHead n={3} title="Region-fordeling" sub="geografisk fordeling av stallen" count={`${regions.length} REGIONER`} />
      <Regions regions={regions} total={totalPlayers} />
    </div>
  );
}
