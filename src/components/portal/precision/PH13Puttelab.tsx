"use client";

/**
 * Puttelaboratoriet i nytt design (PlayerHQ pakke 13, godkjent av Anders 16.10.2026).
 * Tre faner: Kjeden (hvor mye hvert ledd betyr), Greenen (hvor du sikter) og Kontroll (rutinen, 10 putter på 2 m).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «putt». Stil: playerhq-ny-statsresten-historikk.css.
 * Regnemodellen er den samme som i PutteLabV2: @/lib/putt-core (break-tabellen og make-modellen).
 *
 * Avvik:
 *   - Kjeden har glidere for de fire leddene modellen regner med (lesing, sikte, ballstart, lengde).
 *     Flaks er fast i modellen (97 %) og Aksept påvirker ikke sjansen; begge står som faste rader, ikke glidere.
 *   - «Svakest» er leddet der 10 prosentpoeng gir mest, slik at teksten alltid stemmer med modellen.
 *   - Sjansen gjelder 3 m med 1,5 % fall og stimp 10, som standardputten i den gamle Kjeden.
 *     Valg av lengde, fall og stimp i Kjeden er tatt ut; de finnes i Greenen.
 *   - Greenen bruker lengdene og fallene i break-tabellen (1–6 m, 0,5–3 %) og stimp 8–13, ikke 1–15 m og 0–4 %.
 *   - Simuleringene i den gamle siden er tatt ut: «Slå putten» med dra-sikte og fart i Greenen,
 *     og «Slå ti putter» med prosess-skive i Kontroll. Kontroll er nå spillerens egen rutinesjekk, som i utkastet.
 *   - Kontroll lagres ikke; telleren starter på 0 hver gang.
 *   - Puttene i Kontroll står i to rader på mobil, så hvert felt er minst 44 px.
 */
import Link from "next/link";
import { useState } from "react";
import { TmTilbake } from "./PH17TmFelles";
import * as C from "@/lib/putt-core";
import type { QVals, StageKey } from "@/lib/putt-core";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsresten-historikk.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke8-skra.css";

export type PuttelabFane = "kjeden" | "greenen" | "kontroll";
const FANER: { id: PuttelabFane; navn: string }[] = [{ id: "kjeden", navn: "Kjeden" }, { id: "greenen", navn: "Greenen" }, { id: "kontroll", navn: "Kontroll" }];

const LEDD: { key: StageKey; navn: string }[] = [
  { key: "read", navn: "Lesing" }, { key: "aim", navn: "Sikte" }, { key: "start", navn: "Ballstart" }, { key: "pace", navn: "Lengde" },
];

type Forvalg = "skarp" | "snitt" | "lengde" | "sikte";
/** Samme hurtigvalg som i PutteLabV2. */
const FORVALG: { id: Forvalg; navn: string; q: QVals }[] = [
  { id: "skarp", navn: "Skarp", q: { read: 0.92, aim: 0.9, start: 0.9, pace: 0.88 } },
  { id: "snitt", navn: "Snittrunde", q: { read: 0.8, aim: 0.74, start: 0.8, pace: 0.66 } },
  { id: "lengde", navn: "Sliter med lengde", q: { read: 0.85, aim: 0.82, start: 0.84, pace: 0.42 } },
  { id: "sikte", navn: "Sikter skjevt", q: { read: 0.86, aim: 0.5, start: 0.8, pace: 0.72 } },
];

/** Standardputten i Kjeden: 3 m (LEN[4]), 1,5 % fall (SLOPES[2]), stimp 10. */
const KJEDE_LEN = 4, KJEDE_FALL = 2, KJEDE_STIMP = 10;
const prosent = (v: number) => `${Math.round(v * 100)} %`;

export function PH13Puttelab({ startFane = "kjeden" }: { startFane?: PuttelabFane }) {
  const [fane, setFane] = useState<PuttelabFane>(startFane);
  return (
    <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Puttelaboratoriet"
      bilde="/images/playerhq/slag-putting.jpg" bildePosisjon="50% 50%"
      overlinje="Putting · seks ledd"
      tittel="Puttelaboratoriet"
      ingress="En putt går i hullet når seks ledd holder: lesing, sikte, ballstart, lengde, flaks og aksept. Prøv hvor mye hvert ledd betyr."
      handling={<span className="skra-tilbake"><TmTilbake href="/portal/drills" tekst="Øvelsesbank" /></span>}
    />
    <SkraFlyt lav>
        <div className="phn-valg" role="group" aria-label="Fane">
          {FANER.map((f) => <button key={f.id} type="button" aria-pressed={fane === f.id} onClick={() => setFane(f.id)}>{f.navn}</button>)}
        </div>
      {fane === "kjeden" && <Kjeden />}
      {fane === "greenen" && <Greenen />}
      {fane === "kontroll" && <Kontroll />}
    </SkraFlyt>
    </div>
  );
}

function Kjeden() {
  const [q, setQ] = useState<QVals>(FORVALG[1]!.q);
  const [valgt, setValgt] = useState<Forvalg | null>("snitt");
  const geom = C.geomCeiling(KJEDE_LEN, KJEDE_FALL, KJEDE_STIMP);
  const sjanse = C.makeProb(geom, q);
  const gevinst = LEDD.map((l) => C.makeProb(geom, { ...q, [l.key]: Math.min(1, q[l.key] + 0.1) }));
  const svakest = gevinst.indexOf(Math.max(...gevinst));

  return (
    <div className="phn-to-kol">
      <div className="phn-kol">
        <section className="phn-kort">
          <div className="phn-sek-topp"><h2>Hvert ledd</h2><span className="phn-kilde">Prosent riktig</span></div>
          <div className="phn-pl-forvalg" role="group" aria-label="Hurtigvalg">
            {FORVALG.map((f) => (
              <button key={f.id} type="button" aria-pressed={valgt === f.id} onClick={() => { setQ(f.q); setValgt(f.id); }}>{f.navn}</button>
            ))}
          </div>
          <div className="phn-ledd">
            {LEDD.map((l, i) => {
              const verdi = Math.round(q[l.key] * 100);
              return (
                <div key={l.key} className={`phn-ledd-rad${i === svakest ? " svakest" : ""}`}>
                  <label htmlFor={`pl-${l.key}`}>{l.navn}</label>
                  <output htmlFor={`pl-${l.key}`}>{verdi} %</output>
                  <input
                    id={`pl-${l.key}`}
                    type="range"
                    min={40}
                    max={100}
                    value={verdi}
                    onChange={(e) => { setQ({ ...q, [l.key]: Number(e.target.value) / 100 }); setValgt(null); }}
                  />
                </div>
              );
            })}
            <div className="phn-ledd-rad fast">
              <span>Flaks</span>
              <output>{prosent(C.FLAX)}</output>
              <small>Fast i modellen. Spor i gresset og annet du ikke styrer.</small>
            </div>
            <div className="phn-ledd-rad fast">
              <span>Aksept</span>
              <output>—</output>
              <small>Gjorde du alt riktig og den bommet, er det aksept. Den endrer ikke sjansen, men neste putt.</small>
            </div>
          </div>
        </section>
      </div>
      <div className="phn-kol">
        <section className="phn-fylt slag" aria-live="polite">
          <span className="phn-akse-tekst">Sjanse for å sette en putt på 3 m</span>
          <div className="phn-stor">{prosent(sjanse)}</div>
          <p>{LEDD[svakest]!.navn} er svakest. 10 prosentpoeng bedre der gir {prosent(gevinst[svakest]!)}, mer enn i noe annet ledd.</p>
        </section>
        <p className="phn-kilde">Modell, ikke måling. Ledd ganges sammen, så det svakeste leddet styrer mest. 3 m, 1,5 % fall, stimp 10.</p>
        <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/drills">Puttøvelser i øvelsesbanken</Link></div>
      </div>
    </div>
  );
}

function Greenen() {
  const [len, setLen] = useState(4);
  const [fall, setFall] = useState(3);
  const [stimp, setStimp] = useState(10);
  const brekkCm = Math.round(C.breakAtStimp(len, fall, stimp));
  const lenCm = C.LEN[len]!.cm;
  const ballY = 260, hullY = 46, pxPerCm = (ballY - hullY) / lenCm;
  const siktX = Math.round((200 - brekkCm * pxPerCm) * 10) / 10;
  const midtY = Math.round(((ballY + hullY) / 2) * 10) / 10;
  const stimpTekst = stimp.toLocaleString("nb-NO", { maximumFractionDigits: 1 });

  return (
    <div className="phn-to-kol">
      <div className="phn-kol">
        <svg className="phn-pl-green" viewBox="0 0 400 300" role="img" aria-label={`Green sett ovenfra. Putt på ${C.LEN[len]!.m}, sikt ${brekkCm} cm til venstre for hullet.`}>
          <rect className="gress" width="400" height="300" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} className="stripe" d={`M${40 + i * 46} 0 l-30 300`} />)}
          <text className="tekst" x="390" y="18" textAnchor="end">Fall mot høyre {C.SLOPES[fall]}</text>
          <line className="linje" x1="200" y1={ballY} x2={siktX} y2={hullY} />
          <path className="bane" d={`M200 ${ballY} Q${siktX - 4} ${midtY} 200 ${hullY + 8}`} />
          <circle cx="200" cy={hullY} r="7" fill="var(--phn-g900)" />
          <circle cx="200" cy={ballY} r="6" fill="var(--phn-hvit)" stroke="var(--phn-g600)" />
          <circle cx={siktX} cy={hullY} r="4" fill="none" stroke="var(--phn-g900)" strokeWidth="2" />
          <text className="tekst sterk" x={siktX - 8} y={hullY + 4} textAnchor="end">Sikt hit</text>
        </svg>
      </div>
      <div className="phn-kol">
        <section className="phn-kort">
          <div className="phn-ledd">
            <div className="phn-ledd-rad">
              <label htmlFor="g-len">Lengde</label>
              <output htmlFor="g-len">{C.LEN[len]!.m}</output>
              <input id="g-len" type="range" min={0} max={C.LEN.length - 1} step={1} value={len} onChange={(e) => setLen(Number(e.target.value))} aria-valuetext={C.LEN[len]!.m} />
            </div>
            <div className="phn-ledd-rad">
              <label htmlFor="g-fall">Fall</label>
              <output htmlFor="g-fall">{C.SLOPES[fall]}</output>
              <input id="g-fall" type="range" min={0} max={C.SLOPES.length - 1} step={1} value={fall} onChange={(e) => setFall(Number(e.target.value))} aria-valuetext={C.SLOPES[fall]} />
            </div>
            <div className="phn-ledd-rad">
              <label htmlFor="g-stimp">Greenhastighet (stimp)</label>
              <output htmlFor="g-stimp">{stimpTekst}</output>
              <input id="g-stimp" type="range" min={8} max={13} step={0.5} value={stimp} onChange={(e) => setStimp(Number(e.target.value))} />
            </div>
          </div>
          <div className="phn-pl-naer">
            <span><b>{brekkCm} cm</b>sikt til venstre for hullet</span>
            <span><b>40 cm</b>forbi hullet</span>
          </div>
          <p className="phn-kilde">Brekket er hentet fra break-tabellen. Ballen bør rulle 40 cm forbi hullet om den bommer. Høyrebrekk, sett fra ballen.</p>
        </section>
      </div>
    </div>
  );
}

function Kontroll() {
  const [putter, setPutter] = useState<boolean[]>(() => Array.from({ length: 10 }, () => false));
  const antall = putter.filter(Boolean).length;
  return (
    <div className="phn-to-kol">
      <div className="phn-kol">
        <section className="phn-kort">
          <div className="phn-sek-topp"><h2>Prosessen, ikke resultatet</h2><span className="phn-kilde">10 putter på 2 m</span></div>
          <p className="phn-forklar">Huk av for hver putt der du gjorde rutinen helt: leste, siktet, ett prøvesving og slo. Om ballen gikk i, er nummer to.</p>
          <div className="phn-pl-putter" role="group" aria-label="Putter der rutinen holdt">
            {putter.map((p, i) => (
              <button key={i} type="button" aria-pressed={p} aria-label={`Putt ${i + 1}`} onClick={() => setPutter(putter.map((x, j) => (j === i ? !x : x)))}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="phn-knapper">
            <button type="button" className="phn-knapp sek" onClick={() => setPutter(putter.map(() => false))}>Ny runde med 10</button>
          </div>
        </section>
      </div>
      <div className="phn-kol">
        <div className="phn-pl-skive" style={{ "--p": antall * 10 } as React.CSSProperties}>
          <span aria-live="polite">{antall}/10</span>
        </div>
        <p className="phn-forklar phn-pl-midt">
          {antall === 0
            ? "Huk av for hver putt der rutinen holdt. Målet er 9 av 10 før du flytter deg ut til 3 m."
            : `Rutinen holdt på ${antall} av 10. Målet er 9 av 10 før du flytter deg ut til 3 m.`}
        </p>
      </div>
    </div>
  );
}
