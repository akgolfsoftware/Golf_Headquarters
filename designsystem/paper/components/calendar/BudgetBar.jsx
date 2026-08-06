import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-bb{container-type:inline-size;display:flex;flex-direction:column;gap:var(--s3);width:100%;min-width:0;box-sizing:border-box;padding:var(--s3);border:1px solid var(--border);border-radius:var(--r);background:var(--surface);font-family:var(--ui)}
.akhq-bb-hd{display:flex;align-items:baseline;gap:var(--s2);flex-wrap:wrap}
.akhq-bb-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.akhq-bb-sum{margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--fg);font-variant-numeric:tabular-nums}
.akhq-bb-spor{position:relative;height:10px;border-radius:var(--r-pill);background:var(--soft);overflow:hidden}
.akhq-bb-fyll{position:absolute;inset:0 auto 0 0;background:var(--fg);border-radius:var(--r-pill)}
.akhq-bb-vindu{position:absolute;top:0;bottom:0;border-left:1px solid var(--mid);border-right:1px solid var(--mid);pointer-events:none}
.akhq-bb-skala{display:flex;justify-content:space-between;font-family:var(--mono);font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-bb-fordeling{display:flex;height:8px;border-radius:var(--r-pill);overflow:hidden;background:var(--soft)}
.akhq-bb-del{height:100%}
.akhq-bb-tegn{display:flex;flex-wrap:wrap;gap:var(--s2) var(--s3)}
.akhq-bb-tegn-i{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-bb-prikk{width:8px;height:8px;border-radius:2px;flex:none}
.akhq-bb-nokler{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s2)}
.akhq-bb-nokkel{display:flex;flex-direction:column;gap:2px;min-width:0}
.akhq-bb-nokkel-v{font-family:var(--mono);font-size:14px;color:var(--fg);font-variant-numeric:tabular-nums}
.akhq-bb-nokkel-l{font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.akhq-bb-brudd{display:flex;flex-direction:column;gap:6px;padding:var(--s3);border:1px solid var(--border);border-left:3px solid var(--dn);border-radius:var(--r-sm);background:var(--soft)}
.akhq-bb-brudd-t{font-size:13px;font-weight:500;color:var(--fg)}
.akhq-bb-brudd-b{font-size:12.5px;line-height:1.5;color:var(--muted)}
.akhq-bb-brudd-h{display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:2px}
.akhq-bb-overstyr{--hit:30px;--floor:0px;position:relative;display:inline-flex;align-items:center;padding:0 12px;height:var(--hit);border:1px solid var(--border);border-radius:var(--r-pill);background:transparent;color:var(--fg);font-family:var(--ui);font-size:12.5px;cursor:pointer}
.akhq-bb-overstyr::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100%;height:max(var(--hit),var(--floor))}
.akhq-bb-overstyr:hover{background:var(--soft)}
.akhq-bb-overstyr:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-bb-overstyr{--floor:44px}}
[data-coarse-test] .akhq-bb-overstyr{--floor:44px}
@container (max-width: 420px){.akhq-bb-nokler{grid-template-columns:repeat(2,1fr)}}
@container (max-width: 260px){.akhq-bb-nokler{grid-template-columns:1fr}}
}
@layer akhq-modifier{
.akhq-bb-fyll--over{background:var(--dn)}
.akhq-bb-fyll--under{background:var(--mid)}
.akhq-bb-nokkel--avvik .akhq-bb-nokkel-v{color:var(--dn)}
.akhq-bb-nokkel--ok .akhq-bb-nokkel-v{color:var(--up)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-bb")) { const s = document.createElement("style"); s.id = "akhq-css-bb"; s.textContent = css; document.head.appendChild(s); }
const FARGE = { FYS: "var(--info)", TEK: "var(--fg)", SLAG: "var(--mid)", SPILL: "var(--muted)", TURN: "var(--up)" };
/* Norsk desimalkomma. Tall er komponentens hele jobb; skrives de på engelsk,
   leses de feil av nettopp den som stoler mest på dem. */
const tall = (n) => (typeof n === "number" ? String(Math.round(n * 10) / 10).replace(".", ",") : n);
/* Hardt mellomrom mellom tall og enhet — «6,5 t» skal aldri brekke i to linjer. */
const med = (n, e) => tall(n) + "\u00A0" + e;
/* Budsjettlinjen over ukelerretet. Den er det som gjør CANON levende:
   invariantene kjører på hvert slipp, og brudd vises som ANBEFALING med
   «overstyr med begrunnelse» — aldri som sperre. Sperren er teknisk billig
   og faglig feil: coachen vet ting modellen ikke vet.

   Komponenten regner ikke. Den viser tall konsumenten har regnet, fordi
   invariantene bor i CANON og ikke i et UI-bibliotek. */
export function BudgetBar({
  hours = 0, min, max, unit = "t", distribution = [], keyFigures = [],
  violations = [], onOverride, dataOdId = "budsjett"
}) {
  const tak = Math.max(max || 0, hours) * 1.15 || 1;
  const pct = (v) => Math.max(0, Math.min(100, (v / tak) * 100));
  const over = max !== undefined && hours > max;
  const under = min !== undefined && hours < min;
  const sum = distribution.reduce((a, d) => a + d.hours, 0) || 1;
  return (
    <section className="akhq-bb" data-od-id={dataOdId} aria-label="Budsjett for uken">
      <div className="akhq-bb-hd">
        <span className="akhq-bb-lab">Ukevolum</span>
        <span className="akhq-bb-sum">{med(hours, unit)}{min !== undefined && max !== undefined ? " av " + tall(min) + "–" + med(max, unit) : ""}</span>
      </div>
      <div className="akhq-bb-spor" role="img"
        aria-label={"Ukevolum " + tall(hours) + " " + unit + (min !== undefined ? ", periodens vindu " + tall(min) + " til " + tall(max) + " " + unit : "") + (over ? ", over taket" : under ? ", under minimum" : ", innenfor")}>
        <div className={"akhq-bb-fyll" + (over ? " akhq-bb-fyll--over" : under ? " akhq-bb-fyll--under" : "")} style={{ width: pct(hours) + "%" }}></div>
        {min !== undefined && max !== undefined && (
          <div className="akhq-bb-vindu" style={{ left: pct(min) + "%", width: (pct(max) - pct(min)) + "%" }}></div>
        )}
      </div>
      <div className="akhq-bb-skala"><span>0</span><span>{min !== undefined ? "min " + med(min, unit) : ""}</span><span>{max !== undefined ? "maks " + med(max, unit) : ""}</span></div>
      {distribution.length > 0 && (<>
        <div className="akhq-bb-fordeling" role="img" aria-label={"Fordeling: " + distribution.map((d) => d.area + " " + tall(d.hours) + " " + unit).join(", ")}>
          {distribution.map((d) => <div key={d.area} className="akhq-bb-del" style={{ width: (d.hours / sum) * 100 + "%", background: FARGE[d.area] || "var(--mid)" }}></div>)}
        </div>
        <div className="akhq-bb-tegn">
          {distribution.map((d) => (
            <span className="akhq-bb-tegn-i" key={d.area}>
              <span className="akhq-bb-prikk" style={{ background: FARGE[d.area] || "var(--mid)" }}></span>
              {d.area} {med(d.hours, unit)} · {Math.round((d.hours / sum) * 100)} %
            </span>
          ))}
        </div>
      </>)}
      {keyFigures.length > 0 && (
        <div className="akhq-bb-nokler">
          {keyFigures.map((k) => (
            <div className={"akhq-bb-nokkel" + (k.tone === "dn" ? " akhq-bb-nokkel--avvik" : k.tone === "up" ? " akhq-bb-nokkel--ok" : "")} key={k.label}>
              <span className="akhq-bb-nokkel-v">{k.value}</span>
              <span className="akhq-bb-nokkel-l">{k.label}</span>
            </div>
          ))}
        </div>
      )}
      {violations.map((v, i) => (
        <div className="akhq-bb-brudd" key={v.id || i} role="status">
          <span className="akhq-bb-brudd-t">{v.title}</span>
          <span className="akhq-bb-brudd-b">{v.body}</span>
          <div className="akhq-bb-brudd-h">
            {v.actions}
            {onOverride && (
              <button type="button" className="akhq-bb-overstyr" onClick={() => onOverride(v)} data-od-id={"cta-" + dataOdId + "-overstyr-" + (v.id || i)}>
                Overstyr med begrunnelse
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
