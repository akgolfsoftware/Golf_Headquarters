// Screen 3 — Spiller-plan detalj (coach-context)
// /admin/spillere/[id]/plan/[planId] — Drills tab default
const { useState: useS3 } = React;

const DRILLS = [
  { n: 'Gate-putt med start-linje', cat: 'PUTT', col: 'pill-spill', mins: '10 min', reps: '6 av 8 inn', rate: '78%', tm: true },
  { n: 'Lag-på-lag stige 1m → 3m', cat: 'PUTT', col: 'pill-spill', mins: '12 min', reps: '8 av 10', rate: '82%', tm: true },
  { n: 'Pitch 30–50m kontroll', cat: 'SLAG', col: 'pill-slag', mins: '15 min', reps: 'CP < 4m', rate: '64%', tm: true },
  { n: 'Bunker · plugged lie', cat: 'SLAG', col: 'pill-slag', mins: '12 min', reps: '5 av 7 på green', rate: '71%', tm: false },
  { n: 'Drift med målgate', cat: 'TEK', col: 'pill-tek', mins: '20 min', reps: 'CL ± 8m', rate: '69%', tm: true },
  { n: 'Y-balanse · 3 retninger', cat: 'FYS', col: 'pill-fys', mins: '8 min', reps: '3 × 8 hver', rate: '—', tm: false },
  { n: 'Stagespill 10 hull · scramble', cat: 'SPILL', col: 'pill-spill', mins: '90 min', reps: '~70 strokes', rate: '—', tm: false },
];

function S3Hero({ status = 'AKTIV', dark }) {
  return (
    <div className={dark ? 'dark-hero' : ''} style={dark ? { padding: 28, borderRadius: 0 } : { padding: '28px 32px 24px', background: 'linear-gradient(180deg, #FBFAF5 0%, var(--bg) 100%)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
        <div>
          <div className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: dark ? 'rgba(209,248,67,0.7)' : 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            ANDERS K. · MARKUS R.P. · UTVIKLINGSPLAN
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 8, color: dark ? '#fff' : 'var(--fg)' }}>
            Vinter 2026 · <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: dark ? 'var(--accent)' : 'var(--primary)' }}>grunntrening</em>
          </div>
          <div className="mono" style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.65)' : 'var(--muted)', letterSpacing: '0.04em', marginTop: 8 }}>
            ← TILBAKE TIL MARKUS · 12 UKER · 02.NOV — 31.JAN
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" style={dark ? { background: 'rgba(255,255,255,0.10)', borderColor: 'transparent', color: '#fff' } : {}}><Icon.Edit/> Rediger</button>
          <button className="btn btn-outline btn-sm" style={dark ? { background: 'rgba(255,255,255,0.10)', borderColor: 'transparent', color: '#fff' } : {}}><Icon.Copy/> Dupliser</button>
          <button className="btn btn-primary btn-sm">Publiser endring</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 24, paddingTop: 20, borderTop: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid var(--border)' }}>
        {[
          ['STATUS', <span className={`x-pill aktiv`}>{status}</span>],
          ['PERIODE', <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }}>U07 / 12</strong>],
          ['CS · ØKTER', <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }}>34 / 56</strong>],
          ['EFFEKT · SG-PUTT', <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>+0,8</strong>],
        ].map(([l, v], i) => (
          <div key={i}>
            <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{l}</div>
            <div style={{ marginTop: 6, color: dark ? '#fff' : 'var(--fg)' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanTabs({ active, onChange }) {
  const tabs = [
    { id: 'oversikt', l: 'Oversikt' },
    { id: 'periode', l: 'Periodisering' },
    { id: 'drills', l: 'Drills', count: 7 },
    { id: 'hitrate', l: 'Hit-rate' },
    { id: 'effekt', l: 'Effekt' },
  ];
  return (
    <div style={{ display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 32px' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '14px 18px', background: 'transparent', border: 0,
          fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
          color: active === t.id ? 'var(--fg)' : 'var(--muted)',
          borderBottom: active === t.id ? '3px solid var(--accent)' : '3px solid transparent',
          marginBottom: -1, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          {t.l}
          {t.count && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: active === t.id ? 'var(--primary)' : 'var(--muted-soft)', background: active === t.id ? 'rgba(0,88,64,0.08)' : 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

function DrillRow({ d, i, dragging }) {
  return (
    <div className="drill-block" style={{ display: 'grid', gridTemplateColumns: '22px 36px 1fr auto auto auto', alignItems: 'center', gap: 14, cursor: 'grab', borderColor: dragging === i ? 'var(--primary)' : 'var(--border)' }}>
      <div style={{ color: 'var(--muted-soft)' }}><Icon.Drag/></div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>{i + 1}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className={`pill ${d.col}`}>{d.cat}</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}>{d.mins}</span>
          {d.tm && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, color: '#FF6B00', background: 'rgba(255,107,0,0.10)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.08em' }}>TM</span>}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{d.n}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.10em' }}>REP-MÅL</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>{d.reps}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.10em' }}>HIT-RATE</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: d.rate === '—' ? 'var(--muted-soft)' : 'var(--success)' }}>{d.rate}</div>
      </div>
      <button className="btn btn-outline btn-xs"><Icon.Arrow/></button>
    </div>
  );
}

// ── VARIANT A · Klassisk tab-layout, Drills aktiv ────────────────────
function S3_VariantA() {
  const [tab, setTab] = useS3('drills');
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <span>SPILLERE</span> · <span>MARKUS R.P.</span> · <strong>PLAN</strong></>}/>
        <S3Hero/>
        <PlanTabs active={tab} onChange={setTab}/>
        <div style={{ padding: '24px 32px 64px' }}>
          {tab === 'drills' && (
            <>
              <div className="filter-strip" style={{ position: 'static', marginBottom: 18 }}>
                <button className="filter-pill active">Alle <span className="count">7</span></button>
                <button className="filter-pill">PUTT <span className="count">2</span></button>
                <button className="filter-pill">SLAG <span className="count">2</span></button>
                <button className="filter-pill">TEK <span className="count">1</span></button>
                <button className="filter-pill">FYS <span className="count">1</span></button>
                <button className="filter-pill">SPILL <span className="count">1</span></button>
                <div className="divider"/>
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}><Icon.Plus/> Legg til drill</button>
              </div>
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 }}>7 drills · ~167 min / uke</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em', marginTop: 4 }}>Dra for å endre rekkefølge · klikk → for detalj</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-xs"><Icon.Sparkle/> AI-foreslå</button>
                    <button className="btn btn-outline btn-xs">Bibliotek</button>
                  </div>
                </div>
                {DRILLS.map((d, i) => <DrillRow key={i} d={d} i={i} dragging={2}/>)}
              </div>
            </>
          )}
          {tab === 'oversikt' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
              <div className="card" style={{ padding: 22 }}>
                <div className="label-mono" style={{ marginBottom: 10 }}>MÅL · BESKRIVELSE</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.55 }}>
                  Bygge fundament i putt og short game før sesongstart. Spesielt fokus på &lt; 2,5m og pitch 30–50m. Mål: SG-putt fra −2,4 → −1,0 ved sesongstart 28.mar.
                </div>
              </div>
              <div className="card ai-card" style={{ padding: 22 }}>
                <div className="label-mono" style={{ marginBottom: 10, color: 'var(--primary)' }}>AI-GENERERINGS-KONTEKST</div>
                <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                  Generert 14.nov fra: TrackMan-data 90 dg, SG-runder Q3, Markus' egne notater i Notion, sesongmål «sub-par på Olyo Tour».
                </div>
              </div>
            </div>
          )}
          {tab === 'periode' && (
            <div className="card" style={{ padding: 24 }}>
              <div className="label-mono" style={{ marginBottom: 14 }}>PERIODISERING · 12 UKER</div>
              <div className="months" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
                {['U1','U2','U3','U4','U5','U6','U7','U8','U9','U10','U11','U12'].map(u => <span key={u}>{u}</span>)}
              </div>
              <div className="gantt-track">
                <div className="gantt-block" style={{ left: '0%', width: '33%', background: 'rgba(0,88,64,0.18)', color: 'var(--primary)' }}>FUNDAMENT · TEKNIKK</div>
                <div className="gantt-block active" style={{ left: '33%', width: '34%', background: 'rgba(209,248,67,0.45)' }}>SHORT GAME · PUTT</div>
                <div className="gantt-block" style={{ left: '67%', width: '33%', background: 'rgba(44,125,82,0.20)', color: 'var(--slag)' }}>SPILL · COMPETITION</div>
                <div className="today-pin" style={{ left: '58%' }}><div className="pin-label">NÅ · U7</div></div>
              </div>
            </div>
          )}
          {tab === 'hitrate' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {DRILLS.filter(d => d.tm).map((d, i) => (
                <div key={i} className="card" style={{ padding: 18 }}>
                  <span className={`pill ${d.col}`}>{d.cat}</span>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginTop: 8 }}>{d.n}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 14 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: 'var(--success)' }}>{d.rate}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>hit-rate · siste 14 dg</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 14 }}>
                    {[78,82,75,84,80,86,82].map((v, j) => <div key={j} style={{ flex: 1, height: 32, background: 'var(--accent)', opacity: v/100, borderRadius: 2 }}/>)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'effekt' && (
            <div className="card" style={{ padding: 24 }}>
              <div className="label-mono" style={{ marginBottom: 14 }}>FØR / ETTER · UTVALGTE METRIKKER</div>
              {[
                ['SG · PUTT (siste 30 dg)', '−2,4', '−1,6', 'success'],
                ['Putt < 2,5m · hit-rate', '64%', '78%', 'success'],
                ['Start-linje · SD', '2,1°', '1,4°', 'success'],
                ['Pitch 30–50m · CP', '5,8m', '4,2m', 'success'],
                ['Bunker · green-hit', '57%', '71%', 'success'],
              ].map(([k, b, a, c], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-soft)', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--muted)' }}>før: {b}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: `var(--${c})` }}>etter: {a}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: `var(--${c})` }}>↗ forbedring</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sticky-footer">
          <div className="ft-summary">7 drills · <strong>~167 min</strong> / uke · oppdatert i går</div>
          <div className="ft-actions">
            <button className="btn btn-outline btn-sm">Send melding til Markus</button>
            <button className="btn btn-primary btn-sm">Eksportér PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S3_VariantA = S3_VariantA;

// ── VARIANT B · To-pane workbench ────────────────────────────────────
function S3_VariantB() {
  const [picked, setPicked] = useS3(0);
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <span>MARKUS R.P.</span> · <strong>PLAN</strong></>}/>
        <S3Hero/>
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', minHeight: 600 }}>
          {/* LEFT: drill list */}
          <div style={{ background: '#fff', borderRight: '1px solid var(--border)', padding: '18px 18px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 }}>Drills · 7</div>
              <button className="btn btn-outline btn-xs"><Icon.Plus/></button>
            </div>
            {DRILLS.map((d, i) => (
              <div key={i} onClick={() => setPicked(i)} style={{
                display: 'grid', gridTemplateColumns: '20px 28px 1fr auto', gap: 10, alignItems: 'center',
                padding: 12, borderRadius: 10, marginBottom: 6,
                background: picked === i ? 'rgba(0,88,64,0.06)' : 'transparent',
                border: picked === i ? '1.5px solid var(--primary)' : '1px solid var(--border-soft)',
                cursor: 'pointer',
              }}>
                <div style={{ color: 'var(--muted-soft)' }}><Icon.Drag/></div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{i+1}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span className={`pill ${d.col}`} style={{ fontSize: 9 }}>{d.cat}</span>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--muted)' }}>{d.mins}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600 }}>{d.n}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: d.rate === '—' ? 'var(--muted-soft)' : 'var(--success)' }}>{d.rate}</div>
              </div>
            ))}
          </div>
          {/* RIGHT: detail */}
          <div style={{ padding: '28px 32px', overflow: 'auto' }}>
            <PlanTabs active="drills" onChange={() => {}}/>
            <div style={{ paddingTop: 22 }}>
              <span className={`pill ${DRILLS[picked].col}`}>{DRILLS[picked].cat}</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, letterSpacing: '-0.015em', marginTop: 10 }}>{DRILLS[picked].n}</h2>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em', marginTop: 6 }}>{DRILLS[picked].mins} · {DRILLS[picked].reps} · {DRILLS[picked].tm ? 'TRACKMAN' : 'MANUELL LOGGING'}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 22 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="label-mono">HIT-RATE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--success)', marginTop: 4 }}>{DRILLS[picked].rate}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>siste 14 dg</div>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="label-mono">SESJONER</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, marginTop: 4 }}>12</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>i planen</div>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="label-mono">SG-PÅVIRKNING</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--success)', marginTop: 4 }}>+0,8</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>etter 4 uker</div>
                </div>
              </div>

              <div className="card" style={{ padding: 22, marginTop: 18 }}>
                <div className="label-mono" style={{ marginBottom: 10 }}>BESKRIVELSE</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, lineHeight: 1.55 }}>
                  Sett opp en 60cm-bred gate 1m foran ballen. 8 putts fra 2,5m. Mål: 6 av 8 må gå rett gjennom gaten. Hver mislykket repp → 2 ekstra fra 1m som «pannekake».
                </div>
              </div>

              <div className="card" style={{ padding: 22, marginTop: 14 }}>
                <div className="label-mono" style={{ marginBottom: 10 }}>SISTE 6 ØKTER</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
                  {[78,82,75,84,80,86].map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: '100%', height: 80 * v / 100, background: 'var(--accent)', borderRadius: '4px 4px 0 0' }}/>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{v}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S3_VariantB = S3_VariantB;

// ── VARIANT C · Kanban per periode-blokk ─────────────────────────────
function S3_VariantC() {
  const cols = [
    { t: 'FUNDAMENT', sub: 'U1–U4', col: 'rgba(0,88,64,0.10)', items: DRILLS.slice(4, 7) },
    { t: 'SHORT GAME', sub: 'U5–U8 · nå', col: 'rgba(209,248,67,0.20)', active: true, items: DRILLS.slice(0, 4) },
    { t: 'SPILL', sub: 'U9–U12', col: 'rgba(44,125,82,0.14)', items: [{ n: 'Stagespill 10 hull · scramble', cat: 'SPILL', col: 'pill-spill', mins: '90 min', reps: '~70 strokes', rate: '—', tm: false }] },
  ];
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <span>MARKUS R.P.</span> · <strong>PLAN</strong></>}/>
        <S3Hero dark/>
        <PlanTabs active="drills" onChange={() => {}}/>
        <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {cols.map((c, i) => (
            <div key={i} style={{ background: c.col, borderRadius: 16, padding: 18, border: c.active ? '2px solid var(--accent)' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)' }}>{c.sub}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginTop: 4 }}>{c.t}</div>
                </div>
                {c.active && <div className="x-pill aktiv" style={{ background: 'var(--accent)' }}>NÅ</div>}
              </div>
              {c.items.map((d, j) => (
                <div key={j} style={{ background: '#fff', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'grab' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`pill ${d.col}`} style={{ fontSize: 9 }}>{d.cat}</span>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--muted)' }}>{d.mins}</span>
                    {d.tm && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, color: '#FF6B00', background: 'rgba(255,107,0,0.10)', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.08em' }}>TM</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 600 }}>{d.n}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{d.reps}</div>
                    {d.rate !== '—' && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>{d.rate}</div>}
                  </div>
                </div>
              ))}
              <button className="btn btn-outline btn-xs" style={{ alignSelf: 'flex-start', marginTop: 4 }}><Icon.Plus/> Legg til drill</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.S3_VariantC = S3_VariantC;

// ── Mobile ────────────────────────────────────────────────────────────
function S3_Mobile() {
  return (
    <PhoneFrame>
      <div style={{ padding: '6px 18px 14px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="mono" style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.10em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Back/> MARKUS R.P.</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 6, lineHeight: 1.1 }}>
          Vinter 2026 · <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>grunntrening</em>
        </h1>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.04em', marginTop: 4 }}>U07 / 12 · AKTIV · 7 DRILLS</div>
      </div>
      <div style={{ display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {['Oversikt','Periode','Drills · 7','Hit-rate','Effekt'].map((t, i) => (
          <button key={t} style={{ padding: '10px 12px', flexShrink: 0, fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 600, color: i === 2 ? 'var(--fg)' : 'var(--muted)', background: 'transparent', border: 0, borderBottom: i === 2 ? '3px solid var(--accent)' : '3px solid transparent', marginBottom: -1, whiteSpace: 'nowrap' }}>{t}</button>
        ))}
      </div>
      <div className="ph-body">
        {DRILLS.slice(0, 5).map((d, i) => (
          <div key={i} className="card" style={{ padding: 12, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>{i+1}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span className={`pill ${d.col}`} style={{ fontSize: 9 }}>{d.cat}</span>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--muted)' }}>{d.mins}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600 }}>{d.n}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: d.rate === '—' ? 'var(--muted-soft)' : 'var(--success)' }}>{d.rate}</div>
          </div>
        ))}
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary"><Icon.Sparkle/> AI-foreslå ny drill</button>
      </div>
    </PhoneFrame>
  );
}
window.S3_Mobile = S3_Mobile;
