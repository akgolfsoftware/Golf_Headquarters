import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — Select
 * Custom dropdown. Single-select with a floating menu.
 * Sizes: sm / md / lg. Controlled (value + onChange) or uncontrolled.
 */

const CSS = `
.ak-sel-wrap{position:relative;width:100%;}
.ak-sel{
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  width:100%;height:40px;padding:0 12px;
  background:var(--surface);border:1px solid var(--border-strong);
  border-radius:var(--radius-input);
  font-family:var(--font-ui);font-size:var(--text-14);color:var(--text);
  cursor:pointer;user-select:none;text-align:left;
  transition:border-color var(--dur-fast) var(--ease-standard),
    box-shadow var(--dur-fast) var(--ease-standard);
}
.ak-sel:hover{border-color:var(--text-muted);}
.ak-sel:focus-visible{outline:none;border-color:var(--signal);box-shadow:var(--glow-signal);}
.ak-sel[aria-expanded="true"]{border-color:var(--signal);box-shadow:var(--glow-signal);}
.ak-sel:disabled{opacity:.38;cursor:not-allowed;}
.ak-sel--sm{height:32px;font-size:var(--text-13);padding:0 10px;}
.ak-sel--lg{height:48px;font-size:var(--text-16);padding:0 16px;}
.ak-sel__val{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ak-sel__val--ph{color:var(--text-muted);}
.ak-sel__ic{color:var(--text-muted);flex-shrink:0;
  transition:transform var(--dur-fast) var(--ease-standard);}
.ak-sel[aria-expanded="true"] .ak-sel__ic{transform:rotate(180deg);}
.ak-sel-menu{
  position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:250;
  background:var(--surface-2);border:1px solid var(--border-strong);
  border-radius:var(--radius-card);box-shadow:var(--shadow-popover);
  overflow:hidden;max-height:240px;overflow-y:auto;
  animation:ak-modal-fadein var(--dur-fast) var(--ease-out);
}
.ak-sel-opt{
  display:flex;align-items:center;gap:10px;
  padding:9px 12px;cursor:pointer;
  font-size:var(--text-14);color:var(--text-2);
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-sel-opt:hover{background:var(--surface-hover);}
.ak-sel-opt--active{background:var(--surface-hover);}
.ak-sel-opt[aria-selected="true"]{color:var(--text);font-weight:500;}
.ak-sel-opt__chk{color:var(--signal);flex-shrink:0;width:14px;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-sel-css")) {
  const s = document.createElement("style");
  s.id = "ak-sel-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Select({
  options = [],
  value,
  onChange,
  placeholder = "Velg…",
  size = "md",
  disabled = false,
  className = "",
  style,
}) {
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const ref = React.useRef(null);
  const listId = React.useId();
  const selected = options.find((o) => (o.value ?? o) === value);

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const optVal = (o) => o.value ?? o;
  const optLbl = (o) => o.label ?? o;

  const openMenu = () => {
    setActiveIdx(options.findIndex((o) => optVal(o) === value));
    setOpen(true);
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); openMenu(); }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Home") { e.preventDefault(); setActiveIdx(0); }
    else if (e.key === "End") { e.preventDefault(); setActiveIdx(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIdx >= 0) { onChange && onChange(optVal(options[activeIdx])); }
      setOpen(false);
    } else if (e.key === "Tab") { setOpen(false); }
  };

  return (
    <div className={`ak-sel-wrap ${className}`} style={style} ref={ref}>
      <button
        type="button"
        className={`ak-sel ak-sel--${size}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeIdx >= 0 ? `${listId}-${activeIdx}` : undefined}
        onKeyDown={onKeyDown}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <span className={`ak-sel__val${!selected ? " ak-sel__val--ph" : ""}`}>
          {selected ? optLbl(selected) : placeholder}
        </span>
        <Icon name="chevron-down" size={15} className="ak-sel__ic" />
      </button>
      {open && (
        <div className="ak-sel-menu" role="listbox" id={listId}>
          {options.map((opt, i) => {
            const v = optVal(opt);
            const sel = v === value;
            return (
              <div
                key={i}
                id={`${listId}-${i}`}
                className={`ak-sel-opt${i === activeIdx ? " ak-sel-opt--active" : ""}`}
                role="option"
                aria-selected={sel}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => { onChange && onChange(v); setOpen(false); }}
              >
                <span className="ak-sel-opt__chk">
                  {sel && <Icon name="check" size={14} />}
                </span>
                {optLbl(opt)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
