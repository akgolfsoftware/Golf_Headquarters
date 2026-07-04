import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — SGSplittKort
 * Strokes Gained breakdown card: OTT / APP / ARG / PUTT.
 * Each axis: categorical dot + label + bar + value + optional delta.
 * data: { ott: {value, delta}, app: {value, delta}, ... }
 */

const SG_AXES = [
  { key: "ott",  label: "OTT",  color: "var(--sg-ott)"  },
  { key: "app",  label: "APP",  color: "var(--sg-app)"  },
  { key: "arg",  label: "ARG",  color: "var(--sg-arg)"  },
  { key: "putt", label: "PUTT", color: "var(--sg-putt)" },
];

const CSS = `
.ak-sgsplitt{
  display:flex;flex-direction:column;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);overflow:hidden;
}
.ak-sgsplitt__row{
  display:flex;align-items:center;gap:10px;
  padding:11px 16px;border-bottom:1px solid var(--border);
}
.ak-sgsplitt__row:last-child{border-bottom:none;}
.ak-sgsplitt__dot{width:8px;height:8px;border-radius:9999px;flex-shrink:0;}
.ak-sgsplitt__lbl{
  font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);
  width:34px;flex-shrink:0;
}
.ak-sgsplitt__track{flex:1;height:6px;border-radius:9999px;background:var(--track);}
.ak-sgsplitt__fill{height:100%;border-radius:9999px;transition:width var(--dur-base) var(--ease-out);}
.ak-sgsplitt__val{
  font-family:var(--font-mono);font-size:var(--text-13);font-weight:600;
  font-variant-numeric:tabular-nums;width:44px;text-align:right;flex-shrink:0;
}
.ak-sgsplitt__delta{
  display:flex;align-items:center;gap:2px;
  font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  width:36px;flex-shrink:0;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-sgsplitt-css")) {
  const s = document.createElement("style");
  s.id = "ak-sgsplitt-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function fmtSG(v) {
  if (v == null) return "—";
  const n = typeof v === "number" ? v : parseFloat(v);
  return (n > 0 ? "+" : "") + n.toFixed(1).replace(".", ",");
}

export function SGSplittKort({ data = {}, className = "", style }) {
  const allAbs = SG_AXES.map((a) => Math.abs(data[a.key]?.value ?? 0));
  const maxAbs = Math.max(1, ...allAbs);

  return (
    <div className={`ak-sgsplitt ${className}`} style={style}>
      {SG_AXES.map((ax) => {
        const entry = data[ax.key] || {};
        const val = entry.value ?? 0;
        const delta = entry.delta;
        const pct = `${(Math.abs(val) / maxAbs) * 100}%`;
        const valColor = val >= 0 ? "var(--up)" : "var(--down)";
        const deltaColor = delta == null ? "transparent" : delta >= 0 ? "var(--up)" : "var(--down)";
        return (
          <div key={ax.key} className="ak-sgsplitt__row">
            <span className="ak-sgsplitt__dot" style={{ background: ax.color }} />
            <span className="ak-sgsplitt__lbl">{ax.label}</span>
            <div className="ak-sgsplitt__track">
              <div className="ak-sgsplitt__fill" style={{ width: pct, background: ax.color }} />
            </div>
            <span className="ak-sgsplitt__val" style={{ color: valColor }}>{fmtSG(val)}</span>
            <span className="ak-sgsplitt__delta" style={{ color: deltaColor }}>
              {delta != null && (
                <React.Fragment>
                  <Icon name={delta >= 0 ? "arrow-up-right" : "arrow-down-right"} size={11} />
                  {Math.abs(delta).toFixed(1).replace(".", ",")}
                </React.Fragment>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
