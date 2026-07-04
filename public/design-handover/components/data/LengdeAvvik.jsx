import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — LengdeAvvik
 * Lengdeavvik-scatter: hvert slag plottet med side (x, +høyre/-venstre) og
 * lengdeavvik fra mål (y, +langt/-kort) i meter, mål i sentrum.
 * Kanonisk SPREDNING side = trackman/DispersionPlot; denne eier LENGDEAVVIK. A fitted 1σ ellipse (grey) shows the shot pattern's shape; an
 * optional 2σ ellipse can be added via `showOuter`.
 *
 * Premium data-life: points fade+scale in with a light stagger on mount;
 * hovering a point glows it and shows offline/distance in a tooltip.
 */

const CSS = `
.ak-lengdeavvik{position:relative;width:100%;}
.ak-lengdeavvik__svg{width:100%;overflow:visible;display:block;}
.ak-lengdeavvik__tip{
  position:absolute;pointer-events:none;
  background:var(--surface-2);border:1px solid var(--border-strong);
  border-radius:8px;padding:6px 9px;box-shadow:var(--sheen-top-lg);
  font-family:var(--font-mono);font-size:10px;color:var(--text);
  transform:translate(-50%,calc(-100% - 8px));white-space:nowrap;
  transition:opacity var(--dur-fast) var(--ease-standard);z-index:2;
}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-lengdeavvik-css")) {
  const s = document.createElement("style");
  s.id = "ak-lengdeavvik-css";
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

function stats(shots) {
  const n = shots.length;
  const mx = shots.reduce((s, p) => s + p.x, 0) / n;
  const my = shots.reduce((s, p) => s + p.y, 0) / n;
  const sxx = shots.reduce((s, p) => s + (p.x - mx) ** 2, 0) / n;
  const syy = shots.reduce((s, p) => s + (p.y - my) ** 2, 0) / n;
  return { mx, my, sx: Math.sqrt(sxx), sy: Math.sqrt(syy) };
}

export function LengdeAvvik({
  shots = [],
  loading = false,
  range = 20,
  size = 320,
  showOuter = false,
  className = "",
  style,
}) {
  const [hovered, setHovered] = React.useState(null);
  const [drawn, setDrawn] = React.useState(false);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) { setDrawn(true); return; }
    setDrawn(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, shots.length]);

  if (loading) {
    return <Skeleton variant="card" width="100%" height={size} className={className} style={style} />;
  }
  if (!shots || shots.length === 0) {
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
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen slag ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>Lengdeavvik vises i meter (+langt / −kort), side i meter V/H.</span>
      </div>
    );
  }

  const S = size;
  const cx = S / 2, cy = S / 2;
  const scale = (S / 2 - 24) / range;
  const px = (x) => cx + x * scale;
  const py = (y) => cy - y * scale;

  const { mx, my, sx, sy } = stats(shots);
  const rings = [range * 0.33, range * 0.66, range];

  return (
    <div className={`ak-lengdeavvik ${className}`} style={style}>
      <svg
        viewBox={`0 0 ${S} ${S}`}
        className="ak-lengdeavvik__svg"
        style={{ height: size }}
        role="img"
        aria-label="Lengdeavvik-kart"
      >
        {rings.map((r, i) => (
          <circle key={i} cx={cx} cy={cy} r={r * scale} fill="none" stroke="var(--chart-grid)" strokeWidth={1} />
        ))}
        <line x1={cx} y1={24} x2={cx} y2={S - 24} stroke="var(--chart-grid)" strokeWidth={1} />
        <line x1={24} y1={cy} x2={S - 24} y2={cy} stroke="var(--chart-grid)" strokeWidth={1} />

        {/* 1σ ellipse — the shape of the pattern */}
        <ellipse
          cx={px(mx)} cy={py(my)} rx={sx * scale} ry={sy * scale}
          fill="var(--text-muted)" fillOpacity={0.08}
          stroke="var(--text-muted)" strokeWidth={1.25} strokeDasharray="4 3"
          opacity={drawn ? 1 : 0}
          style={{ transition: "opacity 500ms var(--ease-standard) 400ms" }}
        />
        {showOuter && (
          <ellipse
            cx={px(mx)} cy={py(my)} rx={sx * 2 * scale} ry={sy * 2 * scale}
            fill="none" stroke="var(--text-faint)" strokeWidth={1} strokeDasharray="2 4"
            opacity={drawn ? 0.7 : 0}
            style={{ transition: "opacity 500ms var(--ease-standard) 500ms" }}
          />
        )}

        {/* target */}
        <circle cx={cx} cy={cy} r={4} fill="none" stroke="var(--signal)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={1.5} fill="var(--signal)" />

        {shots.map((s, i) => {
          const isHot = hovered === i;
          return (
            <circle
              key={i}
              cx={px(s.x)} cy={py(s.y)}
              r={isHot ? 5 : 3.5}
              fill={isHot ? "var(--signal)" : "var(--text-2)"}
              stroke="var(--bg)" strokeWidth={1}
              opacity={drawn ? (isHot ? 1 : 0.85) : 0}
              style={{
                transformOrigin: `${px(s.x)}px ${py(s.y)}px`,
                transform: drawn ? "scale(1)" : "scale(0.3)",
                transition: `opacity 320ms var(--ease-standard) ${i * 22}ms,
                  transform 320ms var(--ease-standard) ${i * 22}ms, r 120ms var(--ease-standard)`,
                filter: isHot ? "drop-shadow(0 0 4px var(--signal))" : "none",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            />
          );
        })}
      </svg>

      {hovered != null && shots[hovered] && (
        <div
          className="ak-lengdeavvik__tip"
          style={{
            left: `${(px(shots[hovered].x) / S) * 100}%`,
            top: `${(py(shots[hovered].y) / S) * 100}%`,
          }}
        >
          {shots[hovered].label ? `${shots[hovered].label} · ` : ""}
          {shots[hovered].x >= 0 ? "+" : ""}{shots[hovered].x.toFixed(1)} m sidelengs ·{" "}
          {shots[hovered].y >= 0 ? "+" : ""}{shots[hovered].y.toFixed(1)} m
        </div>
      )}
    </div>
  );
}
