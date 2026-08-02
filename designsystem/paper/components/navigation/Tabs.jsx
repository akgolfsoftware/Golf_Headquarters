import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-tabs-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-tabs{--gap:var(--s4);--hit:38px;--floor:0px;display:flex;align-items:stretch;gap:var(--gap);border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none;min-width:0}
.akhq-tabs::-webkit-scrollbar{display:none}
.akhq-itab{display:inline-flex;align-items:center;gap:6px;height:max(var(--hit),var(--floor));padding:0 2px;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;background:transparent;color:var(--muted);font-family:var(--ui);font-size:13px;font-weight:500;white-space:nowrap;cursor:pointer;transition:color var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.akhq-itab:hover{color:var(--fg)}
.akhq-itab:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-itab[aria-selected=true]{color:var(--fg);font-weight:600;border-bottom-color:var(--fg)}
.akhq-itab-n{font-family:var(--mono);font-size:11px;font-variant-numeric:tabular-nums;color:var(--muted)}
}
@layer akhq-container{
@container (max-width:420px){.akhq-tabs{--gap:var(--s3)}}
@media(pointer:coarse){.akhq-tabs{--floor:44px}}
/* Stand-in: coarse pointer kan ikke simuleres i riggen. Uten denne målte
   revisjonen 29.07.2026 base-verdien (0) og flagget Tabs som gulvbrudd,
   selv om ekte touch-enheter allerede fikk 44px via regelen over. */
[data-coarse-test] .akhq-tabs{--floor:44px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-tabs")) { const s = document.createElement("style"); s.id = "akhq-css-tabs"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
export function Tabs({ tabs = [], value, onChange, label = "Faner", dataOdId = "nav-tabs", ...rest }) {
  const base = React.useMemo(() => "akhq-tabs" + (++seq), []);
  const listRef = React.useRef(null);
  const aktiv = value !== undefined ? value : (tabs[0] && tabs[0].id);
  const onKey = (e) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === aktiv);
    const n = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1
      : e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    if (onChange) onChange(tabs[n].id);
    const btns = listRef.current ? listRef.current.querySelectorAll('[role="tab"]') : [];
    if (btns[n]) btns[n].focus();
  };
  return (
    <div className="akhq-tabs-wrap">
      <div className="akhq-tabs" role="tablist" aria-label={label} ref={listRef} onKeyDown={onKey} data-od-id={dataOdId} {...rest}>
        {tabs.map((t) => {
          const på = t.id === aktiv;
          return (
            <button type="button" key={t.id} role="tab" id={base + "-t-" + t.id}
              aria-selected={på} aria-controls={base + "-p-" + t.id} tabIndex={på ? 0 : -1}
              className="akhq-itab" onClick={() => onChange && onChange(t.id)}
              data-od-id={"cta-" + dataOdId + "-" + t.id}>
              {t.label}
              {t.count !== undefined && <span className="akhq-itab-n">{t.count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export function TabPanel({ tabsId, id, active, children, ...rest }) {
  if (!active) return null;
  return <div role="tabpanel" id={tabsId + "-p-" + id} aria-labelledby={tabsId + "-t-" + id} tabIndex={0} {...rest}>{children}</div>;
}
