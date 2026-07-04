import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — Combobox
 * Searchable select. Type to filter options; pick one to set the value.
 * Controlled: value + onChange. options: [{value, label}] or string[].
 */

const CSS = `
.ak-combo-wrap{position:relative;width:100%;}
.ak-combo-row{position:relative;display:flex;align-items:center;}
.ak-combo-input{
  width:100%;height:40px;padding:0 36px 0 12px;
  background:var(--surface);border:1px solid var(--border-strong);
  border-radius:var(--radius-input);
  font-family:var(--font-ui);font-size:var(--text-14);color:var(--text);
  outline:none;
  transition:border-color var(--dur-fast) var(--ease-standard),
    box-shadow var(--dur-fast) var(--ease-standard);
}
.ak-combo-input::placeholder{color:var(--text-muted);}
.ak-combo-input:hover{border-color:var(--text-muted);}
.ak-combo-input:focus{border-color:var(--signal);box-shadow:var(--glow-signal);}
.ak-combo-input:disabled{opacity:.38;cursor:not-allowed;}
.ak-combo-ic{position:absolute;right:12px;color:var(--text-muted);pointer-events:none;}
.ak-combo-menu{
  position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:250;
  background:var(--surface-2);border:1px solid var(--border-strong);
  border-radius:var(--radius-card);box-shadow:var(--shadow-popover);
  overflow:hidden;max-height:220px;overflow-y:auto;
  animation:ak-modal-fadein var(--dur-fast) var(--ease-out);
}
.ak-combo-opt{
  padding:9px 12px;cursor:pointer;
  font-size:var(--text-14);color:var(--text-2);
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-combo-opt:hover{background:var(--surface-hover);}
.ak-combo-opt--active{background:var(--surface-hover);}
.ak-combo-opt[aria-selected="true"]{color:var(--text);font-weight:500;}
.ak-combo-empty{padding:12px;font-size:var(--text-13);color:var(--text-muted);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-combo-css")) {
  const s = document.createElement("style");
  s.id = "ak-combo-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Combobox({
  options = [],
  value,
  onChange,
  placeholder = "Søk…",
  disabled = false,
  className = "",
  style,
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const ref = React.useRef(null);
  const listId = React.useId();

  const optVal = (o) => o.value ?? o;
  const optLbl = (o) => o.label ?? o;
  const selected = options.find((o) => optVal(o) === value);

  const filtered = query.trim()
    ? options.filter((o) => optLbl(o).toLowerCase().includes(query.toLowerCase()))
    : options;

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const displayValue = open ? query : (selected ? optLbl(selected) : "");

  const pick = (opt) => {
    onChange && onChange(optVal(opt));
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActiveIdx(0); }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); setQuery(""); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && filtered[activeIdx]) pick(filtered[activeIdx]);
    } else if (e.key === "Tab") { setOpen(false); }
  };

  return (
    <div className={`ak-combo-wrap ${className}`} style={style} ref={ref}>
      <div className="ak-combo-row">
        <input
          className="ak-combo-input"
          type="text"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && activeIdx >= 0 ? `${listId}-${activeIdx}` : undefined}
          onKeyDown={onKeyDown}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIdx(0); }}
          onFocus={() => { setOpen(true); setQuery(""); }}
        />
        <Icon name="search" size={16} className="ak-combo-ic" />
      </div>
      {open && (
        <div className="ak-combo-menu" role="listbox" id={listId}>
          {filtered.length === 0 ? (
            <div className="ak-combo-empty">Ingen treff</div>
          ) : (
            filtered.map((opt, i) => {
              const v = optVal(opt);
              return (
                <div
                  key={i}
                  id={`${listId}-${i}`}
                  className={`ak-combo-opt${i === activeIdx ? " ak-combo-opt--active" : ""}`}
                  role="option"
                  aria-selected={v === value}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => pick(opt)}
                >
                  {optLbl(opt)}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
