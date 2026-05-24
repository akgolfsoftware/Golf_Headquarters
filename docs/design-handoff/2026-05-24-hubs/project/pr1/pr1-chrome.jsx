// pr1-chrome.jsx — shared sidebar + topbar for PlayerHQ and CoachHQ artboards

const Ic = ({ id, ...rest }) => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <use href={`#${id}`} />
  </svg>
);

function PHSidebar({ active = 'workbench' }) {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <img src="assets/logo-white-on-green.svg" alt="AK Golf" />
        <div className="name">AK GOLF</div>
        <div className="meta">PLAYERHQ · PRO</div>
      </div>
      <div className="sb-profile">
        <div className="av">MR</div>
        <div>
          <div className="nm">Markus R.P.</div>
          <div className="meta">HCP +3,5 · A1</div>
        </div>
      </div>
      <div className="sb-group">
        <div className="sb-glabel">Hjem</div>
        <button className={"sb-item" + (active === 'home' ? ' active' : '')}><Ic id="ic-home"/>Hjem</button>
        <button className="sb-item"><Ic id="ic-bell"/>Varsler<span className="badge">3</span></button>
      </div>
      <div className="sb-group">
        <div className="sb-glabel">Workbench</div>
        <button className={"sb-item" + (active === 'workbench' ? ' active' : '')}><Ic id="ic-clipboard"/>Min workbench</button>
        <button className="sb-item"><Ic id="ic-cal"/>Kalender</button>
        <button className="sb-item"><Ic id="ic-target"/>Mål</button>
        <button className="sb-item"><Ic id="ic-flag"/>Turneringer</button>
      </div>
      <div className="sb-group">
        <div className="sb-glabel">Innsikt</div>
        <button className="sb-item"><Ic id="ic-bar"/>Statistikk</button>
        <button className="sb-item"><Ic id="ic-tm"/>TrackMan</button>
        <button className="sb-item"><Ic id="ic-user"/>Coach</button>
      </div>
      <div style={{ marginTop: 'auto' }} className="sb-group">
        <button className="sb-item"><Ic id="ic-settings"/>Innstillinger</button>
      </div>
    </aside>
  );
}

function CHSidebar({ active = 'home' }) {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <img src="assets/logo-white-on-green.svg" alt="AK Golf" />
        <div className="name">AK GOLF</div>
        <div className="meta">COACHHQ · HEAD COACH</div>
      </div>
      <div className="sb-profile">
        <div className="av">AK</div>
        <div>
          <div className="nm">Anders K.</div>
          <div className="meta">38 SPILLERE</div>
        </div>
      </div>
      <div className="sb-group">
        <div className="sb-glabel">Daglig</div>
        <button className={"sb-item" + (active === 'home' ? ' active' : '')}><Ic id="ic-home"/>Hjem</button>
        <button className="sb-item"><Ic id="ic-cal"/>Kalender</button>
        <button className="sb-item"><Ic id="ic-msg"/>Innboks<span className="badge">7</span></button>
        <button className="sb-item"><Ic id="ic-check"/>Godkjenninger<span className="badge">4</span></button>
      </div>
      <div className="sb-group">
        <div className="sb-glabel">Operasjon</div>
        <button className="sb-item"><Ic id="ic-users"/>Stall</button>
        <button className="sb-item"><Ic id="ic-clipboard"/>Planer</button>
        <button className="sb-item"><Ic id="ic-cal"/>Bookinger</button>
        <button className="sb-item"><Ic id="ic-map-pin"/>Anlegg</button>
      </div>
      <div className="sb-group">
        <div className="sb-glabel">Innsikt</div>
        <button className="sb-item"><Ic id="ic-bar"/>Analyse</button>
        <button className="sb-item"><Ic id="ic-target"/>Talent</button>
      </div>
      <div style={{ marginTop: 'auto' }} className="sb-group">
        <button className="sb-item"><Ic id="ic-settings"/>Innstillinger</button>
      </div>
    </aside>
  );
}

function Topbar({ crumb, search = "Søk drill, plan eller mål…" }) {
  return (
    <header className="topbar">
      <div className="search">
        <Ic id="ic-search"/>
        <input placeholder={search} readOnly />
        <span className="kbd">⌘K</span>
      </div>
      <div className="breadcrumb">{crumb}</div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
        <button className="top-icon"><Ic id="ic-msg"/><span className="dot"></span></button>
        <button className="top-icon"><Ic id="ic-bell"/></button>
        <button className="top-icon"><Ic id="ic-user"/></button>
      </div>
    </header>
  );
}

/* Sparkline svg helper */
function Sparkline({ data = [4,5,4.5,6,5.5,7,6.5,8], width = 90, height = 28, color }) {
  const min = Math.min(...data), max = Math.max(...data);
  const w = width, h = height;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / (max - min || 1)) * (h - 4) - 2]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg className="spk" viewBox={`0 0 ${w} ${h}`} width={w} height={h} preserveAspectRatio="none">
      <path d={d} stroke={color || '#005840'} />
      <circle className="last" cx={last[0]} cy={last[1]} r="2.5" />
    </svg>
  );
}

Object.assign(window, { Ic, PHSidebar, CHSidebar, Topbar, Sparkline });
