import React from "react";
import { Icon } from "../core/Icon.jsx";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — AgendaRow
 * One agenda line: time on the left, a hairline block on the right with a
 * leading icon, title + subtitle and a duration. Discipline note: blocks are
 * neutral; the live/now session gets the lime accent + a pulsing dot (lime is a
 * signal, not a per-category palette).
 */

const CSS = `
@keyframes ak-agenda-pulse{0%,100%{opacity:1}50%{opacity:.35}}
.ak-agenda{display:flex;gap:14px;align-items:stretch;}
.ak-agenda__time{flex:none;width:52px;padding-top:14px;text-align:right;
  font-family:var(--font-mono);font-size:var(--text-12);font-weight:500;
  color:var(--text-muted);font-variant-numeric:tabular-nums;}
.ak-agenda__block{flex:1;display:flex;align-items:center;gap:12px;min-width:0;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-input);
  padding:12px 14px;border-left:3px solid var(--border-strong);
  transition:border-color var(--dur-fast) var(--ease-standard),background var(--dur-fast) var(--ease-standard);}
.ak-agenda--interactive .ak-agenda__block{cursor:pointer;}
.ak-agenda--interactive .ak-agenda__block:hover{background:var(--surface-hover);}
.ak-agenda--live .ak-agenda__block{border-left-color:var(--signal);
  background:color-mix(in srgb,var(--signal) 7%,var(--surface));}
.ak-agenda--done .ak-agenda__block{opacity:.62;}
.ak-agenda__ic{display:flex;align-items:center;justify-content:center;width:32px;height:32px;
  border-radius:9px;flex:none;background:var(--surface-2);color:var(--text-2);}
.ak-agenda--live .ak-agenda__ic{background:color-mix(in srgb,var(--signal) 16%,transparent);color:var(--signal);}
.ak-agenda__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
.ak-agenda__title{font-size:var(--text-14);font-weight:600;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:8px;}
.ak-agenda__sub{font-size:var(--text-12);color:var(--text-muted);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ak-agenda__dur{flex:none;font-family:var(--font-mono);font-size:var(--text-12);
  color:var(--text-2);font-variant-numeric:tabular-nums;}
.ak-agenda__live{width:7px;height:7px;border-radius:9999px;background:var(--signal);
  animation:ak-agenda-pulse 1.6s var(--ease-standard) infinite;flex:none;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-agenda-css")) {
  const el = document.createElement("style");
  el.id = "ak-agenda-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function AgendaRow({
  time,
  icon = "dumbbell",
  title,
  subtitle,
  duration,
  state = "upcoming", // "upcoming" | "live" | "done"
  akFormel, // { arena, trinn, cs, axis } — valgfritt AK-formel-sammendrag i hover
  onClick,
  className = "",
  style,
  ...rest
}) {
  const interactive = !!onClick;
  const [hover, setHover] = React.useState(false);
  const akRows = akFormel
    ? [
        akFormel.axis ? { label: akFormel.axis, value: akFormel.cs || "—" } : null,
        akFormel.arena != null ? { label: "Arena", value: akFormel.arena } : null,
        akFormel.trinn != null ? { label: "Trinn", value: akFormel.trinn } : null,
      ].filter(Boolean)
    : [];
  const cls = [
    "ak-agenda",
    state === "live" ? "ak-agenda--live" : "",
    state === "done" ? "ak-agenda--done" : "",
    interactive ? "ak-agenda--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} style={style} {...rest}>
      <div className="ak-agenda__time">{time}</div>
      <div
        className="ak-agenda__block"
        onClick={onClick}
        role={interactive ? "button" : undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ position: "relative" }}
      >
        <span className="ak-agenda__ic">
          {state === "done" ? <Icon name="check" size={18} /> : typeof icon === "string" ? <Icon name={icon} size={18} /> : icon}
        </span>
        <div className="ak-agenda__body">
          <div className="ak-agenda__title">
            {title}
            {state === "live" && <span className="ak-agenda__live" />}
          </div>
          {subtitle != null && <div className="ak-agenda__sub">{subtitle}</div>}
        </div>
        {duration != null && <div className="ak-agenda__dur">{duration}</div>}
        {akRows.length > 0 && (
          <DataPreview visible={hover} x="22%" y={-4} placement="top" label={title} rows={akRows} />
        )}
      </div>
    </div>
  );
}
