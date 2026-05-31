/* ============================================================
   Workbench Plan · Shared chrome (topbar, zoombar, aibar, sidebar)
   Interaktiv versjon med modal-triggers og fasiliteter
   ============================================================ */

/* ---- TOPBAR ---- */
function WBP_Topbar() {
  const { setModal } = useContext(PlanContext);
  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="logo">AK</div>
        <div className="ttl">
          WORKBENCH
          <span className="sub">PLANLEGGING · PRO</span>
        </div>
      </div>
      <div className="crumbs">
        <span className="crumb">Sesong 2026</span>
        <span className="sep">›</span>
        <span className="crumb">Plan A</span>
        <span className="sep">›</span>
        <span className="crumb">Periode 3 · Bygging</span>
        <span className="sep">›</span>
        <span className="crumb active live">Uke 21 · Tirs 23/5</span>
      </div>
      <div className="topbar-right">
        <div className="role-toggle">
          <span className="r on">Spiller</span>
          <span className="r">Coach</span>
        </div>
        <div className="player-picker">
          <div className="av">MR</div>
          <div className="nm">Markus R.P.<span className="meta">A1 · HCP −2,1</span></div>
          <WBPIc id="ic-chevdown" size={12}/>
        </div>
        <button className="icon-btn" onClick={() => setModal('facilities')} title="Fasilitet-oversikt">
          <WBPIc id="ic-pin"/>
        </button>
        <button className="icon-btn"><WBPIc id="ic-history"/></button>
        <button className="icon-btn"><WBPIc id="ic-settings"/></button>
        <button className="icon-btn"><WBPIc id="ic-bell"/><span className="dot"></span></button>
        <button className="share-btn"><WBPIc id="ic-share" size={13}/>Del plan</button>
      </div>
    </header>
  );
}

/* ---- ZOOMBAR ---- */
function WBP_Zoombar() {
  const { zoom, setZoom } = useContext(PlanContext);
  const tabs = [
    { id: 'ar',      label: 'År',      kbd: 'Y' },
    { id: 'periode', label: 'Periode', kbd: 'P' },
    { id: 'maned',   label: 'Måned',   kbd: 'M' },
    { id: 'uke',     label: 'Uke',     kbd: 'U' },
    { id: 'dag',     label: 'Dag',     kbd: 'D' },
  ];
  const sliderPct = ({ ar: 5, periode: 35, maned: 55, uke: 75, dag: 95 })[zoom] || 35;
  return (
    <div className="zoombar">
      <div className="zb-left">
        <span className="plan-pill"><span className="dot"></span>Plan A · Aktiv</span>
        <span className="save-state"><span className="dot"></span>Lagret 2 s siden</span>
      </div>
      <div className="zoom-tabs">
        {tabs.map(t => (
          <button key={t.id}
                  className={'zt' + (t.id === zoom ? ' on' : '')}
                  onClick={() => setZoom(t.id)}>
            {t.label}<span className="kbd">{t.kbd}</span>
          </button>
        ))}
      </div>
      <div className="zb-right">
        <div className="zoom-slider">
          <span className="lbl">År</span>
          <div className="track">
            <div className="fill" style={{ width: `${sliderPct}%` }}></div>
            <div className="thumb" style={{ left: `${sliderPct}%` }}></div>
          </div>
          <span className="lbl">Dag</span>
        </div>
        <span className="zoom-kbd">
          <span className="kbd-chip">⌘</span><span className="kbd-chip">+</span> / <span className="kbd-chip">⌘</span><span className="kbd-chip">−</span>
        </span>
      </div>
    </div>
  );
}

/* ---- AI COMMAND BAR ---- */
function WBP_AIBar() {
  const { setModal } = useContext(PlanContext);
  const chips = [
    { ic: 'ic-sparkles',  label: 'Generér uke 24',         onClick: () => setModal('freq') },
    { ic: 'ic-shuffle',   label: 'Balansér Periode 3',     onClick: null },
    { ic: 'ic-trending',  label: 'Foreslå taper-uke 22',   onClick: null },
  ];
  return (
    <div className="aibar">
      <div className="ai-leftpad">
        <span className="dot"></span>
        Caddie
      </div>
      <div className="ai-input-wrap">
        <div className="ai-input">
          <WBPIc id="ic-sparkles"/>
          <span className="ph">
            <span className="typed">Flytt mandag&apos;s SLAG til onsdag og legg til en lett FYS</span>
            <span className="caret"></span>
          </span>
          <span className="kbd-chip">⌘K</span>
        </div>
        <div className="ai-suggestions">
          <span className="lbl">Forslag</span>
          {chips.map((c, i) => (
            <button key={i} className="ai-chip" onClick={c.onClick || undefined}><WBPIc id={c.ic} size={11}/>{c.label}</button>
          ))}
        </div>
      </div>
      <button className="ai-cta" onClick={() => setModal('freq')}>
        <WBPIc id="ic-sparkles" size={13}/>
        Generér periode
      </button>
    </div>
  );
}

/* ---- SIDEBAR ---- */
function WBP_Sidebar() {
  const { setModal, facilities } = useContext(PlanContext);
  const facYes = Object.values(facilities).filter(Boolean).length;
  const facTotal = Object.keys(facilities).length;
  return (
    <aside className="sidebar">
      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Sesong-tre</span>
          <button className="add" onClick={() => setModal('period')} title="Ny periode"><WBPIc id="ic-plus" size={12}/></button>
        </div>
        <div className="tree">
          <div className="tree-row lvl-1">
            <span className="chev"><WBPIc id="ic-chevdown" size={11}/></span>
            <span></span>
            <span>Sesong 2026</span>
            <span className="badge-right">5 PER</span>
          </div>
          {WBP_TREE.periods.map(p => (
            <React.Fragment key={p.id}>
              <div className={'tree-row lvl-2 period' + (p.active ? ' active' : '')}
                   onClick={() => p.active && setModal('freq')}>
                <span className="chev">{p.active ? <WBPIc id="ic-chevdown" size={11}/> : <WBPIc id="ic-chevright" size={11}/>}</span>
                <span className={`marker marker-${p.status}`}></span>
                <span>P{p.id} · {p.name}</span>
                <span className="badge-right">{p.weeks.replace('uke ', '')}</span>
              </div>
              {p.active && p.subweeks && p.subweeks.map(w => (
                <div key={w.id} className={'tree-row lvl-3' + (w.state === 'now' ? ' active' : '')}>
                  <span></span>
                  <span className={`marker marker-${w.state}`}></span>
                  <span>{w.label}</span>
                  <span className="badge-right">U{w.id}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <button className="sb-cta" onClick={() => setModal('period')}>
          <WBPIc id="ic-plus" size={12}/>Ny periode
        </button>
      </div>

      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Planer · A/B</span>
          <button className="add"><WBPIc id="ic-plus" size={12}/></button>
        </div>
        {WBP_PLANS.map(p => (
          <div key={p.id} className={'plan-row' + (p.active ? ' active' : '') + (p.draft ? ' draft' : '')}>
            <span className="ic">{p.id}</span>
            <div>
              <div className="nm">{p.name.split(' · ')[1] || p.name}</div>
              <span className="meta">{p.meta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Turneringer · 2026</span>
          <button className="add"><WBPIc id="ic-plus" size={12}/></button>
        </div>
        <div className="tree">
          {WBP_TOURNAMENTS.map(t => (
            <div key={t.id} className="tree-row lvl-2 tournament">
              <span className="chev"></span>
              <span className={`marker marker-${t.tier}`}></span>
              <span>{t.name}</span>
              <span className="badge-right">{t.days}d</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Samlinger</span>
          <button className="add" onClick={() => setModal('camp')} title="Ny samling"><WBPIc id="ic-plus" size={12}/></button>
        </div>
        <div className="tree">
          <div className="tree-row lvl-2">
            <span className="chev"></span>
            <span className="marker" style={{ background: '#005840', borderRadius: '50%' }}></span>
            <span>WANG Toppidrett</span>
            <span className="badge-right">13.–16.6</span>
          </div>
          <div className="tree-row lvl-2">
            <span className="chev"></span>
            <span className="marker" style={{ background: '#A32D2D', borderRadius: '50%' }}></span>
            <span>Team Norge · Vestby</span>
            <span className="badge-right">5.–7.7</span>
          </div>
          <div className="tree-row lvl-2">
            <span className="chev"></span>
            <span className="marker" style={{ background: '#B8852A', borderRadius: '50%' }}></span>
            <span>Klubbsamling GFGK</span>
            <span className="badge-right">22.5</span>
          </div>
        </div>
        <button className="sb-cta" onClick={() => setModal('camp')}>
          <WBPIc id="ic-plus" size={12}/>Ny samling
        </button>
      </div>

      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Fasiliteter</span>
          <button className="add" onClick={() => setModal('facilities')} title="Rediger"><WBPIc id="ic-settings" size={12}/></button>
        </div>
        <div className="plan-row" onClick={() => setModal('facilities')}>
          <span className="ic" style={{ background: facYes >= 8 ? 'var(--brand-primary)' : 'var(--warning)' }}>
            <WBPIc id="ic-pin" size={10}/>
          </span>
          <div>
            <div className="nm">{facYes} av {facTotal} tilgjengelig</div>
            <span className="meta">Caddie tilpasser drills</span>
          </div>
        </div>
      </div>

      <div className="sb-section">
        <div className="head">
          <span className="eyebrow">Pyramide-akser</span>
        </div>
        <div className="legend-grid">
          <span className="l-item"><span className="sw" style={{ background: 'var(--turn)' }}></span>TURN</span>
          <span className="l-item"><span className="sw" style={{ background: 'var(--brand-accent)' }}></span>SPILL</span>
          <span className="l-item"><span className="sw" style={{ background: 'var(--slag)' }}></span>SLAG</span>
          <span className="l-item"><span className="sw" style={{ background: 'var(--tek)' }}></span>TEK</span>
          <span className="l-item"><span className="sw" style={{ background: 'var(--fys)' }}></span>FYS</span>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { WBP_Topbar, WBP_Zoombar, WBP_AIBar, WBP_Sidebar });
