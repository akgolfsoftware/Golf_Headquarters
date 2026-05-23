/**
 * /portal/test/[testId]/live — pixel-perfekt port av tre live-test step-skjermer:
 *   - docs/design-handoff/test-modul/tester-live-step1.html (oppvarming)
 *   - docs/design-handoff/test-modul/tester-live-step2.html (5-slag tabell)
 *   - docs/design-handoff/test-modul/tester-live-step-final.html (egenvurdering)
 *
 * Step velges via prop. Pixel-perfekt mockup-versjon; ekte session-state-tilkobling
 * gjøres via eksisterende session-actions.ts.
 */

"use client";

import { useState } from "react";
import "../planlegge-v2/styles.css";
import { PlanleggeSprite } from "../planlegge-v2/icons";

type StepNum = 1 | 2 | 4;

export function TesterLiveScreen({ step = 1 }: { step?: StepNum }) {
  const [activeStep] = useState<StepNum>(step);

  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <div className="live-shell">
        {/* LIVE HEAD */}
        <header className="live-head">
          <span className="pyr pyr-slag">SLAG</span>
          <div className="center">
            <div className="ttl">Driver Basic</div>
            <div className="eye">SLAGTEKNIKK · LIVE-TEST</div>
          </div>
          <button className="x" aria-label="Avbryt">
            <svg fill="none" stroke="currentColor"><use href="#i-x" /></svg>
          </button>
        </header>

        {/* LIVE PROGRESS */}
        <div className="live-progress">
          <span className="lbl">
            Steg <strong>{activeStep === 4 ? "4 av 4" : `${activeStep} av 4`}</strong>
            <span className="sep">·</span>
            {activeStep === 1 ? "Oppvarming" : activeStep === 2 ? "Hovedtest" : "Egenvurdering"}
          </span>
          <div className="live-bar">
            <div style={{ width: activeStep === 1 ? "8%" : activeStep === 2 ? "40%" : "96%" }} />
          </div>
          <span className="time">
            <svg fill="none" stroke="currentColor"><use href="#i-clock" /></svg>
            {activeStep === 4 ? "~1 min igjen" : "~10 min totalt"}
          </span>
        </div>

        {/* LIVE BODY */}
        <div className="live-body">
          {activeStep === 1 && <Step1Warmup />}
          {activeStep === 2 && <Step2Score />}
          {activeStep === 4 && <Step4Final />}

          {/* Collapsed preview steps */}
          {activeStep === 1 && (
            <>
              <CollapsedStep num={2} title="5 driver-slag på rad" sub="REGISTRER CARRY · TOTAL · SIDEAVVIK PER SLAG" />
              <CollapsedStep num={3} title="Spread & PEI-beregning" sub="AUTO · INGEN INPUT" />
              <CollapsedStep num={4} title="Egenvurdering & lagring" sub="VALGFRITT · NOTAT" />
            </>
          )}
          {activeStep === 2 && (
            <>
              <CollapsedStep num={3} title="Spread & PEI-beregning" sub="AUTO · INGEN INPUT" />
              <CollapsedStep num={4} title="Egenvurdering & lagring" sub="VALGFRITT · NOTAT" />
            </>
          )}
        </div>

        {/* LIVE FOOTER */}
        <footer className="live-foot">
          <span className="left">
            <svg fill="none" stroke="currentColor"><use href="#i-clock" /></svg>
            {activeStep === 4 ? (
              <>
                <strong style={{ color: "var(--ink)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>11:42</strong>
                {" "}· 4 av 4 steg
              </>
            ) : (
              "~10 min totalt"
            )}
          </span>
          <div className="cta">
            <button className="btn btn-outline">Lagre &amp; pause</button>
            {activeStep === 4 ? (
              <button className="btn btn-lime" style={{ fontSize: "14px", padding: "14px 22px" }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-check" /></svg>
                Fullfør test
              </button>
            ) : (
              <button className="btn btn-primary">
                Lagre &amp; neste steg
                <svg fill="none" stroke="currentColor"><use href="#i-arrow-right" /></svg>
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

function CollapsedStep({ num, title, sub }: { num: number; title: string; sub: string }) {
  return (
    <div className="step-card">
      <div className="sh">
        <div className="num idle">{num}</div>
        <div className="meta">
          <div className="ttl">{title}</div>
          <div className="sub">{sub}</div>
        </div>
        <button className="toggle">
          <svg fill="none" stroke="currentColor"><use href="#i-chevron-dn" /></svg>
        </button>
      </div>
    </div>
  );
}

function DoneStep({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="step-card">
      <div className="sh">
        <div className="num done">
          <svg fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-check" /></svg>
        </div>
        <div className="meta">
          <div className="ttl">{title}</div>
          <div className="sub">{sub}</div>
        </div>
        <button className="toggle">
          <svg fill="none" stroke="currentColor"><use href="#i-chevron-dn" /></svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Step 1 — Warmup checklist
// ============================================================================

function Step1Warmup() {
  const slag = [
    { n: 1, lbl: "Slag 1 — kort 70%", sub: "Bekreftet · 14:02", done: true },
    { n: 2, lbl: "Slag 2 — kort 70%", sub: "Bekreftet · 14:03", done: true },
    { n: 3, lbl: "Slag 3 — medium 75%", sub: "Bekreftet · 14:04", done: true },
    { n: 4, lbl: "Slag 4 — medium 80%", sub: "Klar for slag", done: false, active: true },
    { n: 5, lbl: "Slag 5 — full 80%", sub: "Avsluttende slag", done: false },
  ];
  return (
    <div className="step-card open">
      <div className="sh">
        <div className="num">1</div>
        <div className="meta">
          <div className="ttl">Driver-oppvarming</div>
          <div className="sub">5 SLAG · 70–80% INTENSITET</div>
        </div>
        <button className="toggle">
          <svg fill="none" stroke="currentColor"><use href="#i-chevron-up" /></svg>
        </button>
      </div>
      <div className="sbody">
        <div className="info-row">
          <svg fill="none" stroke="currentColor"><use href="#i-info" /></svg>
          <div className="txt">
            Slå <strong>5 driver-slag på 70–80% intensitet</strong>. Du trenger ikke registrere data — bare bekreft at hvert slag er gjennomført. Målet er å være klart oppvarmet før hovedtesten.
          </div>
        </div>
        <div className="equip-row">
          <span className="lbl">Utstyr:</span>
          <span className="chip">Driver</span>
          <span className="chip">5 baller</span>
          <span className="chip">Range eller TrackMan</span>
        </div>
        <div className="tip-row">
          <svg fill="none" stroke="currentColor"><use href="#i-lightbulb" /></svg>
          <div className="txt">
            <strong>Tips:</strong> Hopp ikke over oppvarmingen — kalde mål gir falske skjevheter i PEI. Ta deg tid mellom slagene.
          </div>
        </div>
        <div className="card" style={{ padding: 0, marginTop: "18px", borderColor: "var(--border)" }}>
          {slag.map((s) => (
            <div key={s.n} className="opp-row">
              <div className={`rn${s.done ? " done" : ""}`}>
                {s.done ? <svg fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-check" /></svg> : s.n}
              </div>
              <div className="lbl">
                {s.lbl}
                <span className="sub">{s.sub}</span>
              </div>
              <div className="toggle-pair">
                <button className={s.done ? "on" : s.active ? "off-active" : ""}>
                  {s.done && <svg fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-check" /></svg>}
                  Gjort
                </button>
                <button>Hopp</button>
              </div>
            </div>
          ))}
        </div>
        <div className="all-done" style={{ marginTop: "18px" }}>
          <svg fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-check" /></svg>
          <div>
            <strong>Bra start.</strong> Du har bekreftet 3 av 5 oppvarmingsslag. Når alle 5 er gjort, går du til steg 2: hovedtesten.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 2 — Score table
// ============================================================================

function Step2Score() {
  const rows = [
    { n: 1, carry: "245", total: "268", side: "+3", filled: true },
    { n: 2, carry: "241", total: "263", side: "-1", filled: true },
    { n: 3, carry: "252", total: "", side: "", filled: false, active: true, partial: true },
    { n: 4, carry: "", total: "", side: "", filled: false },
    { n: 5, carry: "", total: "", side: "", filled: false },
  ];
  return (
    <>
      <DoneStep title="Driver-oppvarming" sub="5 AV 5 SLAG · FULLFØRT 14:08" />
      <div className="step-card open">
        <div className="sh">
          <div className="num">2</div>
          <div className="meta">
            <div className="ttl">5 driver-slag på rad</div>
            <div className="sub">REGISTRER CARRY · TOTAL · SIDEAVVIK PER SLAG · MÅL PEI &lt; 0,06</div>
          </div>
          <button className="toggle">
            <svg fill="none" stroke="currentColor"><use href="#i-chevron-up" /></svg>
          </button>
        </div>
        <div className="sbody">
          <div className="info-row">
            <svg fill="none" stroke="currentColor"><use href="#i-info" /></svg>
            <div className="txt">
              Sikt mot <strong>midten av fairway</strong>. Slå <strong>5 driver-slag på rad</strong> uten korreksjon mellom slagene. Registrer carry, total og sideavvik per slag.
            </div>
          </div>
          <div className="equip-row">
            <span className="lbl">Utstyr:</span>
            <span className="chip">Driver</span>
            <span className="chip">TrackMan</span>
            <span className="chip">5 baller</span>
          </div>
          <div className="tip-row">
            <svg fill="none" stroke="currentColor"><use href="#i-lightbulb" /></svg>
            <div className="txt">
              <strong>Tips:</strong> Resultater utendørs avhenger av vær — <strong>IKKE bruk</strong> dette datasettet for direkte sammenligning mot innendørs-økter.
            </div>
          </div>

          <div className="score-table">
            <div className="score-thead">
              <span>#</span>
              <span>
                Carry <span className="small">(meter)</span>
              </span>
              <span>
                Total <span className="small">(meter)</span>
              </span>
              <span>
                Sideavvik <span className="small">(+ høyre · m)</span>
              </span>
            </div>
            {rows.map((r) => (
              <div key={r.n} className={`score-row${r.active ? " active" : ""}`}>
                <div className={`rn${r.filled || r.partial ? " filled" : ""}`}>{r.n}</div>
                <div className="input-wrap with-unit">
                  <input className={r.carry ? "filled" : ""} defaultValue={r.carry} placeholder="0" />
                  <span className="suffix">m</span>
                </div>
                <div className="input-wrap with-unit">
                  <input className={r.total ? "filled" : ""} defaultValue={r.total} placeholder="0" />
                  <span className="suffix">m</span>
                </div>
                <div className="input-wrap with-unit">
                  <input className={r.side ? "filled" : ""} defaultValue={r.side} placeholder="0" />
                  <span className="suffix">m</span>
                </div>
              </div>
            ))}
          </div>

          <div className="live-sum">
            <div>
              <div className="ll">Snitt carry</div>
              <div className="vv">
                246<span className="u">m</span>
              </div>
            </div>
            <div>
              <div className="ll">Snitt total</div>
              <div className="vv">
                265<span className="u">m</span>
              </div>
            </div>
            <div>
              <div className="ll">Snitt sideavvik</div>
              <div className="vv">
                +1<span className="u">m</span>
              </div>
            </div>
            <div>
              <div className="ll">Foreløpig PEI</div>
              <div className="vv calc">0,058</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Step 4 — Final / self-eval
// ============================================================================

function Step4Final() {
  return (
    <>
      <DoneStep title="Driver-oppvarming" sub="5 AV 5 SLAG · FULLFØRT 14:08" />
      <DoneStep title="5 driver-slag på rad" sub="5 AV 5 SLAG · SNITT CARRY 246M · SIDEAVVIK +1M" />
      <DoneStep title="Spread & PEI-beregning" sub="AUTO · PEI 0,054 BEREGNET" />

      <div className="step-card open">
        <div className="sh">
          <div className="num">4</div>
          <div className="meta">
            <div className="ttl">Egenvurdering &amp; lagring</div>
            <div className="sub">VALGFRITT · NOTAT &amp; FØLELSE</div>
          </div>
          <button className="toggle">
            <svg fill="none" stroke="currentColor"><use href="#i-chevron-up" /></svg>
          </button>
        </div>
        <div className="sbody">
          <div className="pei-preview">
            <div>
              <div className="lbl-mini">FORELØPIG PEI</div>
              <div className="big">0,054</div>
              <div className="meta">5 slag · snitt carry 246m · sideavvik +1m · spread 11m</div>
            </div>
            <div className="delta-pill">↑ +0,008 mot 12. mai</div>
          </div>

          <div className="field">
            <div className="field-lbl">Hvordan føltes økten?</div>
            <div className="feel-seg" role="radiogroup">
              <button>Svak</button>
              <button>OK</button>
              <button>God</button>
              <button className="active">Veldig god</button>
              <button>Topp</button>
            </div>
          </div>

          <div className="field">
            <div className="field-lbl">Stjerner — egenvurdering av prestasjon</div>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div className="star-row">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} className={`star${i <= 4 ? " on" : ""}`}>
                    <svg>
                      <use href="#i-star" />
                    </svg>
                  </button>
                ))}
              </div>
              <span className="mono" style={{ color: "var(--muted)", fontSize: "12px" }}>4 av 5</span>
            </div>
          </div>

          <div className="field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <div className="field-lbl">Vind</div>
              <select className="select" defaultValue="Lett bris · 2–5 m/s">
                <option>Stille · &lt; 2 m/s</option>
                <option>Lett bris · 2–5 m/s</option>
                <option>Moderat · 5–8 m/s</option>
                <option>Frisk · &gt; 8 m/s</option>
              </select>
            </div>
            <div>
              <div className="field-lbl">Sted</div>
              <select className="select" defaultValue="TrackMan studio · innendørs">
                <option>TrackMan studio · innendørs</option>
                <option>Range Miklagard</option>
                <option>Range GFGK</option>
                <option>Annet</option>
              </select>
            </div>
          </div>

          <div className="field">
            <div className="field-lbl">
              Notat til deg selv{" "}
              <span style={{ color: "var(--subtle)", fontWeight: 500, letterSpacing: "normal", textTransform: "none" }}>
                (valgfritt)
              </span>
            </div>
            <textarea
              className="textarea"
              placeholder="Hva fungerte? Hva vil du jobbe med neste gang?"
              defaultValue="Veldig god rytme på de 3 første slagene. Slag 4 og 5 ble litt forhastet — jobbe med pre-shot rutinen og tempo."
            />
          </div>

          <div className="bench">
            <svg fill="none" stroke="currentColor" strokeWidth="1.75">
              <use href="#i-zap" />
            </svg>
            <div className="txt">
              Resultatet sendes <strong>automatisk til coach Anders</strong> når du trykker Fullfør. Du vil se det i historikken med en gang.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
