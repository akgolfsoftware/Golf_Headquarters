/* ============================================================
   Workbench Plan · Session detail drawer (contextual)
   Slag-data vises BARE for full-sving (TEK/SLAG-driver/iron/wedge)
   ============================================================ */

/*
 Subtype matrix — controls which fields appear:

   axis  subtype          | clubSpeed  spin   env    distance  drillType
   ------+----------------+----------+------+------+----------+--------
   slag   driver           |    ✓        ✓      ✓      ✓         full
   slag   iron             |    ✓        ✓      ✓      ✓         full
   slag   wedge-short      |    ✓ (lo)   ✓      ✓      ✓         short
   slag   chip             |    —        —      —      ✓         chip
   slag   putt             |    —        —      —      ✓         putt
   tek    swing-video      |    ✓        ✓      —      —         technique
   tek    routine          |    —        —      —      —         mental
   fys    *                |    —        —      —      —         physical
   spill  *                |    —        —      —      —         play
   turn   *                |    —        —      —      —         tournament
*/
function showSwingData(axis, subtype) {
  if (axis === 'slag') return subtype !== 'putt' && subtype !== 'chip';
  if (axis === 'tek')  return subtype !== 'routine' && subtype !== 'mental';
  return false;
}

const WBP_SESSION_DETAILS = {
  's21c': {
    axis: 'slag',
    subtype: 'wedge-short',
    title: 'Wedge-spinn 40–80m',
    titleEm: '40–80m',
    titleBase: 'Wedge-spinn',
    date: 'Tirsdag 23. mai 2026',
    week: 'Uke 21 · Periode 3 · Bygging',
    timeStart: '14:00',
    timeEnd: '15:30',
    duration: 90,
    location: 'GFGK · TM bay 3',
    locationDesc: 'TrackMan · innendørs',
    intensity: 'middels',
    rpeTarget: '6/10',
    status: 'planned',
    swing: {
      clubSpeed: { v: '78', u: 'mph', target: 'Mål 75–82', range: 'PW–GW · 80% av full' },
      ballSpeed: { v: '102', u: 'mph', target: 'Smash 1,31' },
      spin: { v: '11 800', u: 'RPM', target: 'Mål > 11 000' },
      launch: { v: '28°', u: '', target: 'Mål 26–30°' },
      env: { v: 'Innendørs', target: '21 °C · 38 % RH · vindstille' },
    },
    drills: [
      { n: 'Bunn-test · 50m wedge til 3m sirkel',  axis: 'slag', omr: 'Innspill', klubb: 'PW',     sets: 4, reps: 8,  time: 18, note: 'Spin > 11k RPM',                done: false },
      { n: '60m wedge · gate-drill',                 axis: 'slag', omr: 'Innspill', klubb: 'PW',     sets: 3, reps: 10, time: 20, note: 'Landing innen 3m radius',       done: false },
      { n: '70m wedge · lav ball-flight',            axis: 'slag', omr: 'Innspill', klubb: 'PW',     sets: 3, reps: 8,  time: 16, note: 'Føtter sammen, lav håndrotasjon', done: false },
      { n: '80m halv-sving wedge',                    axis: 'slag', omr: 'Innspill', klubb: 'GW',     sets: 4, reps: 6,  time: 18, note: 'Ankerpunkt 9-er på klokken',    done: false },
      { n: 'Random-quiz · avstandskalibrering',      axis: 'slag', omr: 'Avstand',  klubb: 'PW+GW',  sets: 1, reps: 12, time: 18, note: 'Random 40–80m · måling pr slag', done: false },
    ],
    equipment: [
      { nm: 'PW', ic: 'ic-target' },
      { nm: 'GW', ic: 'ic-target' },
      { nm: 'TrackMan',  ic: 'ic-bar' },
      { nm: 'Matte + nett', ic: 'ic-home' },
    ],
    coach: 'Anders Larsen',
    coachInit: 'AL',
    coachMsg: 'Gjenta 60m gate-drillen — den var sentral i forrige videoanalyse. Filmer fra siden + fra bak. Mål: 8 av 10 innenfor 3m radius på 60m.',
  },
};

/* ---- Default content for any session not in detail map ---- */
function getSessionContent(s) {
  if (WBP_SESSION_DETAILS[s.id]) return WBP_SESSION_DETAILS[s.id];

  // Synthesize a reasonable default based on axis
  const dayNames = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag', 'søndag'];
  const monthOffset = { 19: 'mai', 20: 'mai', 21: 'mai', 22: 'mai/juni', 23: 'juni', 24: 'juni' };
  const subtype = ({
    fys:   s.title?.toLowerCase().includes('restitusjon') ? 'physical' : 'physical',
    tek:   s.title?.toLowerCase().includes('video') ? 'swing-video' : 'technique',
    slag:  s.title?.toLowerCase().includes('putt')   ? 'putt'
         : s.title?.toLowerCase().includes('chip')   ? 'chip'
         : s.title?.toLowerCase().includes('driver') ? 'driver'
         : s.title?.toLowerCase().includes('iron')   ? 'iron'
         : 'wedge-short',
    spill: 'play',
    turn:  'tournament',
  })[s.axis];

  return {
    ...s,
    subtype,
    date: `${dayNames[s.day]} · ${monthOffset[s.week] || 'mai'}`,
    week: `Uke ${s.week} · Periode 3`,
    timeStart: '—',
    timeEnd: '—',
    duration: 60,
    location: s.meta || '—',
    locationDesc: '',
    intensity: 'middels',
    rpeTarget: '—',
    status: s.done ? 'done' : (s.now ? 'now' : 'planned'),
    swing: showSwingData(s.axis, subtype) ? {
      clubSpeed: { v: '—', u: 'mph', target: '—' },
      spin: { v: '—', u: 'RPM', target: '—' },
      env: { v: '—', target: '—' },
    } : null,
    drills: [
      { n: 'Drill A', axis: s.axis, omr: '—', klubb: '—', sets: 3, reps: 8, time: 15, note: '', done: false },
      { n: 'Drill B', axis: s.axis, omr: '—', klubb: '—', sets: 2, reps: 10, time: 12, note: '', done: false },
    ],
    equipment: [],
    coach: '',
    coachInit: '',
    coachMsg: '',
  };
}

function WBP_SessionDetail({ session, onClose }) {
  if (!session) return null;
  const c = getSessionContent(session);
  const swingVisible = showSwingData(c.axis, c.subtype);
  const totalTime = c.drills.reduce((acc, d) => acc + d.time, 0);

  const axisLabel = ({
    fys: 'FYS · Fysisk', tek: 'TEK · Teknikk', slag: 'SLAG · Golfslag',
    spill: 'SPILL · Spill', turn: 'TURN · Turnering',
  })[c.axis] || c.axis;

  return (
    <div className="sd-overlay" onClick={onClose}>
      <aside className="sd-drawer" onClick={e => e.stopPropagation()}>
        <div className="sd-head">
          <div className="row">
            <span className={'axis-pill-lg ' + c.axis}>
              <span className="dot"></span>{axisLabel}
            </span>
            <span className={'status-pill ' + c.status}>
              <span className="dot"></span>
              {c.status === 'done' ? 'Fullført' : c.status === 'now' ? 'NÅ aktiv' : 'Planlagt'}
            </span>
            <button className="x" style={{ marginLeft: 'auto' }} onClick={onClose}>
              <WBPIc id="ic-x" size={14}/>
            </button>
          </div>
          <h2 className="ttl">{c.titleBase || c.title.split(' ')[0]} {c.titleEm && <em>{c.titleEm}</em>}{!c.titleBase && !c.titleEm && c.title.includes(' ') ? c.title.split(' ').slice(1).join(' ') : ''}</h2>
          <div className="sub">
            <WBPIc id="ic-calendar" size={12}/>
            <span>{c.date}</span>
            <span className="sep"></span>
            <span>{c.timeStart} – {c.timeEnd}</span>
            <span className="sep"></span>
            <span>{c.week}</span>
          </div>
        </div>

        <div className="sd-body">

          {/* QUICK STATS */}
          <div className="sd-stats">
            <div className="cell">
              <div className="l">Varighet</div>
              <div className="v">{c.duration}<span className="u">min</span></div>
            </div>
            <div className="cell">
              <div className="l">Sted</div>
              <div className="v" style={{ fontSize: 13 }}>{c.location}</div>
            </div>
            <div className="cell">
              <div className="l">Intensitet</div>
              <div className="v pill-wrap">
                <span className={'pill pill-' + (c.intensity === 'høy' ? 'turn' : c.intensity === 'lav' ? 'ok' : 'warn')}>{c.intensity}</span>
              </div>
            </div>
            <div className="cell">
              <div className="l">RPE-mål</div>
              <div className="v">{c.rpeTarget}</div>
            </div>
          </div>

          {/* CONTEXTUAL SWING DATA — only if axis + subtype permits */}
          {swingVisible && c.swing && (
            <div className="sd-block">
              <div className="sd-block-head">
                <span className="eyebrow">Slag-data · mål for økten</span>
                <span className="right">TrackMan auto-import</span>
              </div>
              <div className={'sd-swing ' + c.axis}>
                <div className="sd-swing-grid">
                  {c.swing.clubSpeed && (
                    <div className="sd-swing-row">
                      <span className="l">Kølle-hastighet</span>
                      <span className="v">{c.swing.clubSpeed.v}<span className="u">{c.swing.clubSpeed.u}</span></span>
                      <span className="sub">{c.swing.clubSpeed.target}{c.swing.clubSpeed.range ? ' · ' + c.swing.clubSpeed.range : ''}</span>
                    </div>
                  )}
                  {c.swing.ballSpeed && (
                    <div className="sd-swing-row">
                      <span className="l">Ball-hastighet</span>
                      <span className="v">{c.swing.ballSpeed.v}<span className="u">{c.swing.ballSpeed.u}</span></span>
                      <span className="sub">{c.swing.ballSpeed.target}</span>
                    </div>
                  )}
                  {c.swing.spin && (
                    <div className="sd-swing-row">
                      <span className="l">Spinn</span>
                      <span className="v">{c.swing.spin.v}<span className="u">{c.swing.spin.u}</span></span>
                      <span className="sub">{c.swing.spin.target}</span>
                    </div>
                  )}
                  {c.swing.launch && (
                    <div className="sd-swing-row">
                      <span className="l">Launch-vinkel</span>
                      <span className="v">{c.swing.launch.v}<span className="u">{c.swing.launch.u}</span></span>
                      <span className="sub">{c.swing.launch.target}</span>
                    </div>
                  )}
                  {c.swing.env && (
                    <div className="sd-swing-row" style={{ gridColumn: '1 / -1' }}>
                      <span className="l">Miljø</span>
                      <span className="v">{c.swing.env.v}</span>
                      <span className="sub">{c.swing.env.target}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DRILLS */}
          <div className="sd-block">
            <div className="sd-block-head">
              <span className="eyebrow">Drillplan · {c.drills.length} drills</span>
              <span className="right">≈ {totalTime} min total</span>
            </div>
            <div className="sd-drills">
              <div className="sd-drill-header">
                <span>Nr</span>
                <span>Drill · pyramide · område · kølle</span>
                <span>Reps</span>
                <span>Tid</span>
              </div>
              {c.drills.map((d, i) => (
                <div key={i} className={'sd-drill' + (d.done ? ' done' : '')}>
                  <span className="num">{i + 1}</span>
                  <div className="body">
                    <div className="nm">{d.n}</div>
                  </div>
                  <div className="meta-row">
                    <span className={'axis-pill-mini axis-' + (d.axis || c.axis)}>
                      {(d.axis || c.axis).toUpperCase()}
                    </span>
                    {d.omr && <>
                      <span className="dot-sep"></span>
                      <span className="meta-text">{d.omr}</span>
                    </>}
                    {d.klubb && d.klubb !== '—' && <>
                      <span className="dot-sep"></span>
                      <span className="meta-text club">{d.klubb}</span>
                    </>}
                    {d.note && <>
                      <span className="dot-sep"></span>
                      <span className="meta-text note">{d.note}</span>
                    </>}
                  </div>
                  <span className="col-reps">{d.sets}<span className="x">×</span>{d.reps}</span>
                  <span className="col-time">{d.time}<span className="u">m</span></span>
                </div>
              ))}
              <div className="sd-drill-foot">
                <span>≈ <strong>{c.drills.reduce((a, d) => a + d.sets * d.reps, 0)}</strong> repetisjoner · <strong>{c.drills.length}</strong> drills · <strong>{totalTime}</strong> min</span>
                <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>+ Legg til drill</span>
              </div>
            </div>
          </div>

          {/* EQUIPMENT */}
          {c.equipment && c.equipment.length > 0 && (
            <div className="sd-block">
              <div className="sd-block-head">
                <span className="eyebrow">Utstyr</span>
              </div>
              <div className="sd-eq">
                {c.equipment.map((e, i) => (
                  <span key={i} className="eq"><WBPIc id={e.ic} size={11}/>{e.nm}</span>
                ))}
              </div>
            </div>
          )}

          {/* COACH NOTE */}
          {c.coachMsg && (
            <div className="sd-block">
              <div className="sd-block-head">
                <span className="eyebrow">Coach-notat</span>
              </div>
              <div className="sd-note">
                <div className="sd-note-head">
                  <span className="av">{c.coachInit}</span>
                  <div className="nm">{c.coach}<span className="meta">Hovedcoach · 2 t siden</span></div>
                </div>
                <p className="sd-note-body">{c.coachMsg}</p>
              </div>
            </div>
          )}

        </div>

        <div className="sd-foot">
          <div className="actions-left">
            <button className="icon-action" title="Dupliser"><WBPIc id="ic-copy"/></button>
            <button className="icon-action" title="Del"><WBPIc id="ic-share"/></button>
            <button className="icon-action" title="Slett"><WBPIc id="ic-x"/></button>
          </div>
          <div className="actions-right">
            <button className="btn btn-outline">Rediger</button>
            <button className="btn btn-primary">
              {c.status === 'done' ? 'Se logg' : c.status === 'now' ? 'Start økt' : 'Logg fullført'}
              <WBPIc id="ic-arrow-right" size={12}/>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

Object.assign(window, {
  WBP_SessionDetail,
  WBP_SESSION_DETAILS,
  showSwingData,
});
