/* ============================================================
   Workbench Plan · Pyramid component
   FYS bottom → TURN top. Trapezoid stack. Tournament marker at apex.
   ============================================================ */

/*
  Pyramid geometry (viewBox 320 × 260)
  We build 5 horizontal slabs that taper towards the top.
  Bottom edge (FYS base) = 320 wide; top edge (TURN apex) = small.
  Each slab is a trapezoid.
*/

const WBP_PYR_LEVELS = [
  { key: 'fys',   name: 'FYS',   sub: 'Fysisk',     color: '#005840', textDark: false },
  { key: 'tek',   name: 'TEK',   sub: 'Teknikk',    color: '#B8852A', textDark: false },
  { key: 'slag',  name: 'SLAG',  sub: 'Golfslag',   color: '#2563EB', textDark: false },
  { key: 'spill', name: 'SPILL', sub: 'Spill',      color: '#D1F843', textDark: true  },
  { key: 'turn',  name: 'TURN',  sub: 'Turnering',  color: '#A32D2D', textDark: false },
];

function WBP_Pyramid({ weights, actuals, period = 'Periode 3 · Bygging', anchor }) {
  const [hover, setHover] = useState('slag'); // default shown for demo
  // Tooltip data per axis — planned hours, target, drills, insight
  const tooltipData = {
    fys: {
      nm: 'FYS', sub: 'Fysisk fundament', color: '#005840',
      weekH: 1.5, periodH: 9, drills: 5,
      target: '12–18%', targetPctMid: 15,
      barFill: 18, barTarget: 15,
      insight: { txt: <React.Fragment><strong>På sporet</strong> · 2× mobilitet, 1× styrke, 1× sprint denne uka.</React.Fragment>, cls: '' },
    },
    tek: {
      nm: 'TEK', sub: 'Teknisk arbeid', color: '#B8852A',
      weekH: 2.0, periodH: 12, drills: 8,
      target: '15–22%', targetPctMid: 18,
      barFill: 22, barTarget: 18,
      insight: { txt: <React.Fragment><strong>Over mål</strong> · 22% faktisk (mål 18%) — reduser i uke 22 (taper).</React.Fragment>, cls: 'warn' },
    },
    slag: {
      nm: 'SLAG', sub: 'Golfslag · range + TM', color: '#2563EB',
      weekH: 2.4, periodH: 16, drills: 14,
      target: '24–30%', targetPctMid: 27,
      barFill: 24, barTarget: 27,
      insight: { txt: <React.Fragment><strong>Under mål</strong> · 24% faktisk (mål 27%) — + wedge-økt onsdag anbefales.</React.Fragment>, cls: 'warn' },
    },
    spill: {
      nm: 'SPILL', sub: 'Spill på bane', color: '#B8C73A',
      weekH: 2.7, periodH: 18, drills: 4,
      target: '26–32%', targetPctMid: 30,
      barFill: 26, barTarget: 30,
      insight: { txt: <React.Fragment><strong>Under mål</strong> · 6 runder/måned — prioriter 18-hulls torsdag.</React.Fragment>, cls: 'warn' },
    },
    turn: {
      nm: 'TURN', sub: 'Turnerings-anker', color: '#A32D2D',
      weekH: 0.6, periodH: 5, drills: 0,
      target: '8–12%', targetPctMid: 10,
      barFill: 10, barTarget: 10,
      insight: { txt: <React.Fragment><strong>På sporet</strong> · ankret mot Sør.åpent · 21 dager.</React.Fragment>, cls: '' },
    },
  };
  // Geometry — viewBox 320 wide, 240 tall (plus 10px header space)
  const VB_W = 320;
  const VB_H = 240;
  const apexW = 36;        // top edge width
  const baseW = 280;       // bottom slab edge width
  const padX = (VB_W - baseW) / 2;

  // Y positions for each slab (5 horizontal bands)
  // bottom (FYS) y=240 → top (TURN apex) y=0
  // Each level takes 1/5 of total height = 48px
  const levelH = VB_H / 5;

  // Build slabs from bottom to top
  // Slab i (i=0 is FYS at base, i=4 is TURN at top)
  // Bottom edge width = baseW * (5-i)/5, narrowing
  // Slab top edge width = baseW * (5-i-1)/5  (or apex for the last)
  const slabs = WBP_PYR_LEVELS.map((lvl, i) => {
    const yBot = VB_H - i * levelH;
    const yTop = VB_H - (i + 1) * levelH;
    // Use linear taper from baseW at bottom to apexW at top
    const tBot = i / 5;       // 0..0.8
    const tTop = (i + 1) / 5; // 0.2..1.0
    const widthBot = baseW - (baseW - apexW) * tBot;
    const widthTop = baseW - (baseW - apexW) * tTop;
    const xLBot = (VB_W - widthBot) / 2;
    const xRBot = xLBot + widthBot;
    const xLTop = (VB_W - widthTop) / 2;
    const xRTop = xLTop + widthTop;

    const w = weights[lvl.key] || 0;
    const a = (actuals && actuals[lvl.key]) || 0;

    return {
      ...lvl,
      idx: i,
      yBot, yTop,
      widthBot, widthTop,
      path: `M ${xLBot.toFixed(1)} ${yBot} L ${xRBot.toFixed(1)} ${yBot} L ${xRTop.toFixed(1)} ${yTop.toFixed(1)} L ${xLTop.toFixed(1)} ${yTop.toFixed(1)} Z`,
      cyMid: (yBot + yTop) / 2,
      weight: w,
      actual: a,
    };
  });

  return (
    <div className="pyramid">
      <div className="pyramid-svg-wrap">
        <div className="corner-label tl">Periode-pyramide</div>
        <div className="corner-label tr">↑ Turnering</div>
        <div className="corner-label bl">↓ Fysisk fundament</div>
        <div className="corner-label br">{period}</div>

        <svg className={'pyramid-svg' + (hover ? ' has-hover' : '')} viewBox={`0 0 ${VB_W} ${VB_H}`} xmlns="http://www.w3.org/2000/svg">
          <defs>
            {slabs.map(s => (
              <linearGradient key={s.key} id={`pyr-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.95"/>
                <stop offset="100%" stopColor={s.color} stopOpacity="1"/>
              </linearGradient>
            ))}
          </defs>

          {/* Slabs from bottom (FYS) to top (TURN) */}
          {slabs.map(s => (
            <g key={s.key}
               onMouseEnter={() => setHover(s.key)}
               onMouseLeave={() => setHover(prev => prev === s.key ? null : prev)}
               onClick={() => setHover(prev => prev === s.key ? null : s.key)}>
              <path
                className={'axis-trapezoid' + (hover === s.key ? ' hov' : '')}
                d={s.path}
                fill={`url(#pyr-grad-${s.key})`}
              />
              {/* subtle top edge highlight */}
              <line
                x1={(VB_W - s.widthTop) / 2}
                x2={(VB_W - s.widthTop) / 2 + s.widthTop}
                y1={s.yTop}
                y2={s.yTop}
                stroke="rgba(255,255,255,0.20)"
                strokeWidth="1"
              />

              {/* Axis label */}
              <text
                x={VB_W / 2 - (s.widthBot - s.widthTop) / 4 - 4}
                y={s.cyMid + 1}
                className={'axis-label' + (s.textDark ? ' dark' : '')}
                fontSize={s.idx === 4 ? 7 : 8.5}
                textAnchor="end"
              >
                {s.name}
              </text>

              {/* Sub-label (Norwegian word) */}
              {s.idx < 4 && (
                <text
                  x={VB_W / 2 - (s.widthBot - s.widthTop) / 4 - 4}
                  y={s.cyMid + 10}
                  className={'axis-label' + (s.textDark ? ' dark' : '')}
                  fontSize="6"
                  fontWeight="500"
                  textAnchor="end"
                  opacity="0.65"
                >
                  {s.sub}
                </text>
              )}

              {/* Weight % to right of label */}
              <text
                x={VB_W / 2 + 5}
                y={s.cyMid + 3}
                className={'axis-pct' + (s.textDark ? ' dark' : '')}
                fontSize={s.idx === 4 ? 6.5 : 8}
                textAnchor="start"
              >
                {s.weight}%
              </text>

              {/* Actual sub-number under */}
              {s.actual > 0 && s.idx < 4 && (
                <text
                  x={VB_W / 2 + 5}
                  y={s.cyMid + 11}
                  className={'axis-pct' + (s.textDark ? ' dark' : '')}
                  fontSize="5.5"
                  fontWeight="500"
                  opacity="0.65"
                  textAnchor="start"
                >
                  faktisk {s.actual}%
                </text>
              )}
            </g>
          ))}

          {/* Apex marker — represents the tournament anchor */}
          {anchor && (
            <g>
              <circle cx={VB_W / 2} cy={5} r="5" className="now-marker"/>
              <line x1={VB_W / 2} y1={0} x2={VB_W / 2} y2={10} stroke="#A32D2D" strokeWidth="1.5"/>
            </g>
          )}

          {/* Center plumb line — subtle */}
          <line className="center-line" x1={VB_W/2} y1={0} x2={VB_W/2} y2={VB_H}/>
        </svg>

        {/* Hover popup — appears when an axis is hovered */}
        {hover && tooltipData[hover] && (() => {
          const t = tooltipData[hover];
          const slab = slabs.find(s => s.key === hover);
          const topPct = slab ? (slab.cyMid / VB_H) * 100 : 50;
          return (
            <div className="pyr-tooltip"
                 style={{ left: 'calc(100% + 14px)', top: `${topPct}%`, transform: 'translateY(-50%)' }}>
              <div className="pyr-tooltip-head">
                <span className="sw" style={{ background: t.color }}></span>
                <div className="nm">{t.nm}<span className="sub">{t.sub}</span></div>
                <span className="pct">{t.barFill}<span className="u">%</span></span>
              </div>
              <div className="pyr-tooltip-row">
                <div className="cell">
                  <div className="l">Denne uke</div>
                  <div className="v">{t.weekH}<span className="u">t</span></div>
                </div>
                <div className="cell">
                  <div className="l">Periode-total</div>
                  <div className="v">{t.periodH}<span className="u">t</span></div>
                </div>
                <div className="cell">
                  <div className="l">Drills</div>
                  <div className="v">{t.drills}<span className="u">stk</span></div>
                </div>
                <div className="cell">
                  <div className="l">Mål-range</div>
                  <div className="v target">{t.target}</div>
                </div>
              </div>
              <div className="pyr-tooltip-bar">
                <div className="f" style={{ width: `${Math.min(t.barFill / 35 * 100, 100)}%`, background: t.color }}></div>
                <div className="target-mark" style={{ left: `${t.barTarget / 35 * 100}%` }}></div>
              </div>
              <div className="pyr-tooltip-bar-meta">
                <span>0%</span>
                <span>Mål {t.targetPctMid}%</span>
                <span>35%</span>
              </div>
              <div className={'pyr-tooltip-insight ' + t.insight.cls}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <use href="#ic-sparkles"/>
                </svg>
                <span>{t.insight.txt}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Mini bars: weight vs actual side-by-side */}
      {actuals && (
        <div className="pyramid-legend">
          {[...WBP_PYR_LEVELS].reverse().map(lvl => {
            const w = weights[lvl.key] || 0;
            const a = actuals[lvl.key] || 0;
            const maxScale = 35;
            return (
              <div key={lvl.key} className="pyramid-legend-row">
                <span className="axname">
                  <span className="sw" style={{ background: lvl.color }}></span>
                  {lvl.name}
                </span>
                <div className="bar">
                  <div className="actual" style={{
                    width: `${(a / maxScale) * 100}%`,
                    background: lvl.color,
                  }}></div>
                  <div className="ideal" style={{ left: `${(w / maxScale) * 100}%` }}></div>
                </div>
                <span className="nm">{a}<span className="ideal-num"> / {w}%</span></span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { WBP_Pyramid, WBP_PYR_LEVELS });
