import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-mm{container-type:inline-size;display:flex;flex-direction:column;gap:var(--s2);width:100%;min-width:0;font-family:var(--ui)}
.akhq-mm-grid{display:grid;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;background:var(--surface)}
.akhq-mm-hj{padding:var(--s2);font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--soft);border-bottom:1px solid var(--border);border-right:1px solid var(--border)}
.akhq-mm-radlab{padding:var(--s2);font-size:12px;color:var(--fg);background:var(--soft);border-right:1px solid var(--border);border-bottom:1px solid var(--border);display:flex;align-items:center;min-width:0}
.akhq-mm-celle{padding:var(--s2);border-bottom:1px solid var(--border);border-right:1px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-height:44px;min-width:0}
.akhq-mm-celle:last-child,.akhq-mm-hj:last-child,.akhq-mm-radlab:last-child{border-right:none}
.akhq-mm-v{font-family:var(--mono);font-size:12.5px;color:var(--fg);font-variant-numeric:tabular-nums;white-space:nowrap}
.akhq-mm-mal{font-family:var(--mono);font-size:9.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-mm-tom{color:var(--mid);font-family:var(--mono);font-size:13px}
.akhq-mm-forklaring{display:flex;flex-wrap:wrap;gap:var(--s2) var(--s3);font-family:var(--mono);font-size:10.5px;color:var(--muted)}
}
@layer akhq-container{
@container (max-width: 420px){.akhq-mm-hj,.akhq-mm-radlab{font-size:10px;padding:6px}.akhq-mm-v{font-size:11px}}
}
@layer akhq-modifier{
.akhq-mm-celle--naadd .akhq-mm-v{color:var(--up)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-mm")) { const s = document.createElement("style"); s.id = "akhq-css-mm"; s.textContent = css; document.head.appendChild(s); }
const tall = (n) => (typeof n === "number" ? String(Math.round(n * 10) / 10).replace(".", ",") : n);
/* Rutenett motorikk × miljø: reps gjennomført av mål, per celle. «—» betyr
   ikke planlagt — ALDRI sperret, aldri grått som en feilmelding (18.08.2026:
   ingen treningsregel håndheves). Kolonneaksen heter MILJØ i UI — ordet
   «belastning» vises aldri for spilleren (manifest playerhq-teknisk-plan,
   20.08.2026). Nådd mål farges --up, aldri --accent (accent er reservert
   «Én ting nå»). */
export function MaalMatrise({ motorikk = [], miljo = [], celler = [], dataOdId = "maalmatrise" }) {
  const finn = (m, j) => celler.find((c) => c.motorikk === m && c.miljo === j);
  return (
    <div className="akhq-mm" data-od-id={dataOdId}>
      <div className="akhq-mm-grid" role="table" aria-label="Målmatrise, motorikk mot miljø" style={{ gridTemplateColumns: `minmax(88px,1fr) repeat(${miljo.length}, minmax(64px,1fr))` }}>
        <div className="akhq-mm-hj" role="columnheader"></div>
        {miljo.map((j) => <div className="akhq-mm-hj" role="columnheader" key={j}>{j}</div>)}
        {motorikk.map((m) => (
          <React.Fragment key={m}>
            <div className="akhq-mm-radlab" role="rowheader">{m}</div>
            {miljo.map((j) => {
              const c = finn(m, j);
              if (!c) return <div className="akhq-mm-celle" role="cell" key={j}><span className="akhq-mm-tom" aria-label={m + " " + j + ": ikke planlagt"}>—</span></div>;
              const naadd = c.mal !== undefined && c.gjort >= c.mal;
              return (
                <div className={"akhq-mm-celle" + (naadd ? " akhq-mm-celle--naadd" : "")} role="cell" key={j}
                  aria-label={m + " " + j + ": " + tall(c.gjort) + (c.mal !== undefined ? " av " + tall(c.mal) : "") + " reps" + (naadd ? ", mål nådd" : "")}>
                  <span className="akhq-mm-v">{tall(c.gjort)}{c.mal !== undefined ? "" : ""}</span>
                  {c.mal !== undefined && <span className="akhq-mm-mal">av {tall(c.mal)}</span>}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="akhq-mm-forklaring">
        <span>Tall = reps gjennomført av mål</span>
        <span>«—» = ikke planlagt</span>
      </div>
    </div>
  );
}
