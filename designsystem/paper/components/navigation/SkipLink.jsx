import React from "react";
const css = `
@layer akhq-base;
@layer akhq-base{
.akhq-skip{position:absolute;left:-9999px;top:0;z-index:calc(var(--z-toast) + 10);padding:10px 14px;background:var(--fg);color:var(--bg);border-radius:0 0 var(--r-sm) 0;font-family:var(--ui);font-size:12.5px;font-weight:600;text-decoration:none}
.akhq-skip:focus,.akhq-skip:focus-visible{left:0;outline:2px solid var(--focus);outline-offset:2px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-skip")) { const s = document.createElement("style"); s.id = "akhq-css-skip"; s.textContent = css; document.head.appendChild(s); }
export function SkipLink({ href = "#innhold", children = "Hopp til innhold", dataOdId = "nav-skip", ...rest }) {
  return <a className="akhq-skip" href={href} data-od-id={dataOdId} {...rest}>{children}</a>;
}
