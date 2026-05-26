// Pages 07-10: SG-sammenlign landing/onboarding/resultat + 10 sammenlign-spillere

// ───── 07 SG-sammenlign landing ─────
function SGLanding({ onStart }) {
  const D = window.AKG_DATA;

  return (
    <div>
      <section className="hero" style={{ paddingBottom: 24 }}>
        <Reveal>
          <Eyebrow tone="forest">SG-sammenligning</Eyebrow>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "center", marginTop: 16 }}>
          <Reveal>
            <h1 style={{ fontSize: 84, lineHeight: 0.95 }}>
              Sammenligna deg<br/>med <em className="italic-accent">Rory McIlroy</em>.
            </h1>
            <p className="hero-sub" style={{ maxWidth: 540 }}>
              Legg inn snittscoren din. Vi estimerer din Strokes Gained, og viser hvor du står mot proffene — på 60 sekunder.
            </p>
            <div className="hero-ctas">
              <Btn variant="primary" icon="ArrowRight" size="lg" onClick={onStart}>
                Start gratis sammenligning
              </Btn>
              <Btn variant="ghost" icon={null}>Logg inn</Btn>
            </div>
            <div className="mini-mono" style={{ marginTop: 20 }}>
              KREVER GRATIS KONTO · INGEN KREDITTKORT · 60 SEK
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div style={{ display: "grid", placeItems: "center", background: "var(--secondary)", borderRadius: "var(--r-xl)", padding: 40 }}>
              <BigRadar
                axes={["OTT", "APP", "ARG", "PUTT"]}
                you={[0.55, 0.38, 0.50, 0.45]}
                them={[0.92, 0.95, 0.88, 0.85]}
                size={320}/>
              <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 12, fontFamily: "var(--font-mono)" }}>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--primary)", borderRadius: 2, marginRight: 6 }}/>Du</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--accent)", borderRadius: 2, marginRight: 6 }}/>Rory McIlroy</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Slik fungerer det</Eyebrow>
              <h2>Tre steg. <em className="italic-accent">Tre minutter.</em></h2>
            </div>
          </div>
        </Reveal>
        <div className="steps">
          {[
            { n: "01", t: "Velg referanse",   d: "Pluk en av topp-100 PGA-spillere. Rory, Scottie, Hovland — eller en favoritt.",  icon: "Trophy"   },
            { n: "02", t: "Legg inn tall",     d: "Snittscoren din er nok. Har du egne SG-tall fra TrackMan kan du bruke dem.",     icon: "Target"   },
            { n: "03", t: "Få analyse",        d: "Radar, KPI, estimert Tour-ekvivalent, og hvilken kategori du har størst gap på.", icon: "Sparkles" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="step-card">
                <span className="step-num">{s.n}</span>
                <Icon name={s.icon} size={28} className="step-icon"/>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Eksempler</Eyebrow>
              <h2>Hva du kan <em className="italic-accent">finne ut</em>.</h2>
            </div>
          </div>
        </Reveal>
        <div className="grid-3">
          {[
            { tit: "HCP 12", radar: [0.55, 0.30, 0.50, 0.65], txt: "Største gap er innspill (−1.8). Putting er overraskende sterk (−0.4). Du er ca P30 på PGA Tour." },
            { tit: "Scratch (HCP 0)", radar: [0.80, 0.75, 0.78, 0.82], txt: "Du taper kun 2 strokes mot Tour-snittet. Største gap er drive distance (−0.6)." },
            { tit: "HCP 25", radar: [0.30, 0.25, 0.20, 0.35], txt: "Du er på et tidlig nivå — størst gap er ARG (−2.1). Fokus her gir raskest forbedring." },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 28 }}>
                <div className="mini-mono">EKSEMPEL · BRUKER PÅ {c.tit.toUpperCase()}</div>
                <div style={{ display: "grid", placeItems: "center", margin: "16px 0" }}>
                  <MiniRadar values={c.radar} values2={[0.9, 0.9, 0.9, 0.9]} size={150}/>
                </div>
                <p style={{ fontSize: 14, color: "var(--muted-fg)", lineHeight: 1.5 }}>{c.txt}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Intro</Eyebrow>
              <h2>Hva er <em className="italic-accent">Strokes Gained</em>?</h2>
            </div>
          </div>
        </Reveal>

        <div className="grid-4" style={{ marginTop: 16 }}>
          {[
            { tag: "SG: OTT",  forklar: "Off The Tee — hvor mange strokes du vinner/taper på drives, vs Tour-snittet.", icon: "Crosshair" },
            { tag: "SG: APP",  forklar: "Approach — fra fairway/rough mot greenen. Den mest forutsigbare SG-kategorien.", icon: "Target" },
            { tag: "SG: ARG",  forklar: "Around the Green — chips, pitches, bunker. Trent skill, ikke talent.", icon: "Flag" },
            { tag: "SG: PUTT", forklar: "Putting — fra hver avstand på greenen. Tour-snittet er definert som 0.", icon: "Circle" },
          ].map((sg, i) => (
            <Reveal key={i} delay={i * 60}>
              <div style={{ background: "var(--secondary)", borderRadius: "var(--r-md)", padding: 24 }}>
                <Icon name={sg.icon} size={22} style={{ color: "var(--primary)" }}/>
                <div className="mono" style={{ fontWeight: 600, fontSize: 16, marginTop: 12, letterSpacing: "0.04em" }}>{sg.tag}</div>
                <p style={{ fontSize: 13, color: "var(--muted-fg)", lineHeight: 1.5, marginTop: 8 }}>{sg.forklar}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <p style={{ fontSize: 16, lineHeight: 1.7, marginTop: 32, maxWidth: 720, color: "var(--muted-fg)" }}>
            Strokes Gained ble utviklet av <strong>Mark Broadie</strong> ved Columbia Business School. Tour-snittet er definert som 0 — et positivt tall betyr at du vinner strokes mot snittet, et negativt at du taper.
          </p>
        </Reveal>
      </section>

      <MersalgBand/>

      <section className="section section-divider" style={{ background: "var(--primary)", color: "var(--bg)", borderRadius: 0 }}>
        <div style={{ textAlign: "center" }}>
          <Eyebrow tone="lime">Kom i gang</Eyebrow>
          <h2 style={{ fontSize: 56, marginTop: 16, color: "var(--bg)" }}>
            Det tar <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>60 sekunder</em>.
          </h2>
          <p style={{ color: "rgba(250,250,247,0.7)", margin: "20px auto 32px", maxWidth: 480, fontSize: 16, lineHeight: 1.5 }}>
            Gratis konto. Ingen spam. Etterpå kan du oppgradere til PlayerHQ for å logge runder.
          </p>
          <Btn variant="outline" icon="ArrowRight" size="lg" onClick={onStart}>Lag gratis konto</Btn>
          <div className="mini-mono" style={{ marginTop: 24, color: "rgba(250,250,247,0.6)" }}>
            300+ HAR ALLEREDE PRØVD
          </div>
        </div>
      </section>
    </div>
  );
}

// ───── 08 SG-sammenlign onboarding ─────
function SGOnboarding({ onComplete }) {
  const D = window.AKG_DATA;
  const [step, setStep] = useState(0);
  const [refSpiller, setRefSpiller] = useState(D.refSpillere[0]);
  const [mode, setMode] = useState("snitt");
  const [snittScore, setSnittScore] = useState(78);
  const [antallRunder, setAntallRunder] = useState(20);
  const [sg, setSg] = useState({ ott: 0, app: 0, arg: 0, putt: 0 });

  const sgTotal = sg.ott + sg.app + sg.arg + sg.putt;
  const hcp = Math.max(0, Math.round((snittScore - 70) * 1.0 * 10) / 10);

  return (
    <div>
      <section style={{ padding: "32px 64px 24px", borderBottom: "1px solid var(--border)" }}>
        <div className="row-between">
          <a href="#" className="breadcrumb">← Tilbake til SG-sammenligning</a>
          <div className="mini-mono">STEG {step + 1} AV 2</div>
        </div>
      </section>

      <section style={{ padding: "48px 64px", maxWidth: 880, margin: "0 auto" }}>
        <StepIndicator steps={["Velg referanse", "Legg inn tall"]} active={step}/>

        {step === 0 && (
          <Reveal>
            <div className="text-center" style={{ marginBottom: 40 }}>
              <Eyebrow>Steg 1 av 2</Eyebrow>
              <h1 style={{ fontSize: 48, marginTop: 12 }}>
                Velg din <em className="italic-accent">referansespiller</em>
              </h1>
              <p className="muted-foreground" style={{ maxWidth: 520, margin: "16px auto 0" }}>
                Topp 100 på PGA Tour etter Strokes Gained. Velg en du er nysgjerrig på.
              </p>
            </div>

            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              <SearchBox value="" onChange={() => {}} placeholder="Søk spiller…" size="lg"/>
            </div>

            <div className="mini-mono" style={{ textAlign: "center", marginTop: 28 }}>
              ELLER VELG FRA QUICK-PICKS ↓
            </div>

            <div className="qpick-grid">
              {D.refSpillere.map(s => (
                <button key={s.dgId}
                        className={`qpick ${refSpiller.dgId === s.dgId ? "selected" : ""}`}
                        onClick={() => setRefSpiller(s)}>
                  <div className="qpick-avatar">{s.name.split(" ").map(n => n[0]).join("")}</div>
                  <div>
                    <div className="qpick-name">{s.name}</div>
                    <div className="qpick-sub">SG +{s.sgTotal.toFixed(2)}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 48 }}>
              <Btn variant="primary" icon="ArrowRight" size="lg" onClick={() => setStep(1)}>
                Neste — legg inn dine tall
              </Btn>
            </div>
          </Reveal>
        )}

        {step === 1 && (
          <Reveal>
            <div className="text-center" style={{ marginBottom: 40 }}>
              <Eyebrow>Steg 2 av 2</Eyebrow>
              <h1 style={{ fontSize: 48, marginTop: 12 }}>
                Legg inn <em className="italic-accent">dine tall</em>
              </h1>
              <p className="muted-foreground" style={{ maxWidth: 520, margin: "16px auto 0" }}>
                Bruk snittscoren din — vi estimerer SG-fordelingen din via Broadie-tabellen.
              </p>
            </div>

            <TabBar tabs={[
              { id: "snitt", label: "Bruk snittscore" },
              { id: "sg",    label: "Jeg har egne SG-tall" },
            ]} active={mode} onChange={setMode}/>

            {mode === "snitt" && (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 48, marginTop: 24, textAlign: "center" }}>
                <div className="mini-mono">SNITTSCORE (BRUTTO)</div>
                <div className="editorial-num" style={{ marginTop: 16 }}>{snittScore}</div>
                <div style={{ maxWidth: 480, margin: "24px auto 0" }}>
                  <RangeSlider value={snittScore} min={60} max={140} step={0.5} onChange={setSnittScore}/>
                </div>

                <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
                  <div>
                    <div className="mini-mono">ANTALL RUNDER</div>
                    <div className="mono" style={{ fontSize: 28, fontWeight: 500, marginTop: 4 }}>{antallRunder}</div>
                  </div>
                  <div>
                    <div className="mini-mono">ESTIMERT HCP</div>
                    <div className="mono" style={{ fontSize: 28, fontWeight: 500, marginTop: 4 }}>{hcp.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="mini-mono">TOUR-EKVIVALENT</div>
                    <div className="mono" style={{ fontSize: 28, fontWeight: 500, marginTop: 4, color: "var(--primary)" }}>
                      {(snittScore + 4.4).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mode === "sg" && (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 48, marginTop: 24 }}>
                <div className="grid-2">
                  {[
                    { key: "ott",  label: "SG: OFF THE TEE" },
                    { key: "app",  label: "SG: APPROACH" },
                    { key: "arg",  label: "SG: AROUND GREEN" },
                    { key: "putt", label: "SG: PUTTING" },
                  ].map(f => (
                    <div key={f.key} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                      <div className="mini-mono">{f.label}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                        <input
                          type="number"
                          value={sg[f.key]}
                          step="0.1"
                          onChange={(e) => setSg({ ...sg, [f.key]: Number(e.target.value) })}
                          style={{ width: 120, fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500, border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", background: "var(--bg)" }}/>
                      </div>
                      <RangeSlider value={sg[f.key]} min={-5} max={5} step={0.1}
                        onChange={(v) => setSg({ ...sg, [f.key]: v })}/>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid var(--border)", marginTop: 24, paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
                  <span className="mini-mono">SG TOTAL</span>
                  <span className="mono" style={{ fontSize: 24, fontWeight: 500, color: "var(--primary)" }}>
                    {sgTotal >= 0 ? "+" : ""}{sgTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48 }}>
              <Btn variant="secondary" icon="ChevronLeft" iconAfter={false} onClick={() => setStep(0)}>Tilbake</Btn>
              <Btn variant="primary" icon="ArrowRight" size="lg" onClick={onComplete}>
                Se min sammenligning
              </Btn>
            </div>
          </Reveal>
        )}
      </section>
    </div>
  );
}

// ───── 09 SG-sammenlign resultat ─────
function SGResultat() {
  const D = window.AKG_DATA;
  const ref = D.refSpillere[0]; // Rory
  const youSG = { ott: -0.42, app: -0.91, arg: -0.28, putt: -0.65 };
  const youTotal = youSG.ott + youSG.app + youSG.arg + youSG.putt;

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <a href="#" className="breadcrumb">← SG-sammenligning</a>
        </Reveal>

        <Reveal delay={60}>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Eyebrow>Din sammenligning · {ref.year}</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 32, alignItems: "center", marginTop: 32 }}>
              <div style={{ textAlign: "right" }}>
                <h1 style={{ fontSize: 56, fontStyle: "italic", fontWeight: 500 }}>Anders</h1>
                <div className="mono" style={{ fontSize: 32, fontWeight: 500, marginTop: 8, color: "var(--muted-fg)" }}>
                  SG: {youTotal.toFixed(2)}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontStyle: "italic", color: "var(--accent-fg)", background: "var(--accent)", padding: "12px 24px", borderRadius: 12 }}>vs</div>
              <div style={{ textAlign: "left" }}>
                <h1 style={{ fontSize: 56, fontStyle: "italic", fontWeight: 500 }}>{ref.name.split(" ")[1]}</h1>
                <div className="mono" style={{ fontSize: 32, fontWeight: 500, marginTop: 8, color: "var(--primary)" }}>
                  SG: +{ref.sgTotal.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="mini-mono" style={{ marginTop: 24 }}>SESONG 2026 · PGA TOUR</div>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <div className="kpi-strip" style={{ borderRadius: 0 }}>
          <div className="kpi">
            <div className="kpi-eyebrow">Din SG Total</div>
            <div className="kpi-value">{youTotal.toFixed(2)}</div>
            <div className="kpi-sub">per runde, estimert</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">{ref.name.split(" ")[1].toUpperCase()}S SG TOTAL</div>
            <div className="kpi-value" style={{ color: "var(--primary)" }}>+{ref.sgTotal.toFixed(2)}</div>
            <div className="kpi-sub">sesong {ref.year}</div>
          </div>
          <div className="kpi" style={{ background: "var(--accent)" }}>
            <div className="kpi-eyebrow" style={{ color: "var(--accent-fg)" }}>Differanse</div>
            <div className="kpi-value">{(youTotal - ref.sgTotal).toFixed(2)}</div>
            <div className="kpi-sub" style={{ color: "var(--accent-fg)" }}>du må ta inn</div>
          </div>
        </div>
      </Reveal>

      <section className="section">
        <Reveal>
          <div style={{ textAlign: "center" }}>
            <Eyebrow>Visuell sammenligning</Eyebrow>
            <h2 style={{ marginTop: 12 }}>Radar — du <em className="italic-accent">vs</em> {ref.name.split(" ")[1]}</h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div style={{ display: "grid", placeItems: "center", marginTop: 32 }}>
            <BigRadar
              you={[
                0.5 + youSG.ott / 5,
                0.5 + youSG.app / 5,
                0.5 + youSG.arg / 5,
                0.5 + youSG.putt / 5,
              ]}
              them={[
                0.5 + ref.sgOTT / 5,
                0.5 + ref.sgAPP / 5,
                0.5 + ref.sgARG / 5,
                0.5 + ref.sgPUT / 5,
              ]}
              size={420}/>
            <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: 13, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
              <span><span style={{ display: "inline-block", width: 14, height: 14, background: "var(--primary)", borderRadius: 3, marginRight: 8, verticalAlign: "middle" }}/>Du</span>
              <span><span style={{ display: "inline-block", width: 14, height: 14, background: "var(--accent)", borderRadius: 3, marginRight: 8, verticalAlign: "middle" }}/>{ref.name}</span>
            </div>
            <div className="mini-mono" style={{ marginTop: 16, color: "var(--muted-fg)" }}>
              VERDIER PÅ RADAR ER NORMALISERT
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="grid-2" style={{ alignItems: "stretch" }}>
            <div style={{ background: "var(--accent)", color: "var(--accent-fg)", borderRadius: "var(--r-lg)", padding: 40 }}>
              <div className="mini-mono">STØRSTE GAP</div>
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 28, fontWeight: 600 }}>Innspill <span className="mono" style={{ fontSize: 16, opacity: 0.7 }}>SG: APP</span></h3>
                <div className="editorial-num" style={{ fontSize: 64, marginTop: 12 }}>
                  −{(ref.sgAPP - youSG.app).toFixed(2)}
                </div>
                <div style={{ fontSize: 14, marginTop: 8 }}>strokes per runde</div>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.5, marginTop: 24, maxWidth: 380 }}>
                Innspill er den mest forutsigbare SG-kategorien. Strokene tapt her er strokes du kan vinne tilbake.
              </p>
              <a href="#" style={{ fontSize: 13, color: "var(--accent-fg)", fontWeight: 600, marginTop: 24, display: "inline-block", textDecoration: "underline" }}>
                Få drillforslag for SG: APP i PlayerHQ →
              </a>
            </div>

            <div style={{ background: "var(--secondary)", borderRadius: "var(--r-lg)", padding: 40 }}>
              <div className="mini-mono">DIN NORSKE SNITTSCORE</div>
              <div className="editorial-num" style={{ fontSize: 64, marginTop: 12 }}>78.0</div>
              <div style={{ borderTop: "1px solid var(--border)", margin: "32px 0" }}/>
              <div className="mini-mono">ESTIMERT PÅ PGA TOUR-BANE</div>
              <div className="editorial-num" style={{ fontSize: 64, marginTop: 12, color: "var(--primary)" }}>82.4</div>
              <div style={{ fontSize: 14, color: "var(--muted-fg)", marginTop: 12 }}>HCP-estimert: 8.0</div>
              <div className="mini-mono" style={{ marginTop: 24, color: "var(--muted-fg)" }}>
                BEREGNET MED WHS-FORMEL · SLOPE 145, CR 74.5
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Hva nå?</Eyebrow>
              <h2>Tre <em className="italic-accent">veier</em> videre.</h2>
            </div>
          </div>
        </Reveal>
        <div className="steps">
          {[
            { n: "01", t: "Prøv PlayerHQ",     d: "Få automatisk SG per runde + AI-tips for å lukke gapet.", icon: "Sparkles" },
            { n: "02", t: "Ny sammenligning",  d: "Velg en annen proff og se forskjellen.",                    icon: "Trophy" },
            { n: "03", t: "Del",                d: "Del en screenshot på X eller med vennene dine.",            icon: "ExternalLink" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="step-card">
                <span className="step-num">{s.n}</span>
                <Icon name={s.icon} size={28} className="step-icon"/>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

// ───── 10 Sammenlign norske spillere ─────
function SammenlignSpillere() {
  const D = window.AKG_DATA;
  const [a, setA] = useState(D.norskeSpillere[0]);
  const [b, setB] = useState(D.norskeSpillere[8]); // Anders

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>AK Golf Stats · Sammenlign</Eyebrow>
          <h1>
            Sammenlign <em className="italic-accent">to</em> norske spillere.
          </h1>
          <p className="hero-sub">Velg to spillere og se side-by-side: snittscore over tid, beste resultater, tour-fordeling.</p>
        </Reveal>
      </section>

      <section className="section section-divider">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 32, alignItems: "stretch" }}>
          <Reveal>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 28 }}>
              <div className="mini-mono">SPILLER A</div>
              <div className="row" style={{ marginTop: 16, gap: 14 }}>
                <div className="qpick-avatar" style={{ width: 56, height: 56, fontSize: 16 }}>{a.name.split(" ").map(n => n[0]).join("")}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>{a.name}</div>
                  <div className="muted-foreground" style={{ fontSize: 13 }}>{a.ar} år · {a.klubb}</div>
                </div>
              </div>
              <div style={{ marginTop: 18 }}><span className={`tier-badge ${a.tier}`}>{a.tier.replace("-", " ")}</span></div>
              <a href="#" style={{ marginTop: 18, display: "inline-block", fontSize: 13, color: "var(--primary)" }}>Bytt spiller →</a>
            </div>
          </Reveal>
          <div style={{ display: "grid", placeItems: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontStyle: "italic", color: "var(--primary)" }}>vs</div>
          </div>
          <Reveal delay={80}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 28 }}>
              <div className="mini-mono">SPILLER B</div>
              <div className="row" style={{ marginTop: 16, gap: 14 }}>
                <div className="qpick-avatar" style={{ width: 56, height: 56, fontSize: 16 }}>{b.name.split(" ").map(n => n[0]).join("")}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>{b.name}</div>
                  <div className="muted-foreground" style={{ fontSize: 13 }}>{b.ar} år · {b.klubb}</div>
                </div>
              </div>
              <div style={{ marginTop: 18 }}><span className={`tier-badge ${b.tier}`}>{b.tier.replace("-", " ")}</span></div>
              <a href="#" style={{ marginTop: 18, display: "inline-block", fontSize: 13, color: "var(--primary)" }}>Bytt spiller →</a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="kpi-strip cols-4" style={{ marginTop: 40, borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
            {[
              { lbl: "Totalt runder",     a: 287, b: 198 },
              { lbl: "Snitt 2026",        a: 70.5, b: 71.8 },
              { lbl: "Beste ever",        a: 63,  b: 65 },
              { lbl: "Turneringer",       a: 142, b: 87 },
            ].map((k, i) => (
              <div key={i} className="kpi">
                <div className="kpi-eyebrow">{k.lbl}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--muted-fg)", letterSpacing: "0.1em" }}>A:</span>
                    <span className="mono" style={{ fontSize: 22, fontWeight: 500, color: typeof k.a === "number" && k.a < k.b ? "var(--primary)" : "inherit" }}>{k.a}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--muted-fg)", letterSpacing: "0.1em" }}>B:</span>
                    <span className="mono" style={{ fontSize: 22, fontWeight: 500, color: typeof k.b === "number" && k.b < k.a ? "var(--primary)" : "inherit" }}>{k.b}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Sesongsnitt</Eyebrow>
              <h2>Hvem har <em className="italic-accent">utviklet seg mest</em>?</h2>
            </div>
            <span className="mini-mono">LAVERE = BEDRE</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 32 }}>
            <LineChart
              series={[
                { values: [73.2, 72.4, 71.8, 71.2, 72.4, 71.2, 70.5], color: "#005840", width: 2.5 },
                { values: [74.8, 74.1, 73.5, 73.0, 72.6, 72.1, 71.8], color: "#D1F843", width: 2.5, dashed: true },
              ]}
              xLabels={["2020", "2021", "2022", "2023", "2024", "2025", "2026"]}
              inverted
              height={280}/>
            <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: 13, fontFamily: "var(--font-mono)" }}>
              <span><span style={{ display: "inline-block", width: 14, height: 3, background: "var(--primary)", marginRight: 8, verticalAlign: "middle" }}/>{a.name}</span>
              <span><span style={{ display: "inline-block", width: 14, height: 3, background: "var(--accent)", marginRight: 8, verticalAlign: "middle" }}/>{b.name}</span>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <div className="pull-quote">
          {a.name.split(" ")[0]} har <strong>bedre snittscore</strong> (70.5 vs 71.8) over flere runder.
          {b.name.split(" ")[0]} har <strong>lavere best-ever-score</strong> (63 vs 65).
          {a.name.split(" ")[0]} dominerer på PGA Tour, {b.name.split(" ")[0]} på Srixon.
          <div className="pull-quote-credit">Automatisk oppsummering · oppdatert mai 2026</div>
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

Object.assign(window, { SGLanding, SGOnboarding, SGResultat, SammenlignSpillere });
