import React from "react";

/**
 * AK Golf HQ — Tag & CountBadge
 * Mono-caps status pill (AKTIV / FERDIG / PÅ VEI), category mark (A–K),
 * lime signal tag, neutral and outline. CountBadge is the small counter.
 * Radius 8 (var(--radius-tag)).
 */

const CSS = `
@keyframes ak-tag-pulse{0%,100%{opacity:1}50%{opacity:.35}}
.ak-tag{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);
  font-weight:600;line-height:1;letter-spacing:.08em;text-transform:uppercase;
  border-radius:var(--radius-tag);border:1px solid transparent;white-space:nowrap;
  transition:background var(--dur-base) var(--ease-standard),
    color var(--dur-base) var(--ease-standard),
    border-color var(--dur-base) var(--ease-standard);}
.ak-tag--sm{height:20px;padding:0 7px;font-size:10px;}
.ak-tag--md{height:24px;padding:0 9px;font-size:var(--text-11);}
.ak-tag__dot{width:6px;height:6px;border-radius:9999px;background:currentColor;flex:none;}
.ak-tag--live .ak-tag__dot{animation:ak-tag-pulse 1.6s var(--ease-standard) infinite;}
.ak-badge{display:inline-flex;align-items:center;justify-content:center;
  font-family:var(--font-mono);font-weight:600;font-size:var(--text-11);
  min-width:20px;height:20px;padding:0 6px;border-radius:9999px;line-height:1;
  font-variant-numeric:tabular-nums;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-tag-css")) {
  const el = document.createElement("style");
  el.id = "ak-tag-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

const VARIANTS = {
  neutral: { background: "var(--surface-2)", color: "var(--text-2)", borderColor: "var(--border)" },
  outline: { background: "transparent", color: "var(--text-2)", borderColor: "var(--border-strong)" },
  signal: { background: "var(--signal)", color: "var(--on-signal)", borderColor: "transparent" },
  up: { background: "color-mix(in srgb, var(--up) 15%, transparent)", color: "var(--up)", borderColor: "transparent" },
  down: { background: "color-mix(in srgb, var(--down) 16%, transparent)", color: "var(--down)", borderColor: "transparent" },
  live: { background: "color-mix(in srgb, var(--up) 14%, transparent)", color: "var(--up)", borderColor: "transparent" },
};

export function Tag({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  const showDot = dot || variant === "live";
  return (
    <span
      className={`ak-tag ak-tag--${size} ${variant === "live" ? "ak-tag--live" : ""} ${className}`}
      style={{ ...v, ...style }}
      {...rest}
    >
      {showDot && <span className="ak-tag__dot" />}
      {children}
    </span>
  );
}

/** Small counter badge for queues / nav. tone: "signal" | "neutral". */
export function CountBadge({ count, tone = "neutral", className = "", style, ...rest }) {
  const tones =
    tone === "signal"
      ? { background: "var(--signal)", color: "var(--on-signal)" }
      : { background: "var(--surface-hover)", color: "var(--text)" };
  return (
    <span className={`ak-badge ${className}`} style={{ ...tones, ...style }} {...rest}>
      {count}
    </span>
  );
}
