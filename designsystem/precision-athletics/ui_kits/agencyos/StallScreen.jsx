(() => {
const { Card, Metric, DataRow, Avatar, AxisBadge, StatusPill, Button, IconButton, Tabs, Input, Segmented, TopBar } = window.AKGolfPrecisionAthletics_7d7c29;
function Inspector({ p, onClose, sheet }) {
  return (
    <aside style={{ width: sheet ? "min(380px, 100%)" : "var(--inspector-w)", flex: "none", borderLeft: "1px solid var(--border-hairline)", background: "var(--surface-flat)", display: "flex", flexDirection: "column", minHeight: 0, ...(sheet ? { position: "absolute", top: 0, right: 0, bottom: 0, zIndex: 30, boxShadow: "var(--shadow-modal)" } : {}) }}>
      <TopBar title={p.name} sub={p.group.toUpperCase() + " · HCP " + p.hcp} actions={<IconButton icon="x" label="Lukk" onClick={onClose} />} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, overflow: "auto" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><StatusPill tone={p.status[0]}>{p.status[1]}</StatusPill><AxisBadge axis={p.axis}>Fokus · {p.axis.toUpperCase()}</AxisBadge></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
          <Card padded><Metric size="s" label="Carry 7-jern" value={p.carry} unit="m" meta="TRACKMAN" /></Card>
          <Card padded><Metric size="s" label="Innspill ca. 100 m ±4 m" value={p.wedge} unit="%" meta="30 DAGER" /></Card>
        </div>
        <Card kicker="Uke 39" title="Etterlevelse">
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ font: "var(--type-metric)", color: "var(--text-primary)" }}>{p.done}</span><span style={{ font: "var(--type-num-s)", color: "var(--text-muted)" }}>av {p.plan} økter</span></div>
          <div style={{ height: 8, background: "var(--surface-sunken)" }}><div style={{ height: "100%", width: Math.round(p.done / p.plan * 100) + "%", background: "var(--primary)" }} /></div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Button fullWidth icon="calendar-days">Åpne plan</Button>
          <Button fullWidth variant="secondary" icon="message-square">Skriv til spiller</Button>
        </div>
        <span style={{ font: "var(--type-meta)", color: "var(--text-faint)" }}>SIST AKTIV · {p.last}</span>
      </div>
    </aside>
  );
}
const COLS = "minmax(0,1fr) 64px 96px 80px 176px 96px";
function StallScreen({ selected, setSelected, w = 1280 }) {
  const [group, setGroup] = React.useState("Alle");
  const side = w > 1024;
  const [sheet, setSheet] = React.useState(false);
  const players = window.AOS_PLAYERS.filter((p) => group === "Alle" || p.group === group);
  const sel = window.AOS_PLAYERS.find((p) => p.id === selected);
  const avail = w - (side && sel ? 340 : 0) - (w < 600 ? 32 : w <= 1024 ? 48 : 64);
  const table = avail >= 760;
  const pick = (id) => { setSelected(id); if (!side) setSheet(true); };
  const showInsp = sel && (side || sheet);
  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
      <div style={{ flex: 1, minWidth: 0, padding: "var(--page-y) var(--page-x) 48px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px", minWidth: 0, marginRight: 8 }}><div className="kicker">Stall</div><h1 style={{ font: "600 clamp(22px, 1.2vw + 16px, 28px)/1.15 var(--font-sans)", color: "var(--text-primary)", marginTop: 8 }}>18 spillere</h1></div>
          <div style={{ flex: "1 1 200px", maxWidth: w < 600 ? "none" : 280, minWidth: 0 }}><Input placeholder="Søk spiller" prefix={<span className="pa-icon" style={{ width: 16, height: 16, background: "currentColor", WebkitMaskImage: "url(https://unpkg.com/lucide-static@0.544.0/icons/search.svg)", maskImage: "url(https://unpkg.com/lucide-static@0.544.0/icons/search.svg)" }} />} /></div>
          {w < 600 ? <IconButton icon="user-plus" label="Legg til spiller" variant="secondary" /> : <Button icon="user-plus">Legg til spiller</Button>}
        </div>
        <Tabs tabs={[{ value: "Alle", label: "Alle", count: 18 }, { value: "Junior elite", label: "Junior elite", count: 7 }, { value: "Junior", label: "Junior", count: 6 }, { value: "Voksen", label: "Voksen", count: 5 }]} value={group} onChange={setGroup} />
        <div className="pa-card">
          {table && <div style={{ display: "grid", gridTemplateColumns: COLS, gap: 16, padding: "12px 16px", borderBottom: "1px solid var(--border-hairline)" }}>
            {["Spiller", "HCP", "Fokus", "Uke 39", "Status", "Sist aktiv"].map((h) => <span key={h} className="kicker" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h}</span>)}
          </div>}
          {players.map((p) => table ? (
            <div key={p.id} className={"pa-row pa-row--interactive" + (p.id === selected ? " pa-row--selected" : "")} onClick={() => pick(p.id)} style={{ display: "grid", gridTemplateColumns: COLS, gap: 16 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}><Avatar name={p.name} size={32} /><span className="pa-row__main"><span className="pa-row__title">{p.name}</span><span className="pa-row__sub">{p.group}</span></span></span>
              <span className="num" style={{ color: "var(--text-primary)" }}>{p.hcp}</span>
              <span><AxisBadge axis={p.axis} /></span>
              <span className="num" style={{ color: "var(--text-primary)", whiteSpace: "nowrap" }}>{p.done}<span style={{ color: "var(--text-muted)" }}> / {p.plan}</span></span>
              <span style={{ minWidth: 0, overflow: "hidden" }}><StatusPill tone={p.status[0]}>{p.status[1]}</StatusPill></span>
              <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.last}</span>
            </div>
          ) : (
            <div key={p.id} className={"pa-row pa-row--interactive" + (p.id === selected && side ? " pa-row--selected" : "")} onClick={() => pick(p.id)} style={{ alignItems: "flex-start", gap: 12, padding: "12px 16px" }}>
              <Avatar name={p.name} size={36} />
              <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}><span className="pa-row__main"><span className="pa-row__title">{p.name}</span><span className="pa-row__sub">{p.group} · sist aktiv {p.last}</span></span></span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>HCP <span className="num" style={{ color: "var(--text-primary)" }}>{p.hcp}</span></span>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>UKE <span className="num" style={{ color: "var(--text-primary)" }}>{p.done}/{p.plan}</span></span>
                  <AxisBadge axis={p.axis} />
                  <StatusPill tone={p.status[0]}>{p.status[1]}</StatusPill>
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
      {!side && sheet && sel && <div onClick={() => setSheet(false)} style={{ position: "absolute", inset: 0, background: "var(--scrim-modal)", zIndex: 29 }}></div>}
      {showInsp && <Inspector p={sel} sheet={!side} onClose={() => side ? setSelected(null) : setSheet(false)} />}
    </div>
  );
}
Object.assign(window, { StallScreen });
})();
