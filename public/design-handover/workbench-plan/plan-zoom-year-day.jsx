/* ============================================================
   Workbench Plan · Year + Day views
   ============================================================ */

const WBP_MONTHS = [
  { id: 1,  abbr: 'JAN', n: 'januar' },
  { id: 2,  abbr: 'FEB', n: 'februar' },
  { id: 3,  abbr: 'MAR', n: 'mars' },
  { id: 4,  abbr: 'APR', n: 'april' },
  { id: 5,  abbr: 'MAI', n: 'mai',  now: true },
  { id: 6,  abbr: 'JUN', n: 'juni' },
  { id: 7,  abbr: 'JUL', n: 'juli' },
  { id: 8,  abbr: 'AUG', n: 'august' },
  { id: 9,  abbr: 'SEP', n: 'september' },
  { id: 10, abbr: 'OKT', n: 'oktober' },
  { id: 11, abbr: 'NOV', n: 'november' },
  { id: 12, abbr: 'DES', n: 'desember' },
];

// Each period: spans which months, color, label
const WBP_YEAR_PHASES = [
  { id: 1, lbl: 'GRUNNPERIODE',              abbr: 'GRUNN',  startM: 1,    endM: 3.5,  color: '#5E5C57', status: 'done' },
  { id: 2, lbl: 'SPESIALISERING',            abbr: 'SPES',   startM: 3.5,  endM: 5,    color: '#B8852A', status: 'done' },
  { id: 3, lbl: 'TURNERINGSFORBEREDELSER',   abbr: 'T-FORB', startM: 5,    endM: 6,    color: '#005840', status: 'now' },
  { id: 4, lbl: 'TURNERINGSPERIODE',         abbr: 'TURN',   startM: 6,    endM: 9,    color: '#A32D2D', status: 'next' },
  { id: 5, lbl: 'RESTITUSJON',               abbr: 'REST',   startM: 9,    endM: 10.5, color: '#2563EB', status: 'next' },
  { id: 6, lbl: 'FERIE',                     abbr: 'FERIE',  startM: 10.5, endM: 12.5, color: '#7C8C73', status: 'next' },
];

const WBP_YEAR_TOURNAMENTS = [
  { month: 3.5, lbl: 'Vinter-cup', tier: 'B' },
  { month: 5.85, lbl: 'Sørlandsåpent', tier: 'A' },
  { month: 6.5, lbl: 'Osloåpent', tier: 'B' },
  { month: 7.5, lbl: 'NM-kval', tier: 'A' },
  { month: 9, lbl: 'Norgesfinalen', tier: 'A' },
  { month: 10.2, lbl: 'Klubbmesterskap', tier: 'B' },
];

const WBP_YEAR_CAMPS = [
  { month: 2.5, lbl: 'WANG · vinter', regi: 'W' },
  { month: 6.4, lbl: 'WANG · juni',   regi: 'W' },
  { month: 7.2, lbl: 'Team Norge',    regi: 'T' },
  { month: 9.5, lbl: 'Klubbsamling',  regi: 'K' },
];

// Monthly planned hours per axis (for the bars)
const WBP_YEAR_VOLUMES = {
  fys:   [22, 24, 26, 22, 20, 18, 14, 12, 16, 18, 22, 24],
  tek:   [26, 28, 24, 22, 20, 18, 14, 12, 16, 18, 20, 22],
  slag:  [12, 14, 18, 22, 24, 26, 24, 18, 22, 20, 16, 14],
  spill: [4,  6,  10, 16, 22, 26, 30, 28, 22, 16, 8,  4 ],
  turn:  [0,  0,  3,  6,  8,  10, 14, 12, 8,  4,  2,  0 ],
};

const WBP_YEAR_AXES = [
  { key: 'fys',   nm: 'FYS',   pct: '15%', color: '#005840', max: 28 },
  { key: 'tek',   nm: 'TEK',   pct: '18%', color: '#B8852A', max: 28 },
  { key: 'slag',  nm: 'SLAG',  pct: '27%', color: '#2563EB', max: 28 },
  { key: 'spill', nm: 'SPILL', pct: '30%', color: '#D1F843', max: 30 },
  { key: 'turn',  nm: 'TURN',  pct: '10%', color: '#A32D2D', max: 14 },
];

// "Today" — mid-May
const YEAR_NOW = 5 + 23/31; // mai 23
function pctOfYear(m) {
  return ((m - 1) / 12) * 100;
}

/* ============================================================
   YEAR VIEW
   ============================================================ */
function WBP_CanvasYear() {
  const { setModal } = useContext(PlanContext);

  return (
    <main className="canvas">
      <div className="year-canvas">
        <div className="year-head">
          <h2 className="ttl">
            Sesong <em>2026</em>
            <span className="num">6 perioder · 6 turneringer · 4 samlinger</span>
          </h2>
          <div className="meta-strip">
            <span>I dag: <strong>23. mai · uke 21</strong></span>
            <span className="sep"></span>
            <span>Fase nå: <strong style={{ color: 'var(--brand-primary)' }}>P3 · Bygging</strong></span>
            <span className="sep"></span>
            <span>Til neste turnering: <strong>21 d</strong></span>
          </div>
        </div>

        {/* Phase + tournament strip */}
        <div className="year-phases">
          <div className="year-phase-track">
            <div className="year-phase-label">Faser</div>
            <div className="year-phase-bar">
              {WBP_YEAR_PHASES.map(p => {
                const widthPct = ((p.endM - p.startM) / 12) * 100;
                // Pick label length based on segment width
                const lbl = widthPct >= 17 ? p.lbl : widthPct >= 11 ? p.abbr : '';
                return (
                  <div key={p.id}
                       className={'year-phase-seg' + (p.status === 'now' ? ' now' : '')}
                       style={{ width: `${widthPct}%`, background: p.color }}
                       title={p.lbl}>
                    <span className="lbl-text">{lbl}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="year-markers">
            <div className="lbl">Turneringer</div>
            <div className="strip">
              {WBP_YEAR_TOURNAMENTS.map((t, i) => (
                <div key={i}
                     className={'year-marker trn ' + t.tier}
                     style={{ left: `${pctOfYear(t.month)}%` }}>
                  {t.tier}
                  <span className="tooltip">{t.lbl} · {WBP_MONTHS[Math.floor(t.month) - 1].abbr}</span>
                </div>
              ))}
              {WBP_YEAR_CAMPS.map((c, i) => (
                <div key={'c'+i}
                     className="year-marker camp"
                     style={{ left: `${pctOfYear(c.month)}%` }}>
                  {c.regi}
                  <span className="tooltip">{c.lbl} · {WBP_MONTHS[Math.floor(c.month) - 1].abbr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Month columns */}
        <div className="year-months">
          <div className="corner"></div>
          {WBP_MONTHS.map(m => (
            <div key={m.id} className={'mh' + (m.now ? ' now' : '')}>{m.abbr}</div>
          ))}
        </div>

        {/* Axis × month grid */}
        <div className="year-axes" style={{ position: 'relative' }}>
          {WBP_YEAR_AXES.map(ax => {
            const vols = WBP_YEAR_VOLUMES[ax.key];
            return (
              <div key={ax.key} className="year-axis-row">
                <div className="year-axis-label">
                  <div className="bar" style={{ background: ax.color }}></div>
                  <div className="nm">{ax.nm}<span className="pct">{ax.pct}</span></div>
                </div>
                {WBP_MONTHS.map((m, i) => {
                  const v = vols[i];
                  const fill = (v / ax.max) * 100;
                  return (
                    <div key={m.id} className={'year-month-cell' + (m.now ? ' now' : '')}
                         onClick={() => setModal('period')}>
                      <div className="vbar">
                        <div className="f" style={{ width: `${fill}%`, background: ax.color }}></div>
                      </div>
                      <div className="vbar-num">{v}<span className="u">t</span></div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/* Today vertical line */}
          <div className="year-today-line" style={{
            left: `calc(64px + ${(YEAR_NOW - 1) / 12 * 100}% * ((100% - 64px) / 100%))`,
          }}></div>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   DAY VIEW — single day timeline (Tirsdag 23. mai)
   ============================================================ */
const DAY_HOURS = Array.from({ length: 18 }, (_, i) => i + 5); // 05–22
const DAY_HOUR_PX = 80;

function WBP_CanvasDay() {
  const { setActiveSession } = useContext(PlanContext);

  // Today's sessions = day 1 of WBP_WEEK_SESSIONS
  const sessions = WBP_WEEK_SESSIONS.filter(s => s.day === 1);
  const totalH = sessions.reduce((a, s) => a + s.dur, 0);

  return (
    <main className="canvas">
      <div className="day-canvas">

        <div className="day-head">
          <div>
            <h2 className="ttl">Tirsdag <em>23. mai</em></h2>
            <div className="meta">
              <span>Uke 21 · Periode 3 · Bygging</span>
              <span className="sep"></span>
              <span><strong>{sessions.length}</strong> økter</span>
              <span className="sep"></span>
              <span><strong>{totalH.toFixed(1)}</strong> t total</span>
              <span className="sep"></span>
              <span>Ankret mot: <strong style={{ color: 'var(--turn)' }}>Sørlandsåpent · 21 d</strong></span>
            </div>
          </div>
          <div className="day-stats">
            <div className="s">
              <span className="l">Energi</span>
              <span className="v">7<span className="u">/10</span></span>
            </div>
            <div className="s">
              <span className="l">Søvn</span>
              <span className="v">8,2<span className="u">t</span></span>
            </div>
            <div className="s">
              <span className="l">HRV</span>
              <span className="v">67<span className="u">ms</span></span>
            </div>
            <div className="s">
              <span className="l">Stress</span>
              <span className="v" style={{ fontSize: 14 }}>Lav</span>
            </div>
          </div>
        </div>

        <div className="day-scroll">
          <div className="day-track" style={{ minHeight: DAY_HOURS.length * DAY_HOUR_PX }}>
            <div className="day-time-col">
              {DAY_HOURS.map(h => (
                <div key={h} className={'day-time-row' + (h % 3 === 0 ? ' major' : '')}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
            <div className="lane">
              {DAY_HOURS.map((h, i) => (
                <div key={h} className={'day-hour-line' + (h % 3 === 0 ? ' major' : '')}
                     style={{ top: i * DAY_HOUR_PX }}></div>
              ))}

              {sessions.map(s => {
                const top = (s.startH - 5) * DAY_HOUR_PX;
                const height = s.dur * DAY_HOUR_PX - 4;
                const startStr = `${Math.floor(s.startH).toString().padStart(2, '0')}:${(Math.round((s.startH % 1) * 60)).toString().padStart(2, '0')}`;
                const endStr   = `${Math.floor(s.startH + s.dur).toString().padStart(2, '0')}:${(Math.round(((s.startH + s.dur) % 1) * 60)).toString().padStart(2, '0')}`;
                // Compact mode for sessions < 45 min, medium for 45-75 min
                const sizeCls = s.dur < 0.75 ? ' compact' : s.dur < 1.25 ? ' medium' : '';
                return (
                  <div key={s.id}
                       className={`day-session s-${s.axis} ${s.status === 'done' ? 'done' : ''} ${s.status === 'now' ? 'now' : ''}${sizeCls}`}
                       style={{ top, height }}
                       onClick={(e) => { e.stopPropagation(); setActiveSession({ ...s, week: 21 }); }}>
                    <div className="top-row">
                      <span className="ax" style={{ color: WBP_AXIS_COLOR[s.axis] }}>
                        ● {s.axis.toUpperCase()}
                      </span>
                      <span className="time-range">{startStr} – {endStr}</span>
                    </div>
                    <div className="title">{s.title}</div>
                    {s.dur >= 0.75 && (
                      <div className="meta-row">
                        <span className="m"><WBPIc id="ic-pin" size={11}/>{s.meta}</span>
                        <span className="m"><WBPIc id="ic-target" size={11}/>{Math.round(s.dur * 60)} min</span>
                        {s.status === 'now' && <span className="m" style={{ color: 'var(--danger)', fontWeight: 700 }}>● NÅ AKTIV</span>}
                        {s.status === 'done' && <span className="m" style={{ color: 'var(--success)', fontWeight: 700 }}>✓ Fullført</span>}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Now line at 09:42 */}
              <div className="day-now-line" style={{ top: (9 + 42/60 - 5) * DAY_HOUR_PX }}>
                <span className="lab">NÅ 09:42</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, {
  WBP_CanvasYear, WBP_CanvasDay,
  WBP_MONTHS, WBP_YEAR_PHASES, WBP_YEAR_TOURNAMENTS, WBP_YEAR_CAMPS, WBP_YEAR_VOLUMES, WBP_YEAR_AXES,
});
