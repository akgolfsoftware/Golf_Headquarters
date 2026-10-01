(() => {
const dec = (v, d = 1) => v == null ? "—" : (v < 0 ? "−" : "") + Math.abs(v).toFixed(d).replace(".", ",");
function AG13({ state, go }) {
  const { PageHeader, Button, StatusPill, EmptyState, KeyValue, AxisBadge, Segmented, FormField } = window.AGQ.ns();
  const A = window.AGQ, L = window.AG_DATA3, { mob, pad, desk } = A.useW(), empty = state === "tom";
  const [sel, setSel] = React.useState("l1"), [theme, setTheme] = React.useState(() => localStorage.getItem("ag13-theme") || "Lyst"), [tick, setTick] = React.useState(0);
  React.useEffect(() => { const r = document.documentElement; if (theme === "Natt") r.setAttribute("data-theme", "night"); else r.removeAttribute("data-theme"); localStorage.setItem("ag13-theme", theme); return () => r.removeAttribute("data-theme"); }, [theme]);
  React.useEffect(() => { if (state !== "data") return; const t = setInterval(() => setTick((x) => x + 1), 5000); return () => clearInterval(t); }, [state]);
  const live = empty ? [] : L.live, cur = live.find((x) => x.id === sel);
  const elapsed = (s) => { const [h, m] = s.start.split(":").map(Number); return Math.min(s.min, (15 * 60 + 40) - (h * 60 + m) + Math.floor(tick / 12)); };
  const list = <A.Stack gap={8}>{live.map((s) => { const on = s.id === sel, e = elapsed(s); return <A.EvCard key={s.id} axes={s.axis} onClick={() => setSel(s.id)} style={{ boxShadow: on ? "inset 0 0 0 1px var(--border-ink)" : "none", borderColor: on ? "var(--border-ink)" : undefined, minHeight: 88 }}>
    <span style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "600 15px/1.3 var(--font-sans)", flex: "1 1 140px", minWidth: 0 }}>{s.who}</span><StatusPill tone="info">Pågår</StatusPill></span>
    <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{s.title}</span>
    <span style={{ height: 4, background: "var(--surface-sunken)", display: "block", marginTop: 4 }}><span style={{ display: "block", height: "100%", width: (e / s.min * 100) + "%", background: "var(--primary)" }}></span></span>
    <A.Meta>{s.start} · {e} AV {s.min} MIN · {s.where.toUpperCase()}</A.Meta>
  </A.EvCard>; })}</A.Stack>;
  const detail = cur && <A.Card pad={mob ? 16 : 20} gap={14}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{cur.axis.map((a) => <AxisBadge key={a} axis={a} />)}<span style={{ flex: 1 }}></span><A.Meta>OPPDATERT 15:{String(40 + Math.floor(tick / 12)).padStart(2, "0")} · HVERT 5. SEK</A.Meta></div>
    <div><div style={{ font: "var(--type-title-s)" }}>{cur.who}</div><div style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", marginTop: 2 }}>{cur.title}</div></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,140px),1fr))", gap: 8 }}>{[["Tid brukt", elapsed(cur) + " min", "AV " + cur.min + " MIN"], ["Slag", cur.shots == null ? "—" : String(cur.shots + (cur.id === "l1" ? Math.floor(tick / 2) : 0)), "ØKTLOGG · LIVE"], ["Treff i mål", cur.hit == null ? "—" : cur.hit + " %", cur.hit == null ? "—" : "RESTMÅL · LIVE"], ["Dagsform", cur.form + " av 5", "SPILLER · 15:0" + (cur.id === "l3" ? "0" : "8")]].map(([k, v, s]) => <div key={k} style={{ padding: 12, borderRadius: 6, background: "var(--surface-flat)", border: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{k}</span><span style={{ font: "600 24px/1 var(--font-mono)" }}>{v}</span><A.Meta s={{ fontSize: 10 }}>{s}</A.Meta></div>)}</div>
    <KeyValue items={[["Nå", cur.drill, { mono: false }], ["Sted", cur.where, { mono: false }], ["Coach", cur.coach, { mono: false }]]} />
    {cur.id === "l1" && <div style={{ display: "flex", flexDirection: "column" }}><A.Meta>SISTE SLAG · TRACKMAN</A.Meta>{L.liveShots.slice(-6).reverse().map(([t, c, m, r], i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "52px 64px minmax(0,1fr) auto", gap: 10, padding: "8px 0", borderTop: "1px solid var(--border-hairline)", alignItems: "baseline" }}><span style={{ font: "var(--type-num-s)", color: "var(--text-muted)" }}>{t}</span><span style={{ font: "var(--type-num-s)" }}>{c}</span><span style={{ font: "var(--type-num-s)" }}>Carry {dec(m)} m</span><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{r}</span></div>)}</div>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button icon="message-square" onClick={() => A.toast("Beskjed til " + cur.who.split(" ")[0], "VISES PÅ SPILLERENS SKJERM · UTKAST TIL DU SENDER")}>Gi beskjed</Button><Button variant="ghost" icon="file-text" onClick={() => go("AG-12")}>Øktark</Button></div>
  </A.Card>;
  return <A.Page max={1400}>
    <PageHeader kicker="Live-tavle · Lørdag 26.09 · 15:40" title="Live-tavle" meta={empty ? null : <StatusPill tone="live">Live · {live.length} økter</StatusPill>} actions={<FormField label="Tema"><Segmented options={["Lyst", "Natt"]} value={theme} onChange={setTheme} /></FormField>} />
    <A.Gate state={state} loading="Kobler til pågående økter …" error={{ title: "Mistet kontakten med live-økter", text: "Øktene fortsetter hos spillerne og lagres der. Tavlen kobler til igjen når du prøver.", code: "WEBSOCKET · 1006 · 15:40" }}>
      {empty ? <EmptyState icon="radio" title="Ingen økter pågår nå" text="Neste økt starter 17:00 · Privattime med Lea Brekke." action="Åpne Kalender" actionIcon="calendar-days" onAction={() => go("AG-05")} />
        : desk ? <A.Cols tpl="minmax(0,.9fr) minmax(0,1.3fr)">{list}{detail}</A.Cols> : <A.Stack>{list}{detail}</A.Stack>}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-13"] = { id: "AG-13", parent: "AG-01", name: "Live-tavle", route: "/admin/agencyos/live", Component: AG13 };
})();
