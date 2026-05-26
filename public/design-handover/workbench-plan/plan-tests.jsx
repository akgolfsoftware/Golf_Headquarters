/* ============================================================
   Workbench Plan · Tests · shortcut + picker
   ============================================================ */

const WBP_TESTS = [
  {
    id: 'cmj', nm: 'CMJ vertikalt sprett', axis: 'fys', ic: 'ic-flame',
    desc: 'Eksplosiv kraft',
    duration: 15, freq: 'hver 4. uke',
    dueOffset: -5, // dager (negative = overdue)
    units: 'cm',
    proto: [
      'Oppvarming 5 min på sykkel/løp',
      'Dynamisk mobilitet hofter + ankler',
      '3 prøvesett · 80 % intensitet',
      '3 × 5 hopp · 60 s pause mellom',
      'Logg høyde + RPE etter hver runde',
    ],
    equipment: 'OptoJump / Force-plate / video',
    bestEver: { v: 48, u: 'cm', when: 'jan 2026' },
    latest:   { v: 45, u: 'cm', when: '21. apr' },
  },
  {
    id: 'sprint', nm: '10 m sprint', axis: 'fys', ic: 'ic-trending',
    desc: 'Akselerasjon',
    duration: 12, freq: 'hver 4. uke',
    dueOffset: -3,
    units: 's',
    proto: [
      'Generell oppvarming 10 min',
      'Dynamiske utfall + sprintdrills',
      '3 prøvesett · 85 %',
      '3 × 10 m · 2 min pause',
      'Logg tid pr sprint',
    ],
    equipment: 'Stoppeklokke + photogates',
    bestEver: { v: '1,71', u: 's', when: 'mar 2026' },
    latest:   { v: '1,78', u: 's', when: '21. apr' },
  },
  {
    id: 'putt-konsistens', nm: 'Putt-konsistens 4 m', axis: 'slag', ic: 'ic-target',
    desc: '50 putts · prosent inn',
    duration: 25, freq: 'ukentlig',
    dueOffset: -1,
    units: '%',
    proto: [
      '5 min oppvarming · ulike avstander',
      '50 putts fra 4 m flate · samme break',
      'Logg antall inn pr sett av 10',
      'Snitt-prosent + variasjon',
    ],
    equipment: 'Puttegreen 4 m+ · merkebrikke',
    bestEver: { v: 86, u: '%', when: 'apr 2026' },
    latest:   { v: 78, u: '%', when: '15. mai' },
  },
  {
    id: 'wedge-spinn', nm: 'Wedge-spinn 60m', axis: 'slag', ic: 'ic-bar',
    desc: 'Snitt-spinn på 60m',
    duration: 30, freq: 'månedlig',
    dueOffset: 4,
    units: 'RPM',
    proto: [
      'Oppvarming 10 min · PW',
      '20 slag · 60 m · loggføres på TrackMan',
      'Filter på avvik > 5 m',
      'Snitt + std.avvik · spinn (RPM)',
    ],
    equipment: 'TrackMan · matte · GW + PW',
    bestEver: { v: '12 100', u: 'RPM', when: 'apr 2026' },
    latest:   { v: '11 400', u: 'RPM', when: '8. mai' },
  },
  {
    id: 'hcp-runde', nm: 'HCP-måling 18 hull', axis: 'spill', ic: 'ic-flag',
    desc: 'Offisiell HCP-runde',
    duration: 240, freq: '2× pr md',
    dueOffset: 2,
    units: 'score',
    bestEver: { v: '68', u: '', when: 'aug 2025' },
    latest:   { v: '72', u: '', when: '10. mai' },
    proto: [
      'Standard oppvarming · range 30 min',
      '18 hull · markør · normaltee',
      'Logg score pr hull + statistikk',
      'Oppdater HCP-indeks automatisk',
    ],
    equipment: 'Bane · markør · scorekort',
  },
  {
    id: 'driver-speed', nm: 'Driver kølle-hastighet', axis: 'slag', ic: 'ic-trending',
    desc: 'Max + snitt mph',
    duration: 20, freq: 'månedlig',
    dueOffset: 6,
    units: 'mph',
    proto: [
      'Oppvarming 15 min · range',
      '15 driver-slag · TrackMan',
      'Logg max + topp-5 snitt',
    ],
    equipment: 'TrackMan · driver',
    bestEver: { v: 112, u: 'mph', when: 'mar 2026' },
    latest:   { v: 109, u: 'mph', when: '5. mai' },
  },
  {
    id: 'stork', nm: 'Stork-balanse', axis: 'fys', ic: 'ic-anchor',
    desc: 'Ett-bens stand · sekunder',
    duration: 8, freq: 'månedlig',
    dueOffset: 10,
    units: 's',
    proto: [
      '3 forsøk pr ben · øyne åpne',
      '3 forsøk pr ben · øyne lukket',
      'Logg lengste tid pr forsøk',
    ],
    equipment: 'Stoppeklokke',
    bestEver: { v: 62, u: 's', when: 'jan 2026' },
    latest:   { v: 58, u: 's', when: '20. apr' },
  },
  {
    id: 'video-swing', nm: 'Video swing-analyse', axis: 'tek', ic: 'ic-video',
    desc: 'DTL + FO m/ markører',
    duration: 45, freq: 'månedlig',
    dueOffset: 8,
    units: '°',
    proto: [
      'Oppvarming · 5 min',
      '10 slag DTL · iron 7',
      '10 slag FO · iron 7',
      'Analyse i V1 eller Hudl',
    ],
    equipment: 'Stativ + iPad + V1-app',
    bestEver: null,
    latest: { v: 'AP3-bias 4°', u: '', when: '12. apr' },
  },
];

/* Friendly day-offset → label */
function offsetLabel(off) {
  if (off < 0) return { txt: `${Math.abs(off)} d overdue`, cls: 'overdue' };
  if (off <= 3) return { txt: `om ${off} d`, cls: 'soon' };
  return { txt: `om ${off} d`, cls: 'ok' };
}

/* ============================================================
   Inspector shortcut block (compact, 4-6 most relevant)
   ============================================================ */
function WBP_TestShortcuts({ onShowAll, onAddTest }) {
  // Show overdue + soon-due tests first
  const sorted = [...WBP_TESTS].sort((a, b) => a.dueOffset - b.dueOffset);
  const top = sorted.slice(0, 6);
  const overdue = WBP_TESTS.filter(t => t.dueOffset < 0).length;

  return (
    <div>
      <div className="test-shortcuts">
        {top.map(t => {
          const off = offsetLabel(t.dueOffset);
          return (
            <button key={t.id} className={'test-chip axis-' + t.axis} onClick={() => onAddTest(t.id)}>
              <span className="ic"><WBPIc id={t.ic} size={12}/></span>
              <span className="nm">{t.nm}<span className="meta">{off.txt}</span></span>
            </button>
          );
        })}
      </div>
      <div className="test-shortcuts-all">
        <span className="link" onClick={onShowAll}>
          <WBPIc id="ic-bar" size={11}/>
          Alle {WBP_TESTS.length} tester
        </span>
        {overdue > 0 && (
          <span className="overdue">{overdue} overdue</span>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Test picker modal (full list + slot picker)
   ============================================================ */
function WBP_ModalTestPicker({ onClose, onAdded, initialTestId }) {
  const [selected, setSelected] = useState(initialTestId || null);
  const t = WBP_TESTS.find(x => x.id === selected);

  const slots = [
    { day: 'I dag · tirs', time: '11:00', recommended: false },
    { day: 'Onsdag 24/5', time: '08:00', recommended: true },
    { day: 'Torsdag 25/5', time: '07:00', recommended: false },
    { day: 'Fredag 26/5', time: '17:30', recommended: false },
  ];

  return (
    <WBP_Modal
      icon="ic-beaker"
      eyebrow={<span className="eyebrow">Snarvei · Tester</span>}
      title={<>Velg <em>test</em> å legge til</>}
      sub="Caddie linker testen til riktig drill-modul + statistikk-side"
      onClose={onClose}
      wide
      foot={selected && (
        <>
          <button className="btn btn-ghost" onClick={onClose}>Avbryt</button>
          <button className="btn btn-primary" onClick={() => { onAdded && onAdded(selected); onClose(); }}>
            Legg til på onsdag 08:00 <WBPIc id="ic-arrow-right" size={12}/>
          </button>
        </>
      )}
      leftMeta={selected ? <span>Linket til <strong style={{ color: 'var(--fg)' }}>Tester-modul</strong> · <strong style={{ color: 'var(--fg)' }}>Statistikk</strong> · <strong style={{ color: 'var(--fg)' }}>Kalender</strong></span> : null}
    >
      <div className="test-list">
        {WBP_TESTS.map(test => {
          const off = offsetLabel(test.dueOffset);
          const isSel = test.id === selected;
          return (
            <div key={test.id}
                 className={'test-card axis-' + test.axis}
                 style={isSel ? { borderColor: 'var(--brand-primary)', background: 'rgba(0,88,64,0.04)' } : null}
                 onClick={() => setSelected(test.id)}>
              <span className="ic"><WBPIc id={test.ic} size={14}/></span>
              <div className="body">
                <div className="nm">{test.nm}</div>
                <div className="desc">{test.desc} · {test.duration} min · {test.freq}</div>
              </div>
              <div className="right">
                <span className={'pill pill-' + test.axis}>{test.axis.toUpperCase()}</span>
                <span className={'due ' + off.cls}>{off.txt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {t && (
        <div className="test-detail">
          <div className="test-detail-head">
            <div>
              <div className="ttl">{t.nm} <em>· {t.axis.toUpperCase()}</em></div>
              <div className="sub">{t.desc} · {t.freq}</div>
            </div>
          </div>
          <div className="test-detail-meta">
            <div className="m">
              <div className="l">Varighet</div>
              <div className="v">{t.duration}<span className="u">min</span></div>
            </div>
            <div className="m">
              <div className="l">Måleenhet</div>
              <div className="v" style={{ fontSize: 12 }}>{t.units}</div>
            </div>
            <div className="m">
              <div className="l">Best ever</div>
              <div className="v" style={{ fontSize: 13 }}>
                {t.bestEver ? <>{t.bestEver.v}<span className="u">{t.bestEver.u}</span></> : '—'}
              </div>
            </div>
            <div className="m">
              <div className="l">Siste måling</div>
              <div className="v" style={{ fontSize: 13 }}>
                {t.latest ? <>{t.latest.v}<span className="u">{t.latest.u}</span></> : '—'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 0 6px',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--muted)',
          }}>Protokoll · {t.proto.length} steg</div>
          <div className="test-protocol">
            {t.proto.map((step, i) => (
              <div key={i} className="step">
                <span className="n">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          {t.equipment && (
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>
              Utstyr: <strong style={{ color: 'var(--fg)' }}>{t.equipment}</strong>
            </div>
          )}

          <div className="slot-picker">
            <div className="slot-picker-head">
              <span className="lbl">Velg slot</span>
              <span className="hint">Caddie anbefaler basert på energi-trend + søvn</span>
            </div>
            <div className="slot-list">
              {slots.map((s, i) => (
                <button key={i} className={'slot-opt' + (s.recommended ? ' recommended' : '')}>
                  <span className="day">{s.day}</span>
                  <span className="time">{s.time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </WBP_Modal>
  );
}

/* ============================================================
   Toast (test added confirmation)
   ============================================================ */
function WBP_Toast({ test, onUndo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!test) return null;
  return (
    <div className="toast">
      <span className="ic"><WBPIc id="ic-check" size={13}/></span>
      <div className="body">
        <strong>{test.nm}</strong> lagt til
        <span className="meta">Onsdag 24/5 · 08:00 · linket til Tester-modul</span>
      </div>
      <span className="undo" onClick={onUndo}>Angre</span>
    </div>
  );
}

Object.assign(window, {
  WBP_TESTS,
  WBP_TestShortcuts,
  WBP_ModalTestPicker,
  WBP_Toast,
});
