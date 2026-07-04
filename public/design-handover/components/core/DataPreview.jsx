import React from "react";

/**
 * AK Golf HQ — DataPreview
 * Delt hover/scrubber-primitiv: et lite kort som viser verdien for punktet under
 * pekeren. Verdi i JetBrains Mono, kort label over, valgfri delta (--up/--down).
 * PRESENTASJONELT: forelderen eier hover-geometrien (chart-koordinater, nærmeste
 * punkt) og posisjonerer kortet via `x`/`y` innenfor en `position:relative`-boks;
 * dette kortet eier bare utseendet + inn/ut-bevegelsen. Referansemønster:
 * Heatmap / LengdeAvvik (som hadde egne bespoke tips før dette).
 *
 * To moduser:
 *  1. Enkeltverdi  — `label` + `value` (+ `unit`, `delta`).
 *  2. Flerrad      — `rows={[{color,label,value}]}` (f.eks. SG-akser, AK-formel).
 *
 * Motion: fade + 4px reis inn/ut (Fase 6.5). `prefers-reduced-motion` → ingen
 * transisjon (kortet vises/skjules umiddelbart). Aldri dekorativ loop.
 */

const CSS = `
.ak-dpv{
  position:absolute;z-index:9;pointer-events:none;
  min-width:0;max-width:240px;
  background:var(--surface-raised,var(--surface-2));
  border:1px solid var(--border-strong);
  border-radius:10px;padding:8px 11px;
  box-shadow:var(--sheen-top-lg,0 8px 24px rgba(0,0,0,.32));
  color:var(--text);
  opacity:0;
  transition:opacity var(--dur-fast,140ms) var(--ease-standard,cubic-bezier(.2,0,0,1)),
             transform var(--dur-fast,140ms) var(--ease-standard,cubic-bezier(.2,0,0,1)),
             left 90ms linear,top 90ms linear;
}
.ak-dpv[data-show="1"]{opacity:1;}
/* Retning: kortet forskyves bort fra punktet, og reiser 4px inn */
.ak-dpv[data-place="top"]{transform:translate(-50%,calc(-100% - 8px + 4px));}
.ak-dpv[data-place="top"][data-show="1"]{transform:translate(-50%,calc(-100% - 8px));}
.ak-dpv[data-place="bottom"]{transform:translate(-50%,calc(8px + 4px));}
.ak-dpv[data-place="bottom"][data-show="1"]{transform:translate(-50%,8px);}
.ak-dpv[data-place="right"]{transform:translate(calc(8px + 4px),-50%);}
.ak-dpv[data-place="right"][data-show="1"]{transform:translate(8px,-50%);}
.ak-dpv[data-place="left"]{transform:translate(calc(-100% - 8px - 4px),-50%);}
.ak-dpv[data-place="left"][data-show="1"]{transform:translate(calc(-100% - 8px),-50%);}

.ak-dpv__lbl{
  font-family:var(--font-mono);font-size:9px;font-weight:600;
  letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);
  white-space:nowrap;line-height:1;
}
.ak-dpv__main{display:flex;align-items:baseline;gap:5px;margin-top:6px;}
.ak-dpv__val{
  font-family:var(--font-mono);font-size:19px;font-weight:700;letter-spacing:-0.01em;
  line-height:1;font-variant-numeric:tabular-nums;color:var(--text);white-space:nowrap;
}
.ak-dpv__unit{font-family:var(--font-mono);font-size:10px;font-weight:600;color:var(--text-muted);}
.ak-dpv__delta{
  display:inline-flex;align-items:center;gap:3px;margin-top:6px;
  font-family:var(--font-mono);font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;
}
.ak-dpv__delta[data-dir="up"]{color:var(--up);}
.ak-dpv__delta[data-dir="down"]{color:var(--down);}
.ak-dpv__delta[data-dir="flat"]{color:var(--text-muted);}
.ak-dpv__delta svg{width:10px;height:10px;}

.ak-dpv__rows{display:flex;flex-direction:column;gap:4px;margin-top:7px;}
.ak-dpv__row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;}
.ak-dpv__row-lbl{display:inline-flex;align-items:center;gap:5px;
  font-family:var(--font-mono);font-size:10px;color:var(--text-muted);letter-spacing:.03em;white-space:nowrap;}
.ak-dpv__row-dot{width:6px;height:6px;border-radius:9999px;flex:none;}
.ak-dpv__row-val{font-family:var(--font-mono);font-size:11px;font-weight:700;
  font-variant-numeric:tabular-nums;color:var(--text);white-space:nowrap;}
.ak-dpv__note{margin-top:6px;font-family:var(--font-ui,inherit);font-size:11px;
  color:var(--text-2);line-height:1.35;max-width:210px;white-space:normal;}
@media (prefers-reduced-motion: reduce){
  .ak-dpv{transition:opacity 1ms linear;}
  .ak-dpv[data-place]{transform:translate(-50%,calc(-100% - 8px));}
  .ak-dpv[data-place="bottom"]{transform:translate(-50%,8px);}
  .ak-dpv[data-place="right"]{transform:translate(8px,-50%);}
  .ak-dpv[data-place="left"]{transform:translate(calc(-100% - 8px),-50%);}
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-datapreview-css")) {
  const s = document.createElement("style");
  s.id = "ak-datapreview-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const ArrowUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
);
const ArrowDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
);

function coord(v) {
  return typeof v === "number" ? `${v}px` : v;
}

export function DataPreview({
  visible = true,
  x = "50%",
  y = 0,
  placement = "top",
  label,
  value,
  unit,
  delta,
  deltaDir,     // "up" | "down" | "flat" — ellers utledet fra fortegn på delta (tall)
  rows,
  note,
  accent,       // valgfri aksentfarge på hovedverdien (f.eks. akse-farge)
  className = "",
  style,
}) {
  // Utled retning fra delta hvis ikke gitt eksplisitt
  let dir = deltaDir;
  if (!dir && delta != null) {
    const num = typeof delta === "number" ? delta : parseFloat(String(delta).replace(",", ".").replace(/[^\d.\-+]/g, ""));
    dir = isNaN(num) || num === 0 ? "flat" : num > 0 ? "up" : "down";
  }
  const deltaText = delta == null ? null : typeof delta === "number"
    ? (delta > 0 ? "+" : "") + String(delta).replace(".", ",")
    : delta;

  return (
    <div
      className={`ak-dpv ${className}`}
      data-show={visible ? "1" : "0"}
      data-place={placement}
      role="status"
      aria-hidden={visible ? undefined : "true"}
      style={{ left: coord(x), top: coord(y), ...style }}
    >
      {label != null && <div className="ak-dpv__lbl">{label}</div>}

      {rows && rows.length > 0 ? (
        <div className="ak-dpv__rows">
          {rows.map((r, i) => (
            <div className="ak-dpv__row" key={i}>
              <span className="ak-dpv__row-lbl">
                {r.color && <span className="ak-dpv__row-dot" style={{ background: r.color }} />}
                {r.label}
              </span>
              <span className="ak-dpv__row-val" style={r.valueColor ? { color: r.valueColor } : undefined}>{r.value}</span>
            </div>
          ))}
        </div>
      ) : value != null ? (
        <div className="ak-dpv__main">
          <span className="ak-dpv__val" style={accent ? { color: accent } : undefined}>{value}</span>
          {unit != null && <span className="ak-dpv__unit">{unit}</span>}
        </div>
      ) : null}

      {deltaText != null && (
        <span className="ak-dpv__delta" data-dir={dir}>
          {dir === "up" ? <ArrowUp /> : dir === "down" ? <ArrowDown /> : null}
          {deltaText}
        </span>
      )}

      {note != null && <div className="ak-dpv__note">{note}</div>}
    </div>
  );
}

/**
 * nearestIndex — delt scrubber-hjelper (Fase 4.6). Gitt pekerens clientX, elementets
 * bounding-rect, antall punkter og en funksjon xFrac(i)→0..1 (punktets vannrette
 * andel av bredden), returner indeksen til nærmeste punkt. Brukes av
 * tidsserie-grafene (SGTrend, LoadChart, Sparkline, CompareChart) for konsistent drag.
 */
export function nearestIndex(clientX, rect, count, xFrac) {
  if (!rect || count < 1) return 0;
  const f = (clientX - rect.left) / (rect.width || 1);
  let best = 0, bestD = Infinity;
  for (let i = 0; i < count; i++) {
    const d = Math.abs((xFrac ? xFrac(i) : count < 2 ? 0.5 : i / (count - 1)) - f);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}
