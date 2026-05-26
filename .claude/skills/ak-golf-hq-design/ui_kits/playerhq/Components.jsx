/* Shared PlayerHQ components — exported to window so multiple babel files share scope. */

const { useState } = React;

function Eyebrow({ children, tone = "default" }) {
  const cls = tone === "lime" ? "eyebrow eyebrow-lime" : tone === "light" ? "eyebrow eyebrow-light" : "eyebrow";
  return <span className={cls}>{children}</span>;
}

function PulseDot() { return <span className="pulse" aria-hidden />; }

function Avatar({ initials = "MS", size = 56, status = "none", onPhoto = false }) {
  return (
    <span style={{
      position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: 999, background: "var(--primary)", color: "var(--accent)",
      border: onPhoto ? "2px solid rgba(255,255,255,0.4)" : "2px solid white",
      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: size * 0.36,
      boxShadow: "0 4px 14px rgba(0,0,0,0.18)", flexShrink: 0,
    }}>
      {initials}
      {status === "online" && (
        <span aria-hidden style={{
          position: "absolute", right: 1, bottom: 1, width: size * 0.25, height: size * 0.25,
          borderRadius: 999, background: "var(--accent)", border: "2px solid white",
          boxShadow: "0 0 6px rgba(209,248,67,0.45)",
        }}/>
      )}
    </span>
  );
}

function Icon({ name, size = 18, color }) {
  // tiny lucide-passthrough — uses the global lucide via data-attr
  return <i data-lucide={name} style={{ width: size, height: size, color: color || "currentColor", display: "inline-flex", alignItems: "center", justifyContent: "center", strokeWidth: 1.5 }} />;
}

function KpiCard({ label, value, unit, trend, tone = "pos" }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-val">{value}{unit && <span className="kpi-unit">{unit}</span>}</div>
      {trend && <div className={"kpi-trend " + (tone === "neg" ? "neg" : "pos")}>{trend}</div>}
    </div>
  );
}

function KpiStrip({ children, cols = 2 }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>{children}</div>;
}

function PyramidProgress({ rows }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: "grid", gridTemplateColumns: "60px 1fr 56px", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)" }}>{r.label}</span>
          <span style={{ height: 6, borderRadius: 999, background: "var(--muted)", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", borderRadius: 999, background: r.color, width: r.pct + "%" }} />
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, textAlign: "right" }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function FeaturedCard({ eyebrow, title, italic, description, action, photo }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden", borderRadius: 24, padding: 24, color: "white",
      background: photo
        ? `linear-gradient(135deg, rgba(0,88,64,0.96) 0%, rgba(8,50,42,0.88) 60%, rgba(0,30,22,0.75) 100%), url(${photo}) center/cover`
        : "linear-gradient(135deg, #005840 0%, #005840 50%, #08322a 100%)",
      minHeight: 200,
    }}>
      <div aria-hidden style={{ position: "absolute", top: -48, right: -48, width: 160, height: 160, borderRadius: 999, background: "var(--accent)", opacity: 0.15, filter: "blur(2px)" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {eyebrow && <Eyebrow tone="lime">{eyebrow}</Eyebrow>}
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, lineHeight: 1.05, letterSpacing: "-0.02em", maxWidth: "22ch", margin: "12px 0 0" }}>
          {title}{italic && <> <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--accent)" }}>{italic}</em></>}
        </h3>
        {description && <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,0.85)", maxWidth: "38ch", margin: "10px 0 0" }}>{description}</p>}
        {action && <div style={{ marginTop: 16 }}>{action}</div>}
      </div>
    </div>
  );
}

function SessionRow({ time, title, meta, status }) {
  const statusBg = status === "done" ? "#C8EBDC" : status === "now" ? "#D1F843" : "#F1EEE5";
  const statusColor = status === "done" ? "#0E5D3F" : status === "now" ? "#005840" : "#5E5C57";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 48, textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{time}</div>
      </div>
      <div style={{ width: 3, height: 36, background: status === "now" ? "var(--accent)" : "var(--border)", borderRadius: 999, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.005em" }}>{title}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}>{meta}</div>
      </div>
      {status && (
        <span style={{ background: statusBg, color: statusColor, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 999 }}>
          {status === "done" ? "Logget" : status === "now" ? "Nå" : "Kommer"}
        </span>
      )}
    </div>
  );
}

function StatusBar({ onPhoto = false }) {
  return (
    <div className={"statusbar " + (onPhoto ? "on-photo" : "")}>
      <span>9:41</span>
      <span className="right">
        <span style={{ fontSize: 11, letterSpacing: "0.04em" }}>●●●●</span>
        <span style={{ marginLeft: 6 }}>5G</span>
        <span style={{ marginLeft: 8, padding: "2px 5px", border: "1.5px solid currentColor", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>87</span>
      </span>
    </div>
  );
}

function BottomNav({ tab, onChange }) {
  const items = [
    { key: "home", icon: "home", label: "Hjem" },
    { key: "plan", icon: "calendar-days", label: "Plan" },
    { key: "stats", icon: "line-chart", label: "Tall" },
    { key: "profile", icon: "user-round", label: "Deg" },
  ];
  return (
    <nav className="bottomnav">
      {items.map(it => (
        <button key={it.key} className={"bn-item " + (tab === it.key ? "active" : "")} onClick={() => onChange(it.key)}>
          <span className="bn-icon"><Icon name={it.icon} size={18} /></span>
          {it.label}
        </button>
      ))}
    </nav>
  );
}

Object.assign(window, { Eyebrow, PulseDot, Avatar, Icon, KpiCard, KpiStrip, PyramidProgress, FeaturedCard, SessionRow, StatusBar, BottomNav });
