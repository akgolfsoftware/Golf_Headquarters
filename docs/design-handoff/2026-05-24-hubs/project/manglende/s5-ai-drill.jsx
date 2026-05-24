// Screen 5 — AI foreslå drill (modal)
// Three variants: A modal, B side-panel, C full-screen. Plus mobile sheet.
const { useState: useS5 } = React;

// ── Shared bits ──────────────────────────────────────────────────────
const DRILL_SUGGESTIONS = [
  {
    title: 'Lag-på-lag stigespil 1m → 3m',
    cat: 'PUTT',
    catColor: 'pill-spill',
    time: '12 min',
    why: 'Du taper 2,4 slag/runde på putter mellom 1–3m. Stige-format gjør deg trygg på short-side recoveries.',
    repmal: '8 av 10 inn',
    tm: true,
  },
  {
    title: 'Gate-putt med start-linje',
    cat: 'PUTT',
    catColor: 'pill-spill',
    time: '10 min',
    why: 'Trackman-data viser start-vinkel-spredning på 2,1°. Gate-drillen halverer dette på 2 uker.',
    repmal: '6 av 8 gjennom gate',
    tm: true,
  },
  {
    title: 'Speed-kontroll 6m + lag-putt',
    cat: 'PUTT',
    catColor: 'pill-spill',
    time: '14 min',
    why: 'Speed-feil > 1m på 38% av langputt. Tre-distanse-drillen kalibrerer rytmen.',
    repmal: '70% innenfor 0,5m',
    tm: false,
  },
];

function WeaknessHero() {
  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(209,248,67,0.22), rgba(209,248,67,0.06))',
      border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)',
      borderRadius: 14, padding: '18px 20px',
      display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 16, alignItems: 'center',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'var(--fg)', color: 'var(--accent)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon.Sparkle/></div>
      <div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--primary)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>TOP-OF-MIND</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, marginTop: 4, letterSpacing: '-0.01em' }}>
          Du taper mest slag på <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>putt &lt; 2,5m</em>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.10em' }}>SG·PUTT</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--danger)' }}>−2,4</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted)' }}>siste 90 dg</div>
      </div>
    </div>
  );
}

function DrillCard({ d, picked, onPick, compact }) {
  return (
    <div style={{
      background: '#fff', border: picked ? '1.5px solid var(--primary)' : '1px solid var(--border)',
      borderRadius: 14, padding: compact ? 14 : 18, position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: picked ? '0 0 0 3px rgba(0,88,64,0.08)' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className={`pill ${d.catColor}`}>{d.cat}</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.04em' }}>{d.time}</span>
            {d.tm && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: '#FF6B00', background: 'rgba(255,107,0,0.10)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.08em' }}>TM</span>}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.005em' }}>{d.title}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.10em' }}>REP-MÅL</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{d.repmal}</div>
        </div>
      </div>
      <div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Hvorfor denne?</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--fg)', lineHeight: 1.5 }}>{d.why}</div>
      </div>
      <button onClick={onPick} className={`btn ${picked ? 'btn-forest' : 'btn-primary'}`} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
        {picked ? <><Icon.Check/> Lagt til</> : <><Icon.Plus/> Legg til i ukens plan</>}
      </button>
    </div>
  );
}

function LoadingShell({ compact }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: compact ? 0 : 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--primary)',
          animation: 'spin 0.9s linear infinite',
        }}/>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>Analyserer dine siste 90 dager …</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em', marginTop: 4 }}>SG-data · TrackMan · økt-historikk</div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {[1,2,3].map(i => (
        <div key={i} className="skel" style={{ height: compact ? 110 : 140, borderRadius: 14 }}/>
      ))}
    </div>
  );
}

// ── VARIANT A · Modal (default spec) ─────────────────────────────────
function S5_VariantA() {
  const [state, setState] = useS5('RESULT');
  const [picked, setPicked] = useS5(new Set([0]));
  const toggle = (i) => {
    const next = new Set(picked);
    next.has(i) ? next.delete(i) : next.add(i);
    setPicked(next);
  };
  return (
    <div className="ab" style={{ background: 'rgba(10,31,23,0.45)', backdropFilter: 'blur(2px)' }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, maxWidth: 'calc(100% - 40px)',
        maxHeight: 'calc(100% - 40px)',
        background: '#fff', borderRadius: 20,
        boxShadow: '0 24px 60px rgba(10,31,23,0.30)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'var(--accent)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--fg)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
              <Icon.Sparkle/> AI · CLAUDE
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 10 }}>
              AI-foreslå <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>drill</em>
            </h2>
            <div style={{ marginTop: 10 }}>
              <StateStrip states={['LOADING','RESULT','ERROR']} value={state} onChange={setState}/>
            </div>
          </div>
          <button className="modal-close"><Icon.Close/></button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {state === 'LOADING' && <LoadingShell/>}
          {state === 'ERROR' && (
            <div style={{
              padding: 18, borderRadius: 12,
              background: 'rgba(163,45,45,0.08)', border: '1px solid rgba(163,45,45,0.28)',
              borderLeft: '3px solid var(--danger)', display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--danger)' }}>Kunne ikke generere forslag akkurat nå</div>
              <div style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.5 }}>Vi kommer ikke til Claude-API'en — kanskje du er offline? Prøv igjen, eller velg drills manuelt fra biblioteket.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setState('LOADING')}>Prøv igjen</button>
                <button className="btn btn-outline btn-sm">Åpne drill-bibliotek</button>
              </div>
            </div>
          )}
          {state === 'RESULT' && (
            <>
              <WeaknessHero/>
              {DRILL_SUGGESTIONS.map((d, i) => (
                <DrillCard key={i} d={d} picked={picked.has(i)} onPick={() => toggle(i)}/>
              ))}
            </>
          )}
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-soft)', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>Basert på 90 dager · cachet 24t</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost">Avbryt</button>
            <button className="btn btn-primary" disabled={!picked.size}>Legg til {picked.size} drill{picked.size === 1 ? '' : 's'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S5_VariantA = S5_VariantA;

// ── VARIANT B · Side-panel slide-in ──────────────────────────────────
function S5_VariantB() {
  const [picked, setPicked] = useS5(new Set([0]));
  const toggle = (i) => {
    const next = new Set(picked);
    next.has(i) ? next.delete(i) : next.add(i);
    setPicked(next);
  };
  return (
    <div className="ab" style={{ background: 'rgba(10,31,23,0.30)' }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 480, background: '#fff',
        boxShadow: '-12px 0 40px rgba(10,31,23,0.25)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--primary)', letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon.Sparkle/> AI · DRILL-FORSLAG
            </div>
            <button className="modal-close"><Icon.Close/></button>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 10 }}>
            Tre drills basert på <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>din uke</em>
          </h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <WeaknessHero/>
          {DRILL_SUGGESTIONS.map((d, i) => (
            <DrillCard key={i} d={d} compact picked={picked.has(i)} onPick={() => toggle(i)}/>
          ))}
        </div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{picked.size} valgt</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost">Lukk</button>
            <button className="btn btn-primary" disabled={!picked.size}>Legg til {picked.size}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S5_VariantB = S5_VariantB;

// ── VARIANT C · Full-screen takeover ─────────────────────────────────
function S5_VariantC() {
  return (
    <div className="ab" style={{ background: 'var(--bg)' }}>
      <div className="scroll">
        <div style={{ padding: '18px 32px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-outline btn-sm"><Icon.Back/> Tilbake til planlegging</button>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em', marginLeft: 'auto' }}>
            PLANLEGGE · DRILLS · <strong style={{ color: 'var(--fg)' }}>AI-FORSLAG</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, padding: 32 }}>
          {/* LEFT: Analysis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 32, alignSelf: 'flex-start' }}>
            <div className="dark-hero" style={{ padding: 24 }}>
              <div className="mono" style={{ fontSize: 10, color: 'rgba(209,248,67,0.7)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon.Sparkle/> AI · ANALYSE
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: '#fff', marginTop: 8, lineHeight: 1.15 }}>
                Du taper mest slag på <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>putt &lt; 2,5m</em>
              </div>
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.10)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.10em' }}>SG · PUTT</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#F5C8C8', marginTop: 4 }}>−2,4</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.10em' }}>FEILMARGIN</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>2,1°</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div className="label-mono" style={{ marginBottom: 10 }}>BASERT PÅ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                {['12 økter · 4 080 putts','4 runder · siste 30 dg','TrackMan Putt-lab 06.05','Notion: «short-game-fokus»'].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon.Check/>{s}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
              «Forslagene er basert på din unike data — ikke en generisk plan.»
            </div>
          </div>

          {/* RIGHT: drills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, letterSpacing: '-0.015em' }}>3 drills å legge i ukens plan</h2>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>~36 min totalt</div>
            </div>
            {DRILL_SUGGESTIONS.map((d, i) => (
              <DrillCard key={i} d={d} picked={i === 0}/>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost">Avbryt</button>
              <button className="btn btn-outline">Generer 3 nye</button>
              <button className="btn btn-primary">Legg til alle 3 →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S5_VariantC = S5_VariantC;

// ── Mobile ────────────────────────────────────────────────────────────
function S5_Mobile() {
  return (
    <PhoneFrame>
      <div style={{ padding: '6px 18px 14px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--primary)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Sparkle/> AI</div>
          <Icon.Close/>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 8, lineHeight: 1.15 }}>
          AI-foreslå <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>drill</em>
        </h2>
      </div>
      <div className="ph-body">
        <WeaknessHero/>
        {DRILL_SUGGESTIONS.map((d, i) => <DrillCard key={i} d={d} compact picked={i === 0}/>)}
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary">Legg til 1 drill</button>
      </div>
    </PhoneFrame>
  );
}
window.S5_Mobile = S5_Mobile;
