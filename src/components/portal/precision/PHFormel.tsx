"use client";

import { useState } from "react";
import { KnappLenke, Sidehode } from "@/components/precision/pa";
import { OMRAADER, PYRAMIDE_KODER, PYRAMIDE_LABEL, type OmraadeKode, type PyramideKode } from "@/lib/domain/ak-formel-v2";

const REP: Record<(typeof OMRAADER)[number]["repsEnhet"], string> = {
  SLAG: "Slag", PUTTER: "Putter", HULL: "Hull", SERIER_REPS: "Serier × repetisjoner", MINUTTER: "Minutter", SEGMENTER: "Segmenter",
};
export function PHFormel() {
  const [axis, setAxis] = useState<PyramideKode>("TEK");
  const [area, setArea] = useState<OmraadeKode>("TEE_TOTAL");
  const selected = OMRAADER.find(value => value.kode === area)!;
  return <div className="pa-side ph-formel">
    <Sidehode kicker="AK-formel v2" title="AK-formelen" sub="Pyramiden og de 19 treningsområdene beskriver hva du arbeider med i hver øvelse." />
    <div className="ph-formel__oppsett">
      <section aria-label="Velg pyramide" className="ph-formel__pyramide"><h2>Pyramide</h2>
        <svg viewBox="0 0 320 270" role="img" aria-label={`Treningspyramiden. Valgt: ${PYRAMIDE_LABEL[axis]}.`}>
          {[...PYRAMIDE_KODER].reverse().map((code, i) => {
            const y = 12 + i * 46, topLeft = 142 - i * 25, topRight = 166 + i * 25, bottomLeft = topLeft - 25, bottomRight = topRight + 25;
            return <g key={code} data-selected={axis === code} className={`ph-formel__lag ph-formel__lag--${code.toLowerCase()}`}><path d={`M${topLeft} ${y} L${topRight} ${y} L${bottomRight} ${y + 40} L${bottomLeft} ${y + 40} Z`} /><path className="ph-formel__dybde" d={`M${topRight} ${y} L${topRight + 18} ${y - 8} L${bottomRight + 18} ${y + 32} L${bottomRight} ${y + 40} Z`} /><text x={154} y={y + 27} textAnchor="middle">{code}</text></g>;
          })}
        </svg>
        <div role="group" aria-label="Pyramide" className="ph-formel__valg">{PYRAMIDE_KODER.map(code => <button type="button" key={code} aria-pressed={axis === code} onClick={() => setAxis(code)}><strong>{code}</strong><span>{PYRAMIDE_LABEL[code]}</span></button>)}</div>
      </section>
      <section className="ph-formel__omraader"><h2>Treningsområde</h2><p>Velg ett av de 19 områdene sammen med pyramiden.</p><div role="group" aria-label="Treningsområde" className="ph-formel__omraadevalg">{OMRAADER.map(value => <button type="button" key={value.kode} aria-pressed={area === value.kode} onClick={() => setArea(value.kode)}>{value.label}</button>)}</div></section>
    </div>
    <section className="ph-formel__valgt" aria-live="polite"><div><span>Valgt kombinasjon</span><h2>{PYRAMIDE_LABEL[axis]} · {selected.label}</h2></div><dl><div><dt>Pyramide</dt><dd>{axis}</dd></div><div><dt>Område</dt><dd>{selected.kode}</dd></div><div><dt>Repetisjoner registreres som</dt><dd>{REP[selected.repsEnhet]}</dd></div>{selected.enhet && <div><dt>Avstandsenhet</dt><dd>{selected.enhet === "ft" ? "Fot" : "Meter"}</dd></div>}</dl><p>Pyramide og område er selvstendige valg. En øvelse bærer sin egen AK-formel.</p><KnappLenke href="/portal/planlegge/workbench" variant="secondary">Åpne Workbench</KnappLenke></section>
  </div>;
}
