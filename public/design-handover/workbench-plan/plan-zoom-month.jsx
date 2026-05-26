/* ============================================================
   Workbench Plan · Month view (mai 2026)
   ============================================================ */

const WTM_DAYS_OF_WEEK = ['MAN', 'TIRS', 'ONS', 'TORS', 'FRE', 'LØR', 'SØN'];

// 6-row month grid for mai 2026 (mai 1 = torsdag, last day mai 31 = søndag)
// Week starts Monday. Apr 28 (Mon) → May 31 (Sun) = 5 weeks
const WTM_WEEKS = [
  { wk: 18, days: [
    { d: 28, m: 4, sessions: 2, hours: 1.5, items: [{ ax: 'fys', t: '06:30', n: 'Mobilitet' }] },
    { d: 29, m: 4, sessions: 3, hours: 2.0, items: [{ ax: 'tek', t: '10:00', n: 'Video' }, { ax: 'slag', t: '14:00', n: 'Range' }] },
    { d: 30, m: 4, sessions: 1, hours: 1.0, items: [{ ax: 'fys', t: '08:00', n: 'Styrke' }] },
    { d: 1,  m: 5, sessions: 2, hours: 2.5, items: [{ ax: 'spill', t: '13:00', n: '9 hull' }] },
    { d: 2,  m: 5, sessions: 1, hours: 1.5, items: [{ ax: 'tek', t: '09:00', n: 'Putt-drill' }] },
    { d: 3,  m: 5, sessions: 0, hours: 0,   weekend: true, items: [] },
    { d: 4,  m: 5, sessions: 1, hours: 1.0, weekend: true, items: [{ ax: 'fys', t: '10:00', n: 'Yoga' }] },
  ]},
  { wk: 19, days: [
    { d: 5,  m: 5, sessions: 1, hours: 0.75, items: [{ ax: 'fys', t: '06:30', n: 'Mobilitet' }] },
    { d: 6,  m: 5, sessions: 2, hours: 1.5, items: [{ ax: 'tek', t: '10:00', n: 'Wedge-treff' }] },
    { d: 7,  m: 5, sessions: 1, hours: 1.0, items: [] },
    { d: 8,  m: 5, sessions: 2, hours: 2.5, items: [{ ax: 'slag', t: '14:00', n: 'Driver-økt' }] },
    { d: 9,  m: 5, sessions: 0, hours: 0,   items: [] },
    { d: 10, m: 5, sessions: 1, hours: 3.0, weekend: true, items: [{ ax: 'spill', t: '13:00', n: '9 hull · Iver' }] },
    { d: 11, m: 5, sessions: 0, hours: 0,   weekend: true, items: [] },
  ]},
  { wk: 20, days: [
    { d: 12, m: 5, sessions: 2, hours: 1.75, items: [{ ax: 'fys', t: '07:00', n: 'Styrke + mob.' }] },
    { d: 13, m: 5, sessions: 2, hours: 1.25, items: [{ ax: 'tek', t: '10:00', n: 'Video Anders' }, { ax: 'tek', t: '14:00', n: 'Putt-test' }] },
    { d: 14, m: 5, sessions: 0, hours: 0,    items: [] },
    { d: 15, m: 5, sessions: 1, hours: 1.5,  items: [{ ax: 'slag', t: '15:00', n: 'Wedge spinn 60m' }] },
    { d: 16, m: 5, sessions: 0, hours: 0,    items: [] },
    { d: 17, m: 5, sessions: 1, hours: 4.0,  weekend: true, items: [{ ax: 'spill', t: '13:00', n: '18 hull · Bogstad' }] },
    { d: 18, m: 5, sessions: 0, hours: 0,    weekend: true, items: [] },
  ]},
  { wk: 21, days: [
    { d: 19, m: 5, sessions: 1, hours: 0.75, items: [{ ax: 'fys', t: '06:30', n: 'Mobilitet' }] },
    { d: 20, m: 5, sessions: 1, hours: 0.5,  items: [] },
    { d: 21, m: 5, sessions: 0, hours: 0,    items: [] },
    { d: 22, m: 5, sessions: 1, hours: 1.0,  items: [] },
    { d: 23, m: 5, sessions: 5, hours: 4.0, today: true, items: [
      { ax: 'tek', t: '09:30', n: 'Video Anders' },
      { ax: 'slag', t: '14:00', n: 'Wedge-spinn 40-80m' },
      { ax: 'spill', t: '17:00', n: '9 hull scramble' },
    ]},
    { d: 24, m: 5, sessions: 3, hours: 3.5,  weekend: true, items: [{ ax: 'slag', t: '08:00', n: 'Putt gate' }, { ax: 'spill', t: '14:30', n: '18 hull GFGK' }] },
    { d: 25, m: 5, sessions: 1, hours: 0.5,  weekend: true, items: [] },
  ]},
  { wk: 22, days: [
    { d: 26, m: 5, sessions: 1, hours: 0.5,  items: [{ ax: 'fys', t: '07:00', n: 'Lett mobilitet' }] },
    { d: 27, m: 5, sessions: 1, hours: 1.5,  items: [{ ax: 'slag', t: '14:00', n: 'Range Kr.sand' }] },
    { d: 28, m: 5, sessions: 2, hours: 4.5,  turn: true, items: [{ ax: 'turn', t: '08:00', n: 'Sør.åpent R1' }] },
    { d: 29, m: 5, sessions: 1, hours: 4.5,  turn: true, items: [{ ax: 'turn', t: '08:00', n: 'Sør.åpent R2' }] },
    { d: 30, m: 5, sessions: 1, hours: 4.5,  turn: true, items: [{ ax: 'turn', t: '08:00', n: 'Sør.åpent F' }] },
    { d: 31, m: 5, sessions: 0, hours: 0,    weekend: true, items: [] },
    { d: 1,  m: 6, sessions: 0, hours: 0,    weekend: true, otherMonth: true, items: [] },
  ]},
];

function WBP_CanvasMonth() {
  const { setModal, setActiveSession } = useContext(PlanContext);

  const totalH = WTM_WEEKS.reduce((acc, w) => acc + w.days.reduce((a, d) => a + d.hours, 0), 0);
  const totalSessions = WTM_WEEKS.reduce((acc, w) => acc + w.days.reduce((a, d) => a + d.sessions, 0), 0);

  return (
    <main className="canvas">
      <div className="month-canvas">
        <div className="month-head">
          <h2 className="ttl">
            <em>Mai</em> 2026
            <span className="num">5 uker · {totalSessions} økter · {totalH.toFixed(1)} t</span>
          </h2>
          <div className="meta-strip">
            <span>Periode 3 · <strong style={{ color: 'var(--brand-primary)' }}>Bygging mot turnering</strong></span>
            <span className="sep"></span>
            <span><strong style={{ color: 'var(--turn)' }}>Sørlandsåpent 28.–30.</strong></span>
            <span className="sep"></span>
            <span>I dag: <strong>23. mai · uke 21</strong></span>
          </div>
        </div>

        <div className="month-weekday-head">
          <div className="wcorner"></div>
          {WTM_DAYS_OF_WEEK.map(d => <div key={d} className="wd">{d}</div>)}
        </div>

        <div className="month-grid-scroll">
          <div className="month-grid">
            {WTM_WEEKS.map(w => {
              const wkH = w.days.reduce((a, d) => a + d.hours, 0);
              const wkS = w.days.reduce((a, d) => a + d.sessions, 0);
              const isNow = w.wk === 21;
              const isPeak = w.wk === 22;
              return (
                <React.Fragment key={w.wk}>
                  <div className={'month-row-label' + (isNow ? ' now' : '') + (isPeak ? ' peak' : '')}>
                    Uke<br/>{w.wk}
                    <span className="vol">{wkH.toFixed(1)}<span className="u">t</span></span>
                  </div>
                  {w.days.map((d, di) => {
                    const isToday = d.today;
                    const isWeekend = d.weekend;
                    const isOther = d.otherMonth;
                    const isTurn = d.turn;
                    return (
                      <div key={di}
                           className={'month-day' + (isToday ? ' today' : '') + (isWeekend ? ' weekend' : '') + (isOther ? ' other-month' : '')}
                           onClick={() => setModal('camp')}>
                        {isTurn && <div className="turn-band"></div>}
                        {isTurn && <div className="turn-flag">SØR.ÅPENT</div>}
                        <div className="d-num">
                          <span className="n">{d.d}</span>
                          {d.sessions > 0 && (
                            <span className="h-total"><strong>{d.hours.toFixed(1)}</strong>t · {d.sessions}ø</span>
                          )}
                        </div>
                        {d.items.slice(0, 3).map((it, j) => (
                          <div key={j} className={'m-evt ' + it.ax}
                               onClick={(e) => { e.stopPropagation(); setActiveSession && setActiveSession({ id: 'm' + d.d + j, axis: it.ax, title: it.n, meta: it.t, week: w.wk, day: di }); }}>
                            <span className="t">{it.t}</span><span className="nm">{it.n}</span>
                          </div>
                        ))}
                        {d.items.length > 3 && (
                          <span className="m-more">+ {d.items.length - 3} til</span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { WBP_CanvasMonth });
