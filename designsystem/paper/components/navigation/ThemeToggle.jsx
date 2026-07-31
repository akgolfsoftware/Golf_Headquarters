import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-tmode{--hit:32px;--floor:0px;display:inline-flex;align-items:center;gap:7px;height:max(var(--hit),var(--floor));padding:0 11px;border-radius:var(--r-pill);border:1px solid var(--border);background:transparent;color:var(--muted);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:color var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.akhq-tmode:hover{color:var(--fg);border-color:color-mix(in srgb,var(--fg) 22%,var(--border))}
.akhq-tmode:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-tmode-dot{width:8px;height:8px;border-radius:50%;background:var(--fg);flex:none}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-tmode{--floor:44px}}
/* Stand-in, samme begrunnelse som Tabs/QuickLinkBar/DropdownMenu (29.07.2026). */
[data-coarse-test] .akhq-tmode{--floor:44px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-tmode")) { const s = document.createElement("style"); s.id = "akhq-css-tmode"; s.textContent = css; document.head.appendChild(s); }
export function ThemeToggle({ storageKey = "akhq-theme-agencyos", target, dataOdId = "cta-tema", ...rest }) {
  const [mode, setMode] = React.useState("light");
  const el = () => (target && document.querySelector(target)) || document.documentElement;
  React.useEffect(() => {
    let lagret = null;
    try { lagret = localStorage.getItem(storageKey); } catch (e) {}
    const start = lagret === "dark" || lagret === "light" ? lagret : (el().getAttribute("data-theme") === "dark" ? "dark" : "light");
    setMode(start);
    if (start === "dark") el().setAttribute("data-theme", "dark"); else el().removeAttribute("data-theme");
  }, [storageKey]);
  const bytt = () => {
    const neste = mode === "dark" ? "light" : "dark";
    setMode(neste);
    if (neste === "dark") el().setAttribute("data-theme", "dark"); else el().removeAttribute("data-theme");
    try { localStorage.setItem(storageKey, neste); } catch (e) {}
  };
  return (
    <button type="button" className="akhq-tmode" onClick={bytt} aria-pressed={mode === "dark"} data-od-id={dataOdId} {...rest}>
      <span className="akhq-tmode-dot" aria-hidden="true"></span>
      {mode === "dark" ? "Mørk" : "Lys"}
    </button>
  );
}
