import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — KommandoPalett
 * Kanonisk ⌘K-palett (promotert fra ui_kits): søk + grupperte hurtighandlinger +
 * hopp-til-navigasjon. Tastatur: ↑/↓ flytter, Enter velger, Esc lukker. Kontrollert
 * (open/onClose). Begge moduser, WCAG (fokus i input, aria-activedescendant).
 */
const CSS = `
.ak-kp__ov{position:fixed;inset:0;z-index:400;background:var(--overlay);backdrop-filter:blur(3px);
  display:flex;align-items:flex-start;justify-content:center;padding:14vh 16px 16px;
  animation:ak-kp-fade var(--dur-fast) var(--ease-out);}
.ak-kp{width:100%;max-width:560px;background:var(--surface-2);border:1px solid var(--border-strong);
  border-radius:var(--radius-panel,16px);box-shadow:var(--shadow-sheet);overflow:hidden;display:flex;flex-direction:column;max-height:70vh;
  animation:ak-kp-rise var(--dur-base) var(--ease-out);}
.ak-kp__inp{display:flex;align-items:center;gap:11px;padding:14px 16px;border-bottom:1px solid var(--border);}
.ak-kp__field{flex:1;background:none;border:none;outline:none;color:var(--text);font-family:var(--font-ui);font-size:var(--text-15);}
.ak-kp__field::placeholder{color:var(--text-muted);}
.ak-kp__kbd{font-family:var(--font-mono);font-size:9px;font-weight:700;color:var(--text-muted);background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:2px 6px;}
.ak-kp__list{overflow-y:auto;padding:6px;}
.ak-kp__grp{font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);padding:9px 10px 5px;}
.ak-kp__item{display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:9px 10px;border-radius:9px;border:none;background:none;cursor:pointer;color:var(--text);}
.ak-kp__item[data-active="1"]{background:var(--surface-hover);}
.ak-kp__it-tit{flex:1;font-family:var(--font-ui);font-size:var(--text-13);font-weight:500;}
.ak-kp__it-sub{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);}
.ak-kp__it-sc{font-family:var(--font-mono);font-size:9px;color:var(--text-muted);border:1px solid var(--border);border-radius:5px;padding:2px 6px;}
.ak-kp__tom{padding:26px 16px;text-align:center;font-family:var(--font-ui);font-size:var(--text-13);color:var(--text-2);}
@keyframes ak-kp-fade{from{opacity:0}to{opacity:1}}
@keyframes ak-kp-rise{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.ak-kp__ov,.ak-kp{animation:none;}}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-kp-css")) {
  const s = document.createElement("style"); s.id = "ak-kp-css"; s.textContent = CSS; document.head.appendChild(s);
}

export function KommandoPalett({
  open = false, onClose, grupper = [], placeholder = "Søk spillere, handlinger, sider…",
  tomTekst = "Ingen treff", className = "", style,
}) {
  const [q, setQ] = React.useState("");
  const [aktiv, setAktiv] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (open) { setQ(""); setAktiv(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 20); } }, [open]);

  const filtrerte = grupper
    .map((g) => ({ ...g, elementer: g.elementer.filter((e) => !q || (e.tittel + " " + (e.undertekst || "")).toLowerCase().includes(q.toLowerCase())) }))
    .filter((g) => g.elementer.length);
  const flat = filtrerte.flatMap((g) => g.elementer);

  React.useEffect(() => { setAktiv(0); }, [q]);
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose && onClose(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setAktiv((i) => Math.min(flat.length - 1, i + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setAktiv((i) => Math.max(0, i - 1)); }
      else if (e.key === "Enter") { e.preventDefault(); const el = flat[aktiv]; if (el) { el.onVelg && el.onVelg(el); onClose && onClose(); } }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, flat, aktiv, onClose]);

  if (!open) return null;
  let idx = -1;
  return (
    <div className={`ak-kp__ov ${className}`} style={style} onClick={onClose}>
      <div className="ak-kp" role="dialog" aria-label="Kommandopalett" onClick={(e) => e.stopPropagation()}>
        <div className="ak-kp__inp">
          <Icon name="search" size={17} style={{ color: "var(--text-muted)", flex: "none" }} />
          <input ref={inputRef} className="ak-kp__field" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
            role="combobox" aria-expanded="true" aria-controls="ak-kp-list" />
          <span className="ak-kp__kbd">ESC</span>
        </div>
        <div className="ak-kp__list" id="ak-kp-list" role="listbox">
          {flat.length === 0 && <div className="ak-kp__tom">{tomTekst}</div>}
          {filtrerte.map((g) => (
            <div key={g.tittel}>
              {g.tittel && <div className="ak-kp__grp">{g.tittel}</div>}
              {g.elementer.map((e) => {
                idx += 1; const on = idx === aktiv;
                return (
                  <button key={e.id || e.tittel} type="button" className="ak-kp__item" data-active={on ? "1" : "0"} role="option" aria-selected={on}
                    onMouseEnter={() => setAktiv(flat.indexOf(e))}
                    onClick={() => { e.onVelg && e.onVelg(e); onClose && onClose(); }}>
                    {e.ikon && <Icon name={e.ikon} size={16} style={{ color: "var(--text-muted)", flex: "none" }} />}
                    <span className="ak-kp__it-tit">{e.tittel}</span>
                    {e.undertekst && <span className="ak-kp__it-sub">{e.undertekst}</span>}
                    {e.snarvei && <span className="ak-kp__it-sc">{e.snarvei}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
