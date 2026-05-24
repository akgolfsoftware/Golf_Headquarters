// Screen 7 — AI mål-bygger (modal)
const { useState: useS7 } = React;

const GENERATED_GOALS = [
  { type: 'OUTCOME', col: 'pill-turn', t: 'HCP < 0 før sesongstart 2027', kpi: 'WHS · 12 best 20', tid: '12 mnd', dep: 'Krever 4×/uke struktur + 8 turneringer', picked: true },
  { type: 'PROCESS', col: 'pill-spill', t: '6 av 8 putts inn fra 2,5m i 3 sammenhengende uker', kpi: 'Trackman hit-rate', tid: '8 uker', dep: 'Krever 2× putt-økt/uke', picked: true },
  { type: 'OUTCOME', col: 'pill-turn', t: 'Topp-5 på Olyo Tour Larvik (14.06)', kpi: 'Score-resultat', tid: '21 dg', dep: 'Krever 3× spill-økt + putt-fokus', picked: false },
  { type: 'PROCESS', col: 'pill-fys', t: 'Y-balanse rett+venstre = ± 4cm', kpi: 'Fysio-test', tid: '6 uker', dep: 'Krever 3× FYS/uke', picked: false },
  { type: 'PROCESS', col: 'pill-slag', t: 'Pitch 30–50m · CP < 4m', kpi: 'Trackman CP', tid: '10 uker', dep: 'Krever 2× pitch-økt/uke', picked: true },
];

function GoalChecklistRow({ g, i }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 14, alignItems: 'center',
      padding: 16, borderRadius: 12,
      background: g.picked ? 'rgba(0,88,64,0.04)' : '#fff',
      border: g.picked ? '1.5px solid var(--primary)' : '1px solid var(--border)',
      cursor: 'pointer',
    }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, border: '1.5px solid var(--border)', background: g.picked ? 'var(--primary)' : '#fff', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{g.picked && <Icon.Check/>}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className={`pill ${g.col}`}>{g.type}</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.04em' }}>{g.tid} · {g.kpi}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>{g.t}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em', marginTop: 6 }}>↪ {g.dep}</div>
      </div>
      <button className="iconbtn" style={{ width: 28, height: 28, color: 'var(--muted)' }}><Icon.Edit/></button>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
      {[
        { n: 1, l: 'Input' },
        { n: 2, l: 'AI genererer' },
        { n: 3, l: 'Velg & lagre' },
      ].map((s, i) => (
        <React.Fragment key={s.n}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: step === s.n ? 'var(--primary)' : step > s.n ? 'rgba(209,248,67,0.40)' : 'var(--bg)',
            color: step === s.n ? 'var(--accent)' : 'var(--fg)',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: step > s.n ? 'var(--primary)' : step === s.n ? 'var(--accent)' : 'var(--border)', color: step > s.n ? 'var(--accent)' : 'var(--fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>{step > s.n ? '✓' : s.n}</span>
            {s.l}
          </div>
          {i < 2 && <div style={{ width: 16, height: 1, background: 'var(--border)' }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── VARIANT A · 3-stegs wizard ───────────────────────────────────────
function S7_VariantA() {
  const [step, setStep] = useS7(2);
  return (
    <div className="ab" style={{ background: 'rgba(10,31,23,0.45)', backdropFilter: 'blur(2px)' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 640, maxWidth: 'calc(100% - 40px)', maxHeight: 'calc(100% - 40px)', background: '#fff', borderRadius: 20, boxShadow: '0 24px 60px rgba(10,31,23,0.30)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'var(--accent)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--fg)', letterSpacing: '0.10em', textTransform: 'uppercase' }}><Icon.Sparkle/> AI · CLAUDE</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 10 }}>AI mål-<em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>bygger</em></h2>
            <Stepper step={step}/>
          </div>
          <button className="modal-close"><Icon.Close/></button>
        </div>
        <div style={{ padding: '22px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {step === 1 && (
            <>
              <div className="field-stack">
                <div className="field-label">Hva vil du oppnå?</div>
                <textarea className="field-input" placeholder="F.eks. «Bli scratch innen sommeren» eller «Topp-10 på Olyo Tour i juni»" defaultValue="Vil ned i scratch før neste sesong og spille topp-10 på minst én Olyo Tour-event i sommer."/>
              </div>
              <div className="field-stack">
                <div className="field-label">Hva slags mål?</div>
                <div className="chip-row multi">
                  {[['HCP','chip-turn'],['Score','chip-slag'],['Turnering','chip-tek'],['Skill','chip-spill'],['Mental','chip-fys']].map(([l, c]) => (
                    <button key={l} className={`chip ${c} active`}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="field-stack">
                <div className="field-label">Tidsramme</div>
                <div className="segmented">
                  <button>3 mnd</button>
                  <button>6 mnd</button>
                  <button className="active">12 mnd</button>
                </div>
              </div>
              <div className="context-card">
                <Icon.Sparkle/>
                <div className="ctx-body"><strong>AI vil bruke:</strong> dine SG-tall siste 90 dg, planlagte turneringer på Olyo Tour, treningsfrekvens og dine notater fra coach.</div>
              </div>
            </>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', padding: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', animation: 'spin 0.9s linear infinite' }}/>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Bygger 5 SMART-mål fra ditt input …</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>SG-data · turneringskalender · ditt input</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ width: '100%', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skel" style={{ height: 80, borderRadius: 12 }}/>)}
              </div>
            </div>
          )}
          {step === 3 && (
            <>
              <div className="context-card">
                <Icon.Sparkle/>
                <div className="ctx-body"><strong>5 mål basert på 12-mnd input.</strong> Velg de du vil committe til — du kan endre dem etterpå.</div>
              </div>
              {GENERATED_GOALS.map((g, i) => <GoalChecklistRow key={i} g={g} i={i}/>)}
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em', textAlign: 'center', marginTop: 4 }}>AI lærer av dine tidligere mål · {GENERATED_GOALS.filter(g => g.picked).length} valgt</div>
            </>
          )}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <StateStrip states={['1','2','3']} value={String(step)} onChange={(v) => setStep(Number(v))}/>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => step > 1 && setStep(step - 1)}>Tilbake</button>
            {step < 3 && <button className="btn btn-primary" onClick={() => setStep(step + 1)}>{step === 2 ? 'Vis forslag' : 'Generer mål'} →</button>}
            {step === 3 && <button className="btn btn-primary">Lagre 3 mål</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
window.S7_VariantA = S7_VariantA;

// ── VARIANT B · Split-pane (steps + content) ─────────────────────────
function S7_VariantB() {
  return (
    <div className="ab" style={{ background: 'rgba(10,31,23,0.45)' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 940, height: 720, maxWidth: 'calc(100% - 40px)', maxHeight: 'calc(100% - 40px)', background: '#fff', borderRadius: 20, boxShadow: '0 24px 60px rgba(10,31,23,0.30)', display: 'flex', overflow: 'hidden' }}>
        {/* LEFT: progress + summary */}
        <div style={{ width: 300, background: 'linear-gradient(180deg, var(--primary-dark), var(--primary))', color: '#fff', padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(209,248,67,0.7)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Sparkle/> AI · MÅL-BYGGER</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginTop: 10, color: '#fff' }}>3 steg til <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>5 SMART-mål</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            {[
              { n: 1, l: 'Hva vil du oppnå', s: 'done', sub: '"Topp-10 Olyo + scratch" · 12 mnd' },
              { n: 2, l: 'AI analyserer', s: 'done', sub: 'SG · TM · Olyo · 8 turneringer' },
              { n: 3, l: 'Velg & lagre', s: 'active', sub: '3 av 5 mål valgt' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 10, background: s.s === 'active' ? 'rgba(209,248,67,0.10)' : 'transparent', border: s.s === 'active' ? '1px solid rgba(209,248,67,0.40)' : '1px solid transparent' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.s === 'done' ? 'var(--accent)' : s.s === 'active' ? 'rgba(209,248,67,0.30)' : 'rgba(255,255,255,0.08)', color: s.s === 'done' ? 'var(--fg)' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.s === 'done' ? '✓' : s.n}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600 }}>{s.l}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'rgba(209,248,67,0.65)', letterSpacing: '0.04em', marginTop: 3, lineHeight: 1.35 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.10)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
            «AI lærer av dine tidligere mål — også de du sluttet å jobbe med.»
          </div>
        </div>
        {/* RIGHT: content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="label-mono">STEG 3 / 3</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginTop: 4 }}>Velg de målene du vil committe til</h3>
            </div>
            <button className="modal-close"><Icon.Close/></button>
          </div>
          <div style={{ flex: 1, padding: '20px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {GENERATED_GOALS.map((g, i) => <GoalChecklistRow key={i} g={g} i={i}/>)}
          </div>
          <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>3 av 5 mål valgt</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost">Tilbake</button>
              <button className="btn btn-outline">Generer nye</button>
              <button className="btn btn-primary">Lagre 3 mål</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S7_VariantB = S7_VariantB;

// ── VARIANT C · Chat-style konversasjon ──────────────────────────────
function S7_VariantC() {
  return (
    <div className="ab" style={{ background: 'rgba(10,31,23,0.45)' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 560, height: 760, maxWidth: 'calc(100% - 40px)', maxHeight: 'calc(100% - 40px)', background: '#fff', borderRadius: 20, boxShadow: '0 24px 60px rgba(10,31,23,0.30)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Sparkle/> AI · MÅL-COACH</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, marginTop: 4 }}>Vi bygger målene <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>sammen</em></h2>
          </div>
          <button className="modal-close"><Icon.Close/></button>
        </div>
        <div style={{ flex: 1, padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg)' }}>
          {/* AI bubble */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.Sparkle/></div>
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px 12px 12px 4px', padding: '12px 14px', maxWidth: '78%', fontSize: 13.5, lineHeight: 1.5 }}>
              Hei Markus! Jeg ser at SG-putt er −2,4 og du har 4 turneringer i juni–juli. Hva er det viktigste du vil oppnå <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--primary)' }}>i år</em>?
            </div>
          </div>
          {/* User bubble */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: 'row-reverse' }}>
            <div className="p-avatar c1" style={{ width: 28, height: 28, fontSize: 11 }}>MR</div>
            <div style={{ background: 'var(--primary)', color: '#fff', borderRadius: '12px 12px 4px 12px', padding: '12px 14px', maxWidth: '78%', fontSize: 13.5, lineHeight: 1.5 }}>
              Vil ned i scratch og spille topp-10 på Olyo Tour. Også puttingen suger.
            </div>
          </div>
          {/* AI bubble */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.Sparkle/></div>
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px 12px 12px 4px', padding: '14px 14px', maxWidth: '88%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>Forstått. Her er 3 SMART-mål basert på det. Trykk for å committe — eller be om endringer.</div>
              {GENERATED_GOALS.filter(g => g.picked).map((g, i) => (
                <div key={i} style={{ padding: 12, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border-soft)', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className={`pill ${g.col}`} style={{ fontSize: 9 }}>{g.type}</span>
                  <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{g.t}</div>
                  <button className="btn btn-outline btn-xs"><Icon.Check/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-soft)', background: '#fff' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 12px' }}>
            <input style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--fg)' }} placeholder="Be om endringer, f.eks. «Mer fokus på putt» …"/>
            <button className="btn btn-primary btn-sm">Send →</button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {['Lagre alle 3', 'Generer 3 nye', 'Bare process-mål', 'Kortere tidsramme'].map(s => (
              <button key={s} className="chip" style={{ fontSize: 10 }}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.S7_VariantC = S7_VariantC;

// ── Mobile ────────────────────────────────────────────────────────────
function S7_Mobile() {
  return (
    <PhoneFrame>
      <div style={{ padding: '6px 18px 12px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="mono" style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Sparkle/> AI</div>
          <Icon.Close/>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginTop: 8 }}>AI mål-<em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>bygger</em></h2>
        <Stepper step={3}/>
      </div>
      <div className="ph-body">
        {GENERATED_GOALS.slice(0,4).map((g, i) => <GoalChecklistRow key={i} g={g} i={i}/>)}
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary">Lagre 3 mål</button>
      </div>
    </PhoneFrame>
  );
}
window.S7_Mobile = S7_Mobile;
