import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-qlink{--gap:var(--s2);--hit:30px;--floor:0px;display:flex;flex-wrap:wrap;align-items:center;gap:var(--gap);min-width:0;font-family:var(--ui)}
.akhq-qlink-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-right:2px}
.akhq-qlink-a{display:inline-flex;align-items:center;gap:5px;height:max(var(--hit),var(--floor));padding:0 10px;border-radius:var(--r-pill);border:1px solid var(--border);background:transparent;color:var(--muted);font-size:12px;font-weight:500;text-decoration:none;cursor:pointer;transition:color var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.akhq-qlink-a:hover{color:var(--fg);border-color:color-mix(in srgb,var(--fg) 22%,var(--border))}
.akhq-qlink-a:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-qlink-arrow{font-family:var(--mono);color:var(--mid)}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-qlink{--floor:44px}}
/* Stand-in, samme begrunnelse som Tabs/ThemeToggle/DropdownMenu (29.07.2026). */
[data-coarse-test] .akhq-qlink{--floor:44px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-qlink")) { const s = document.createElement("style"); s.id = "akhq-css-qlink"; s.textContent = css; document.head.appendChild(s); }
export function QuickLinkBar({ label = "Mer her", links = [], dataOdId = "nav-quicklinks", ...rest }) {
  return (
    <nav className="akhq-qlink" aria-label={label} data-od-id={dataOdId} {...rest}>
      {label && <span className="akhq-qlink-lab">{label}</span>}
      {links.map((l, i) => (
        <a key={l.id || i} className="akhq-qlink-a" href={l.href} onClick={l.onClick} data-od-id={"cta-" + dataOdId + "-" + (l.id || i)}>
          {l.text}<span className="akhq-qlink-arrow" aria-hidden="true">→</span>
        </a>
      ))}
    </nav>
  );
}
