(() => {
const { Segmented, Button, IconButton, AxisBadge } = window.AKGolfPrecisionAthletics_7d7c29;
const START = 7, END = 18, HOUR = 52;
const clip = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 };
function CalendarScreen({ w = 1280 }) {
  const mob = w < 600;
  const [view, setView] = React.useState(mob ? "Dag" : "Uke");
  const [day, setDay] = React.useState(1);
  React.useEffect(() => { if (mob && view === "Uke") setView("Dag"); }, [mob]);
  const hours = Array.from({ length: END - START }, (_, i) => START + i);
  const week = window.AOS_WEEK;
  const d = week[day];
  return (
    <div style={{ padding: "var(--page-y) var(--page-x) 48px", display: "flex", flexDirection: "column", gap: 16, flex: 1, minHeight: 0, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 260px", minWidth: 0, marginRight: 8 }}><div className="kicker">Kalender</div><h1 style={{ font: "600 clamp(22px, 1.2vw + 16px, 28px)/1.15 var(--font-sans)", color: "var(--text-primary)", marginTop: 8, textWrap: "balance" }}>Uke 39 · 23.–29. september</h1></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", width: mob ? "100%" : "auto" }}>
          <IconButton icon="chevron-left" label="Forrige uke" variant="secondary" />
          <IconButton icon="chevron-right" label="Neste uke" variant="secondary" />
          <div style={{ flex: mob ? "1 1 auto" : "none", minWidth: 0 }}><Segmented options={mob ? ["Dag", "Uke"] : ["Dag", "Uke", "Måned"]} value={view} onChange={setView} fullWidth={mob} /></div>
          {mob ? <IconButton icon="plus" label="Ny økt" variant="primary" /> : <Button icon="plus">Ny økt</Button>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["fys", "tek", "slag", "spill", "turn"].map((a) => <AxisBadge key={a} axis={a} />)}</div>
      {view === "Dag" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div role="tablist" style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 4 }}>
            {week.map((x, i) => { const on = i === day, [dn, dd] = x.day.split(" "); return (
              <button key={x.day} role="tab" aria-selected={on} onClick={() => setDay(i)} style={{ height: 56, minWidth: 0, borderRadius: 8, border: "1px solid " + (on ? "var(--primary)" : "var(--border-hairline)"), background: on ? "var(--primary)" : "var(--surface-card)", color: on ? "var(--text-on-primary)" : "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", padding: 0 }}>
                <span style={{ font: "500 11px/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: ".04em" }}>{dn}</span>
                <span className="num" style={{ font: "600 15px/1 var(--font-mono)" }}>{dd}</span>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: x.items.length ? (on ? "var(--text-on-primary)" : "var(--text-muted)") : "transparent" }}></span>
              </button>); })}
          </div>
          <div className="pa-card">
            {d.items.length === 0 && <div style={{ padding: 16, font: "var(--type-body)", color: "var(--text-muted)" }}>Ingen økter denne dagen.</div>}
            {d.items.map((s) => (
              <div key={s.title} className="pa-row pa-row--interactive" style={{ gap: 12, alignItems: "stretch", padding: "12px 16px" }}>
                <span style={{ width: 4, borderRadius: 2, background: "var(--axis-" + s.axis + ")", flex: "none" }}></span>
                <span style={{ width: 48, flex: "none", display: "flex", flexDirection: "column", gap: 4 }}><span className="num" style={{ font: "var(--type-num)", color: "var(--text-primary)" }}>{s.t}</span><span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{s.d} MIN</span></span>
                <span className="pa-row__main" style={{ justifyContent: "center" }}><span className="pa-row__title">{s.title}</span><span className="pa-row__sub">{s.who}</span></span>
                <span style={{ alignSelf: "center", flex: "none" }}><AxisBadge axis={s.axis} /></span>
              </div>
            ))}
          </div>
        </div>
      ) : (
      <div className="pa-card" style={{ flex: 1, minHeight: 360, overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7,minmax(0,1fr))", position: "sticky", top: 0, background: "var(--surface-card)", zIndex: 2, borderBottom: "1px solid var(--border-hairline)" }}>
          <span />
          {week.map((x) => <div key={x.day} style={{ padding: "12px 8px", font: "500 13px/1 var(--font-sans)", color: x.day === "Tir 24" ? "var(--text-primary)" : "var(--text-secondary)", borderLeft: "1px solid var(--border-hairline)", display: "flex", gap: 4, alignItems: "center", minWidth: 0, overflow: "hidden" }}>{x.day.split(" ")[0]} <span className="num" style={x.day === "Tir 24" ? { background: "var(--primary)", color: "var(--text-on-primary)", borderRadius: 999, padding: "4px 8px" } : {}}>{x.day.split(" ")[1]}</span></div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7,minmax(0,1fr))", position: "relative" }}>
          <div>{hours.map((h) => <div key={h} className="num" style={{ height: HOUR, font: "var(--type-meta)", color: "var(--text-faint)", padding: "4px 8px 0 0", textAlign: "right" }}>{String(h).padStart(2, "0")}</div>)}</div>
          {week.map((x) => (
            <div key={x.day} style={{ position: "relative", minWidth: 0, borderLeft: "1px solid var(--border-hairline)", backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent " + (HOUR - 1) + "px, var(--border-hairline) " + (HOUR - 1) + "px, var(--border-hairline) " + HOUR + "px)" }}>
              {x.items.map((s) => {
                const [hh, mm] = s.t.split(":").map(Number);
                const top = (hh - START + mm / 60) * HOUR, h = Math.min(s.d / 60 * HOUR, (END - hh) * HOUR) - 4;
                return (
                  <div key={s.title} title={s.t + " · " + s.title + " · " + s.who} style={{ position: "absolute", left: 4, right: 4, top: top + 2, height: h, borderRadius: 6, padding: "4px 8px 4px 11px", background: "var(--surface-card)", border: "1px solid var(--border-hairline)", boxShadow: "inset 4px 0 0 var(--axis-" + s.axis + ")", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ ...clip, font: "var(--type-meta)", color: "var(--text-secondary)" }}>{s.t} · {s.d} MIN</div>
                    <div style={{ ...clip, font: "500 13px/1.25 var(--font-sans)", color: "var(--text-primary)" }}>{s.title}</div>
                    <div style={{ ...clip, font: "400 12px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>{s.who}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>)}
    </div>
  );
}
Object.assign(window, { CalendarScreen });
})();
