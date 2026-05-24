// Screen 4 — Økt-detalj (coach-context)
// /admin/gjennomfore/okter/[id] — status-pill endrer farge basert på tid
const { useState: useS4 } = React;

const SESSION_DRILLS = [
  { n: 'Oppvarming · 5m putts', cat: 'PUTT', col: 'pill-spill', mins: '4 min', reps: '20', done: 20 },
  { n: 'Gate-putt med start-linje', cat: 'PUTT', col: 'pill-spill', mins: '5 min', reps: '8 av 10', done: 7 },
  { n: 'Lag-på-lag stige 1m → 3m', cat: 'PUTT', col: 'pill-spill', mins: '6 min', reps: '8 av 10', done: 4 },
  { n: 'Speed-kontroll 6m', cat: 'PUTT', col: 'pill-spill', mins: '3 min', reps: '70% inn ±0,5m', done: 0 },
  { n: 'Free-throw · 3 av 5 fra 2,5m', cat: 'PUTT', col: 'pill-spill', mins: '2 min', reps: '3 av 5', done: 0 },
];

function S4StatusPill({ status }) {
  const map = {
    'OM 2 TIMER': { bg: 'rgba(184,133,42,0.15)', fg: 'var(--warning)' },
    'AKTIV NÅ': { bg: 'var(--accent)', fg: 'var(--fg)', pulse: true },
    'GJENNOMFØRT': { bg: 'rgba(94,92,87,0.14)', fg: 'var(--muted)' },
  };
  const s = map[status];
  return (
    <div className="x-pill" style={{ background: s.bg, color: s.fg, padding: '5px 12px', fontSize: 11 }}>
      {s.pulse && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', animation: 'lpulse 1.4s ease-in-out infinite' }}/>}
      {status}
    </div>
  );
}

function S4Hero({ status }) {
  return (
    <div style={{ padding: '24px 32px 22px', background: 'linear-gradient(180deg, #FBFAF5 0%, var(--bg) 100%)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
        <div>
          <div className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            TIRSDAG 27. MAI · 14:00–14:20 · MULLIGAN STUDIO
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 8 }}>
            Markus R.P. · <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>putt-fokus</em>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
            <S4StatusPill status={status}/>
            <span className="pill pill-spill">PUTT</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>20 MIN · TRACKMAN BRIDGE · MARKUS BETALER kr 600</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {status !== 'GJENNOMFØRT' && <>
            <button className="btn btn-outline btn-sm">Reschedule</button>
            <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>Avlys</button>
            <button className="btn btn-primary btn-sm">{status === 'AKTIV NÅ' ? 'Åpne live-konsoll' : 'Start økt'}</button>
          </>}
          {status === 'GJENNOMFØRT' && <>
            <button className="btn btn-outline btn-sm">Eksporter</button>
            <button className="btn btn-primary btn-sm">Skriv oppfølging</button>
          </>}
        </div>
      </div>
    </div>
  );
}

function MarkusInfo({ compact }) {
  return (
    <div className={compact ? '' : 'card'} style={compact ? {} : { padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <Avatar name="Markus R. Pedersen" color="c1" size="lg"/>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Markus R. Pedersen</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em', marginTop: 4 }}>HCP +3,5 · WAGR 2 142 · 17 år</div>
        </div>
      </div>
      <div className="label-mono" style={{ marginBottom: 8 }}>SISTE 5 ØKTER</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {[{c:'pill-spill',l:'P'},{c:'pill-tek',l:'T'},{c:'pill-spill',l:'P'},{c:'pill-fys',l:'F'},{c:'pill-spill',l:'P'}].map((s, i) => (
          <div key={i} style={{ padding: 8, background: 'var(--bg)', borderRadius: 8, textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted)' }}>{['25.05','22.05','20.05','17.05','15.05'][i]}</div>
            <span className={`pill ${s.c}`} style={{ marginTop: 4, fontSize: 9 }}>{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveProgressStrip() {
  const done = SESSION_DRILLS.filter(d => d.done > 0).length;
  const total = SESSION_DRILLS.length;
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
      borderRadius: 16, padding: 22, color: '#fff', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(209,248,67,0.16), transparent 70%)' }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, position: 'relative', zIndex: 1 }}>
        <div className="x-pill live"><span className="pulse"/> AKTIV NÅ</div>
        <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>14:08 · 8 min gått</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'end', marginBottom: 18, position: 'relative', zIndex: 1 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.10em' }}>NÅVÆRENDE DRILL · {done}/{total}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginTop: 4 }}>Lag-på-lag stige 1m → 3m</div>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(209,248,67,0.7)', marginTop: 4 }}>4 av 10 inn · 40% hit-rate</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm" style={{ background: 'rgba(255,255,255,0.10)', borderColor: 'transparent', color: '#fff' }}><Icon.Pause/></button>
          <button className="btn btn-primary btn-sm"><Icon.Skip/> Neste</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, position: 'relative', zIndex: 1 }}>
        {SESSION_DRILLS.map((d, i) => {
          const pct = d.done > 0 ? (d.done / parseInt(d.reps) || 0.5) : 0;
          return (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.10)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct * 100}%`, background: 'var(--accent)' }}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── VARIANT A · Stacked sections ─────────────────────────────────────
function S4_VariantA() {
  const [status, setStatus] = useS4('OM 2 TIMER');
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <span>GJENNOMFØRE</span> · <strong>ØKT</strong></>}/>
        <S4Hero status={status}/>
        <div style={{ padding: '14px 32px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <StateStrip states={['OM 2 TIMER','AKTIV NÅ','GJENNOMFØRT']} value={status} onChange={setStatus}/>
        </div>
        <div style={{ padding: '20px 32px 64px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {status === 'AKTIV NÅ' && <LiveProgressStrip/>}

            <div className="card" style={{ padding: 22 }}>
              <div className="card-head"><div className="title">Planlagt innhold</div><div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>5 drills · 20 min</div></div>
              {SESSION_DRILLS.map((d, i) => (
                <div key={i} className="drill-block" style={{ gridTemplateColumns: '22px 1fr auto', borderColor: status === 'AKTIV NÅ' && i === 2 ? 'var(--primary)' : 'var(--border)', background: status === 'AKTIV NÅ' && i === 2 ? 'rgba(209,248,67,0.10)' : 'var(--bg)' }}>
                  <div style={{ color: 'var(--muted-soft)' }}><Icon.Drag/></div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span className={`pill ${d.col}`}>{d.cat}</span>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{d.mins} · mål {d.reps}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{d.n}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {status === 'GJENNOMFØRT' && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>{d.done}/{parseInt(d.reps)}</div>
                    )}
                    {status === 'AKTIV NÅ' && i === 2 && <div className="x-pill live"><span className="pulse"/> NÅ</div>}
                    {status === 'OM 2 TIMER' && <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>VENTER</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div className="card-head"><div className="title">Notater</div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div className="label-mono" style={{ marginBottom: 8 }}>PREP · DU SKREV</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.55 }}>
                    «Markus klagde forrige uke over at start-linja vandret på lange putts. Kjør gate-drill først for å re-kalibrere — så bygge tilbake til speed-kontroll.»
                  </div>
                </div>
                <div>
                  <div className="label-mono" style={{ marginBottom: 8 }}>MARKUS ØNSKET</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.55 }}>
                    «Vil ha hjelp med å lese rake-greener — Olyo Tour på Larvik har mye sidefall.»
                  </div>
                </div>
              </div>
            </div>

            {status === 'GJENNOMFØRT' && (
              <div className="card" style={{ padding: 22 }}>
                <div className="card-head"><div className="title">Etter økt</div></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-soft)' }}>
                  <div className="label-mono">RATING</div>
                  <div className="star-row">
                    {[1,2,3,4,5].map(i => <button key={i} className={`star-btn ${i <= 4 ? 'on' : ''}`}><svg viewBox="0 0 24 24"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2l-5-4.9 6.9-1z"/></svg></button>)}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Markus · 4/5</div>
                </div>
                <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border-soft)' }}>
                  <div className="label-mono" style={{ marginBottom: 6 }}>COACH-OPPSUMMERING</div>
                  <div style={{ fontSize: 13, lineHeight: 1.55 }}>Solid økt — start-linje 1,4° SD (mål 1,5°). Speed-drill skummelt på 6m, bør gjentas neste uke.</div>
                </div>
                <div style={{ paddingTop: 14 }}>
                  <button className="btn btn-primary btn-sm">Bok neste økt → onsdag 04.06</button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MarkusInfo/>
            <div className="card" style={{ padding: 22 }}>
              <div className="label-mono" style={{ marginBottom: 12 }}>BOOKING-INFO</div>
              {[
                ['Type', 'Privattime · 60 min'],
                ['Pris', 'kr 600 (forhåndsbetalt)'],
                ['Sted', 'Mulligan Studio · Bay 4'],
                ['Utstyr', 'Trackman · Capto putt-mat'],
                ['Booket', '14. mai 09:42'],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border-soft)' : 0, fontSize: 13 }}>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.06em' }}>{k}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 22 }}>
              <div className="card-head"><div className="title">Knyttet plan</div></div>
              <div style={{ padding: 14, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>Vinter 2026 · grunntrening</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 4 }}>U07 / 12 · 34/56 ØKTER</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S4_VariantA = S4_VariantA;

// ── VARIANT B · 2-col med live-rail ──────────────────────────────────
function S4_VariantB() {
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <strong>ØKT</strong></>}/>
        <S4Hero status="AKTIV NÅ"/>
        <div style={{ padding: '20px 32px 48px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <LiveProgressStrip/>
            <div className="card" style={{ padding: 22 }}>
              <div className="card-head"><div className="title">Live · TrackMan</div><span className="mono" style={{ fontSize: 10.5, color: 'var(--success)' }}>● TILKOBLET</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 8 }}>
                {[
                  ['START-LINJE SD', '1,8°', 'success'],
                  ['SPEED ERROR', '±0,3m', 'success'],
                  ['HIT-RATE', '7 / 17', 'warning'],
                  ['REPS LOGGED', '17', 'fg'],
                ].map(([l, v, c], i) => (
                  <div key={i} style={{ padding: 12, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                    <div className="label-mono">{l}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: `var(--${c})`, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 22 }}>
              <div className="card-head"><div className="title">Drills · 5</div></div>
              {SESSION_DRILLS.map((d, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--border-soft)' : 0, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: d.done >= parseInt(d.reps) ? 'var(--primary)' : d.done > 0 ? 'var(--accent)' : 'var(--bg)', color: d.done >= parseInt(d.reps) ? 'var(--accent)' : 'var(--fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>{i+1}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 600 }}>{d.n}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{d.mins} · {d.reps}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: d.done > 0 ? 'var(--fg)' : 'var(--muted-soft)' }}>{d.done}/{parseInt(d.reps)}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MarkusInfo/>
            <div className="card" style={{ padding: 22 }}>
              <div className="label-mono" style={{ marginBottom: 10 }}>RAW NOTES · LIVE</div>
              <textarea className="field-input" style={{ minHeight: 140, fontFamily: 'var(--font-mono)', fontSize: 11.5 }} defaultValue={"14:03 — speed-kontroll bra første 5 reps\n14:06 — vandrer på stigen igjen ved 2,5m\n14:08 — fortelle om Larvik på neste økt"}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S4_VariantB = S4_VariantB;

// ── VARIANT C · Tidslinje-strip horisontal ───────────────────────────
function S4_VariantC() {
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <strong>ØKT</strong></>}/>
        <S4Hero status="OM 2 TIMER"/>
        {/* horizontal strip */}
        <div style={{ padding: '24px 32px 0' }}>
          <div className="label-mono" style={{ marginBottom: 12 }}>I DAG · TIRSDAG 27. MAI</div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 12, overflowX: 'auto' }}>
            {[
              { t: '10:00', n: 'Henrik T.', cat: 'TEK', col: 'pill-tek', s: 'done' },
              { t: '11:00', n: 'Sofie L.', cat: 'PUTT', col: 'pill-spill', s: 'done' },
              { t: '13:00', n: 'Lunsj', cat: '', col: '', s: 'gap' },
              { t: '14:00', n: 'Markus R.P.', cat: 'PUTT', col: 'pill-spill', s: 'active' },
              { t: '15:00', n: 'Ada N-B.', cat: 'SLAG', col: 'pill-slag', s: 'next' },
              { t: '16:00', n: 'Tora M.', cat: 'TEK', col: 'pill-tek', s: 'next' },
              { t: '17:30', n: 'Vetle H.', cat: 'SPILL', col: 'pill-spill', s: 'next' },
            ].map((e, i) => (
              <div key={i} style={{
                minWidth: 160, padding: 14, borderRadius: 12,
                background: e.s === 'active' ? 'rgba(209,248,67,0.30)' : e.s === 'gap' ? 'transparent' : '#fff',
                border: e.s === 'active' ? '2px solid var(--accent)' : '1px solid var(--border)',
                opacity: e.s === 'done' ? 0.55 : 1,
              }}>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.06em' }}>{e.t}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{e.n}</div>
                {e.cat && <div style={{ marginTop: 6 }}><span className={`pill ${e.col}`} style={{ fontSize: 9 }}>{e.cat}</span></div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 32px 48px', display: 'grid', gridTemplateColumns: '320px 1fr 320px', gap: 20 }}>
          {/* SPILLER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="label-mono">SPILLER</div>
            <MarkusInfo/>
          </div>
          {/* DRILLS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="label-mono">PLANLAGT INNHOLD · 5 DRILLS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SESSION_DRILLS.map((d, i) => (
                <div key={i} className="card" style={{ padding: 16, display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>{i+1}</div>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                      <span className={`pill ${d.col}`}>{d.cat}</span>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{d.mins} · {d.reps}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{d.n}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* SIDEKARRIK */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="label-mono">FORBEREDELSER</div>
            <div className="card" style={{ padding: 18 }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                {['Sjekk Trackman-kalibrering', 'Sett opp Capto-mat (bay 4)', 'Hent 4 lette balls (Pro V1x)', 'Print scorekort til Markus'].map((s, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid var(--border)', background: i < 2 ? 'var(--primary)' : '#fff', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i < 2 && <Icon.Check/>}</div>
                    <span style={{ textDecoration: i < 2 ? 'line-through' : 'none', color: i < 2 ? 'var(--muted)' : 'var(--fg)' }}>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S4_VariantC = S4_VariantC;

// ── Mobile ────────────────────────────────────────────────────────────
function S4_Mobile() {
  return (
    <PhoneFrame>
      <div style={{ padding: '6px 18px 14px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="mono" style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.10em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Back/> KALENDER</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.10em', marginTop: 8 }}>TIR 27 · 14:00–14:20 · MULLIGAN BAY 4</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginTop: 6 }}>Markus R.P. · <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>putt-fokus</em></h1>
        <div style={{ marginTop: 10 }}><S4StatusPill status="OM 2 TIMER"/></div>
      </div>
      <div className="ph-body">
        <MarkusInfo compact/>
        <div className="card" style={{ padding: 14 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>DRILLS · 5</div>
          {SESSION_DRILLS.map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border-soft)' : 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{i+1}</div>
              <div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                  <span className={`pill ${d.col}`} style={{ fontSize: 9 }}>{d.cat}</span>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--muted)' }}>{d.mins}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12.5, fontWeight: 600 }}>{d.n}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary">Start økt</button>
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Reschedule</button>
      </div>
    </PhoneFrame>
  );
}
window.S4_Mobile = S4_Mobile;
