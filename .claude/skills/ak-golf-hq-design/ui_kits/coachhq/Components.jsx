/* CoachHQ shared components */

function Icon({ name, size = 16, color }) {
  return <i data-lucide={name} style={{ width: size, height: size, color: color || "currentColor", display: "inline-flex", strokeWidth: 1.5 }} />;
}

function Eyebrow({ children, tone }) {
  return <span className={"eyebrow " + (tone === "lime" ? "eyebrow-lime" : "")}>{children}</span>;
}

function PulseDot() { return <span className="pulse" aria-hidden />; }

function Avatar({ initials, size = 32, status }) {
  return (
    <span style={{
      position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: 999, background: "var(--primary)", color: "var(--accent)",
      border: "2px solid white", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: size * 0.38,
      flexShrink: 0,
    }}>
      {initials}
      {status === "online" && <span aria-hidden style={{ position: "absolute", right: 0, bottom: 0, width: size * 0.28, height: size * 0.28, borderRadius: 999, background: "var(--accent)", border: "2px solid white" }}/>}
    </span>
  );
}

function StatusBadge({ tone, children }) {
  const map = {
    ok:      { bg: "#C8EBDC", fg: "#0E5D3F" },
    warn:    { bg: "#FBEFD4", fg: "#6B4D11" },
    urgent:  { bg: "#FAD7D7", fg: "#7A1E1E" },
    lime:    { bg: "#D1F843", fg: "#005840" },
    primary: { bg: "#005840", fg: "#D1F843" },
    neutral: { bg: "#F1EEE5", fg: "#0A1F17" },
  };
  const c = map[tone] || map.neutral;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.fg, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}

function Sparkline({ values, color = "var(--primary)", width = 64, height = 22 }) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - ((v - min) / range) * height}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
      <circle cx={width} cy={height - ((values[values.length-1] - min) / range) * height} r="2" fill="var(--accent)" />
    </svg>
  );
}

function Sidebar({ view, onNav }) {
  const items = [
    { key: "today", icon: "calendar-check", label: "Dagens", badge: "5" },
    { key: "players", icon: "users", label: "Spillere", badge: "42" },
    { key: "plan", icon: "calendar-days", label: "Planlegging" },
    { key: "invoice", icon: "receipt", label: "Faktura", badge: "3" },
    { key: "library", icon: "library", label: "Øktbibliotek" },
  ];
  const secondary = [
    { key: "analytics", icon: "line-chart", label: "Analyse" },
    { key: "settings",  icon: "settings",   label: "Innstillinger" },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <img src="../../assets/logo-primary-on-light.svg" alt="" />
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>CoachHQ</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted-foreground)" }}>AK Golf · admin</div>
        </div>
      </div>

      <div>
        <div className="sb-section">Arbeid</div>
        <div className="sb-nav">
          {items.map(it => (
            <button key={it.key} className={"sb-item " + (view === it.key ? "active" : "")} onClick={() => onNav(it.key)}>
              <Icon name={it.icon} size={16} />
              {it.label}
              {it.badge && <span className="badge">{it.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="sb-section">Verktøy</div>
        <div className="sb-nav">
          {secondary.map(it => (
            <button key={it.key} className={"sb-item " + (view === it.key ? "active" : "")} onClick={() => onNav(it.key)}>
              <Icon name={it.icon} size={16} />
              {it.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sb-profile">
        <span className="av">AK</span>
        <div style={{ minWidth: 0 }}>
          <div className="nm">Andreas Krogh</div>
          <div className="em">PGA · head coach</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <div className="topbar">
      <div className="search">
        <Icon name="search" size={14} />
        <input placeholder="Søk spiller, økt, faktura…" />
        <kbd>⌘K</kbd>
      </div>
      <span className="spacer" />
      <button className="btn btn-primary"><Icon name="plus" size={14} />Ny økt</button>
      <button className="icon-btn"><Icon name="bell" size={16} /><span className="dot" /></button>
      <span style={{ width: 32, height: 32, borderRadius: 999, background: "var(--primary)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12 }}>AK</span>
    </div>
  );
}

Object.assign(window, { Icon, Eyebrow, PulseDot, Avatar, StatusBadge, Sparkline, Sidebar, Topbar });
