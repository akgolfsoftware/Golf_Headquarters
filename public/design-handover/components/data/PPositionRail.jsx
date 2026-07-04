import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { Icon } from "../core/Icon.jsx";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — PPositionRail
 * Horizontal chain of P-positions (P1…P10) or any ordered position sequence.
 * A connecting line links them; each stop is ferdig (filled lime) · aktiv
 * (lime ring, gentle pulse) · planlagt (neutral outline). Click to select.
 *
 * Premium data-life: the connecting line draws in on mount; the active stop
 * pulses softly (no bounce) so it reads as "in progress" without noise.
 */

const CSS = `
.ak-prail{display:flex;flex-direction:column;gap:8px;width:100%;}
.ak-prail__track{position:relative;display:flex;justify-content:space-between;padding:0 2px;}
.ak-prail__line{position:absolute;left:0;right:0;top:11px;height:2px;background:var(--border);
  border-radius:1px;overflow:hidden;}
.ak-prail__line-fill{height:100%;background:var(--signal);border-radius:1px;
  transition:width 900ms var(--ease-standard);}
.ak-prail__stop{
  position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;
  background:none;border:none;cursor:pointer;padding:0;flex:1;
}
.ak-prail__dot{
  width:22px;height:22px;border-radius:9999px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  border:2px solid var(--border-strong);background:var(--surface);color:var(--text-muted);
  transition:background var(--dur-base) var(--ease-standard),
    border-color var(--dur-base) var(--ease-standard),
    transform var(--dur-fast) var(--ease-standard);
}
.ak-prail__stop:active .ak-prail__dot{transform:scale(.92);}
.ak-prail__dot[data-status="ferdig"]{background:var(--signal);border-color:var(--signal);color:var(--on-signal);}
.ak-prail__dot[data-status="aktiv"]{border-color:var(--signal);color:var(--signal);
  animation:ak-glow-pulse 2.2s var(--ease-standard) infinite;}
.ak-prail__label{font-family:var(--font-mono);font-size:9px;font-weight:600;letter-spacing:.04em;
  color:var(--text-muted);white-space:nowrap;transition:color var(--dur-fast) var(--ease-standard);}
.ak-prail__stop[data-selected] .ak-prail__label{color:var(--text);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-prail-css")) {
  const s = document.createElement("style");
  s.id = "ak-prail-css";
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

export function PPositionRail({
  positions = [],
  loading = false,
  selectedId,
  onSelect,
  className = "",
  style,
}) {
  const [drawn, setDrawn] = React.useState(false);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) { setDrawn(true); return; }
    setDrawn(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, positions.length]);

  if (loading) {
    return <Skeleton variant="card" width="100%" height={88} className={className} style={style} />;
  }
  if (!positions || positions.length === 0) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: 88, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 16, boxSizing: "border-box",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)",
          background: "var(--surface)", textAlign: "center", ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen P-posisjoner ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>Posisjoner vises når analysen er kjørt.</span>
      </div>
    );
  }

  const doneCount = positions.filter((p) => p.status === "ferdig").length;
  const fillPct = positions.length > 1 ? (doneCount / (positions.length - 1)) * 100 : 0;
  const [hover, setHover] = React.useState(null);
  const STATUS = { ferdig: "Ferdig", aktiv: "Aktiv nå", planlagt: "Planlagt" };

  return (
    <div className={`ak-prail ${className}`} style={style}>
      <div className="ak-prail__track">
        <div className="ak-prail__line">
          <div className="ak-prail__line-fill" style={{ width: drawn ? `${fillPct}%` : "0%" }} />
        </div>
        {positions.map((p) => (
          <button
            key={p.id}
            type="button"
            className="ak-prail__stop"
            data-selected={selectedId === p.id ? "" : undefined}
            onClick={() => onSelect && onSelect(p.id)}
            onMouseEnter={() => setHover(p.id)}
            onMouseLeave={() => setHover((h) => (h === p.id ? null : h))}
          >
            <span className="ak-prail__dot" data-status={p.status}>
              {p.status === "ferdig" ? (
                <Icon name="check" size={11} />
              ) : (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700 }}>
                  {p.id.replace(/^P/, "")}
                </span>
              )}
            </span>
            <span className="ak-prail__label">{p.label || p.id}</span>
            {hover === p.id && (
              <DataPreview
                visible
                x="50%"
                y={-4}
                placement="top"
                label={p.id}
                value={p.label || p.id}
                note={p.note != null ? p.note : STATUS[p.status] || null}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
