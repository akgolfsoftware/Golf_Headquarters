import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — Radar
 * Spider / radar chart for the 4 Strokes Gained axes: OTT / APP / ARG / PUTT.
 * Data polygon in lime with 15% fill; optional baseline polygon dashed grey.
 * Axis labels outside the chart. Size controls the SVG square.
 *
 * Premium data-life: the data polygon grows in from center on mount
 * (respects prefers-reduced-motion) and its vertex dots glow subtly.
 */

const SG_AXES = [
  { key: "ott",  label: "OTT"  },
  { key: "app",  label: "APP"  },
  { key: "arg",  label: "ARG"  },
  { key: "putt", label: "PUTT" },
];

const CSS = `
.ak-radar{display:inline-flex;flex-direction:column;align-items:center;gap:12px;}
.ak-radar__poly{transition:opacity 500ms var(--ease-standard);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-radar-css")) {
  const s = document.createElement("style");
  s.id = "ak-radar-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function usePrefersReducedMotion() {
  const [reduce] = React.useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  return reduce;
}

export function Radar({
  data = {},
  loading = false,
  baseline,
  min = -2,
  max = 3,
  size = 220,
  className = "",
  style,
}) {
  const [grown, setGrown] = React.useState(false);
  const reduceMotion = usePrefersReducedMotion();
  React.useEffect(() => {
    if (reduceMotion) { setGrown(true); return; }
    setGrown(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, JSON.stringify(data)]);

  if (loading) {
    return <Skeleton variant="card" width="100%" height={size} className={className} style={style} />;
  }
  if (!data || Object.keys(data).length === 0) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: size, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 16, boxSizing: "border-box",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)",
          background: "var(--surface)", textAlign: "center", ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen data ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>Radaren vises når det finnes registrerte verdier.</span>
      </div>
    );
  }

  const n = SG_AXES.length;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) - 30;
  const rings = 4;

  const angle = (i) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const valuePct = (v) => Math.max(0, Math.min(1, (v - min) / (max - min)));
  const pt = (i, pct) => {
    const a = angle(i);
    const d = r * pct;
    return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a) };
  };
  const pts = (arr) => arr.map((p) => `${p.x},${p.y}`).join(" ");

  const dataPoints = SG_AXES.map((a, i) => pt(i, valuePct(data[a.key] ?? 0)));
  const grownPoints = SG_AXES.map((_, i) => pt(i, 0)); // collapsed to center
  const basePoints = baseline
    ? SG_AXES.map((a, i) => pt(i, valuePct(baseline[a.key] ?? 0)))
    : null;
  const shownPoints = grown ? dataPoints : grownPoints;
  const [hover, setHover] = React.useState(null);
  const fmtSG = (v) => (v == null ? "—" : (v > 0 ? "+" : "") + v.toFixed(2).replace(".", ","));

  return (
    <div className={`ak-radar ${className}`} style={{ position: "relative", ...style }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Strokes Gained radar"
        role="img"
      >
        {Array.from({ length: rings + 1 }, (_, ri) => (
          <polygon
            key={ri}
            points={pts(SG_AXES.map((_, i) => pt(i, ri / rings)))}
            fill="none"
            stroke={ri === 0 ? "transparent" : "var(--chart-grid)"}
            strokeWidth={1}
          />
        ))}

        {SG_AXES.map((_, i) => {
          const outer = pt(i, 1);
          return (
            <line
              key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y}
              stroke="var(--chart-grid)" strokeWidth={1}
            />
          );
        })}

        {basePoints && (
          <polygon
            points={pts(basePoints)}
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )}

        <polygon
          className="ak-radar__poly"
          points={pts(shownPoints)}
          fill="var(--signal)"
          fillOpacity={0.15}
          stroke="var(--signal)"
          strokeWidth={2}
          style={{ transition: "all 650ms var(--ease-standard)" }}
        />

        {shownPoints.map((p, i) => (
          <circle
            key={i} cx={p.x} cy={p.y} r={hover === i ? 6 : 4}
            fill="var(--signal)" stroke="var(--bg)" strokeWidth={1.5}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((h) => (h === i ? null : h))}
            style={{
              transition: `cx 650ms var(--ease-standard), cy 650ms var(--ease-standard),
                opacity 300ms var(--ease-standard) ${grown ? "550ms" : "0ms"}, r 120ms var(--ease-standard)`,
              opacity: grown ? 1 : 0,
              animation: grown && hover !== i ? "ak-glow-pulse 2.8s var(--ease-standard) infinite" : "none",
              color: "var(--signal)", cursor: "pointer",
            }}
          />
        ))}

        {SG_AXES.map((a, i) => {
          const outer = pt(i, 1.22);
          return (
            <text
              key={i}
              x={outer.x} y={outer.y}
              textAnchor="middle" dominantBaseline="middle"
              fill="var(--text-muted)" fontSize={10}
              fontFamily="var(--font-mono)" fontWeight={600}
              letterSpacing="0.08em"
            >
              {a.label}
            </text>
          );
        })}
      </svg>

      {hover != null && (
        <DataPreview
          visible
          x={dataPoints[hover].x}
          y={dataPoints[hover].y}
          placement="top"
          label={SG_AXES[hover].label}
          value={fmtSG(data[SG_AXES[hover].key])}
          unit="SG"
          delta={baseline ? Number(((data[SG_AXES[hover].key] ?? 0) - (baseline[SG_AXES[hover].key] ?? 0)).toFixed(2)) : undefined}
        />
      )}
    </div>
  );
}
