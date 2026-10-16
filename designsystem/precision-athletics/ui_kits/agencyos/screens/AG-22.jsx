(() => {
function Radar({ axes, v, peer, size = 220 }) {
  const n = axes.length, R = size * 0.34, c = size / 2;
  const pt = (i, x) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [c + Math.cos(a) * R * x / 100, c + Math.sin(a) * R * x / 100]; };
  const poly = (vals) => vals.map((x, i) => pt(i, x).join(",")).join(" ");
  return <svg viewBox={"0 0 " + size + " " + size} style={{ width: "100%", maxWidth: size, height: "auto", display: "block", margin: "0 auto" }} role="img" aria-label={axes.map((a, i) => a + " " + (v ? v[i] : "—") + " mot peer " + peer[i]).join(", ")}>
    {[25, 50, 75, 100].map((l) => <polygon key={l} points={poly(axes.map(() => l))} fill="none" stroke="var(--border-hairline)" />)}
    <polygon points={poly(peer)} fill="none" stroke="var(--text-muted)" strokeDasharray="4 3" strokeWidth="1.5" />
    {v && <polygon points={poly(v)} fill="var(--surface-sunken)" fillOpacity=".7" stroke="var(--text-primary)" strokeWidth="2" />}
    {v && v.map((x, i) => { const [px, py] = pt(i, x); return <circle key={i} cx={px} cy={py} r="3.5" fill={"var(--axis-" + axes[i].toLowerCase() + ")"} />; })}
    {axes.map((a, i) => { const [x, y] = pt(i, 128); return <g key={a}><text x={x} y={y - 1} textAnchor="middle" style={{ font: "600 10px var(--font-mono)", fill: "var(--text-primary)" }}>{a}</text><text x={x} y={y + 11} textAnchor="middle" style={{ font: "400 10px var(--font-mono)", fill: "var(--text-muted)" }}>{v ? v[i] : "—"}</text></g>; })}
  </svg>;
}
function AG22({ state, go }) {
  const { PageHeader, Button, EmptyState, Tabs, ChoicePill, InlineAlert, DataTable, StatusPill } = window.AGQ.ns();
  const A = window.AGQ, T = window.AG_DATA4.talent, { mob, desk } = A.useW(), empty = state === "tom";
  const visible = (p) => p.born != null && (p.born < 2008 || p.consent);
  const P = (empty ? [] : T.players).filter(visible), hidden = (empty ? [] : T.players).length - P.length;
  const [tab, setTab] = React.useState("radar"), [pick, setPick] = React.useState(["p1", "p2"]), [imp, setImp] = React.useState(false);
  const toggle = (id) => setPick((l) => l.includes(id) ? l.filter((x) => x !== id) : l.length >= 4 ? l : [...l, id]);
  const picked = P.filter((p) => pick.includes(p.id));
  let body;
  if (tab === "radar") body = <A.Stack>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><A.Meta>VELG OPPTIL FIRE SPILLERE · {pick.length} AV 4</A.Meta><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{P.map((p) => <ChoicePill key={p.id} selected={pick.includes(p.id)} disabled={!pick.includes(p.id) && pick.length >= 4} onClick={() => toggle(p.id)}>{p.name}</ChoicePill>)}</div></div>
    {picked.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))", gap: 12 }}>{picked.map((p) => <A.Card key={p.id} gap={8}><div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "600 15px/1.3 var(--font-sans)", flex: "1 1 auto" }}>{p.name}</span><A.Meta>FØDT {p.born}</A.Meta></div><Radar axes={T.axes} v={p.v} peer={T.peer.v} /><A.Meta>SNITT {Math.round(p.v.reduce((a, b) => a + b, 0) / 5)} · PEER {Math.round(T.peer.v.reduce((a, b) => a + b, 0) / 5)}</A.Meta></A.Card>)}</div> : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Velg minst én spiller.</p>}
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 16, height: 2, background: "var(--text-primary)" }}></span><A.Meta>SPILLER</A.Meta></span><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 16, borderTop: "1.5px dashed var(--text-muted)" }}></span><A.Meta>{T.peer.label.toUpperCase()}</A.Meta></span><A.Meta>INDEKS 0–100 · {T.src}</A.Meta></div>
  </A.Stack>;
  if (tab === "disc") body = <DataTable caption="Discovery · talentdager og søknader" rowKey="1" columns={[{ key: "0", label: "Kilde" }, { key: "1", label: "Spiller" }, { key: "2", label: "Født", mono: true }, { key: "4", label: "Resultat", mono: true }, { key: "3", label: "Samtykke", render: (r) => r[3] ? <StatusPill tone="ok">Ja</StatusPill> : <StatusPill>Mangler</StatusPill> }]} rows={(empty ? [] : T.discovery).filter((r) => r[2] < 2008 || r[3]).map((r) => ({ ...r }))} />;
  if (tab === "wagr") body = <A.Card gap={12} style={{ maxWidth: 720 }}><A.Head k="WAGR-import" aside={T.wagr.src} /><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Last opp CSV fra WAGR. Spillere matches på navn og fødselsår. Umatchede rader lagres ikke.</p>
    {imp ? <InlineAlert tone="ok" title={"Importert " + T.wagr.match + " av " + T.wagr.rows + " rader"}>{T.wagr.file} · 1 rad uten treff i stallen ble hoppet over.</InlineAlert> : <div style={{ padding: 20, borderRadius: 8, border: "1px dashed var(--border-strong)", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}><A.Meta>{T.wagr.file.toUpperCase()} · {T.wagr.rows} RADER</A.Meta><Button variant="secondary" icon="upload" onClick={() => { setImp(true); A.toast("WAGR-fila er importert", T.wagr.match + " SPILLERE OPPDATERT"); }}>Importer fil</Button></div>}
  </A.Card>;
  return <A.Page>
    <PageHeader kicker="Innsikt og talent" title="Innsikt og talent" sub="Talentradar mot peer-snitt, discovery og WAGR. Kohortsammenligning er bare for coach." />
    <A.Gate state={state} loading="Henter talentprofiler …" error={{ title: "Talentdata kunne ikke hentes", text: "Ingen profiler er endret. Prøv igjen.", code: "FEIL 503 · TALENT" }}>
      <InlineAlert tone="info" title="Bare for coach">Spillere født 2008 eller senere uten samtykke vises aldri. Spillere uten fødselsår vises ikke.{hidden ? " " + hidden + " spillere er skjult." : ""}</InlineAlert>
      <Tabs tabs={[{ value: "radar", label: "Radar" }, { value: "disc", label: "Discovery" }, { value: "wagr", label: "WAGR-import" }]} value={tab} onChange={setTab} />
      {empty && tab !== "wagr" ? <EmptyState icon="radar" title="Ingen talentprofiler" text="Talentradaren bygges fra tester og runder. Tildel testbatteriet i Tester." action="Åpne Tester" actionIcon="clipboard-list" onAction={() => go("AG-15")} /> : body}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-22"] = { id: "AG-22", parent: "AG-09", name: "Innsikt og talent", route: "/admin/innsikt", Component: AG22 };
})();
