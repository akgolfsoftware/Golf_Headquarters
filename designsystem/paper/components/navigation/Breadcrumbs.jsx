import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-crumbs{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;gap:6px;align-items:center}
.akhq-crumb-a{--hit:16px;--floor:0px;display:inline-flex;align-items:center;height:max(var(--hit),var(--floor));color:inherit;text-decoration:none;border-radius:2px}
.akhq-crumb-a:hover{color:var(--fg)}
.akhq-crumb-a:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-crumbs b{color:var(--fg);font-weight:600}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-crumb-a{--floor:44px}}
/* Stand-in, samme begrunnelse som Tabs/ThemeToggle/QuickLinkBar (29.07.2026).
   Laveste målte treffmål i biblioteket (12,8px) — manglet --floor helt. */
[data-coarse-test] .akhq-crumb-a{--floor:44px}
}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-crumbs")) { const s = document.createElement("style"); s.id = "akhq-css-crumbs"; s.textContent = css; document.head.appendChild(s); }
export function Breadcrumbs({ items = [], dataOdId = "nav-crumbs", ...rest }) {
  return (
    <nav className="akhq-crumbs" aria-label="Brødsmuler" data-od-id={dataOdId} {...rest}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden="true">·</span>}
          {i === items.length - 1 ? <b aria-current="page">{it.label}</b> : it.href ? <a className="akhq-crumb-a" href={it.href}>{it.label}</a> : <span>{it.label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}
