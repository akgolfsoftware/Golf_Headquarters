import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-topbar{--pad:var(--s3) 28px;padding:var(--pad);display:flex;align-items:center;justify-content:space-between;gap:var(--s4);min-height:56px;border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--surface) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);position:sticky;top:0;z-index:var(--z-sticky);font-family:var(--ui);box-sizing:border-box}
.akhq-topbar-right{display:flex;align-items:center;gap:var(--s2);flex:none}
/* Gulvet ligger på LABELEN, ikke på inputen: labelen er treffsonen (klikk
   hvor som helst i feltet fokuserer inputen), og inputen strekkes til full
   høyde slik at det målte elementet arver gulvet. Funn 30.07: inputen målte
   20,9px og hadde ingen klasse i det hele tatt. */
.akhq-search{display:flex;align-items:center;gap:var(--s2);padding:0 var(--s3);border:1px solid var(--border);border-radius:var(--r-sm);background:var(--soft);color:var(--muted);min-width:200px;box-sizing:border-box;transition:border-color var(--dur) var(--ease)}
.akhq-search:hover{border-color:color-mix(in srgb,var(--fg) 22%,var(--border))}
.akhq-search:focus-within{outline:2px solid var(--focus);outline-offset:2px}
.akhq-search-in{--h:34px;--floor:0px;height:max(var(--h),var(--floor));min-height:max(var(--h),var(--floor));border:0;background:transparent;color:var(--fg);font:500 12.5px/1 var(--ui);outline:none;width:140px;min-width:0;padding:0;box-sizing:border-box}
.akhq-search-in::placeholder{color:var(--muted);opacity:1}
.akhq-search-in:disabled{cursor:not-allowed}
.akhq-search svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;flex:none}
.akhq-search kbd{font-family:var(--mono);font-size:10px;padding:2px 5px;border-radius:4px;border:1px solid var(--border);color:var(--muted);line-height:1.2}
.akhq-theme{--h:36px;--floor:0px;min-height:max(var(--h),var(--floor));height:max(var(--h),var(--floor));display:inline-flex;align-items:center;gap:7px;padding:0 var(--s3);border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface);color:var(--fg);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:border-color var(--dur) var(--ease),background var(--dur) var(--ease)}
.akhq-theme:hover{border-color:color-mix(in srgb,var(--fg) 22%,var(--border));background:var(--soft)}
.akhq-theme:active{transform:translateY(.5px)}
.akhq-theme:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-theme-sw{width:28px;height:16px;border-radius:var(--r-pill);background:var(--soft);border:1px solid var(--border);position:relative;flex:none}
.akhq-theme-sw i{position:absolute;top:1px;left:1px;width:12px;height:12px;border-radius:50%;background:var(--fg);transition:transform var(--dur) var(--ease)}
.akhq-theme[aria-pressed=true] .akhq-theme-sw i{transform:translateX(12px)}
}
@layer akhq-container{
/* Skallkomponent: søkefeltets synlighet og topbarens polstring følger
   vindusbredden med rette (beslutning 36). */
@media(max-width:980px){.akhq-topbar{--pad:var(--s3) var(--s4)}.akhq-search{display:none}}
@media(pointer:coarse){.akhq-theme{--floor:44px}.akhq-search-in{--floor:44px}}
/* Stand-in: coarse pointer kan ikke simuleres. Samme lag og vekt som
   spørringen over, slik at en modifikator som nuller gulvet vinner her
   nøyaktig som på en berøringsenhet. */
[data-coarse-test] .akhq-theme{--floor:44px}
[data-coarse-test] .akhq-search-in{--floor:44px}
}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-topbar")) { const s = document.createElement("style"); s.id = "akhq-css-topbar"; s.textContent = css; document.head.appendChild(s); }
export function Topbar({ left, searchPlaceholder = "S\u00f8k i stall og \u00f8kter", searchDisabled = false, theme = "light", onToggleTheme, actions, dataOdId = "topbar", ...rest }) {
  return (
    <header className="akhq-topbar" data-od-id={dataOdId} {...rest}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>{left}</div>
      <div className="akhq-topbar-right">
        <label className="akhq-search" aria-label="S\u00f8k">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input className="akhq-search-in" type="search" placeholder={searchPlaceholder} disabled={searchDisabled} />
          <kbd aria-hidden="true">/</kbd>
        </label>
        <button type="button" className="akhq-theme" aria-pressed={theme === "dark"} aria-label={theme === "dark" ? "Bytt til lys modus" : "Bytt til m\u00f8rk modus"} data-od-id="cta-theme-toggle" onClick={onToggleTheme}>
          <span className="akhq-theme-sw" aria-hidden="true"><i></i></span>
          <span>{theme === "dark" ? "M\u00f8rk" : "Lys"}</span>
        </button>
        {actions}
      </div>
    </header>
  );
}
