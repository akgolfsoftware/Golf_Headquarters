import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-slabel{display:block;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);line-height:1}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-slabel")) { const s = document.createElement("style"); s.id = "akhq-css-slabel"; s.textContent = css; document.head.appendChild(s); }
export function SectionLabel({ as = "span", id, dataOdId, children, ...rest }) {
  return React.createElement(as, { className: "akhq-slabel", id, "data-od-id": dataOdId, ...rest }, children);
}
