import React from "react";
import { Icon } from "./Icon.jsx";

/**
 * AK Golf HQ — ThemeToggle
 * Tre-veis utseende-velger: System · Lys · Mørk. Skriver `.light`/`.dark`-klasse,
 * `data-theme` og `color-scheme` på et mål (default <html>). «System» følger
 * `prefers-color-scheme` live. Segmentert pille — nøytral, aldri lime (kanon:
 * en toggle er ikke et signal). Respekterer `prefers-reduced-motion`.
 *
 * Plassering (dokumentert): AgencyOS — i toppbar/kontoområde (default mørk).
 * PlayerHQ — under Meg › Innstillinger › Utseende (default lys).
 */

const CSS = `
.ak-theme{display:inline-flex;align-items:center;gap:2px;flex:none;
  padding:3px;background:var(--surface-2);border:1px solid var(--border);
  border-radius:var(--radius-pill);}
.ak-theme__opt{display:inline-flex;align-items:center;gap:6px;flex:none;
  border:none;cursor:pointer;background:transparent;color:var(--text-muted);
  border-radius:var(--radius-pill);font-family:var(--font-ui);
  font-weight:var(--weight-semibold);line-height:1;
  transition:background var(--dur-base) var(--ease-standard),
             color var(--dur-base) var(--ease-standard);}
.ak-theme--md .ak-theme__opt{padding:6px 12px;font-size:var(--text-13);}
.ak-theme--sm .ak-theme__opt{padding:5px 9px;font-size:var(--text-12);}
.ak-theme--icon .ak-theme__opt{padding:7px;}
.ak-theme__opt:hover{color:var(--text-2);}
.ak-theme__opt:focus-visible{outline:none;box-shadow:0 0 0 2px var(--focus-ring);}
.ak-theme__opt.is-active{background:var(--surface);color:var(--text);
  box-shadow:var(--sheen-top);}
.ak-theme__opt.is-active svg{color:var(--text);}
@media (prefers-reduced-motion: reduce){.ak-theme__opt{transition:none;}}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-theme-css")) {
  const el = document.createElement("style");
  el.id = "ak-theme-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

const OPTS = [
  { id: "system", icon: "monitor", label: "System" },
  { id: "light", icon: "sun", label: "Lys" },
  { id: "dark", icon: "moon", label: "Mørk" },
];

function prefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}
function resolveTheme(value) {
  return value === "system" ? (prefersDark() ? "dark" : "light") : value;
}
function applyTheme(el, resolved) {
  if (!el) return;
  el.classList.remove("light", "dark");
  el.classList.add(resolved);
  el.setAttribute("data-theme", resolved);
  el.style.colorScheme = resolved;
}

export function ThemeToggle({
  value,
  defaultValue = "system",
  onChange,
  target,
  apply = true,
  storageKey,
  size = "md",
  visEtiketter = true,
  className = "",
  style,
  ...rest
}) {
  const controlled = value !== undefined;
  const [internal, setInternal] = React.useState(() => {
    if (storageKey && typeof localStorage !== "undefined") {
      const s = localStorage.getItem(storageKey);
      if (s === "system" || s === "light" || s === "dark") return s;
    }
    return defaultValue;
  });
  const current = controlled ? value : internal;

  const getTarget = React.useCallback(() => {
    if (typeof document === "undefined") return null;
    if (!target) return document.documentElement;
    if (typeof target === "string") return document.querySelector(target);
    return target;
  }, [target]);

  React.useEffect(() => {
    if (!apply) return undefined;
    applyTheme(getTarget(), resolveTheme(current));
    if (current === "system" && typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const fn = () => applyTheme(getTarget(), resolveTheme("system"));
      mq.addEventListener("change", fn);
      return () => mq.removeEventListener("change", fn);
    }
    return undefined;
  }, [current, apply, getTarget]);

  const select = (id) => {
    if (!controlled) setInternal(id);
    if (storageKey && typeof localStorage !== "undefined") {
      localStorage.setItem(storageKey, id);
    }
    if (onChange) onChange(id, resolveTheme(id));
  };

  const icon = size === "sm" ? 15 : 16;
  const iconOnly = !visEtiketter;

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={`ak-theme ak-theme--${size}${iconOnly ? " ak-theme--icon" : ""} ${className}`}
      style={style}
      {...rest}
    >
      {OPTS.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={current === o.id}
          aria-label={o.label}
          title={o.label}
          className={`ak-theme__opt${current === o.id ? " is-active" : ""}`}
          onClick={() => select(o.id)}
        >
          <Icon name={o.icon} size={icon} />
          {!iconOnly && <span>{o.label}</span>}
        </button>
      ))}
    </div>
  );
}
