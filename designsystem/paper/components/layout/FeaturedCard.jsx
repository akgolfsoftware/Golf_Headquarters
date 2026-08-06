import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-feat-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-feat{--pad:var(--s5);display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;padding:var(--pad);background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);box-shadow:var(--shadow);font-family:var(--ui);color:var(--fg)}
.akhq-feat-kick{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-feat-ttl{margin:0;font-size:20px;font-weight:600;line-height:1.25;overflow-wrap:anywhere}
.akhq-feat-txt{margin:0;font-family:var(--body);font-size:13.5px;color:var(--muted);line-height:1.6;max-width:52ch}
.akhq-feat-act{display:flex;gap:var(--s2);flex-wrap:wrap;margin-top:var(--s1)}
}
@layer akhq-container{
@container (max-width:420px){.akhq-feat{--pad:var(--s4)}.akhq-feat-ttl{font-size:17px}}
}
@layer akhq-modifier{
.akhq-feat--soft{background:var(--soft);border-color:transparent;box-shadow:none}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-feat")) { const s = document.createElement("style"); s.id = "akhq-css-feat"; s.textContent = css; document.head.appendChild(s); }
/* Det fremhevede kortet: editorial flate (radius --r-md, den ene myke
   skyggen) for onboarding-steg, nye funksjoner og marketingens
   produktkort. Kicker + display-tittel + Lora-prosa + handlingsslot.
   Erstatter den pensjonerte athletic/FeaturedCard. Grensen mot Panel:
   Panel er ARBEIDSFLATENS kort (tett, --r); FeaturedCard er det EDITORIELLE
   (luftig, --r-md) og hører hjemme i marketing/onboarding — aldri inne i
   arbeidsflater. Maks én per skjerm; skal noe fremheves i arbeid, er det
   OneThingNow eller et Panel. */
export function FeaturedCard({
  kicker, title, children, actions, soft = false, dataOdId = "fremhevet", ...rest
}) {
  return (
    <div className="akhq-feat-wrap">
      <div className={"akhq-feat" + (soft ? " akhq-feat--soft" : "")} data-od-id={"panel-" + dataOdId} {...rest}>
        {kicker && <span className="akhq-feat-kick">{kicker}</span>}
        <h3 className="akhq-feat-ttl">{title}</h3>
        {children && <p className="akhq-feat-txt">{children}</p>}
        {actions && <div className="akhq-feat-act">{actions}</div>}
      </div>
    </div>
  );
}
