/* ============================================================
   Workbench Plan · Week view (Uke 21 demo)
   7 day columns × hourly time grid
   ============================================================ */

const WBP_WEEK_DAYS = [
  { wd: 'man', date: 22, dn: 'Mandag' },
  { wd: 'tirs', date: 23, dn: 'Tirsdag', today: true },
  { wd: 'ons', date: 24, dn: 'Onsdag' },
  { wd: 'tors', date: 25, dn: 'Torsdag' },
  { wd: 'fre', date: 26, dn: 'Fredag' },
  { wd: 'lør', date: 27, dn: 'Lørdag', weekend: true },
  { wd: 'søn', date: 28, dn: 'Søndag', weekend: true },
];

const WBP_WEEK_HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 05–23

/* Sessions for week 21 — explicit start time + duration */
const WBP_WEEK_SESSIONS = [
  // Mandag
  { id: 'w-m-1', day: 0, startH: 6.5,  dur: 0.75, axis: 'fys',  title: 'Morgenmobilitet', meta: '45m · hjemme', status: 'done' },
  { id: 'w-m-2', day: 0, startH: 17,   dur: 1.0,  axis: 'fys',  title: 'Styrke + core',   meta: 'Gym', status: 'done' },

  // Tirsdag (TODAY)
  { id: 'w-t-1', day: 1, startH: 6.5,  dur: 0.75, axis: 'fys',  title: 'Morgenmobilitet', meta: 'hjemme', status: 'done' },
  { id: 'w-t-2', day: 1, startH: 9.5,  dur: 0.5,  axis: 'tek',  title: 'Video m/ Anders', meta: 'Zoom · 30m', status: 'now' },
  { id: 'w-t-3', day: 1, startH: 14,   dur: 1.5,  axis: 'slag', title: 'Wedge-spinn 40–80m', meta: 'GFGK · TM bay 3', status: 'planned' },
  { id: 'w-t-4', day: 1, startH: 17,   dur: 0.75, axis: 'spill',title: '9 hull · scramble', meta: 'm/ Iver · park', status: 'planned' },
  { id: 'w-t-5', day: 1, startH: 19.5, dur: 0.5,  axis: 'fys',  title: 'Restitusjon',     meta: 'pust · hjemme', status: 'planned' },

  // Onsdag
  { id: 'w-o-1', day: 2, startH: 8,    dur: 1.0,  axis: 'fys',  title: 'CMJ + sprint',    meta: 'Gym · test', status: 'planned' },
  { id: 'w-o-2', day: 2, startH: 10,   dur: 0.75, axis: 'slag', title: 'Putt gate 50cm', meta: 'putting · 45m', status: 'planned' },
  { id: 'w-o-3', day: 2, startH: 14,   dur: 1.0,  axis: 'tek',  title: 'Iron-treff video', meta: 'TM bay 1', status: 'planned' },
  { id: 'w-o-4', day: 2, startH: 18,   dur: 1.5,  axis: 'spill',title: '9 hull · m/ Emil', meta: 'GFGK', status: 'planned' },

  // Torsdag
  { id: 'w-r-1', day: 3, startH: 7,    dur: 0.5,  axis: 'fys',  title: 'Mobilitet',       meta: 'hjemme', status: 'planned' },
  { id: 'w-r-2', day: 3, startH: 13,   dur: 4.0,  axis: 'spill',title: '18 hull · målerunde', meta: 'GFGK · alene', status: 'planned' },

  // Fredag
  { id: 'w-f-1', day: 4, startH: 8,    dur: 1.0,  axis: 'fys',  title: 'Styrke',           meta: 'Gym', status: 'planned' },
  { id: 'w-f-2', day: 4, startH: 10,   dur: 1.5,  axis: 'slag', title: 'Driver + iron',    meta: 'TM · range', status: 'planned' },
  { id: 'w-f-3', day: 4, startH: 17,   dur: 0.5,  axis: 'fys',  title: 'Lett mobilitet',   meta: 'hjemme', status: 'planned' },

  // Lørdag
  { id: 'w-l-1', day: 5, startH: 9,    dur: 0.75, axis: 'fys',  title: 'Pust + mobilitet', meta: 'hjemme', status: 'planned' },
  { id: 'w-l-2', day: 5, startH: 14,   dur: 1.5,  axis: 'turn', title: 'Reise · pakking',  meta: 'mental forb.', status: 'planned' },

  // Søndag — restitusjon
  { id: 'w-s-1', day: 6, startH: 10,   dur: 1.0,  axis: 'fys',  title: 'Spasertur + lett yoga', meta: 'aktiv hvile', status: 'planned' },
];

const HOUR_PX = 56;
const FIRST_HOUR = 5;
// "Now" — Tirsdag 09:42
const NOW_DAY = 1;
const NOW_H = 9 + 42/60;

function WBP_CanvasWeek() {
  const { setActiveSession, setModal } = useContext(PlanContext);
  const totalHours = WBP_WEEK_HOURS.length;
  const gridHeight = totalHours * HOUR_PX;

  // Compute daily totals
  const dayTotals = WBP_WEEK_DAYS.map((d, dayIdx) => {
    const sessions = WBP_WEEK_SESSIONS.filter(s => s.day === dayIdx);
    const totalH = sessions.reduce((a, s) => a + s.dur, 0);
    const axesUsed = [...new Set(sessions.map(s => s.axis))];
    return { count: sessions.length, totalH, axesUsed };
  });
  const weekTotalH = dayTotals.reduce((a, d) => a + d.totalH, 0);
  const weekCount = dayTotals.reduce((a, d) => a + d.count, 0);

  return (
    <main className="canvas">
      <div className="week-canvas">

        {/* HEAD */}
        <div className="week-head">
          <h2 className="ttl">
            Uke 21 · <em>Bygging mot turnering</em>
            <span className="num">22.–28. mai · {weekCount} økter · {weekTotalH.toFixed(1)} t</span>
          </h2>
          <div className="week-nav">
            <button className="arrow"><WBPIc id="ic-chevright" size={13} style={{ transform: 'rotate(180deg)' }}/></button>
            <button className="today">I dag</button>
            <button className="arrow"><WBPIc id="ic-chevright" size={13}/></button>
          </div>
        </div>

        {/* DAY HEADER */}
        <div className="week-days">
          <div className="day-corner">UKE 21</div>
          {WBP_WEEK_DAYS.map((d, i) => {
            const ds = dayTotals[i];
            return (
              <div key={i} className={'day' + (d.today ? ' today' : '') + (d.weekend ? ' weekend' : '')}>
                <span className="wd">{d.wd}</span>
                <span className="date">{d.date}</span>
                <span className="meta">{ds.count} økter · {ds.totalH.toFixed(1)} t</span>
              </div>
            );
          })}
        </div>

        {/* GRID */}
        <div className="week-grid-scroll">
          <div className="week-grid" style={{ minHeight: gridHeight }}>
            {/* Time labels */}
            <div className="week-time-col">
              {WBP_WEEK_HOURS.map(h => (
                <div key={h} className={'week-time-row' + (h % 3 === 0 ? ' major' : '')}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* 7 day columns */}
            {WBP_WEEK_DAYS.map((d, dayIdx) => {
              const sessions = WBP_WEEK_SESSIONS.filter(s => s.day === dayIdx);
              return (
                <div key={dayIdx} className={'week-day-col' + (d.today ? ' today' : '') + (d.weekend ? ' weekend' : '')}>
                  {/* hour lines */}
                  {WBP_WEEK_HOURS.map((h, hi) => (
                    <div key={h} className={'week-hour-line' + (h % 3 === 0 ? ' major' : '')}
                         style={{ top: hi * HOUR_PX }}></div>
                  ))}

                  {/* sessions */}
                  {sessions.map(s => {
                    const top = (s.startH - FIRST_HOUR) * HOUR_PX;
                    const height = s.dur * HOUR_PX - 2;
                    return (
                      <div key={s.id}
                           className={`week-session s-${s.axis} ${s.status === 'done' ? 'done' : ''} ${s.status === 'now' ? 'now' : ''}`}
                           style={{ top, height }}
                           onClick={(e) => { e.stopPropagation(); setActiveSession({ ...s, id: s.id, week: 21 }); }}
                      >
                        <div className="time">
                          {Math.floor(s.startH).toString().padStart(2, '0')}:{(Math.round((s.startH % 1) * 60)).toString().padStart(2, '0')}
                          {' – '}
                          {Math.floor(s.startH + s.dur).toString().padStart(2, '0')}:{(Math.round(((s.startH + s.dur) % 1) * 60)).toString().padStart(2, '0')}
                        </div>
                        <div className="title">{s.title}</div>
                        {height >= 56 && <div className="meta">{s.meta}</div>}
                      </div>
                    );
                  })}

                  {/* now line — only on today */}
                  {d.today && (
                    <div className="week-now-line" style={{ top: (NOW_H - FIRST_HOUR) * HOUR_PX }}>
                      <span className="lab">NÅ 09:42</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SUMMARY FOOTER */}
        <div className="week-summary">
          <div className="lbl">Sum</div>
          {WBP_WEEK_DAYS.map((d, i) => {
            const ds = dayTotals[i];
            return (
              <div key={i} className={'cell' + (d.weekend ? ' weekend' : '')}>
                <span className="v">{ds.totalH.toFixed(1)}<span className="u">t</span></span>
                <div className="dots">
                  {ds.axesUsed.map(ax => (
                    <span key={ax} className="dot" style={{ background: WBP_AXIS_COLOR[ax] }}></span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { WBP_CanvasWeek, WBP_WEEK_DAYS, WBP_WEEK_SESSIONS });
