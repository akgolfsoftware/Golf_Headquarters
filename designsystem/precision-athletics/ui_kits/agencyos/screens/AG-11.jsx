(() => {
function AG11({ state, go }) {
  const { SegmentedFilter, Select, InlineAlert, Segmented, FormField, Button, Icon, StatusPill } = window.AGQ.ns();
  const A = window.AGQ, R = window.AG_DATA2.roster, G = window.AG_DATA2.groups, ctx = A.useW();
  const [mode, setMode] = React.useState("Spiller"), [pl, setPl] = React.useState("Tobias Lindvik"), [grp, setGrp] = React.useState("WANG Toppidrett");
  const active = R.filter((p) => p.st !== "Inaktiv"), members = active.filter((p) => p.grp === grp);
  const group = mode === "Gruppe";
  const top = <div className="pa-card" style={{ padding: 16, gap: 12 }}>
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
      <FormField label="Modus"><Segmented options={["Spiller", "Gruppe"]} value={mode} onChange={setMode} /></FormField>
      <div style={{ flex: "1 1 240px", minWidth: 0, maxWidth: 360 }}>{group ? <Select label="Gruppe" value={grp} onChange={(e) => setGrp(e.target.value)} options={G.map((g) => ({ value: g, label: g + " · " + active.filter((p) => p.grp === g).length + " spillere" }))} /> : <Select label="Spiller i stallen" value={pl} onChange={(e) => setPl(e.target.value)} options={active.map((p) => ({ value: p.name, label: p.name + " · " + p.grp }))} />}</div>
    </div>
    <div role="list" aria-label="Moduler" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 8 }}>{[["AG-WB-FYS", "dumbbell", "Fysisk plan", "Styrke · grunnperiode · uke 40 av 6", "Endret etter publisering", "warn", "Publiser endringer", "fys"], ["AG-WB-TURN", "trophy", "Turneringer", "Srixon Tour 03.10 · 4 i perioden", "3 konflikter", "warn", "Løs konflikter", "turn"]].map(([id, ic, n, s, stt, tone, nx, ax]) => <button key={id} role="listitem" type="button" onClick={() => go(id)} style={{ all: "unset", cursor: "pointer", boxSizing: "border-box", display: "flex", gap: 12, alignItems: "center", padding: 12, minHeight: 56, borderRadius: "var(--radius-inner)", border: "1px solid var(--border-hairline)", background: "var(--surface-card)", boxShadow: "inset 4px 0 0 var(--axis-" + ax + ")", minWidth: 0 }}><Icon name={ic} size={20} /><span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}><span style={{ font: "600 14px/1.3 var(--font-sans)" }}>{n}</span><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{s}</span><span style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}><StatusPill tone={tone}>{stt}</StatusPill><span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>NESTE: {nx.toUpperCase()}</span></span></span></button>)}</div>
    {group && <InlineAlert tone="info" title={"Gruppemodus · " + members.length + " spillere"}>Endringer i uka gjelder alle i {grp}. Individuelle økter hos den enkelte beholdes. {members.slice(0, 6).map((p) => p.name.split(" ")[0]).join(", ")}{members.length > 6 ? " og " + (members.length - 6) + " til" : ""}.</InlineAlert>}
  </div>;
  const coach = group ? { kicker: "Workbench · gruppe · " + grp, group: grp, count: members.length, top } : { kicker: "Workbench · " + pl, name: pl, top };
  return <window.PHQ.WCtx.Provider value={ctx}><window.PHQ_WB key={mode + (group ? grp : pl) + state} state={state} go={go} coach={coach} /></window.PHQ.WCtx.Provider>;
}
window.AG_SCREENS["AG-11"] = { id: "AG-11", name: "Workbench (coach)", route: "/admin/workbench/[playerId]", Component: AG11 };
})();
