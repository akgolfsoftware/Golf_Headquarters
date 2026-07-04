import React from "react";
import { Eyebrow } from "./Eyebrow.jsx";

/**
 * AK Golf HQ — Card
 * The hairline base card: surface just lighter than bg + 1px border, radius 16,
 * no shadow. Optional header (eyebrow + title + action), body, footer.
 * `compact` tightens padding for dense data; `interactive` adds a hover lift.
 */

const CSS = `
.ak-card{background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);color:var(--text);
  box-shadow:var(--sheen-top);
  display:flex;flex-direction:column;}
.ak-card--interactive{cursor:pointer;transition:border-color var(--dur-base) var(--ease-standard),
  background var(--dur-base) var(--ease-standard),box-shadow var(--dur-base) var(--ease-standard);}
.ak-card--interactive:hover{border-color:var(--border-strong);background:var(--surface-hover);
  box-shadow:var(--sheen-top-lg);}
.ak-card--interactive:active{transform:scale(.995);
  transition:transform var(--dur-fast) var(--ease-standard);}
.ak-card--interactive:focus-visible{outline:none;border-color:var(--signal);
  box-shadow:var(--sheen-top),var(--glow-signal);}
.ak-card__head{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-4);}
.ak-card__title{font-family:var(--font-display);font-weight:600;
  letter-spacing:var(--tracking-tight);line-height:var(--leading-snug);
  color:var(--text);margin:0;}
.ak-card__action{flex:none;margin-top:-2px;}
.ak-card__foot{margin-top:auto;border-top:1px solid var(--border);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-card-css")) {
  const el = document.createElement("style");
  el.id = "ak-card-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function Card({
  children,
  eyebrow,
  title,
  action,
  footer,
  compact = false,
  interactive = false,
  className = "",
  style,
  as: Tag = "div",
  bodyStyle,
  ...rest
}) {
  const pad = compact ? "var(--space-4)" : "var(--space-5)";
  const hasHead = eyebrow != null || title != null || action != null;
  const titleSize = compact ? "var(--text-16)" : "var(--text-18)";
  return (
    <Tag
      className={`ak-card ${interactive ? "ak-card--interactive" : ""} ${className}`}
      style={style}
      {...rest}
    >
      {hasHead && (
        <div className="ak-card__head" style={{ padding: pad, paddingBottom: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
            {eyebrow != null && <Eyebrow>{eyebrow}</Eyebrow>}
            {title != null && (
              <h3 className="ak-card__title" style={{ fontSize: titleSize }}>
                {title}
              </h3>
            )}
          </div>
          {action != null && <div className="ak-card__action">{action}</div>}
        </div>
      )}
      <div
        style={{
          padding: pad,
          paddingTop: hasHead ? "var(--space-4)" : pad,
          ...bodyStyle,
        }}
      >
        {children}
      </div>
      {footer != null && (
        <div className="ak-card__foot" style={{ padding: `var(--space-3) ${pad}` }}>
          {footer}
        </div>
      )}
    </Tag>
  );
}
