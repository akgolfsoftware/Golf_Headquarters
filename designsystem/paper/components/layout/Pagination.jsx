import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-pag-wrap{container-type:inline-size;display:block;width:100%;min-width:0}
.akhq-pag{--gap:var(--s1);display:flex;align-items:center;flex-wrap:wrap;gap:var(--gap);min-width:0}
.akhq-pag-tell{margin-right:auto;font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-pag-b{--h:32px;--floor:0px;display:inline-flex;align-items:center;justify-content:center;min-width:32px;min-height:max(var(--h),var(--floor));box-sizing:border-box;padding:0 8px;border:1px solid transparent;border-radius:var(--r-sm);background:none;color:var(--muted);font-family:var(--mono);font-size:12px;font-variant-numeric:tabular-nums;cursor:pointer}
.akhq-pag-b:hover:not(:disabled){background:var(--soft);color:var(--fg)}
.akhq-pag-b:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-pag-b:disabled{opacity:.4;cursor:not-allowed}
.akhq-pag-b[aria-current="page"]{background:var(--cta);border-color:var(--cta);color:var(--on-cta);font-weight:600}
.akhq-pag-b[aria-current="page"]:hover{background:color-mix(in srgb, var(--cta) 88%, var(--bg))}
/* Utelatelsen er ikke en knapp og skal ikke se ut som en. */
.akhq-pag-hopp{display:inline-flex;align-items:center;justify-content:center;min-width:20px;color:var(--mid);font-family:var(--mono);font-size:12px;user-select:none}
.akhq-pag-ikon{width:14px;height:14px}
}
@layer akhq-container{
/* Under 380 px tilgjengelig bredde faller sidetallene bort og bare
   forrige/neste + posisjonen står igjen. En sifferrekke som brytes over to
   linjer i PlayerHQ-kolonnen leses ikke som paginering. */
@container (max-width:380px){.akhq-pag-tall{display:none}}
@media(pointer:coarse){.akhq-pag-b{--floor:44px;min-width:44px}}
[data-coarse-test] .akhq-pag-b{--floor:44px;min-width:44px}
}
@layer akhq-modifier{
.akhq-pag--enkel .akhq-pag-tall{display:none}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-pag")) { const s = document.createElement("style"); s.id = "akhq-css-pag"; s.textContent = css; document.head.appendChild(s); }
const Chevron = ({ vei }) => (
  <svg className="akhq-pag-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={vei === "venstre" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
  </svg>
);
/* Vinduet rundt gjeldende side: alltid første og siste, pluss gjeldende med
   en nabo på hver side. Utelatelsene markeres, aldri skjules stille. */
function sider(side, antall) {
  if (antall <= 7) return Array.from({ length: antall }, (_, i) => i + 1);
  const ut = new Set([1, antall, side, side - 1, side + 1]);
  const liste = [...ut].filter((n) => n >= 1 && n <= antall).sort((a, b) => a - b);
  const med = [];
  liste.forEach((n, i) => { if (i && n - liste[i - 1] > 1) med.push("hopp" + n); med.push(n); });
  return med;
}
export function Pagination({
  page = 1, pageCount = 1, onChange, totalLabel, simple = false,
  label = "Sidenavigasjon", dataOdId = "nav-paginering", ...rest
}) {
  const gå = (n) => { if (onChange && n >= 1 && n <= pageCount && n !== page) onChange(n); };
  return (
    <div className="akhq-pag-wrap">
      <nav className={"akhq-pag" + (simple ? " akhq-pag--enkel" : "")} aria-label={label} data-od-id={dataOdId} {...rest}>
        {totalLabel && <span className="akhq-pag-tell">{totalLabel}</span>}
        <button type="button" className="akhq-pag-b" disabled={page <= 1} onClick={() => gå(page - 1)} aria-label="Forrige side" data-od-id={dataOdId + "-forrige"}>
          <Chevron vei="venstre" />
        </button>
        {sider(page, pageCount).map((n) =>
          typeof n === "string"
            ? <span key={n} className="akhq-pag-hopp akhq-pag-tall" aria-hidden="true">…</span>
            : <button key={n} type="button" className="akhq-pag-b akhq-pag-tall"
                aria-current={n === page ? "page" : undefined}
                aria-label={"Side " + n + " av " + pageCount}
                onClick={() => gå(n)} data-od-id={dataOdId + "-side-" + n}>{n}</button>
        )}
        <button type="button" className="akhq-pag-b" disabled={page >= pageCount} onClick={() => gå(page + 1)} aria-label="Neste side" data-od-id={dataOdId + "-neste"}>
          <Chevron vei="høyre" />
        </button>
      </nav>
    </div>
  );
}
