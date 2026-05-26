/* ============================================================
   Live Test Scoring · 20 NGF-tester
   ============================================================ */

const WTL_TESTS = {
  inspill_120: {
    name: 'Inspill 120m', axis: 'slag',
    sub: 'Slå 5 slag fra eksakt 120m. Mål: snitt < 8m fra hull.',
    scoringRule: 'Snitt-avstand til hull',
    scoringMode: 'lowest',
    primaryMetric: 'Snitt-avstand',
    unit: 'm',
    expectedDurationMin: 10,
    pgaBenchmark: 'PGA snitt PEI ≈ 0.055 (≈ 6.6m fra hull)',
    pgaValue: 6.6,
    targetValue: 8.0,
    bestEver: { v: 5.4, when: 'apr 2026' },
    equipment: ['Pitching wedge / 9-jern', '5 baller', 'Mål-flagg + avstandsmåler'],
    steps: [
      { id: 'from-120', label: 'Slag 1', n: 1 },
      { id: 'from-120', label: 'Slag 2', n: 2 },
      { id: 'from-120', label: 'Slag 3', n: 3 },
      { id: 'from-120', label: 'Slag 4', n: 4 },
      { id: 'from-120', label: 'Slag 5', n: 5 },
    ],
    inputFields: [
      { key: 'till_hull_m', label: 'Avstand til hull', unit: 'm', type: 'number' },
    ],
    notes: 'Carry + utløp. Bruk laser fra ball-posisjon.',
  },
  putt_1_3m: {
    name: 'Putt 1-3m', axis: 'spill',
    sub: '25 putter fra 5 avstander (1m, 1.5m, 2m, 2.5m, 3m).',
    scoringRule: 'Sink-prosent',
    scoringMode: 'hit-rate',
    primaryMetric: 'Sink-rate',
    unit: '%',
    expectedDurationMin: 15,
    pgaBenchmark: 'PGA avg 3-5 fot: ~65 % sink',
    pgaValue: 65,
    targetValue: 60,
    bestEver: { v: 84, when: 'apr 2026' },
    equipment: ['Putter', '25 baller', 'Avstands-markering'],
    steps: [
      { label: '1.0 m', desc: '5 putter fra eksakt 1 meter', shots: 5 },
      { label: '1.5 m', desc: '5 putter fra 1.5 meter', shots: 5 },
      { label: '2.0 m', desc: '5 putter fra 2 meter', shots: 5 },
      { label: '2.5 m', desc: '5 putter fra 2.5 meter', shots: 5 },
      { label: '3.0 m', desc: '5 putter fra 3 meter', shots: 5 },
    ],
    inputFields: [{ key: 'sunket', label: 'Sunket', type: 'checkbox' }],
  },
  driver_basic: {
    name: 'Driver Basic', axis: 'slag',
    sub: '5 driver-slag. Måler carry, total og PEI.',
    scoringRule: 'PEI (lavere er bedre)',
    scoringMode: 'pei',
    primaryMetric: 'PEI',
    unit: 'PEI',
    expectedDurationMin: 10,
    pgaBenchmark: 'PGA Top 40 avg PEI < 0.06',
    pgaValue: 0.06,
    targetValue: 0.07,
    bestEver: { v: 0.052, when: 'feb 2026' },
    equipment: ['Driver', 'TrackMan', '5 baller'],
    steps: [
      { label: 'Slag 1' }, { label: 'Slag 2' }, { label: 'Slag 3' },
      { label: 'Slag 4' }, { label: 'Slag 5' },
    ],
    inputFields: [
      { key: 'carry_m', label: 'Carry', unit: 'm', type: 'number' },
      { key: 'total_m', label: 'Total', unit: 'm', type: 'number' },
      { key: 'side_m',  label: 'Sideavvik', unit: 'm', type: 'number', helper: '+ høyre, − venstre' },
    ],
  },
  trapbar_deadlift: {
    name: 'Trapbar Deadlift', axis: 'fys',
    sub: 'Maks 1RM trapbar markløft. Korrelerer med rotasjonskraft + CHS.',
    scoringRule: 'Maks vekt (kg)',
    scoringMode: 'max',
    primaryMetric: 'Maks vekt',
    unit: 'kg',
    expectedDurationMin: 25,
    pgaBenchmark: 'Junior G19: 1.5× kroppsvekt · Pro: 2.0×',
    pgaValue: 170,
    targetValue: 140,
    bestEver: { v: 145, when: 'mar 2026' },
    equipment: ['Trapbar', 'Vektskiver', 'Spotter', 'Flate sko'],
    steps: [
      { label: 'Oppvarming', desc: '50/60/70 % oppvarmings-sett' },
      { label: 'Forsøk 1', desc: '90 % av antatt 1RM' },
      { label: 'Forsøk 2', desc: '95 %' },
      { label: 'Forsøk 3', desc: '100 % — maks' },
      { label: 'Forsøk 4', desc: 'Hvis godkjent — øke 2.5 kg' },
    ],
    inputFields: [
      { key: 'kg', label: 'Vekt', unit: 'kg', type: 'number' },
      { key: 'approved', label: 'Godkjent', type: 'checkbox', helper: 'Form OK?' },
    ],
  },
  chs: {
    name: 'Clubhead Speed (CHS)', axis: 'fys',
    sub: 'Klubbhodehastighet med driver innendørs (TrackMan).',
    scoringRule: 'Maks CHS (mph)',
    scoringMode: 'max',
    primaryMetric: 'Maks CHS',
    unit: 'mph',
    expectedDurationMin: 15,
    pgaBenchmark: 'PGA avg: 114 mph',
    pgaValue: 114,
    targetValue: 105,
    bestEver: { v: 112, when: 'mar 2026' },
    equipment: ['Driver', 'TrackMan', '5 baller'],
    steps: [
      { label: 'Slag 1' }, { label: 'Slag 2' }, { label: 'Slag 3' },
      { label: 'Slag 4' }, { label: 'Slag 5' },
    ],
    inputFields: [
      { key: 'mph', label: 'CHS', unit: 'mph', type: 'number' },
      { key: 'smash', label: 'Smash factor', type: 'number', helper: 'Ball / CHS' },
    ],
  },
};

/* ============================================================
   START SCREEN
   ============================================================ */
function WTL_StartScreen({ test, mobile }) {
  return (
    <div className="wtl" data-axis={test.axis} data-mobile={mobile ? '1' : undefined}>
      <div className="frame" style={{ gridTemplateRows: '56px 1fr 64px' }}>
        <WTL_Topbar test={test} state="start"/>
        <div className="start-hero">
          <div className="axis-badge">
            <span className="dot"></span>
            {test.axis === 'fys' ? 'FYS · FYSISK' :
             test.axis === 'tek' ? 'TEK · TEKNIKK' :
             test.axis === 'slag' ? 'SLAG · GOLFSLAG' :
             test.axis === 'spill' ? 'SPILL · GOLFSPILL' : 'TURN · TURNERING'}
          </div>
          <h1>{test.name.split(' ')[0]} <em>{test.name.split(' ').slice(1).join(' ')}</em></h1>
          <p className="sub">{test.sub}</p>
          <div className="stat-row">
            <div className="stat">
              <div className="l">Tid</div>
              <div className="v">~{test.expectedDurationMin}<span className="u">min</span></div>
            </div>
            <div className="stat">
              <div className="l">Antall slag</div>
              <div className="v">{test.steps.reduce((a, s) => a + (s.shots || 1), 0)}<span className="u">stk</span></div>
            </div>
            <div className="stat">
              <div className="l">Mål</div>
              <div className="v">{test.targetValue}<span className="u">{test.unit}</span></div>
            </div>
            <div className="stat">
              <div className="l">Best ever</div>
              <div className="v">{test.bestEver.v}<span className="u">{test.unit}</span></div>
            </div>
          </div>
          <button className="start-btn">
            <WBPIc id="ic-play" size={18}/>
            Start test
          </button>
          <div className="start-meta">⏎ for å starte · esc for å avbryte</div>
        </div>
        <div className="footbar">
          <div className="left-meta">
            <WBPIc id="ic-pin" size={13}/>
            <strong>GFGK · TrackMan bay 3</strong>
            <span className="sep">·</span>
            <span>Coach: Anders L.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TOPBAR (shared)
   ============================================================ */
function WTL_Topbar({ test, state, elapsed }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">AK</div>
        <span className="crumb">WANG <span className="sep">›</span> NGF TEST <span className="sep">›</span> <strong>{test.name}</strong></span>
      </div>
      {state === 'active' && <span className="live-pill"><span className="dot"></span>LIVE</span>}
      <div className="right">
        {elapsed && <span className="timer">{elapsed}</span>}
        <div className="player">
          <div className="av">MR</div>
          <div className="nm">Markus R.P.<span className="meta">A1 · HCP −2,1</span></div>
        </div>
        <button className="top-action" title="Pause"><WBPIc id="ic-pause"/></button>
        <button className="top-action" title="Avbryt"><WBPIc id="ic-x"/></button>
      </div>
    </header>
  );
}

/* ============================================================
   ACTIVE SCORING SCREEN
   ============================================================ */
function WTL_ActiveScreen({ test, currentStepIdx, currentShotIdx, shotLog, scoreNow, putts, mobile }) {
  return (
    <div className="wtl" data-axis={test.axis} data-mobile={mobile ? '1' : undefined}>
      <div className="frame">
        <WTL_Topbar test={test} state="active" elapsed="04:32"/>

        {/* Step indicator */}
        <div className="steps">
          {test.steps.map((s, i) => (
            <div key={i} className={'step-chip ' + (i < currentStepIdx ? 'done' : i === currentStepIdx ? 'current' : '')}>
              <span className="n">{i + 1}</span>
              <span className="lbl">{s.label}</span>
              {i < currentStepIdx && <span className="meta-right">✓</span>}
            </div>
          ))}
        </div>

        <div className="main">
          {/* LEFT — instruction + input */}
          <div className="left">
            <div className="test-eyebrow">
              <span className="axis-tag">{test.axis.toUpperCase()}</span>
              <span>{test.scoringRule}</span>
              <span className="sep"></span>
              <span className="scoring">{test.primaryMetric}</span>
            </div>
            <h1 className="test-title">{test.name.split(' ')[0]} <em>{test.name.split(' ').slice(1).join(' ')}</em></h1>
            <p className="test-sub">{test.sub}</p>

            {/* Current step */}
            <div className="step-card">
              <div className="step-card-head">
                <span className="eyebrow">Steg {currentStepIdx + 1} av {test.steps.length}</span>
                <span className="shot-counter">Slag <strong>{currentShotIdx + 1}</strong> av <strong>{test.steps[currentStepIdx]?.shots || 1}</strong></span>
              </div>
              <h2 className="ttl">{test.steps[currentStepIdx]?.label}</h2>
              <p className="instr">{test.steps[currentStepIdx]?.desc || 'Registrer resultat for hvert slag — Caddie regner snitt og PEI automatisk.'}</p>
              <div className="target-strip">
                <WBPIc id="ic-target" size={14}/>
                Mål: <strong>{test.scoringMode === 'lowest' ? `snitt < ${test.targetValue}${test.unit}` :
                              test.scoringMode === 'hit-rate' ? `≥ ${test.targetValue}% sunket` :
                              test.scoringMode === 'max' ? `> ${test.targetValue}${test.unit}` :
                              test.scoringMode === 'pei' ? `PEI < ${test.targetValue}` :
                              `${test.targetValue}${test.unit}`}</strong>
              </div>
            </div>

            {/* Input area */}
            {test.inputFields[0].type === 'number' ? (
              <div className="input-area">
                <div className="input-area-head">
                  <h3 className="ttl">Slag <em>{currentShotIdx + 1}</em></h3>
                  <span className="ts">{Math.round((currentShotIdx / 5) * 100)}% gjennom</span>
                </div>
                <div className="input-row">
                  {test.inputFields.map((f, i) => (
                    <div key={i} className="input-field with-unit">
                      <label className="lbl">{f.label}</label>
                      <input type="number" defaultValue={i === 0 ? '6.2' : ''} placeholder="—"/>
                      {f.unit && <span className="unit-suffix">{f.unit}</span>}
                      {f.helper && <span className="helper">{f.helper}</span>}
                    </div>
                  ))}
                </div>
                <div className="save-strip">
                  <span className="save-hint">⏎ for å lagre · <span className="kbd">←</span><span className="kbd">→</span> for å navigere</span>
                  <button className="save-btn">
                    <WBPIc id="ic-check" size={14}/>
                    Lagre & neste
                  </button>
                </div>
              </div>
            ) : (
              <div className="input-area">
                <div className="input-area-head">
                  <h3 className="ttl">Marker <em>sunket / bom</em></h3>
                  <span className="ts">{(putts || []).filter(p => p === true).length} / {test.steps[currentStepIdx].shots} sunket</span>
                </div>
                <div className="checkbox-row">
                  {(putts || [true, true, false, true, null]).map((p, i) => (
                    <button key={i} className={'big-check' + (p === true ? ' on' : p === false ? ' miss' : '')}>
                      <span className="nr">Putt {i + 1}</span>
                      <span className="icon">{p === true ? '✓' : p === false ? '✗' : '—'}</span>
                    </button>
                  ))}
                </div>
                <div className="save-strip">
                  <span className="save-hint">Tap for å bytte · <span className="kbd">⏎</span> neste avstand</span>
                  <button className="save-btn">
                    <WBPIc id="ic-arrow-right" size={14}/>
                    Neste avstand
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — live score + log */}
          <div className="right">
            <div className="score-card">
              <div className="score-head">
                <span className="ttl">{test.primaryMetric}</span>
                <span className="live-tag">LIVE</span>
              </div>
              <div className="score-main">
                {scoreNow.value}<span className="unit">{test.unit}</span>
              </div>
              <div className="score-meta">{scoreNow.context}</div>
              <div className="benchmark">
                <div className="benchmark-row">
                  <span>Mål <strong>{test.targetValue}{test.unit}</strong></span>
                  <span className={scoreNow.vsTarget > 0 ? 'ok' : 'miss'}>
                    {scoreNow.vsTarget > 0 ? '✓ Over mål' : '↓ Under mål'}
                  </span>
                </div>
                <div className="benchmark-bar">
                  <div className="f" style={{ width: `${scoreNow.barPct}%` }}></div>
                  <div className="target" style={{ left: `${scoreNow.targetPct}%` }}></div>
                  <div className="pga" style={{ left: `${scoreNow.pgaPct}%` }}></div>
                </div>
              </div>
            </div>

            <div className="shot-log">
              <div className="ttl">Slag-logg</div>
              {shotLog.map((s, i) => (
                <div key={i} className="shot-row">
                  <span className={'n ' + (s.status === 'done' ? 'done' : s.status === 'current' ? 'current' : '')}>{i + 1}</span>
                  <span className={'val ' + (s.value ? '' : 'empty')}>{s.value || '—'}</span>
                  {s.delta && <span className={'delta ' + (s.deltaCls || '')}>{s.delta}</span>}
                </div>
              ))}
            </div>

            <div className="info-card">
              <div className="ttl">Benchmark</div>
              <div className="item"><WBPIc id="ic-trophy" size={13}/>{test.pgaBenchmark}</div>
              <div className="item"><WBPIc id="ic-target" size={13}/>Mål: {test.targetValue}{test.unit}</div>
              <div className="item"><WBPIc id="ic-trending" size={13}/>Best: {test.bestEver.v}{test.unit} · {test.bestEver.when}</div>
            </div>
          </div>
        </div>

        <div className="footbar">
          <div className="left-meta">
            <span><strong>{currentStepIdx + 1}</strong> / {test.steps.length} steg</span>
            <span className="sep">·</span>
            <span><strong>04:32</strong> / ~{test.expectedDurationMin}:00</span>
            <span className="sep">·</span>
            <span>Auto-lagret</span>
          </div>
          <div className="actions">
            <button className="btn btn-prev"><WBPIc id="ic-arrow-right" size={14} style={{ transform: 'rotate(180deg)' }}/>Forrige</button>
            <button className="btn btn-next">Neste slag<WBPIc id="ic-arrow-right" size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   RESULT SCREEN
   ============================================================ */
function WTL_ResultScreen({ test, finalScore, shots, beatTarget, beatPga, mobile }) {
  return (
    <div className="wtl" data-axis={test.axis} data-mobile={mobile ? '1' : undefined}>
      <div className="frame" style={{ gridTemplateRows: '56px 1fr 64px' }}>
        <WTL_Topbar test={test} state="done"/>
        <div className="result-screen">
          <div>
            <div className="badge">
              <WBPIc id="ic-trophy" size={14}/>
              Test fullført · {test.expectedDurationMin} min
            </div>
            <h1>{test.name.split(' ')[0]} <em>{test.name.split(' ').slice(1).join(' ')}</em></h1>
            <div className="final-score">
              {finalScore.value}<span className="u">{test.unit}</span>
            </div>
            <div className={'delta ' + (beatTarget ? '' : 'miss')}>
              <WBPIc id="ic-trending" size={22}/>
              <span><strong>{beatTarget ? '✓ Bedre enn mål' : '↓ Under mål'}</strong> · {finalScore.context}</span>
            </div>
          </div>
          <div className="result-detail">
            <div className="panel">
              <div className="panel-head">Slag-for-slag</div>
              <div className="shot-grid">
                {shots.map((s, i) => (
                  <div key={i} className={'shot-cell ' + (s.ok ? 'ok' : '')}>
                    <div className="n">{i + 1}</div>
                    <div className="v">{s.v}<span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginLeft: 2, fontWeight: 500 }}>{test.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">Mål-sammenligning</div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Mål</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--fg)', marginTop: 3 }}>{test.targetValue}{test.unit}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>PGA snitt</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--fg)', marginTop: 3 }}>{test.pgaValue}{test.unit}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Best ever</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--fg)', marginTop: 3 }}>{test.bestEver.v}{test.unit}</div>
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">Caddie · neste handling</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg)', lineHeight: 1.5 }}>
                {beatTarget
                  ? 'Sterk innspill-runde. Caddie anbefaler å holde 2× wedge-spinn-økter per uke fram til Sør.åpent.'
                  : 'Snittet ligger over mål. Caddie foreslår + 60 m wedge gate-drill onsdag og torsdag før neste re-test.'}
              </p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button style={{
                  padding: '8px 14px', borderRadius: 999, fontFamily: 'var(--font-body)',
                  fontSize: 12, fontWeight: 600, background: 'var(--brand-primary)', color: 'var(--brand-accent)',
                }}>Legg til drill <WBPIc id="ic-arrow-right" size={12}/></button>
                <button style={{
                  padding: '8px 14px', borderRadius: 999, fontFamily: 'var(--font-body)',
                  fontSize: 12, fontWeight: 600, background: 'var(--card)', color: 'var(--fg)',
                  border: '1px solid var(--border)',
                }}>Del med coach</button>
              </div>
            </div>
          </div>
        </div>
        <div className="footbar">
          <div className="left-meta">
            <span>Logget <strong>23. mai 14:32</strong></span>
            <span className="sep">·</span>
            <span>Linket: Tester-modul · Statistikk · Kalender</span>
          </div>
          <div className="actions">
            <button className="btn btn-prev">Re-test</button>
            <button className="btn btn-finish">Ferdig<WBPIc id="ic-check" size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  WTL_TESTS,
  WTL_StartScreen,
  WTL_ActiveScreen,
  WTL_ResultScreen,
});
