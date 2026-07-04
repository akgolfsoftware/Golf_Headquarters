import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — DatePicker
 * Input-lik trigger + månedsgrid i popover. Norsk locale (mandagsstart).
 * Tastatur: piltaster flytter dag · PgUp/PgDn måned · Enter velger · Escape lukker.
 * WAI-ARIA grid-pattern med aria-activedescendant. Lukker på klikk utenfor.
 * Kontrollert (value+onChange) eller ukontrollert (defaultValue).
 */

const CSS = `
.ak-dp-wrap{position:relative;display:inline-flex;width:100%;max-width:280px;}
.ak-dp{
  display:flex;align-items:center;gap:8px;width:100%;
  background:var(--surface);border:1px solid var(--border-strong);
  border-radius:var(--radius-input);cursor:pointer;
  font-family:var(--font-ui);color:var(--text);text-align:left;
  transition:border-color var(--dur-fast) var(--ease-standard),
    box-shadow var(--dur-fast) var(--ease-standard);
}
.ak-dp--md{height:40px;font-size:var(--text-14);padding:0 12px;}
.ak-dp--sm{height:32px;font-size:var(--text-13);padding:0 10px;}
.ak-dp:hover{border-color:var(--text-muted);}
.ak-dp[aria-expanded="true"],.ak-dp:focus-visible{outline:none;border-color:var(--signal);box-shadow:var(--glow-signal);}
.ak-dp:disabled{opacity:.38;cursor:not-allowed;}
.ak-dp--error{border-color:var(--error);}
.ak-dp__val{flex:1;min-width:0;font-variant-numeric:tabular-nums;}
.ak-dp__val--ph{color:var(--text-muted);}
.ak-dp__ic{color:var(--text-muted);flex-shrink:0;}
.ak-dp-menu{
  position:absolute;top:calc(100% + 4px);left:0;z-index:250;
  background:var(--surface-2);border:1px solid var(--border-strong);
  border-radius:var(--radius-card);box-shadow:var(--shadow-popover);
  padding:12px;width:280px;
  animation:ak-dp-in var(--dur-fast) var(--ease-out);
}
.ak-dp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.ak-dp-head__lbl{
  font-family:var(--font-display);font-size:var(--text-14);
  font-weight:var(--weight-semibold);color:var(--text);
}
.ak-dp-head__btn{
  display:flex;align-items:center;justify-content:center;
  width:28px;height:28px;border-radius:var(--radius-input);
  background:transparent;border:none;cursor:pointer;color:var(--text-muted);
  transition:background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard);
}
.ak-dp-head__btn:hover{background:var(--surface-hover);color:var(--text);}
.ak-dp-head__btn:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-dp-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.ak-dp-wd{
  font-family:var(--font-mono);font-size:10px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);
  text-align:center;padding:4px 0 6px;
}
.ak-dp-day{
  position:relative;display:flex;align-items:center;justify-content:center;
  height:32px;border-radius:var(--radius-input);border:none;background:transparent;
  font-family:var(--font-mono);font-size:var(--text-13);
  font-variant-numeric:tabular-nums;color:var(--text-2);cursor:pointer;
  transition:background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard);
}
.ak-dp-day:hover{background:var(--surface-hover);color:var(--text);}
.ak-dp-day--out{color:var(--text-muted);opacity:.45;}
.ak-dp-day--today::after{
  content:"";position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
  width:3px;height:3px;border-radius:50%;background:var(--signal);
}
.ak-dp-day--sel{background:var(--primary-fill);color:var(--primary-text);font-weight:600;}
.ak-dp-day--sel:hover{background:var(--primary-fill);color:var(--primary-text);}
.ak-dp-day--active{box-shadow:inset 0 0 0 1px var(--signal);}
.ak-dp-day:disabled{opacity:.25;cursor:not-allowed;}
@keyframes ak-dp-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-dp-css")) {
  const s = document.createElement("style");
  s.id = "ak-dp-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const MND = ["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"];
const UKEDAG = ["ma","ti","on","to","fr","lø","sø"];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const fmt = (s) => { const d = parse(s); return `${d.getDate()}. ${MND[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };

/** Alle celler (42) for måneds-grid med mandagsstart. */
function gridDays(year, month) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // man=0
  const start = new Date(year, month, 1 - lead);
  return Array.from({ length: 42 }, (_, i) =>
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export function DatePicker({
  value: controlled,
  defaultValue,
  onChange,
  min,
  max,
  placeholder = "Velg dato…",
  size = "md",
  disabled = false,
  error = false,
  className = "",
  style,
}) {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = controlled !== undefined ? controlled : internal;
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(() => {
    const d = value ? parse(value) : new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [active, setActive] = React.useState(null); // ISO for tastatur-fokusert dag
  const ref = React.useRef(null);
  const gridId = React.useId();

  const inRange = (d) => (!min || iso(d) >= min) && (!max || iso(d) <= max);

  const pick = (d) => {
    const v = iso(d);
    if (controlled === undefined) setInternal(v);
    if (onChange) onChange(v);
    setOpen(false);
  };

  const openMenu = () => {
    const d = value ? parse(value) : new Date();
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setActive(iso(d));
    setOpen(true);
  };

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const move = (days) => {
    const d = parse(active || iso(new Date()));
    d.setDate(d.getDate() + days);
    setActive(iso(d));
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };
  const moveMonth = (n) => {
    const d = parse(active || iso(new Date()));
    d.setMonth(d.getMonth() + n);
    setActive(iso(d));
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); openMenu(); }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-7); }
    else if (e.key === "ArrowDown") { e.preventDefault(); move(7); }
    else if (e.key === "PageUp") { e.preventDefault(); moveMonth(-1); }
    else if (e.key === "PageDown") { e.preventDefault(); moveMonth(1); }
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (active) { const d = parse(active); if (inRange(d)) pick(d); }
    } else if (e.key === "Tab") { setOpen(false); }
  };

  const todayIso = iso(new Date());
  const days = gridDays(view.y, view.m);

  return (
    <div className={`ak-dp-wrap ${className}`} style={style} ref={ref}>
      <button
        type="button"
        className={`ak-dp ak-dp--${size}${error ? " ak-dp--error" : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? gridId : undefined}
        aria-activedescendant={open && active ? `${gridId}-${active}` : undefined}
        disabled={disabled}
        onKeyDown={onKeyDown}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <Icon name="calendar" size={15} className="ak-dp__ic" />
        <span className={`ak-dp__val${!value ? " ak-dp__val--ph" : ""}`}>
          {value ? fmt(value) : placeholder}
        </span>
        <Icon name="chevron-down" size={14} className="ak-dp__ic" />
      </button>
      {open && (
        <div className="ak-dp-menu" role="dialog" aria-label="Velg dato">
          <div className="ak-dp-head">
            <button type="button" className="ak-dp-head__btn" aria-label="Forrige måned"
              onClick={() => setView((v) => ({ y: v.m === 0 ? v.y - 1 : v.y, m: (v.m + 11) % 12 }))}>
              <Icon name="chevron-left" size={16} />
            </button>
            <span className="ak-dp-head__lbl" aria-live="polite">{MND[view.m]} {view.y}</span>
            <button type="button" className="ak-dp-head__btn" aria-label="Neste måned"
              onClick={() => setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: (v.m + 1) % 12 }))}>
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
          <div className="ak-dp-grid" role="grid" id={gridId}>
            {UKEDAG.map((d) => <span key={d} className="ak-dp-wd" role="columnheader">{d}</span>)}
            {days.map((d) => {
              const v = iso(d);
              const out = d.getMonth() !== view.m;
              const sel = v === value;
              const ok = inRange(d);
              return (
                <button
                  key={v}
                  type="button"
                  id={`${gridId}-${v}`}
                  role="gridcell"
                  tabIndex={-1}
                  aria-selected={sel || undefined}
                  aria-label={`${d.getDate()}. ${MND[d.getMonth()]} ${d.getFullYear()}`}
                  className={`ak-dp-day${out ? " ak-dp-day--out" : ""}${v === todayIso ? " ak-dp-day--today" : ""}${sel ? " ak-dp-day--sel" : ""}${v === active ? " ak-dp-day--active" : ""}`}
                  disabled={!ok}
                  onMouseEnter={() => setActive(v)}
                  onClick={() => pick(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
