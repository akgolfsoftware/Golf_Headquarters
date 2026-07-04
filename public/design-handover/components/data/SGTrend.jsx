import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — SGTrend
 * Multi-axis Strokes Gained line chart. Axes: OTT / APP / ARG / PUTT.
 * Each axis uses its categorical colour token. Benchmark band shown as
 * a dashed line + subtle fill. Round-selector below toggles a "focused" round.
 * Toggle axes on/off via the legend.
 *
 * Premium data-life: lines draw in on mount (respects prefers-reduced-motion);
 * hovering/dragging over the plot drives a scrubber — a vertical guide with a
 * gliding tooltip and glowing touched points. The signature moment of the system.
 */

const SG_AXES = [
  { key: "ott",  label: "OTT",  color: "var(--sg-ott)"  },
  { key: "app",  label: "APP",  color: "var(--sg-app)"  },
  { key: "arg",  label: "ARG",  color: "var(--sg-arg)"  },
  { key: "putt", label: "PUTT", color: "var(--sg-putt)" },
];

const CSS = `
.ak-sgtrend{display:flex;flex-direction:column;gap:14px;width:100%;}
.ak-sgtrend__legend{display:flex;gap:6px;flex-wrap:wrap;}
.ak-sgleg{
  display:inline-flex;align-items:center;gap:6px;
  padding:4px 10px;border-radius:9999px;border:1px solid transparent;
  background:transparent;cursor:pointer;
  transition:background var(--dur-fast) var(--ease-standard),opacity var(--dur-base) var(--ease-standard);
}
.ak-sgleg:hover{background:var(--surface-hover);}
.ak-sgleg--off{opacity:.35;}
.ak-sgleg__dot{width:8px;height:8px;border-radius:9999px;flex-shrink:0;}
.ak-sgleg__lbl{
  font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:.06em;color:var(--text-2);
}
.ak-sgtrend__plot{position:relative;width:100%;}
.ak-sgtrend__svg{width:100%;overflow:visible;display:block;cursor:crosshair;}
.ak-sgtrend__rounds{display:flex;gap:4px;flex-wrap:wrap;}
.ak-sgrnd{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:32px;height:24px;padding:0 8px;border-radius:6px;
  font-family:var(--font-mono);font-size:10px;font-weight:600;
  color:var(--text-muted);cursor:pointer;
  border:1px solid transparent;background:transparent;
  transition:background var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard),
    border-color var(--dur-fast) var(--ease-standard);
}
.ak-sgrnd:hover{background:var(--surface-hover);color:var(--text);}
.ak-sgrnd:active{transform:scale(.97);}
.ak-sgrnd[data-active]{background:var(--surface-2);color:var(--text);border-color:var(--border-strong);}
.ak-sgtrend__tip{
  position:absolute;top:0;pointer-events:none;
  background:var(--surface-raised,var(--surface-2));border:1px solid var(--border-strong);
  border-radius:8px;padding:8px 10px;box-shadow:var(--sheen-top-lg);
  font-family:var(--font-mono);font-size:10px;color:var(--text);
  transform:translate(-50%,-100%);white-space:nowrap;
  transition:left 90ms linear,opacity var(--dur-fast) var(--ease-standard);
  z-index:2;
}
.ak-sgtrend__tip-row{display:flex;align-items:baseline;gap:6px;justify-content:space-between;}
.ak-sgtrend__tip-row + .ak-sgtrend__tip-row{margin-top:2px;}
.ak-sgtrend__tip-dot{width:6px;height:6px;border-radius:9999px;display:inline-block;margin-right:4px;}
.ak-sgtrend__tip-lbl{color:var(--text-muted);letter-spacing:.04em;}
.ak-sgtrend__tip-val{font-variant-numeric:tabular-nums;font-weight:700;}
@media (prefers-reduced-motion: reduce){
  .ak-sgtrend__tip{transition:none;}
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-sgtrend-css")) {
  const s = document.createElement("style");
  s.id = "ak-sgtrend-css";
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

function fmtSG(v) {
  if (v == null) return "—";
  const s = v.toFixed(2).replace(".", ",");
  return v > 0 ? `+${s}` : s;
}

export function SGTrend({
  rounds = [],
  loading = false,
  benchmark,
  height = 200,
  className = "",
  style,
}) {
  const [hidden, setHidden] = React.useState([]);
  const [focusRound, setFocusRound] = React.useState(null);
  const [scrub, setScrub] = React.useState(null); // index under pointer
  const [drawn, setDrawn] = React.useState(false);
  const svgRef = React.useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) { setDrawn(true); return; }
    setDrawn(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, rounds.length]);

  const allVals = SG_AXES.flatMap((a) =>
    rounds.map((r) => r[a.key]).filter((v) => v != null)
  );
  if (loading) {
    return <Skeleton variant="card" width="100%" height={height} className={className} style={style} />;
  }
  if (allVals.length === 0) {
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
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen runder ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>SG-trend vises når runder er registrert.</span>
      </div>
    );
  }

  const rawMin = Math.min(...allVals) - 0.3;
  const rawMax = Math.max(...allVals) + 0.3;
  const minV = Math.min(rawMin, benchmark != null ? benchmark - 0.2 : rawMin);
  const maxV = Math.max(rawMax, benchmark != null ? benchmark + 0.2 : rawMax);

  const W = 500;
  const H = height;
  const P = { top: 8, right: 8, bottom: 8, left: 28 };
  const cW = W - P.left - P.right;
  const cH = H - P.top - P.bottom;

  const yp = (v) => cH - ((v - minV) / (maxV - minV)) * cH;
  const xp = (i) => rounds.length < 2 ? cW / 2 : (i / (rounds.length - 1)) * cW;

  const ticks = [];
  for (let v = Math.ceil(minV); v <= Math.floor(maxV); v++) ticks.push(v);

  const toggle = (key) =>
    setHidden((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const activeIdx = scrub != null ? scrub : focusRound;

  const handlePointer = (e) => {
    if (rounds.length < 2 || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W - P.left;
    let nearest = 0, best = Infinity;
    rounds.forEach((_, i) => {
      const d = Math.abs(xp(i) - relX);
      if (d < best) { best = d; nearest = i; }
    });
    setScrub(nearest);
  };

  const visibleAxes = SG_AXES.filter((a) => !hidden.includes(a.key));
  const tipLeftPct = activeIdx != null ? ((P.left + xp(activeIdx)) / W) * 100 : null;

  return (
    <div className={`ak-sgtrend ${className}`} style={style}>
      <div className="ak-sgtrend__legend">
        {SG_AXES.map((a) => (
          <button
            key={a.key}
            type="button"
            className={`ak-sgleg${hidden.includes(a.key) ? " ak-sgleg--off" : ""}`}
            onClick={() => toggle(a.key)}
          >
            <span className="ak-sgleg__dot" style={{ background: a.color }} />
            <span className="ak-sgleg__lbl">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="ak-sgtrend__plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="ak-sgtrend__svg"
          style={{ height }}
          aria-label="Strokes Gained trend"
          role="img"
          onMouseMove={handlePointer}
          onMouseLeave={() => setScrub(null)}
        >
          <g transform={`translate(${P.left},${P.top})`}>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={0} y1={yp(v)} x2={cW} y2={yp(v)} stroke="var(--chart-grid)" strokeWidth={1} />
                <text
                  x={-4} y={yp(v)} fill="var(--text-muted)"
                  fontSize={9} fontFamily="var(--font-mono)"
                  textAnchor="end" dominantBaseline="middle"
                >
                  {v > 0 ? `+${v}` : v}
                </text>
              </g>
            ))}

            {benchmark != null && (
              <React.Fragment>
                <rect
                  x={0} y={yp(benchmark + 0.12)}
                  width={cW}
                  height={Math.abs(yp(benchmark - 0.12) - yp(benchmark + 0.12))}
                  fill="var(--chart-grid)"
                />
                <line
                  x1={0} y1={yp(benchmark)} x2={cW} y2={yp(benchmark)}
                  stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="5 4"
                />
              </React.Fragment>
            )}

            <line x1={0} y1={yp(0)} x2={cW} y2={yp(0)} stroke="var(--chart-axis)" strokeWidth={1} />

            {activeIdx != null && (
              <line
                x1={xp(activeIdx)} y1={0} x2={xp(activeIdx)} y2={cH}
                stroke="var(--border-strong)" strokeWidth={1}
                style={{ transition: "x1 90ms linear,x2 90ms linear" }}
              />
            )}

            {visibleAxes.map((a) => {
              const data = rounds.map((r) => r[a.key]);
              if (data.some((v) => v == null)) return null;
              const pts = data.map((v, i) => `${xp(i)},${yp(v)}`).join(" ");
              const dim = focusRound !== null ? 0.3 : 1;
              return (
                <g key={a.key}>
                  <polyline
                    points={pts} fill="none"
                    stroke={a.color} strokeWidth={2}
                    strokeLinejoin="round" strokeLinecap="round"
                    opacity={dim}
                    pathLength={100}
                    strokeDasharray={100}
                    strokeDashoffset={drawn ? 0 : 100}
                    style={{ transition: "stroke-dashoffset 1000ms var(--ease-standard)" }}
                  />
                  {data.map((v, i) => {
                    const isHot = activeIdx === i;
                    return (
                      <circle
                        key={i} cx={xp(i)} cy={yp(v)} r={isHot ? 5 : 3.5}
                        fill={a.color} stroke="var(--bg)" strokeWidth={1.5}
                        opacity={
                          !drawn ? 0
                          : activeIdx != null && !isHot ? 0.25
                          : 1
                        }
                        style={{
                          transition: "opacity var(--dur-base) var(--ease-standard) 900ms, r 120ms var(--ease-standard)",
                          filter: isHot ? `drop-shadow(0 0 4px ${a.color})` : "none",
                        }}
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>
        </svg>

        {activeIdx != null && rounds[activeIdx] && (
          <DataPreview
            visible
            x={`${tipLeftPct}%`}
            y={0}
            placement="top"
            label={rounds[activeIdx].label || `RUNDE ${activeIdx + 1}`}
            rows={visibleAxes.map((a) => ({ color: a.color, label: a.label, value: fmtSG(rounds[activeIdx][a.key]) }))}
          />
        )}
      </div>

      {rounds.length > 0 && (
        <div className="ak-sgtrend__rounds">
          {rounds.map((r, i) => (
            <button
              key={i}
              type="button"
              className="ak-sgrnd"
              data-active={focusRound === i ? "" : undefined}
              onClick={() => setFocusRound(focusRound === i ? null : i)}
            >
              {r.label || `R${i + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
