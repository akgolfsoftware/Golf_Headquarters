import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-ssgl{display:flex;flex-direction:column;gap:var(--s3);width:100%;min-width:0;font-family:var(--ui)}
.akhq-ssgl-navaerende{display:flex;align-items:center;gap:var(--s3);padding:var(--s3);border:1px solid var(--border);border-radius:var(--r);background:var(--surface)}
.akhq-ssgl-klokke{font-family:var(--mono);font-size:20px;font-weight:600;color:var(--fg);font-variant-numeric:tabular-nums}
.akhq-ssgl-meta{display:flex;flex-direction:column;gap:2px;margin-left:auto}
.akhq-ssgl-typ{font-size:13px;color:var(--fg)}
.akhq-ssgl-sone{font-family:var(--mono);font-size:10.5px;color:var(--muted)}
.akhq-ssgl-typper{display:flex;gap:var(--s2);flex-wrap:wrap}
.akhq-ssgl-tbtn{--floor:0px;min-height:max(36px,var(--floor));padding:0 var(--s3);border:1px solid var(--border);border-radius:var(--r-pill);background:var(--surface);color:var(--fg);font-family:var(--ui);font-size:12.5px;cursor:pointer}
.akhq-ssgl-tbtn:hover{background:var(--soft)}
.akhq-ssgl-tbtn:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-ssgl-tbtn--valgt{border-color:var(--fg);background:var(--soft);font-weight:600}
.akhq-ssgl-soner{display:flex;gap:6px}
.akhq-ssgl-sbtn{--floor:0px;width:max(32px,var(--floor));height:max(32px,var(--floor));border:1px solid var(--border);border-radius:50%;background:var(--surface);color:var(--fg);font-family:var(--mono);font-size:12px;cursor:pointer}
.akhq-ssgl-sbtn:hover{background:var(--soft)}
.akhq-ssgl-sbtn:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-ssgl-sbtn--valgt{border-color:var(--fg);background:var(--fg);color:var(--surface);font-weight:600}
.akhq-ssgl-logg{display:flex;flex-direction:column;gap:4px}
.akhq-ssgl-rad{display:flex;align-items:center;gap:var(--s2);font-family:var(--mono);font-size:11.5px;color:var(--muted)}
.akhq-ssgl-rad-typ{color:var(--fg);font-family:var(--ui);font-size:12.5px;flex:1;min-width:0}
.akhq-ssgl-tom{font-size:12.5px;color:var(--muted)}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-ssgl-tbtn{--floor:44px}.akhq-ssgl-sbtn{--floor:44px}}
[data-coarse-test] .akhq-ssgl-tbtn,[data-coarse-test] .akhq-ssgl-sbtn{--floor:44px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-ssgl")) { const s = document.createElement("style"); s.id = "akhq-css-ssgl"; s.textContent = css; document.head.appendChild(s); }
const TYPER = ["Oppvarming", "Drag", "Hvile"];
const SONER = [1, 2, 3, 4, 5];
/* Kondisjonssegmenter i live-økt: pågående segment (klokke + type + sone),
   segmentbytte, og logg over avsluttede segmenter med varighet. Skiller seg
   fra golf-/FYS-drills ved at tid, ikke reps, er den logges størrelsen
   (manifest playerhq-live-okt, 20.08.2026). */
export function SoneSegmentLogger({ navaerende, klokkeLabel, onByttType, onByttSone, logg = [], dataOdId = "sonesegmentlogger" }) {
  return (
    <div className="akhq-ssgl" data-od-id={dataOdId}>
      {navaerende && (
        <div className="akhq-ssgl-navaerende" role="status" aria-label={"Pågående segment: " + navaerende.typ + ", sone " + navaerende.sone + ", " + klokkeLabel}>
          <span className="akhq-ssgl-klokke">{klokkeLabel}</span>
          <span className="akhq-ssgl-meta">
            <span className="akhq-ssgl-typ">{navaerende.typ}</span>
            <span className="akhq-ssgl-sone">Sone {navaerende.sone}</span>
          </span>
        </div>
      )}
      <div className="akhq-ssgl-typper" role="group" aria-label="Segmenttype">
        {TYPER.map((t) => (
          <button type="button" key={t} className={"akhq-ssgl-tbtn" + (navaerende?.typ === t ? " akhq-ssgl-tbtn--valgt" : "")}
            aria-pressed={navaerende?.typ === t} onClick={() => onByttType && onByttType(t)} data-od-id={dataOdId + "-typ-" + t}>
            {t}
          </button>
        ))}
      </div>
      <div className="akhq-ssgl-soner" role="group" aria-label="Sone 1 til 5">
        {SONER.map((sone) => (
          <button type="button" key={sone} className={"akhq-ssgl-sbtn" + (navaerende?.sone === sone ? " akhq-ssgl-sbtn--valgt" : "")}
            aria-pressed={navaerende?.sone === sone} onClick={() => onByttSone && onByttSone(sone)} data-od-id={dataOdId + "-sone-" + sone}>
            {sone}
          </button>
        ))}
      </div>
      <div className="akhq-ssgl-logg" role="list" aria-label="Avsluttede segmenter">
        {logg.length === 0 && <span className="akhq-ssgl-tom">Ingen avsluttede segmenter ennå</span>}
        {logg.map((seg, i) => (
          <div className="akhq-ssgl-rad" role="listitem" key={i}>
            <span className="akhq-ssgl-rad-typ">{seg.typ} · sone {seg.sone}</span>
            <span>{seg.varighetLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
