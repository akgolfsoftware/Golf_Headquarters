(() => {
const COLS = [["risiko", "Risiko"], ["folg", "Følg med"], ["sjekk", "Sjekk inn"], ["lost", "Løst"]];
const stamp = () => "26.09 " + new Date().toTimeString().slice(0, 5);
function AG03({ state, go }) {
  const { PageHeader, Button, Badge, EmptyState, SegmentedFilter, Icon } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA, { mob, pad, desk, wide } = A.useW(), empty = state === "tom";
  const [cases, setCases] = React.useState(D.follow), [col, setCol] = React.useState("risiko");
  const list = empty ? [] : cases;
  const setStatus = (c, to) => { setCases((l) => l.map((x) => x.id === c.id ? { ...x, col: to, prev: to === "lost" ? x.col : undefined, by: "Anders Kristiansen", at: stamp(), back: false } : x)); A.toast(to === "lost" ? "Saken er løst" : "Flyttet til " + COLS.find((k) => k[0] === to)[1], (c.who + " · SATT AV ANDERS KRISTIANSEN").toUpperCase()); };
  const card = (c) => <div key={c.id} className="pa-card" style={{ padding: 14, gap: 10, minWidth: 0, background: c.col === "lost" ? "var(--surface-flat)" : undefined }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><button type="button" onClick={() => c.who === "Tobias Lindvik" ? go("AG-08") : A.toast("Spiller 360", "DEMO VISER TOBIAS LINDVIK")} style={{ all: "unset", cursor: "pointer", font: "600 15px/1.3 var(--font-sans)", color: c.col === "lost" ? "var(--text-secondary)" : "var(--text-primary)", flex: "1 1 140px", minWidth: 0, minHeight: 32, textDecoration: "underline", textUnderlineOffset: 3 }} aria-label={"Åpne Spiller 360 for " + c.who}>{c.who}</button><A.Meta>{c.grp.toUpperCase()}</A.Meta></div>
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{c.why}</p>
    <A.Meta>{c.src}</A.Meta>
    <div style={{ display: "flex", gap: 6, alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border-hairline)" }}><Icon name={c.col === "lost" ? "check" : "user-round"} size={14} /><A.Meta s={{ color: "var(--text-secondary)" }}>{(c.col === "lost" ? "LØST AV " : "SATT AV ") + c.by.toUpperCase() + " · " + c.at}</A.Meta></div>
    {c.col === "lost" ? <div><Button size="sm" variant="ghost" icon="rotate-ccw" onClick={() => setStatus(c, c.prev || "sjekk")}>Åpne igjen</Button></div>
      : <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><Button size="sm" variant="secondary" icon="check" onClick={() => setStatus(c, "lost")}>Løst</Button>{COLS.filter(([k]) => k !== c.col && k !== "lost").map(([k, l]) => <Button key={k} size="sm" variant="ghost" onClick={() => setStatus(c, k)}>{l}</Button>)}</div>}
  </div>;
  const colView = (k, l) => { const cs = list.filter((c) => c.col === k); return <section key={k} aria-label={l} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, borderBottom: "1px solid var(--border-strong)", paddingBottom: 6 }}><span style={{ font: "600 14px/1 var(--font-sans)", color: "var(--text-primary)" }}>{l}</span>{k === "risiko" && cs.length ? <Badge count={cs.length} tone="signal" label="krever handling" /> : <A.Meta>{cs.length ? cs.length : "—"}</A.Meta>}</div>
    {cs.length ? cs.map(card) : <p style={{ margin: 0, padding: "8px 0", font: "var(--type-body-s)", color: "var(--text-muted)" }}>Ingen saker.</p>}
  </section>; };
  return <A.Page max={1480}>
    <PageHeader kicker={"Oppfølging · " + D.dayLabel} title="Oppfølgingskø" sub="Agentene foreslår Risiko, Følg med og Sjekk inn. Løst setter bare du, med ett trykk på saken." />
    <A.Gate state={state} loading="Henter oppfølgingssaker …" error={{ title: "Oppfølgingskøen kunne ikke hentes", text: "Ingen statuser er endret. Prøv igjen.", code: "FEIL 502 · QUEUE" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: 12, borderRadius: 8, background: "var(--surface-flat)", border: "1px solid var(--border-hairline)" }}><Icon name="info" size={16} /><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>En sak blir aldri løst av seg selv. Selv om spilleren følger planen igjen, står saken åpen til du trykker Løst. En løst sak kan åpnes igjen.</span></div>
      {empty ? <EmptyState icon="list-checks" title="Ingen spillere til oppfølging" text="Agentene sjekker belastning, dagsform og aktivitet hver morgen. Du kan også legge til en sak selv." action="Legg til sak" actionIcon="plus" onAction={() => A.toast("Ny sak", "VELG SPILLER")} />
        : desk && wide ? <A.Cols tpl="repeat(4,minmax(0,1fr))">{COLS.map(([k, l]) => colView(k, l))}</A.Cols>
        : desk || pad ? <A.Cols tpl="repeat(2,minmax(0,1fr))" gap={24}>{COLS.map(([k, l]) => colView(k, l))}</A.Cols>
        : <><SegmentedFilter label="Status" value={col} onChange={setCol} options={COLS.map(([k, l]) => ({ value: k, label: l, count: list.filter((c) => c.col === k).length }))} />{COLS.filter(([k]) => k === col).map(([k, l]) => colView(k, l))}</>}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-03"] = { id: "AG-03", name: "Oppfølgingskø", route: "/admin/queue", Component: AG03 };
})();
