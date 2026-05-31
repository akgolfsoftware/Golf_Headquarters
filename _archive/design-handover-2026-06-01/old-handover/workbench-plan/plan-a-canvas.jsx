/* ============================================================
   Workbench Plan · Variant A · Pyramid Lanes — canvas
   ============================================================ */

const WBP_AXES = [
  { key: 'fys',   name: 'FYS',   weight: 15, h: 76  },
  { key: 'tek',   name: 'TEK',   weight: 18, h: 92  },
  { key: 'slag',  name: 'SLAG',  weight: 27, h: 132 },
  { key: 'spill', name: 'SPILL', weight: 30, h: 146 },
  { key: 'turn',  name: 'TURN',  weight: 10, h: 64  },
];
const WBP_AXIS_COLOR = {
  fys:   '#005840',
  tek:   '#B8852A',
  slag:  '#2563EB',
  spill: '#B8C73A',
  turn:  '#A32D2D',
};

/* Map session axis + week → which sessions render in which (axis,week) cell */
function sessionsFor(axis, weekId) {
  return WBP_SESSIONS.filter(s => s.axis === axis && s.week === weekId);
}

function WBP_Session({ s, onClick }) {
  // Position within a 7-day week cell
  const left = (s.day / 7) * 100;
  const width = (s.span / 7) * 100;
  const cls = [
    'session',
    's-' + s.axis,
    s.done ? 'done' : '',
    s.dragging ? 'dragging' : '',
    s.selected ? 'selected' : '',
    s.now ? 'now' : '',
  ].filter(Boolean).join(' ');

  const meta = s.now
    ? <><span style={{ color: 'var(--danger)', fontWeight: 700 }}>● NÅ</span> {s.meta}</>
    : s.done
      ? <><span style={{ color: 'var(--success)' }}>✓</span> {s.meta}</>
      : s.meta;

  return (
    <div
      className={cls}
      style={{
        left:  `calc(${left}% + 3px)`,
        width: `calc(${width}% - 6px)`,
      }}
      title={s.title}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(s); }}
    >
      <div className="title">{s.title}</div>
      <div className="meta">{meta}</div>
    </div>
  );
}

function WBP_Canvas() {
  const { setModal, setActiveSession } = useContext(PlanContext);
  const [quickpop, setQuickpop] = useState(null);

  // Close popover on background click
  useEffect(() => {
    if (!quickpop) return;
    const close = () => setQuickpop(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [quickpop]);

  const openQuickpop = (e, axis, weekId, day) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.closest('.canvas').getBoundingClientRect();
    setQuickpop({
      axis, week: weekId, day,
      x: rect.left - parentRect.left + 12,
      y: rect.top - parentRect.top + rect.height + 8,
    });
  };

  const weekCount = WBP_WEEKS.length; // 6

  // ---- today position (uke 21, day 1 / Tue) inside the 6-column overlay
  const todayWeekIdx = WBP_WEEKS.findIndex(w => w.state === 'now');
  const todayDay = 1;
  const todayPct = ((todayWeekIdx + todayDay / 7) / weekCount) * 100;

  // ---- tournament pillar positions
  // Sørlandsåpent: uke 22 (idx 3), starts Thu (day 3)
  const sorIdx = WBP_WEEKS.findIndex(w => w.id === 22);
  const sorPct = ((sorIdx + 3 / 7) / weekCount) * 100;
  // Osloåpent: uke 24 (idx 5), starts Sat (day 5)
  const osloIdx = WBP_WEEKS.findIndex(w => w.id === 24);
  const osloPct = ((osloIdx + 5 / 7) / weekCount) * 100;

  // ---- ghost target for the demonstrated drag: uke 22 day 1
  const ghostWeekIdx = WBP_WEEKS.findIndex(w => w.id === 22);
  const ghostDay = 1;
  const ghostLeftPct = (ghostDay / 7) * 100;

  // Mark one session as dragging for affordance
  const renderSessions = (axis, weekId) => sessionsFor(axis, weekId).map(s => {
    const isDrag = s.id === 's21h';
    return <WBP_Session key={s.id} s={{ ...s, dragging: isDrag, selected: s.id === 's21c' }} onClick={setActiveSession}/>;
  });

  return (
    <main className="canvas">
      {/* ============ CANVAS HEAD ============ */}
      <div className="canvas-head">
        <div className="top-row">
          <h2 className="ttl">
            Periode 3 · <em>Bygging mot turnering</em>
            <span className="num">6 uker · 29 økter</span>
          </h2>
          <div className="meta-strip">
            <span>Fase: <strong>Peaking-form</strong></span>
            <span className="sep"></span>
            <span>Ankret mot: <strong>Sørlandsåpent · 21d</strong></span>
            <span className="sep"></span>
            <span>Balanse: <strong style={{ color: 'var(--warning)' }}>−3 pp på SPILL</strong></span>
            <span className="sep"></span>
            <span>3 endringer venter coach-godkjenning</span>
          </div>
        </div>

        {/* Phase bar — the period's pyramid weights as horizontal proportions */}
        <div className="phase-bar" title="Periode 3 ideal-pyramide">
          {WBP_AXES.map(a => (
            <div key={a.key} className={'seg ' + a.key} style={{ flex: a.weight }}></div>
          ))}
        </div>
      </div>

      {/* ============ WEEK RIBBON ============ */}
      <div className="week-ribbon" style={{ '--week-count': weekCount }}>
        <div className="corner"></div>
        {WBP_WEEKS.map(w => (
          <div key={w.id} className={'wcol ' + (w.state === 'now' ? 'now' : w.state === 'peak' ? 'peak' : '')}>
            <div className="w-id">Uke {w.id}</div>
            <div className="w-dates">{w.dates}</div>
            <div className="w-load" title={`Volum ${w.loadH}t · ideal ${w.idealH}t`}>
              <div className="f" style={{ width: `${Math.min(w.loadH / 12 * 100, 100)}%`,
                                          background: w.state === 'peak' ? 'var(--turn)' : 'var(--brand-primary)' }}></div>
              <div className="ideal" style={{ left: `${w.idealH / 12 * 100}%` }}></div>
            </div>
            <div className="w-mini">
              <span><strong>{w.loadH}</strong>t</span>
              <span><strong>{w.sessions}</strong> økter</span>
              {w.tests > 0 && <span><strong>{w.tests}</strong> test</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ============ LANES ============ */}
      <div className="lanes-scroll">
        <div className="lanes" style={{ '--week-count': weekCount, position: 'relative' }}>
          {WBP_AXES.map(ax => (
            <React.Fragment key={ax.key}>
              <div className="lane-label" style={{ height: ax.h }}>
                <div className="axis-bar" style={{ background: WBP_AXIS_COLOR[ax.key], height: '60%' }}></div>
                <div>
                  <div className="ax-name">{ax.name}</div>
                  <div className="ax-pct">{ax.weight}%</div>
                </div>
              </div>
              {WBP_WEEKS.map(w => {
                const isNow = w.state === 'now';
                const isPeak = w.state === 'peak';
                const ses = renderSessions(ax.key, w.id);
                const isGhostHost = ax.key === 's21h-target-axis'; // not used
                return (
                  <div key={w.id}
                       className={'lane-cell' + (isNow ? ' now' : '') + (isPeak ? ' peak' : '')}
                       style={{ height: ax.h }}
                       onClick={(e) => ses.length === 0 && openQuickpop(e, ax.key, w.id, 3)}>
                    <div className="day-ticks">
                      {[0,1,2,3,4,5,6].map(d => <div key={d} className="t"></div>)}
                    </div>
                    {ses}

                    {/* Ghost drop target: Driver+Iron (s21h, slag) being dragged to uke 22 day 1 */}
                    {ax.key === 'slag' && w.id === 22 && (
                      <div className="session-ghost" style={{ left: `calc(${ghostLeftPct}% + 3px)`, width: `calc(${100/7}% - 6px)` }}>
                        <span className="lab">Slipp her · TIRS 30/5</span>
                      </div>
                    )}

                    {/* Empty-state hint shows on hover */}
                    {ses.length === 0 && (
                      <div className="ai-hint">
                        <WBPIc id="ic-sparkles" size={11}/>
                        Caddie · foreslå
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}

          {/* ---- Absolute overlay: tournament pillars + today line ---- */}
          <div style={{
            position: 'absolute',
            top: 0, bottom: 0,
            left: 90, right: 0,
            pointerEvents: 'none',
            zIndex: 5,
          }}>
            <div className="today-line" style={{ left: `${todayPct}%` }}></div>
            <div className="tournament-pillar A" style={{ left: `${sorPct}%`, top: -1 }}>
              <span className="flag">SØR.ÅPENT · 28.5</span>
            </div>
            <div className="tournament-pillar B" style={{ left: `${osloPct}%`, top: -1 }}>
              <span className="flag">OSLOÅPENT · 15.6</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ QUICK POP ============ */}
      {quickpop && (
        <WBP_QuickPop
          pos={{ x: quickpop.x, y: quickpop.y }}
          axis={quickpop.axis}
          week={quickpop.week}
          day={quickpop.day}
          onClose={() => setQuickpop(null)}
          onAddSession={() => { setQuickpop(null); setModal('camp'); }}
        />
      )}

      {/* ============ PERIODISATION ============ */}
      <div className="periodisation" style={{ '--week-count': weekCount }}>
        <div className="pd-label">
          <strong>Volum + intensitet</strong>
          ⌥ DRA HÅNDTAK
        </div>
        {WBP_WEEKS.map(w => (
          <div key={w.id} className={'pd-cell ' + w.state}>
            <div className="volume-bar">
              <div className="fill" style={{
                width: `${Math.min(w.loadH / 12 * 100, 100)}%`,
                background: w.state === 'peak' ? 'var(--turn)' : (w.state === 'rec' ? 'var(--info)' : 'var(--brand-primary)'),
              }}></div>
              <div className="ideal" style={{ left: `${w.idealH / 12 * 100}%` }}></div>
              <div className="handle" style={{ left: `${Math.min(w.loadH / 12 * 100, 100)}%` }}></div>
              <div className="num">{w.loadH}<span className="u">/{w.idealH}t</span></div>
            </div>
            <span className={'intensity-pill ' + w.intensity}>
              {w.intensity === 'peak'  ? 'PEAK'
              : w.intensity === 'rec'  ? 'RESTITUSJON'
              : w.intensity === 'high' ? 'HØY'
              : w.intensity === 'mid'  ? 'MIDDELS'
              : w.intensity === 'low'  ? 'LAV'
              : w.intensity === 'taper'? 'TAPER'
              : w.intensity}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}

Object.assign(window, { WBP_Canvas });
