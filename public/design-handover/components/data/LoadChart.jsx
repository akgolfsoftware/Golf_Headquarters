import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — LoadChart
 * ACWR-style load chart: a glowing lime area line over horizontal risk bands
 * (trygg / følg / over). This is the system's signature data-life moment —
 * match the reference benchmark: soft lime glow on the line + endpoint, a
 * gliding scrubber with tooltip. Bands are labelled inline, never a legend.
 *
 * Premium data-life: area + line draw in on mount (respects
 * prefers-reduced-motion); pointer drives a scrubber with a soft glow on the
 * touched point; endpoint pulses gently.
 */

const CSS = `
.ak-loadchart{display:flex;flex-direction:column;gap:10px;width:100%;}
.ak-loadchart__plot{position:relative;width:100%;}
.ak-loadchart__svg{width:100%;overflow:visible;display:block;cursor:crosshair;}
.ak-loadchart__tip{
  position:absolute;top:0;pointer-events:none;
  background:var(--surface-2);border:1px solid var(--border-strong);
  border-radius:8px;padding:7px 10px;box-shadow:var(--sheen-top-lg);
  font-family:var(--font-mono);font-size:10px;color:var(--text);
  transform:translate(-50%,-100%);white-space:nowrap;
  transition:left 90ms linear,opacity var(--dur-fast) var(--ease-standard);
  z-index:2;
}
.ak-loadchart__tip-val{font-weight:700;font-variant-numeric:tabular-nums;color:var(--signal);}
@media (prefers-reduced-motion: reduce){ .ak-loadchart__tip{transition:none;} }
`;

if (typeof document !== "undefined" && !document.getElementById("ak-loadchart-css")) {
  const s = document.createElement("style");
  s.id = "ak-loadchart-css";
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

const GID = "ak-loadchart-glow-" + Math.random().toString(36).slice(2, 9);
const FID = "ak-loadchart-fill-" + Math.random().toString(36).slice(2, 9);

export function LoadChart({
  series = [],
  loading = false,
  zones = [],
  min,
  max,
  height = 180,
  fmt = (v) => v.toFixed(2),
  className = "",
  style,
}) {
  const [drawn, setDrawn] = React.useState(false);
  const [scrub, setScrub] = React.useState(null);
  const svgRef = React.useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) { setDrawn(true); return; }
    setDrawn(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, series.length]);

  if (loading) {
    return <Skeleton variant="card" width="100%" height={height} className={className} style={style} />;
  }
  if (!series || series.length === 0) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: height, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 16, boxSizing: "border-box",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)",
          background: "var(--surface)", textAlign: "center", ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen belastningsdata ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>ACWR-kurven vises når økter er registrert.</span>
      </div>
    );
  }

  const vals = series.map((s) => s.value);
  const zoneVals = zones.flatMap((z) => [z.from, z.to]);
  const minV = min != null ? min : Math.min(...vals, ...zoneVals);
  const maxV = max != null ? max : Math.max(...vals, ...zoneVals);

  const W = 560;
  const H = height;
  const P = { top: 10, right: 12, bottom: 8, left: 8 };
  const cW = W - P.left - P.right;
  const cH = H - P.top - P.bottom;

  const yp = (v) => cH - ((v - minV) / (maxV - minV)) * cH;
  const xp = (i) => (series.length < 2 ? cW / 2 : (i / (series.length - 1)) * cW);

  const linePts = series.map((s, i) => `${xp(i)},${yp(s.value)}`).join(" ");
  const areaPts = `0,${cH} ${linePts} ${cW},${cH}`;

  const activeIdx = scrub;
  const lastIdx = series.length - 1;

  const handlePointer = (e) => {
    if (series.length < 2 || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W - P.left;
    let nearest = 0, best = Infinity;
    series.forEach((_, i) => {
      const d = Math.abs(xp(i) - relX);
      if (d < best) { best = d; nearest = i; }
    });
    setScrub(nearest);
  };

  const shownIdx = activeIdx != null ? activeIdx : lastIdx;
  const tipLeftPct = ((P.left + xp(shownIdx)) / W) * 100;

  return (
    <div className={`ak-loadchart ${className}`} style={style}>
      <div className="ak-loadchart__plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="ak-loadchart__svg"
          style={{ height }}
          role="img"
          aria-label="Belastningsgraf"
          onMouseMove={handlePointer}
          onMouseLeave={() => setScrub(null)}
        >
          <defs>
            <linearGradient id={FID} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
            </linearGradient>
            <filter id={GID} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(${P.left},${P.top})`}>
            {zones.map((z, i) => {
              const y0 = yp(z.to);
              const y1 = yp(z.from);
              return (
                <g key={i}>
                  <rect x={0} y={y0} width={cW} height={Math.max(0, y1 - y0)} fill={z.color} opacity={0.08} />
                  {z.label && (
                    <text x={cW - 4} y={y0 + 11} fill={z.color} fontSize={9} fontFamily="var(--font-mono)"
                      fontWeight={600} textAnchor="end" opacity={0.85}>
                      {z.label}
                    </text>
                  )}
                </g>
              );
            })}

            {activeIdx != null && (
              <line x1={xp(activeIdx)} y1={0} x2={xp(activeIdx)} y2={cH}
                stroke="var(--border-strong)" strokeWidth={1}
                style={{ transition: "x1 90ms linear,x2 90ms linear" }} />
            )}

            <polygon
              points={areaPts}
              fill={`url(#${FID})`}
              opacity={drawn ? 1 : 0}
              style={{ transition: "opacity 900ms var(--ease-standard) 200ms" }}
            />
            <polyline
              points={linePts}
              fill="none"
              stroke="var(--signal)"
              strokeWidth={2.25}
              strokeLinejoin="round"
              strokeLinecap="round"
              filter={`url(#${GID})`}
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={drawn ? 0 : 100}
              style={{ transition: "stroke-dashoffset 1100ms var(--ease-standard)" }}
            />

            {series.map((s, i) => {
              const isLast = i === lastIdx;
              const isHot = activeIdx === i;
              if (!isLast && !isHot) return null;
              return (
                <circle
                  key={i} cx={xp(i)} cy={yp(s.value)} r={isHot ? 5 : 3.5}
                  fill="var(--signal)" stroke="var(--bg)" strokeWidth={1.5}
                  opacity={drawn ? 1 : 0}
                  style={{
                    transition: "opacity 400ms var(--ease-standard) 1000ms, r 120ms var(--ease-standard)",
                    animation: isLast && !isHot ? "ak-glow-pulse 2.4s var(--ease-standard) infinite" : "none",
                    color: "var(--signal)",
                  }}
                />
              );
            })}
          </g>
        </svg>

        <DataPreview
          visible={drawn}
          x={`${tipLeftPct}%`}
          y={0}
          placement="top"
          label={series[shownIdx].label || `#${shownIdx + 1}`}
          value={fmt(series[shownIdx].value)}
          accent="var(--signal)"
          note={(() => { const z = zones.find((z) => series[shownIdx].value >= Math.min(z.from, z.to) && series[shownIdx].value <= Math.max(z.from, z.to)); return z && z.label ? z.label : null; })()}
        />
      </div>
    </div>
  );
}
