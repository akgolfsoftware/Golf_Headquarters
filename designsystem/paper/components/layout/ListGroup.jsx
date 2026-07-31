import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-lgroup{container-type:inline-size;list-style:none;margin:0;padding:0;min-width:0}
/* Skillelinjer eies av gruppen. Tre selektorer, ikke én: DC-runtimen setter en
   mount-wrapper (div.sc-host-*) mellom gruppen og raden når en x-import
   ligger inne i en x-import, og med bare >-varianten forsvant alle
   skillelinjene i hver template [funn 31.07]. Wrapper-varianten teller på
   wrapperen, så siste rad forblir uten strek også når hver rad har sin egen. */
.akhq-lgroup>.akhq-lrow-item:not(:last-child){border-bottom:1px solid var(--border)}
.akhq-lgroup>*:not(:last-child)>.akhq-lrow-item{border-bottom:1px solid var(--border)}
.akhq-lgroup>*:not(:last-child)>*>.akhq-lrow-item{border-bottom:1px solid var(--border)}
.akhq-lgroup-label{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:var(--s2)}
}
@layer akhq-modifier{
.akhq-lgroup--plain>.akhq-lrow-item,.akhq-lgroup--plain>*>.akhq-lrow-item,.akhq-lgroup--plain>*>*>.akhq-lrow-item{border-bottom:0}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-lgroup")) { const s = document.createElement("style"); s.id = "akhq-css-lgroup"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
/* as="div" finnes fordi `<ul>` kun tar `<li>` som barn. Legger en runtime en
   mount-wrapper mellom gruppen og radene — som DC-runtimen gjør for
   `<x-import>` inne i `<x-import>` — blir `<div>` barn av `<ul>`, som er
   ugyldig HTML. `role="list"`/`role="listitem"` gir samme semantikk uten
   den begrensningen. Se `.prompt.md`. */
export function ListGroup({ label, dividers = true, as = "ul", dataOdId = "list", children, ...rest }) {
  const id = React.useMemo(() => "akhq-lgroup-l" + (++seq), []);
  const Tag = as === "div" ? "div" : "ul";
  const list = (
    <Tag className={"akhq-lgroup" + (dividers ? "" : " akhq-lgroup--plain")} role={as === "div" ? "list" : undefined} data-akhq-lgroup="" aria-labelledby={label ? id : undefined} data-od-id={dataOdId} {...rest}>
      {children}
    </Tag>
  );
  if (!label) return list;
  return <div style={{ minWidth: 0 }}><span className="akhq-lgroup-label" id={id}>{label}</span>{list}</div>;
}
