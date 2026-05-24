// pr2-shared.jsx — primitives shared across PR2 screens

function PlayerHero({
  initials = 'MR', avatarClass = 'c3',
  first = 'Markus R.', last = 'Pedersen',
  cohort = 'A1', hcp = '+4,8', wagr = '2 142', age = '17 år', tier = 'PRO',
  extraMeta = 'Sist aktiv 14 min siden · 12/36 tester · Plan: Mai-blokk',
  actions = true,
}) {
  return (
    <div className="player-hero">
      <div className={`ph-av av ${avatarClass}`}>{initials}</div>
      <div>
        <div className="eyebrow">SPILLER · A1 KOHORT · PRO-ABONNEMENT</div>
        <div className="ph-name">{first} <em>{last}</em></div>
        <div className="ph-pills">
          <span className="pill pill-cohort">{cohort}</span>
          <span className="pill pill-tier">HCP {hcp}</span>
          <span className="pill" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>WAGR {wagr}</span>
          <span className="pill" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>{age}</span>
          <span className="pill pill-pro">{tier}</span>
        </div>
        <div className="ph-meta">{extraMeta}</div>
      </div>
      {actions && (
        <div className="ph-actions">
          <button className="btn btn-outline btn-sm"><Ic id="ic-msg"/>Send melding</button>
          <button className="btn btn-outline btn-sm"><Ic id="ic-target"/>Tildel test</button>
          <button className="btn btn-primary btn-sm"><Ic id="ic-plus"/>Ny økt</button>
          <button className="btn btn-outline btn-sm" style={{ padding: '7px 10px' }}><Ic id="ic-more"/></button>
        </div>
      )}
    </div>
  );
}

function PlayerTabs({ active = 'profil' }) {
  const tabs = [
    { id: 'profil', label: 'Profil' },
    { id: 'plan', label: 'Plan' },
    { id: 'tester', label: 'Tester', badge: '12/36' },
    { id: 'analyse', label: 'Analyse' },
    { id: 'notater', label: 'Notater', badge: '8' },
  ];
  return (
    <div className="tabs">
      {tabs.map(t => (
        <div key={t.id} className={"tab" + (t.id === active ? ' active' : '')}>
          <span>{t.label}</span>
          {t.badge && <span className="badge">{t.badge}</span>}
        </div>
      ))}
    </div>
  );
}

function PlayerKpis({ next = 'I dag 14:00 · Putt' }) {
  return (
    <div className="kpi-strip">
      <div className="kpi compact featured">
        <span className="lbl">HCP-trend · 12 uker</span>
        <span className="val">+4,8</span>
        <Sparkline data={[5.4,5.3,5.2,5.0,4.9,5.0,4.8,4.7,4.8,4.7,4.8,4.8]} width={180} height={28} color="#D1F843"/>
        <span className="sub">↓ 0,4 i mai</span>
      </div>
      <div className="kpi compact">
        <span className="lbl">Strokes Gained · total</span>
        <span className="val" style={{ color: 'var(--brand-primary)' }}>−1,6</span>
        <span className="sub">A1-snitt: −2,2 · ↑ 0,6</span>
      </div>
      <div className="kpi compact">
        <span className="lbl">Tester gjort</span>
        <span className="val">12<span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 500 }}>/36</span></span>
        <span className="sub">2 forfaller i mai</span>
      </div>
      <div className="kpi compact">
        <span className="lbl">Neste økt</span>
        <span className="val" style={{ fontSize: 16, lineHeight: 1.2, marginTop: 6 }}>{next}</span>
        <span className="sub">Mulligan Studio · 60 min</span>
      </div>
    </div>
  );
}

function Fact({ k, v, mono }) {
  return (
    <div className="fact">
      <div className="k">{k}</div>
      <div className={"v" + (mono ? ' mono' : '')}>{v}</div>
    </div>
  );
}

/* 5-axis radar chart */
function Radar({
  axes = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'],
  me = [62, 78, 71, 58, 64],
  cohort = [55, 62, 58, 60, 55],
  size = 260,
}) {
  const cx = size / 2, cy = size / 2, R = size * 0.40;
  const n = axes.length;
  // axis directions
  const dir = (i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [Math.cos(a), Math.sin(a)];
  };
  const point = (val, i) => {
    const [dx, dy] = dir(i);
    const r = (val / 100) * R;
    return [cx + dx * r, cy + dy * r];
  };
  const polygon = (vals) => vals.map((v, i) => point(v, i).join(',')).join(' ');
  const grid = [25, 50, 75, 100].map((p) => (
    <polygon key={p}
      points={Array.from({ length: n }, (_, i) => point(p, i).join(',')).join(' ')}
      fill="none" stroke="#E5E3DD" strokeWidth="1"
    />
  ));
  return (
    <svg className="radar-svg" viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {/* grid */}
      {grid}
      {/* axes */}
      {axes.map((_, i) => {
        const [dx, dy] = dir(i);
        return <line key={i} x1={cx} y1={cy} x2={cx + dx * R} y2={cy + dy * R} stroke="#E5E3DD" strokeWidth="1" />;
      })}
      {/* cohort polygon (dashed) */}
      <polygon points={polygon(cohort)} fill="rgba(94,92,87,0.06)" stroke="#908D86" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* me polygon */}
      <polygon points={polygon(me)} fill="rgba(0,88,64,0.18)" stroke="#005840" strokeWidth="2" />
      {/* me points */}
      {me.map((v, i) => {
        const [px, py] = point(v, i);
        return <circle key={i} cx={px} cy={py} r="3.5" fill="#D1F843" stroke="#005840" strokeWidth="1.5" />;
      })}
      {/* axis labels */}
      {axes.map((a, i) => {
        const [dx, dy] = dir(i);
        const lx = cx + dx * (R + 16), ly = cy + dy * (R + 16);
        return (
          <text key={a} x={lx} y={ly} fill="#0A1F17"
            fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700"
            letterSpacing="0.10em" textAnchor="middle" dominantBaseline="middle">
            {a}
          </text>
        );
      })}
    </svg>
  );
}

/* Progress ring for goal cards */
function ProgressRing({ value = 65, color = '#005840', size = 64 }) {
  const r = size / 2 - 5, cx = size / 2, cy = size / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg className="ring-svg" viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle className="ring-bg" cx={cx} cy={cy} r={r} />
      <circle className="ring-fg" cx={cx} cy={cy} r={r}
        stroke={color}
        strokeDasharray={`${c} ${c}`} strokeDashoffset={off}
      />
    </svg>
  );
}

Object.assign(window, { PlayerHero, PlayerTabs, PlayerKpis, Fact, Radar, ProgressRing });
