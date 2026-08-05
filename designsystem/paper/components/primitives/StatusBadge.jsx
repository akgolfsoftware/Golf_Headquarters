import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-badge{display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 8px;box-sizing:border-box;border-radius:var(--r-pill);border:1px solid transparent;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;flex:none;line-height:1}
.akhq-badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex:none}
}
@layer akhq-modifier{
.akhq-badge--up{color:var(--up);background:color-mix(in srgb,var(--up) 10%,transparent);border-color:color-mix(in srgb,var(--up) 26%,transparent)}
.akhq-badge--warn{color:var(--dn);background:color-mix(in srgb,var(--dn) 10%,transparent);border-color:color-mix(in srgb,var(--dn) 26%,transparent)}
.akhq-badge--info{color:var(--info);background:color-mix(in srgb,var(--info) 10%,transparent);border-color:color-mix(in srgb,var(--info) 26%,transparent)}
.akhq-badge--mut{color:var(--muted);background:var(--soft)}
/* ny = blekkfylt. Eneste fylte badge, og bevisst: «ny» er en tilstand som
   skal stoppe blikket. Hører i kind=status, ikke tag. */
.akhq-badge--ny{color:var(--bg);background:var(--fg)}
/* tag = fargeløs PERMANENT. AK-vokabularet (GRUNN/SPESIALISERING/TURNERING,
   FYS/TEK/SLAG/SPILL/TURN, A–K, og AK-formel v2-verdiene — motorikk,
   belastning, press) skal aldri fargekodes — det sprenger paletten og
   kolliderer med datasemantikken der grønn betyr bedre. Bindende; ikke ta
   det opp per skjerm. */
.akhq-badge--tag{color:var(--muted);background:transparent;border-color:var(--border)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-badge")) { const s = document.createElement("style"); s.id = "akhq-css-badge"; s.textContent = css; document.head.appendChild(s); }
export function StatusBadge({ kind = "status", tone = "mut", dot = false, dataOdId = "badge", children, ...rest }) {
  const mod = kind === "tag" ? "tag" : tone;
  return (
    <span className={"akhq-badge akhq-badge--" + mod} data-od-id={dataOdId} {...rest}>
      {kind === "status" && dot && <span className="akhq-badge-dot" aria-hidden="true"></span>}
      {children}
    </span>
  );
}
