import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — CompareChart
 * Dual-line comparison: a primary lime series against a muted secondary
 * (previous period, squad average, benchmark). Scrubber shows both values +
 * the delta between them at the touched point.
 *
 * Premium data-life: both lines draw in (secondary slightly behind primary);
 * pointer drives a scrubber with a gliding tooltip; the primary's endpoint
 * glows softly.
 */

const CSS = `
.ak-cmpchart{display:flex;flex-direction:column;gap:10px;width:100%;}
.ak-cmpchart__legend{display:flex;gap:14px;align-items:center;}
.ak-cmpchart__leg{display:flex;align-items:center;gap:6px;font-family:var(--font-mono);
  font-size:10px;font-weight:600;letter-spacing:.06em;color:var(--text-2);}
.ak-cmpchart__swatch{width:14px;height:2px;border-radius:2px;flex-shrink:0;}
.ak-cmpchart__swatch--dashed{background-image:linear-gradient(90deg, var(--text-muted) 0 6px, transparent 6px 9px);
  background-size:9px 2px;height:2px;background-color:transparent;}
.ak-cmpchart__plot{position:relative;width:100%;}
.ak-cmpchart__svg{width:100%;overflow:visible;display:block;cursor:crosshair;}
.ak-cmpchart__tip{
  position:absolute;top:0;pointer-events:none;
  background:var(--surface-2);border:1px solid var(--border-strong);
  border-radius:8px;padding:8px 10px;box-shadow:var(--sheen-top-lg);
  font-family:var(--font-mono);font-size:10px;color:var(--text);
  transform:translate(-50%,-100%);white-space:nowrap;
  transition:left 90ms linear,opacity var(--dur-fast) var(--ease-standard);
  z-index:2;
}
.ak-cmpchart__tip-row{display:flex;justify-content:space-between;gap:10px;}
.ak-cmpchart__tip-row + .ak-cmpchart__tip-row{margin-top:3px;}
.ak-cmpchart__tip-delta{margin-top:4px;padding-top:4px;border-top:1px solid var(--border);
  display:flex;justify-content:space-between;gap:10px;color:var(--text-muted);}
@media (prefers-reduced-motion: reduce){ .ak-cmpchart__tip{transition:none;} }
`;

if (typeof document !== "undefined" && !document.getElementById("ak-cmpchart-css")) {
  const s = document.createElement("style");
  s.id = "ak-cmpchart-css";
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

export function CompareChart({
  labels = [],
  primary = [],
  loading = false,
  secondary,
  primaryLabel = "Nå",
  secondaryLabel = "Forrige",
  height = 200,
  fmt = (v) => String(v),
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
  }, [reduceMotion, primary.length]);

  if (loading) {
    return <Skeleton variant="card" width="100%" height={height} className={className} style={style} />;
  }
  if (!primary || primary.length === 0) {
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
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen data ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>Sammenligning vises når det finnes registrerte verdier.</span>
      </div>
    );
  }

  const allVals = [...primary, ...(secondary || [])].filter((v) => v != null);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const pad = (maxV - minV) * 0.15 || 1;

  const W = 560;
  const H = height;
  const P = { top: 10, right: 8, bottom: 8, left: 8 };
  const cW = W - P.left - P.right;
  const cH = H - P.top - P.bottom;

  const yp = (v) => cH - ((v - (minV - pad)) / (maxV - minV + pad * 2)) * cH;
  const xp = (i) => (primary.length < 2 ? cW / 2 : (i / (primary.length - 1)) * cW);

  const primPts = primary.map((v, i) => `${xp(i)},${yp(v)}`).join(" ");
  const secPts = secondary ? secondary.map((v, i) => `${xp(i)},${yp(v)}`).join(" ") : null;
  const lastIdx = primary.length - 1;

  const handlePointer = (e) => {
    if (primary.length < 2 || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W - P.left;
    let nearest = 0, best = Infinity;
    primary.forEach((_, i) => {
      const d = Math.abs(xp(i) - relX);
      if (d < best) { best = d; nearest = i; }
    });
    setScrub(nearest);
  };

  const activeIdx = scrub != null ? scrub : lastIdx;
  const tipLeftPct = ((P.left + xp(activeIdx)) / W) * 100;
  const pVal = primary[activeIdx];
  const sVal = secondary ? secondary[activeIdx] : null;
  const delta = sVal != null ? pVal - sVal : null;

  return (
    <div className={`ak-cmpchart ${className}`} style={style}>
      <div className="ak-cmpchart__legend">
        <span className="ak-cmpchart__leg"><span className="ak-cmpchart__swatch" style={{ background: "var(--signal)" }} />{primaryLabel}</span>
        {secondary && (
          <span className="ak-cmpchart__leg"><span className="ak-cmpchart__swatch ak-cmpchart__swatch--dashed" />{secondaryLabel}</span>
        )}
      </div>

      <div className="ak-cmpchart__plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="ak-cmpchart__svg"
          style={{ height }}
          role="img"
          aria-label="Sammenligningsgraf"
          onMouseMove={handlePointer}
          onMouseLeave={() => setScrub(null)}
        >
          <g transform={`translate(${P.left},${P.top})`}>
            {activeIdx != null && (
              <line x1={xp(activeIdx)} y1={0} x2={xp(activeIdx)} y2={cH}
                stroke="var(--border-strong)" strokeWidth={1}
                style={{ transition: "x1 90ms linear,x2 90ms linear" }} />
            )}

            {secPts && (
              <polyline
                points={secPts} fill="none" stroke="var(--text-muted)" strokeWidth={1.5}
                strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round"
                opacity={drawn ? 1 : 0}
                style={{ transition: "opacity 700ms var(--ease-standard) 150ms" }}
              />
            )}

            <polyline
              points={primPts} fill="none" stroke="var(--signal)" strokeWidth={2.25}
              strokeLinejoin="round" strokeLinecap="round"
              pathLength={100} strokeDasharray={100}
              strokeDashoffset={drawn ? 0 : 100}
              style={{ transition: "stroke-dashoffset 1000ms var(--ease-standard)" }}
            />

            {primary.map((v, i) => {
              const isLast = i === lastIdx;
              const isHot = scrub === i;
              if (!isLast && !isHot) return null;
              return (
                <circle key={i} cx={xp(i)} cy={yp(v)} r={isHot ? 5 : 3.5}
                  fill="var(--signal)" stroke="var(--bg)" strokeWidth={1.5}
                  opacity={drawn ? 1 : 0}
                  style={{
                    transition: "opacity 400ms var(--ease-standard) 900ms, r 120ms var(--ease-standard)",
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
          label={labels[activeIdx] || `#${activeIdx + 1}`}
          rows={[
            { color: "var(--signal)", label: primaryLabel, value: fmt(pVal) },
            ...(sVal != null ? [{ color: "var(--text-muted)", label: secondaryLabel, value: fmt(sVal) }] : []),
            ...(delta != null ? [{ label: "Diff", value: (delta >= 0 ? "+" : "") + fmt(delta), valueColor: delta >= 0 ? "var(--up)" : "var(--down)" }] : []),
          ]}
        />
      </div>
    </div>
  );
}
