/**
 * TrackMan · Stabilitet-seksjon — per-slag standardavvik per kølle per parameter.
 *
 * Paper-portert 2026-08-11: seksjonen lå igjen i Tailwind/shadcn med hardkodede
 * hex-farger midt på en fasit-tro flate. Nå bruker den kun Paper-tokens (T.*):
 * variansskalaen er bygget med color-mix over --v2-up/--v2-warn/--v2-down, så
 * den følger lys/mørk modus. Funksjonen er uendret (utenfor fasiten, beholdt
 * per Enkelhet-prinsippet). Server component — statistikk beregnes server-side.
 */

import { CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { TL } from "@/lib/v2/train-lock";

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

// ── Variansskala (semantiske tokens — følger lys/mørk) ───────────────────────
// Bakgrunn er en svak tint av opp/varsel/ned-fargen; teksten bruker selve
// tokenen, som holder kontrast i begge temaer.

const VFARGER: Record<1 | 2 | 3 | 4 | 5, { bg: string; text: string }> = {
  1: { bg: `color-mix(in srgb, ${TL.ok} 22%, transparent)`, text: TL.ok },
  2: { bg: `color-mix(in srgb, ${TL.ok} 11%, transparent)`, text: TL.ok },
  3: { bg: `color-mix(in srgb, ${TL.warn} 14%, transparent)`, text: TL.warn },
  4: { bg: `color-mix(in srgb, ${TL.danger} 12%, transparent)`, text: TL.danger },
  5: { bg: `color-mix(in srgb, ${TL.danger} 24%, transparent)`, text: TL.danger },
};

const BIAS_FARGE = {
  steady: { bg: `color-mix(in srgb, ${TL.ok} 12%, transparent)`, border: `color-mix(in srgb, ${TL.ok} 50%, transparent)`, text: TL.ok, label: "Stødig" },
  bias:   { bg: `color-mix(in srgb, ${TL.warn} 14%, transparent)`, border: `color-mix(in srgb, ${TL.warn} 65%, transparent)`, text: TL.warn, label: "Bias" },
  spread: { bg: `color-mix(in srgb, ${TL.danger} 14%, transparent)`, border: `color-mix(in srgb, ${TL.danger} 60%, transparent)`, text: TL.danger, label: "Spredning" },
  both:   { bg: `color-mix(in srgb, ${TL.danger} 22%, transparent)`, border: `color-mix(in srgb, ${TL.danger} 80%, transparent)`, text: TL.danger, label: "Bias + spredning" },
};

const capsStil: React.CSSProperties = {
  fontFamily: TL.font.mono,
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: TL.mute,
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
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }} aria-hidden>
      {/* Crosshair */}
      <line x1={cx} y1={5} x2={cx} y2={H - 5} stroke={TL.hair} strokeWidth="1" />
      <line x1={5} y1={cy} x2={W - 5} y2={cy} stroke={TL.hair} strokeWidth="1" />
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
        fill={TL.text}
        stroke={TL.elev}
        strokeWidth="1.5"
      />
      {/* Target dot */}
      <circle cx={cx} cy={cy} r={2} fill={TL.mute} opacity="0.5" />
    </svg>
  );
}

// ── Heatmap-celle ─────────────────────────────────────────────────────────────

function HeatmapCelle({ stats, paramKey }: { stats: ParamStats; paramKey: ParamKey }) {
  if (stats.level === null || stats.stddev === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: TL.elev, padding: 8, fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>
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
      style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 8, fontFamily: TL.font.mono, fontSize: 11, fontWeight: 600, background: farge.bg, color: farge.text }}
      title={`${val}${enhet}`}
    >
      {val}
      {enhet && <span style={{ marginLeft: 2, fontSize: 9, opacity: 0.7 }}>{enhet}</span>}
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
  const farge = type === "best" ? TL.ok : type === "worst" ? TL.danger : TL.warn;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4, padding: 16, borderRight: `1px solid ${TL.hair}` }}>
      <span style={{ ...capsStil, fontSize: 9.5, letterSpacing: "0.12em" }}>{label}</span>
      <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 20, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.01em", color: TL.text }}>
          {klubb}
        </span>
        <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: farge }}>
          {score}
        </span>
      </div>
      <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute }}>{detail}</span>
      <span
        style={{ position: "absolute", right: 16, top: 16, display: "inline-flex", height: 28, width: 28, alignItems: "center", justifyContent: "center", borderRadius: 8, background: `color-mix(in srgb, ${farge} 14%, transparent)`, color: farge }}
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
      style={{ overflow: "hidden", borderRadius: TL.radius.card, border: `1px solid ${TL.hair}`, background: TL.elev }}
    >
      {/* Header */}
      <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, borderBottom: `1px solid ${TL.hair}`, padding: "16px 20px 14px" }}>
        <div>
          <span style={{ ...capsStil, fontSize: 10, letterSpacing: "0.12em", display: "inline-flex", alignItems: "center", gap: 8 }}>
            TrackMan · Stabilitet
          </span>
          <h2 style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 19, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.015em", color: TL.text }}>
            Konsistens-analyse{" "}
            <em style={{ fontWeight: 400, fontStyle: "italic", color: TL.mute }}>
              · {klubber.length} køller
            </em>
          </h2>
        </div>
        <span style={{ ...capsStil, fontSize: 10, letterSpacing: "0.1em", flexShrink: 0, borderRadius: 6, background: TL.dock, padding: "4px 10px" }}>
          {klubber.reduce((a, k) => a + k.antallSlag, 0)} slag
        </span>
      </header>

      {/* Top callouts */}
      <div
        style={{ display: "grid", borderBottom: `1px solid ${TL.hair}`, gridTemplateColumns: mestStødig && trengerJobbing && trengerJobbing.navn !== mestStødig.navn ? "1fr 1fr" : "1fr" }}
      >
        {mestStødig && (
          <Callout
            label="Mest stødig"
            klubb={mestStødig.navn}
            score={`${mestStødig.stabilitetScore.toFixed(1)} / 10`}
            detail={`Carry ±${mestStødig.params.carry.stddev?.toFixed(1) ?? "—"} m`}
            type="best"
            icon={<CheckCircle2 style={{ height: 14, width: 14 }} />}
          />
        )}
        {trengerJobbing && trengerJobbing.navn !== mestStødig?.navn && (
          <Callout
            label="Trenger jobbing"
            klubb={trengerJobbing.navn}
            score={`${trengerJobbing.stabilitetScore.toFixed(1)} / 10`}
            detail={worstParam(trengerJobbing)}
            type="worst"
            icon={<AlertTriangle style={{ height: 14, width: 14 }} />}
          />
        )}
      </div>

      {/* Heatmap */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 700, letterSpacing: "-0.015em", color: TL.text }}>
            Varians-heatmap · køller × parametere
          </h3>
          <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute }}>
            Lavere = mer stødig
          </span>
        </div>

        {/* Fargeskala-legend */}
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12, ...capsStil }}>
          <span>Stødig</span>
          <div style={{ display: "flex", height: 10, width: 144, overflow: "hidden", borderRadius: 999, border: `1px solid ${TL.hair}` }}>
            {([1, 2, 3, 4, 5] as const).map((v) => (
              <span key={v} style={{ flex: 1, background: VFARGER[v].bg }} />
            ))}
          </div>
          <span>Inkonsistent</span>
        </div>

        {/* Grid: klubbe-col + 6 param-cols + stab-col */}
        <div
          style={{
            marginBottom: 20,
            overflow: "hidden",
            borderRadius: 8,
            border: `1px solid ${TL.hair}`,
            display: "grid",
            gridTemplateColumns: "80px repeat(6, 1fr) 68px",
            gap: "1px",
            background: TL.hair,
          }}
        >
          {/* Header-rad */}
          <div style={{ display: "flex", alignItems: "center", background: TL.scene, padding: "8px", ...capsStil }}>
            Kølle
          </div>
          {PARAMS.map((p) => (
            <div
              key={p}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", background: TL.scene, padding: "8px 4px", textAlign: "center", ...capsStil, letterSpacing: "0.06em" }}
            >
              {PARAM_LABEL[p]}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", background: TL.scene, padding: "8px", ...capsStil }}>
            Stab
          </div>

          {/* Kølle-rader */}
          {klubber.map((k) => (
            <>
              {/* Navn */}
              <div
                key={`${k.navn}-navn`}
                style={{ display: "flex", alignItems: "center", background: TL.scene, padding: "10px 8px", fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, color: TL.text }}
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
                style={{
                  display: "flex", alignItems: "center", justifyContent: "flex-end",
                  background: TL.elev, padding: "10px 8px",
                  fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                  color: k.stabilitetScore >= 8 ? TL.ok : k.stabilitetScore < 5 ? TL.danger : TL.text,
                }}
              >
                {k.stabilitetScore.toFixed(1)}
                <small style={{ marginLeft: 2, fontSize: 9, fontWeight: 600, color: TL.mute }}>
                  /10
                </small>
              </div>
            </>
          ))}
        </div>
      </div>

      {/* Bias vs spredning */}
      <div style={{ borderTop: `1px solid ${TL.hair}`, padding: "16px 20px 20px" }}>
        <div style={{ marginBottom: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 700, letterSpacing: "-0.015em", color: TL.text }}>
              Bias vs. tilfeldig spredning
            </h3>
            <p style={{ margin: "2px 0 0", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute }}>
              Bias = misser samme vei · Spredning = tilfeldig
            </p>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", flexShrink: 0, flexWrap: "wrap", columnGap: 12, rowGap: 4, ...capsStil }}>
            {(["steady", "bias", "spread", "both"] as const).map((t) => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    display: "inline-block", height: 10, width: 16, borderRadius: 3,
                    border: `1px solid ${BIAS_FARGE[t].border}`,
                    background: BIAS_FARGE[t].bg,
                  }}
                />
                {BIAS_FARGE[t].label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 8 }}>
          {klubber.slice(0, 14).map((k) => {
            const c = BIAS_FARGE[k.biasType];
            return (
              <div
                key={k.navn}
                style={{ display: "flex", flexDirection: "column", gap: 6, borderRadius: 8, border: `1px solid ${TL.hair}`, background: TL.scene, padding: 8 }}
              >
                <BiasMinikart
                  meanSide={k.meanSide}
                  stddevSide={k.stddevSide}
                  type={k.biasType}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: TL.text }}>
                    {k.navn}
                  </span>
                  <span
                    style={{ ...capsStil, fontSize: 8.5, borderRadius: 4, padding: "2px 4px", background: c.bg, color: c.text, alignSelf: "flex-start" }}
                  >
                    {c.label}
                  </span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 9, lineHeight: 1.3, color: TL.mute }}>
                    Snitt{" "}
                    <strong style={{ color: TL.text }}>
                      {k.meanSide >= 0 ? "+" : ""}
                      {k.meanSide.toFixed(1)} m
                    </strong>{" "}
                    · spred{" "}
                    <strong style={{ color: TL.text }}>±{k.stddevSide.toFixed(1)}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagnosepanel */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "flex-start", gap: 10, borderRadius: TL.radius.card, border: `1px solid ${TL.hair}`, background: TL.scene, padding: "12px 16px" }}>
          <TrendingUp style={{ marginTop: 2, height: 16, width: 16, flexShrink: 0, color: TL.warn }} />
          <p style={{ margin: 0, fontFamily: TL.font.mono, fontSize: 11, lineHeight: 1.6, color: TL.mute }}>
            <strong style={{ fontWeight: 700, color: TL.text }}>Diagnose-prinsipp:</strong>{" "}
            Bias = tren på sikte. Spredning = tren på teknikk. Begge = prioriter teknikk
            først — ellers gjør sikte-justering ingen forskjell.
          </p>
        </div>
      </div>
    </section>
  );
}
