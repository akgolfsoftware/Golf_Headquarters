import React from "react";
import { Icon } from "./Icon.jsx";

/**
 * AK Golf HQ — Button
 * Full-radius pill. Primary = white pill / dark text on dark (dark pill / white
 * text on light, via tokens). Signal = the one loud lime action. Plus secondary
 * (hairline outline), ghost, and destructive. Sizes sm / md / lg. Icon-only when
 * given an icon and no children.
 */

const CSS = `
.ak-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font-family:var(--font-ui);font-weight:var(--weight-semibold);line-height:1;
  border-radius:var(--radius-pill);border:1px solid transparent;cursor:pointer;
  white-space:nowrap;text-decoration:none;user-select:none;position:relative;
  transition:background var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard),
    border-color var(--dur-fast) var(--ease-standard),
    box-shadow var(--dur-fast) var(--ease-standard),
    transform var(--dur-fast) var(--ease-standard);
}
.ak-btn:active{transform:scale(.98);}
.ak-btn:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-btn[disabled],.ak-btn[aria-disabled="true"]{opacity:.38;pointer-events:none;}
.ak-btn--loading{pointer-events:none;}
.ak-btn--loading>*:not(.ak-btn__spin){opacity:0;}
.ak-btn__spin{position:absolute;width:1em;height:1em;border-radius:9999px;
  border:2px solid currentColor;border-top-color:transparent;
  animation:ak-btn-spin .7s linear infinite;}
@keyframes ak-btn-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion: reduce){.ak-btn__spin{animation-duration:1.6s;}}
.ak-btn--sm{height:32px;padding:0 14px;font-size:var(--text-13);}
.ak-btn--md{height:40px;padding:0 18px;font-size:var(--text-14);}
.ak-btn--lg{height:48px;padding:0 24px;font-size:var(--text-16);}
.ak-btn--icon.ak-btn--sm{width:32px;padding:0;}
.ak-btn--icon.ak-btn--md{width:40px;padding:0;}
.ak-btn--icon.ak-btn--lg{width:48px;padding:0;}
.ak-btn--block{display:flex;width:100%;}
.ak-btn--primary{background:var(--primary-fill);color:var(--primary-text);}
.ak-btn--primary:hover{background:var(--primary-press);}
.ak-btn--signal{background:var(--signal);color:var(--on-signal);}
.ak-btn--signal:hover{background:var(--signal-press);}
.ak-btn--secondary{background:transparent;color:var(--text);border-color:var(--border-strong);}
.ak-btn--secondary:hover{background:var(--surface-hover);border-color:var(--text-muted);}
.ak-btn--secondary:active{background:var(--surface-2);}
.ak-btn--ghost{background:transparent;color:var(--text-2);}
.ak-btn--ghost:hover{background:var(--surface-hover);color:var(--text);}
.ak-btn--destructive{background:var(--destructive);color:var(--on-destructive);}
.ak-btn--destructive:hover{filter:brightness(1.08);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-btn-css")) {
  const el = document.createElement("style");
  el.id = "ak-btn-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

const ICON_SIZE = { sm: 16, md: 18, lg: 20 };

function renderGlyph(glyph, size) {
  if (!glyph) return null;
  if (typeof glyph === "string") return <Icon name={glyph} size={size} />;
  return glyph;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  block = false,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  as,
  ...rest
}) {
  const iconOnly = !children && (iconLeft || iconRight);
  const Tag = as || "button";
  const issz = ICON_SIZE[size] || 18;
  const cls = [
    "ak-btn",
    `ak-btn--${variant}`,
    `ak-btn--${size}`,
    iconOnly ? "ak-btn--icon" : "",
    block ? "ak-btn--block" : "",
    loading ? "ak-btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const tagProps =
    Tag === "button"
      ? { type, disabled: disabled || loading }
      : { "aria-disabled": disabled || loading || undefined };

  return (
    <Tag className={cls} aria-busy={loading || undefined} {...tagProps} {...rest}>
      {loading && <span className="ak-btn__spin" aria-hidden="true"></span>}
      {renderGlyph(iconLeft, issz)}
      {children != null && <span>{children}</span>}
      {renderGlyph(iconRight, issz)}
    </Tag>
  );
}
