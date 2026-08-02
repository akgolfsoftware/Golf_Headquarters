import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sab{--pad-x:var(--s4);--pad-y:12px;position:sticky;bottom:0;left:0;right:0;z-index:calc(var(--z-toast) - 10);display:flex;align-items:center;gap:var(--s3);padding:var(--pad-y) var(--pad-x);padding-bottom:calc(var(--pad-y) + env(safe-area-inset-bottom,0px));box-sizing:border-box;background:var(--bg);border-top:1px solid var(--border);min-width:0}
.akhq-sab::before{content:"";position:absolute;left:0;right:0;top:-24px;height:24px;pointer-events:none;background:linear-gradient(to top,color-mix(in srgb,var(--bg) 92%,transparent),transparent)}
.akhq-sab-note{font-family:var(--mono);font-size:11px;color:var(--muted);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-sab-act{margin-left:auto;display:flex;align-items:center;gap:var(--s2);flex:none}
}
@layer akhq-container{
@container (max-width:420px){.akhq-sab{--pad-x:var(--s3)}.akhq-sab-act{width:100%}}
}
@layer akhq-modifier{
.akhq-sab--stack{flex-direction:column;align-items:stretch}
.akhq-sab--stack .akhq-sab-act{margin-left:0}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-sab")) { const s = document.createElement("style"); s.id = "akhq-css-sab"; s.textContent = css; document.head.appendChild(s); }
export function StickyActionBar({ note, children, stack = false, dataOdId = "cta-bar", ...rest }) {
  const n = React.Children.toArray(children).length;
  if (typeof console !== "undefined" && n > 2) console.warn("StickyActionBar: " + n + " knapper — maks 2. En fast bunnrad er for det brukeren skal gjøre nå, ikke en verktøylinje.");
  return (
    <div className="akhq-sab" data-od-id={dataOdId} {...rest}>
      {note && <span className="akhq-sab-note">{note}</span>}
      <div className="akhq-sab-act">{children}</div>
    </div>
  );
}
