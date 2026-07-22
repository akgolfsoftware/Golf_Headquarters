/**
 * TrackMan · Stabilitet-seksjon — port av components-trackman-stability.html.
 *
 * Viser per-slag standardavvik per kølle per parameter i et farge-kodet heatmap.
 * Variance-farger er mode-invariante (rå hex) per designsystem-regelen for datafarger.
 * Server component — all statistikk beregnes server-side fra rawJson.shots.
 */

import { CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import {
  beregnStabilitet,
  type StabilitetData,
  type StabilitetDbShot,
  type ParamKey,
  type ParamStats,
  type ClubStabStats,
} from "@/lib/trackman/stabilitet";

export { beregnStabilitet, type StabilitetData, type StabilitetDbShot };

// ── Labels for UI ────────────────────────────────────────────────────────────

const PARAM_LABEL: Record<string, string> = {
  carry:       "Carry",
  side:        "Side",
  ballSpeed:   "Ball spd",
  launchAngle: "Launch",
  spinRate:    "Spin",
  smash:       "Smash",
};

const PARAM_UNIT: Record<string, string> = {
  carry:       "m",
  side:        "m",
  ballSpeed:   "m/s",
  launchAngle: "°",
  spinRate:    "rpm",
  smash:       "",
};

const PARAMS = ["carry", "side", "ballSpeed", "launchAngle", "spinRate", "smash"] as const;

// ── Variance-farger (mode-invariante, aldri semantiske tokens) ───────────────

const VFARGER: Record<1 | 2 | 3 | 4 | 5, { bg: string; text: string }> = {
  1: { bg: "#1A7D56", text: "#FAFAF7" },
  2: { bg: "#4CA880", text: "#FAFAF7" },
  3: { bg: "#C9A50D", text: "#0A1F17" },
  4: { bg: "#C45C2E", text: "#FAFAF7" },
  5: { bg: "#A32D2D", text: "#FAFAF7" },
};

const BIAS_FARGE = {
  steady: { bg: "rgba(26,125,86,0.12)", border: "rgba(26,125,86,0.5)", text: "var(--success)", label: "Stødig" },
  bias:   { bg: "rgba(184,133,42,0.14)", border: "rgba(184,133,42,0.7)", text: "var(--warning)", label: "Bias" },
  spread: { bg: "rgba(184,66,51,0.14)", border: "rgba(184,66,51,0.65)", text: "var(--destructive)", label: "Spredning" },
  both:   { bg: "rgba(163,45,45,0.20)", border: "rgba(163,45,45,0.8)", text: "var(--destructive)", label: "Bias + spredning" },
};

// ── Bias-mini SVG ────────────────────────────────────────────────────────────

function BiasMinikart({ meanSide, stddevSide, type }: {
  meanSide: number;
  stddevSide: number;
  type: "steady" | "bias" | "spread" | "both";
}) {
  const W = 70; const H = 44;
  const cx = W / 2; const cy = H / 2;

  // Normaliser bias og spredning til pixler (maks ~10 px fra senter)
  const SIDE_SCALE = 10 / 10; // 10 m → 10 px
  const SPREAD_SCALE = 10 / 10;

  const biasX = Math.max(-cx + 8, Math.min(cx - 8, meanSide * SIDE_SCALE));
  const ellipseW = Math.max(6, Math.min(30, stddevSide * SPREAD_SCALE * 2));
  const ellipseH = Math.max(5, ellipseW * 0.75);

  const c = BIAS_FARGE[type];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden>
      {/* Crosshair */}
      <line x1={cx} y1={5} x2={cx} y2={H - 5} stroke="rgba(10,31,23,0.10)" strokeWidth="1" />
      <line x1={5} y1={cy} x2={W - 5} y2={cy} stroke="rgba(10,31,23,0.10)" strokeWidth="1" />
      {/* Spread ellipse */}
      <ellipse
        cx={cx + biasX}
        cy={cy}
        rx={ellipseW}
        ry={ellipseH}
        fill={c.bg}
        stroke={c.border}
        strokeWidth="1.5"
      />
      {/* Mean dot */}
      <circle
        cx={cx + biasX}
        cy={cy}
        r={3.5}
        fill="var(--foreground)"
        stroke="var(--card)"
        strokeWidth="1.5"
      />
      {/* Target dot */}
      <circle cx={cx} cy={cy} r={2} fill="var(--muted-foreground)" opacity="0.5" />
    </svg>
  );
}

// ── Heatmap-celle ─────────────────────────────────────────────────────────────

function HeatmapCelle({ stats, paramKey }: { stats: ParamStats; paramKey: ParamKey }) {
  if (stats.level === null || stats.stddev === null) {
    return (
      <div className="flex items-center justify-center bg-card p-2 font-mono text-[11px] text-muted-foreground">
        —
      </div>
    );
  }
  const farge = VFARGER[stats.level];
  const enhet = PARAM_UNIT[paramKey];

  // Formater stddev uten for mange desimaler
  let val: string;
  if (paramKey === "spinRate") {
    val = `±${Math.round(stats.stddev)}`;
  } else if (paramKey === "smash") {
    val = `±${stats.stddev.toFixed(2)}`;
  } else {
    val = `±${stats.stddev.toFixed(1)}`;
  }

  return (
    <div
      className="flex items-center justify-center p-2 font-mono text-[11px] font-semibold"
      style={{ background: farge.bg, color: farge.text }}
      title={`${val}${enhet}`}
    >
      {val}
      {enhet && <span className="ml-0.5 text-[9px] opacity-70">{enhet}</span>}
    </div>
  );
}

// ── Topptekst-callout ─────────────────────────────────────────────────────────

function Callout({
  label,
  klubb,
  score,
  detail,
  type,
  icon,
}: {
  label: string;
  klubb: string;
  score: string;
  detail: string;
  type: "best" | "worst" | "prog";
  icon: React.ReactNode;
}) {
  const style = {
    best: { icon: "bg-[rgba(26,125,86,0.14)] text-[var(--success)]" },
    worst: { icon: "bg-[rgba(163,45,45,0.14)] text-[var(--destructive)]" },
    prog: { icon: "bg-[rgba(184,133,42,0.14)] text-[var(--warning)]" },
  }[type];

  return (
    <div className="relative flex flex-col gap-1 border-r border-border p-4 last:border-r-0">
      <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-1 flex items-baseline gap-2.5">
        <span className="font-display text-[20px] font-bold leading-none tracking-tight text-foreground">
          {klubb}
        </span>
        <span
          className="font-mono text-[13px] font-bold tabular-nums"
          style={{
            color:
              type === "best"
                ? "var(--success)"
                : type === "worst"
                  ? "var(--destructive)"
                  : "var(--warning)",
          }}
        >
          {score}
        </span>
      </div>
      <span className="font-mono text-[10.5px] text-muted-foreground">{detail}</span>
      <span
        className={`absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-lg ${style.icon}`}
      >
        {icon}
      </span>
    </div>
  );
}

// ── Hovudkomponent ────────────────────────────────────────────────────────────

export function StabilitetSeksjon({ data }: { data: StabilitetData }) {
  const { klubber, mestStødig, trengerJobbing } = data;

  if (klubber.length === 0) return null;

  // Finn worst-parameter for trengerJobbing
  function worstParam(k: ClubStabStats): string {
    const worst = PARAMS.filter((p) => k.params[p].level !== null)
      .sort((a, b) => (k.params[b].level ?? 0) - (k.params[a].level ?? 0))[0];
    if (!worst) return "Mangler data";
    const sd = k.params[worst].stddev;
    const unit = PARAM_UNIT[worst];
    if (sd === null) return PARAM_LABEL[worst];
    return `${PARAM_LABEL[worst]} ±${worst === "spinRate" ? Math.round(sd) : sd.toFixed(worst === "smash" ? 2 : 1)}${unit}`;
  }

  return (
    <section
      aria-label="TrackMan stabilitet-analyse"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      {/* Header */}
      <header className="flex items-end justify-between gap-4 border-b border-border px-5 pb-3.5 pt-4">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="relative h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_color-mix(in srgb, var(--v2-lime) 60%, transparent)]" />
            TrackMan · Stabilitet
          </span>
          <h2 className="mt-1 font-display text-[19px] font-bold leading-[1.1] tracking-[-0.015em] text-foreground">
            Konsistens-analyse{" "}
            <em className="font-normal italic text-muted-foreground">
              · {klubber.length} køller
            </em>
          </h2>
        </div>
        <span className="shrink-0 rounded-md bg-secondary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {klubber.reduce((a, k) => a + k.antallSlag, 0)} slag
        </span>
      </header>

      {/* Top callouts */}
      <div
        className={`grid border-b border-border ${
          mestStødig && trengerJobbing ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {mestStødig && (
          <Callout
            label="Mest stødig"
            klubb={mestStødig.navn}
            score={`${mestStødig.stabilitetScore.toFixed(1)} / 10`}
            detail={`Carry ±${mestStødig.params.carry.stddev?.toFixed(1) ?? "—"} m`}
            type="best"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          />
        )}
        {trengerJobbing && trengerJobbing.navn !== mestStødig?.navn && (
          <Callout
            label="Trenger jobbing"
            klubb={trengerJobbing.navn}
            score={`${trengerJobbing.stabilitetScore.toFixed(1)} / 10`}
            detail={worstParam(trengerJobbing)}
            type="worst"
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
          />
        )}
      </div>

      {/* Heatmap */}
      <div className="px-5 pb-0 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[14px] font-bold tracking-[-0.015em] text-foreground">
            Varians-heatmap · køller × parametere
          </h3>
          <span className="font-mono text-[10.5px] text-muted-foreground">
            Lavere = mer stødig
          </span>
        </div>

        {/* Fargeskala-legend */}
        <div className="mb-3 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
          <span>Stødig</span>
          <div className="flex h-2.5 w-36 overflow-hidden rounded-full border border-border">
            {([1, 2, 3, 4, 5] as const).map((v) => (
              <span key={v} className="flex-1" style={{ background: VFARGER[v].bg }} />
            ))}
          </div>
          <span>Inkonsistent</span>
        </div>

        {/* Grid: klubbe-col + 6 param-cols + stab-col */}
        <div
          className="mb-5 overflow-hidden rounded-lg border border-border"
          style={{
            display: "grid",
            gridTemplateColumns: "80px repeat(6, 1fr) 68px",
            gap: "1px",
            background: "var(--border)",
          }}
        >
          {/* Header-rad */}
          <div className="flex items-center bg-background px-2 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Kølle
          </div>
          {PARAMS.map((p) => (
            <div
              key={p}
              className="flex items-center justify-center bg-background px-1 py-2 text-center font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground"
            >
              {PARAM_LABEL[p]}
            </div>
          ))}
          <div className="flex items-center justify-end bg-background px-2 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Stab
          </div>

          {/* Kølle-rader */}
          {klubber.map((k) => (
            <>
              {/* Navn */}
              <div
                key={`${k.navn}-navn`}
                className="flex items-center bg-background px-2 py-2.5 font-mono text-[11px] font-bold text-foreground"
              >
                {k.navn}
              </div>
              {/* Parametre */}
              {PARAMS.map((p) => (
                <HeatmapCelle key={`${k.navn}-${p}`} stats={k.params[p]} paramKey={p} />
              ))}
              {/* Stabilitet-score */}
              <div
                key={`${k.navn}-stab`}
                className="flex items-center justify-end bg-card px-2 py-2.5 font-mono text-[13px] font-bold tabular-nums text-foreground"
                style={{
                  color:
                    k.stabilitetScore >= 8
                      ? "var(--success)"
                      : k.stabilitetScore < 5
                        ? "var(--destructive)"
                        : undefined,
                }}
              >
                {k.stabilitetScore.toFixed(1)}
                <small className="ml-0.5 text-[9px] font-semibold text-muted-foreground">
                  /10
                </small>
              </div>
            </>
          ))}
        </div>
      </div>

      {/* Bias vs spredning */}
      <div className="border-t border-border px-5 pb-5 pt-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[14px] font-bold tracking-[-0.015em] text-foreground">
              Bias vs. tilfeldig spredning
            </h3>
            <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
              Bias = misser samme vei · Spredning = tilfeldig
            </p>
          </div>
          {/* Legend */}
          <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
            {(["steady", "bias", "spread", "both"] as const).map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-4 rounded-sm border"
                  style={{
                    background: BIAS_FARGE[t].bg,
                    borderColor: BIAS_FARGE[t].border,
                  }}
                />
                {BIAS_FARGE[t].label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
          {klubber.slice(0, 14).map((k) => {
            const c = BIAS_FARGE[k.biasType];
            return (
              <div
                key={k.navn}
                className="flex flex-col gap-1.5 rounded-lg border border-border bg-background p-2"
              >
                <BiasMinikart
                  meanSide={k.meanSide}
                  stddevSide={k.stddevSide}
                  type={k.biasType}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[11px] font-bold tracking-[0.04em] text-foreground">
                    {k.navn}
                  </span>
                  <span
                    className="rounded px-1 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.08em]"
                    style={{ background: c.bg, color: c.text, alignSelf: "flex-start" }}
                  >
                    {c.label}
                  </span>
                  <span className="font-mono text-[9px] leading-tight text-muted-foreground">
                    Snitt{" "}
                    <strong className="text-foreground">
                      {k.meanSide >= 0 ? "+" : ""}
                      {k.meanSide.toFixed(1)} m
                    </strong>{" "}
                    · spred{" "}
                    <strong className="text-foreground">±{k.stddevSide.toFixed(1)}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagnosepanel */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-background px-4 py-3">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
            <strong className="font-bold text-foreground">Diagnose-prinsipp:</strong>{" "}
            Bias = tren på sikte. Spredning = tren på teknikk. Begge = prioriter teknikk
            først — ellers gjør sikte-justering ingen forskjell.
          </p>
        </div>
      </div>
    </section>
  );
}
