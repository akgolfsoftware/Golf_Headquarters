import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-dt-wrap{container-type:inline-size;display:block;width:100%;min-width:0}
/* Rullingen bor HER, ikke på siden. Egen container med egen overflow er hele
   grunnen til at komponenten finnes: en bred tabell skal aldri kunne skyve
   sidebredden ut. min-width:0 er nødvendig for at grid/flex-forfedre skal la
   den krympe i det hele tatt. */
.akhq-dt-scroll{--maxh:none;width:100%;min-width:0;max-height:var(--maxh);overflow-x:auto;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r);background:var(--surface);-webkit-overflow-scrolling:touch}
.akhq-dt{--cell-x:var(--s3);--cell-y:10px;--fs:13px;border-collapse:collapse;width:100%;min-width:max-content;font-family:var(--ui);font-size:var(--fs);color:var(--fg)}
.akhq-dt-cap{caption-side:top;text-align:left;padding:var(--s3) var(--cell-x);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-dt-th{position:sticky;top:0;z-index:1;padding:0;background:var(--surface);border-bottom:1px solid var(--border);text-align:left;font-weight:600;font-size:11.5px;letter-spacing:.02em;color:var(--muted);white-space:nowrap}
.akhq-dt-th-in{display:block;padding:var(--cell-y) var(--cell-x)}
/* Sorteringsutløseren er en ekte knapp — hele cellen er treffmålet, ikke en
   liten pil ved siden av etiketten. */
.akhq-dt-sort{--hit:34px;--floor:0px;display:flex;align-items:center;gap:6px;width:100%;min-height:max(var(--hit),var(--floor));box-sizing:border-box;padding:var(--cell-y) var(--cell-x);margin:0;border:0;background:none;font:inherit;color:inherit;letter-spacing:inherit;text-align:inherit;cursor:pointer;border-radius:var(--r-sm)}
.akhq-dt-sort:hover{background:var(--soft)}
.akhq-dt-sort:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
.akhq-dt-pil{flex:none;width:9px;height:9px;opacity:0;transition:opacity var(--dur) var(--ease)}
.akhq-dt-sort:hover .akhq-dt-pil{opacity:.45}
[aria-sort="ascending"] .akhq-dt-pil,[aria-sort="descending"] .akhq-dt-pil{opacity:1}
[aria-sort="ascending"] .akhq-dt-sort,[aria-sort="descending"] .akhq-dt-sort{color:var(--fg)}
[aria-sort="descending"] .akhq-dt-pil{transform:rotate(180deg)}
.akhq-dt-td{padding:var(--cell-y) var(--cell-x);border-bottom:1px solid var(--border);vertical-align:middle}
/* Siste rad har aldri strek — samme konvensjon som ListGroup og KeyValueGrid. */
.akhq-dt-tr:last-child>.akhq-dt-td{border-bottom:0}
.akhq-dt-tr:hover>.akhq-dt-td{background:var(--soft)}
/* Tall er høyrestilt og mono med tabulære sifre, slik at sifrene står i lodd
   nedover kolonnen. Komma-desimal kommer fra nf() i data/viz.jsx. */
.akhq-dt-td--tall,.akhq-dt-th--tall{text-align:right}
.akhq-dt-td--tall{font-family:var(--mono);font-variant-numeric:tabular-nums;font-size:12.5px}
.akhq-dt-td--sterk{font-weight:600}
.akhq-dt-td--opp{color:var(--up)}
.akhq-dt-td--ned{color:var(--dn)}
.akhq-dt-tom{padding:var(--s6) var(--cell-x);text-align:center;color:var(--muted);font-size:12.5px;line-height:1.55}
.akhq-dt-sk{display:block;height:11px;border-radius:var(--r-sm);background:var(--soft)}
.akhq-dt-fot{padding:var(--s3) var(--cell-x);border-top:1px solid var(--border);font-family:var(--mono);font-size:10.5px;color:var(--muted)}
}
@layer akhq-container{
/* Under 560 px tilgjengelig bredde strammes cellene inn — tabellen ruller
   fortsatt, men flere kolonner rekker innenfor før den gjør det. 560 er regnet
   mot containeren (Panel trekker 34-38 px), ikke mot vindusbredden. */
@container (max-width:560px){.akhq-dt{--cell-x:10px;--cell-y:8px;--fs:12.5px}}
@media(pointer:coarse){.akhq-dt-sort{--floor:44px}}
[data-coarse-test] .akhq-dt-sort{--floor:44px}
}
@layer akhq-modifier{
.akhq-dt--tett{--cell-y:6px}
.akhq-dt--romslig{--cell-y:14px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-dt")) { const s = document.createElement("style"); s.id = "akhq-css-dt"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
const Pil = () => (
  <svg className="akhq-dt-pil" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 15 7-7 7 7" /></svg>
);
/* DataTable: radsett med flere sammenlignbare kolonner — økonomi, rapporter,
   turneringsfelt, stallister med tall. Grensen mot naboene:

   - ListRow/ListGroup = én rad, én sak. Leading + tittel + hale. Ingen kolonner
     å sammenligne nedover, ingen sortering.
   - KeyValueGrid = ETT objekts spesifikasjoner. Par, ikke rader.
   - DataTable = mange rader × mange kolonner der lesningen går NEDOVER i en
     kolonne. Er det bare én verdi per rad, er det en liste.

   Komponenten sorterer ikke selv. `sort` + `onSort` er kontrollerte, slik at
   skjermen kan sortere på serveren når settet er større enn siden. */
export function DataTable({
  columns = [], rows = [], caption, sort = null, onSort, rowKey = "id",
  state = "content", emptyText = "Ingen rader i dette utvalget ennå.",
  errorText = "Kunne ikke hente tabellen. Prøv igjen.",
  loadingRows = 4, density = "md", maxHeight, footNote, dataOdId = "panel-tabell", ...rest
}) {
  const id = React.useMemo(() => "akhq-dt" + (++seq), []);
  const laster = state === "loading";
  const kolonner = columns.length ? columns : [{ key: "_", label: "" }];
  const klikk = (k) => {
    if (!onSort) return;
    const dir = sort && sort.key === k && sort.dir === "asc" ? "desc" : "asc";
    onSort({ key: k, dir });
  };
  const beskjed = state === "error" ? errorText : emptyText;
  const visBeskjed = state === "error" || (!laster && rows.length === 0);
  return (
    <div className="akhq-dt-wrap" data-od-id={dataOdId}>
      <div className="akhq-dt-scroll" style={maxHeight ? { "--maxh": typeof maxHeight === "number" ? maxHeight + "px" : maxHeight } : undefined}>
        <table className={"akhq-dt" + (density !== "md" ? " akhq-dt--" + density : "")} aria-describedby={footNote ? id + "-f" : undefined} {...rest}>
          {caption && <caption className="akhq-dt-cap">{caption}</caption>}
          <thead>
            <tr>
              {kolonner.map((c) => {
                const aktiv = sort && sort.key === c.key;
                const sortbar = !!c.sortable && !!onSort && !laster;
                return (
                  <th key={c.key} scope="col" style={c.width ? { width: c.width } : undefined}
                    className={"akhq-dt-th" + (c.align === "end" ? " akhq-dt-th--tall" : "")}
                    aria-sort={sortbar ? (aktiv ? (sort.dir === "asc" ? "ascending" : "descending") : "none") : undefined}>
                    {sortbar
                      ? <button type="button" className="akhq-dt-sort" onClick={() => klikk(c.key)} data-od-id={"cta-sorter-" + c.key}
                          style={c.align === "end" ? { justifyContent: "flex-end" } : undefined}>
                          <span>{c.label}</span><Pil />
                        </button>
                      : <span className="akhq-dt-th-in">{c.label}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {laster && Array.from({ length: loadingRows }, (_, i) => (
              <tr className="akhq-dt-tr" key={"sk" + i}>
                {kolonner.map((c) => (
                  <td className="akhq-dt-td" key={c.key}><span className="akhq-dt-sk" style={{ width: c.align === "end" ? "44%" : (i % 2 ? "62%" : "78%"), marginLeft: c.align === "end" ? "auto" : 0 }} /></td>
                ))}
              </tr>
            ))}
            {visBeskjed && (
              <tr className="akhq-dt-tr"><td className="akhq-dt-td akhq-dt-tom" colSpan={kolonner.length}>{beskjed}</td></tr>
            )}
            {!laster && state !== "error" && rows.map((r, i) => (
              <tr className="akhq-dt-tr" key={r[rowKey] != null ? r[rowKey] : i}>
                {kolonner.map((c) => {
                  const v = r[c.key];
                  const tone = typeof c.tone === "function" ? c.tone(r) : c.tone;
                  return (
                    <td key={c.key} className={"akhq-dt-td"
                      + (c.align === "end" ? " akhq-dt-td--tall" : "")
                      + (c.strong ? " akhq-dt-td--sterk" : "")
                      + (tone === "up" ? " akhq-dt-td--opp" : tone === "dn" ? " akhq-dt-td--ned" : "")}>
                      {c.render ? c.render(r) : v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footNote && <div className="akhq-dt-fot" id={id + "-f"}>{footNote}</div>}
    </div>
  );
}
