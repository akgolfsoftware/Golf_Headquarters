(() => {
function AG16({ state, go }) {
  const { PageHeader, Button, EmptyState, Tabs, DataTable, KeyValue, StatusPill, Icon } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA3, { mob, pad, desk } = A.useW(), empty = state === "tom";
  const [gid, setGid] = React.useState("wang"), [tab, setTab] = React.useState("med");
  const g = D.groups.find((x) => x.id === gid), ladder = D.groups.filter((x) => x.ladder).sort((a, b) => a.ladder - b.ladder), side = D.groups.filter((x) => !x.ladder);
  const gcard = (x, step) => { const on = x.id === gid; return <button key={x.id} type="button" aria-pressed={on} onClick={() => { setGid(x.id); setTab("med"); }} className="pa-card pa-card--interactive" style={{ padding: 12, gap: 4, textAlign: "left", font: "inherit", cursor: "pointer", minWidth: 0, flex: "1 1 140px", borderColor: on ? "var(--border-ink)" : undefined, boxShadow: on ? "inset 0 0 0 1px var(--border-ink)" : undefined }}>
    <span style={{ display: "flex", gap: 6, alignItems: "baseline" }}>{step && <span style={{ font: "600 12px/1 var(--font-mono)", color: "var(--text-muted)" }}>{step}</span>}<span style={{ font: "600 15px/1.2 var(--font-sans)" }}>{x.name}</span></span>
    <A.Meta>{x.age.toUpperCase()} · {empty ? "—" : x.n + " SPILLERE"}</A.Meta>
  </button>; };
  const stige = <A.Card gap={10}><A.Head k="AK-stigen" aside="FIRE TRINN" />
    <div style={{ display: "flex", gap: 6, alignItems: "stretch", flexWrap: "wrap" }}>{ladder.map((x, i) => <React.Fragment key={x.id}>{gcard(x, String(i + 1))}{i < ladder.length - 1 && !mob && <span aria-hidden="true" style={{ display: "grid", placeItems: "center", color: "var(--text-muted)" }}><Icon name="chevron-right" size={16} /></span>}</React.Fragment>)}</div>
    <div style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}><A.Meta>VED SIDEN AV STIGEN · IKKE TRINN</A.Meta><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{side.map((x) => gcard(x))}</div></div>
  </A.Card>;
  const members = (D.members[gid] || []).map(([n, k, st]) => ({ id: n, n, k, st }));
  let body;
  if (tab === "med") body = empty || !members.length ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{empty ? "Ingen medlemmer." : "Medlemslisten for " + g.name + " er ikke med i demodata. Se WANG Toppidrett eller Utvikling."}</p> : <DataTable rowKey="id" columns={[{ key: "n", label: "Spiller", sortable: true }, { key: "k", label: g.school ? "Klasse" : "—", mono: true }, { key: "st", label: "Trinn på AK-stigen" }]} rows={members} />;
  if (tab === "tider") body = <A.Stack gap={0}>{g.times.map(([d, t, w], i) => <div key={i} style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap", minHeight: 48, padding: "10px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><span style={{ font: "500 14px/1 var(--font-sans)", width: 120 }}>{d}</span><span style={{ font: "var(--type-num-s)" }}>{t}</span><A.Meta>{w.toUpperCase()}</A.Meta></div>)}<div style={{ paddingTop: 12 }}><Button size="sm" variant="secondary" icon="calendar-days" onClick={() => go("AG-05")}>Åpne i Kalender</Button></div></A.Stack>;
  if (tab === "aar") body = <A.Stack gap={8}><div style={{ display: "flex", borderTop: "1px solid var(--border-strong)", borderBottom: "1px solid var(--border-strong)", flexWrap: "wrap" }}>{D.yearplan.map(([n, w], i) => <div key={i} style={{ flex: "1 1 120px", padding: "8px 10px", borderLeft: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}><div style={{ font: "500 13px/1.25 var(--font-sans)" }}>{n}</div><A.Meta>{w.toUpperCase()}</A.Meta></div>)}</div><div><Button size="sm" variant="secondary" icon="layers" onClick={() => go("AG-11")}>Åpne i Workbench · gruppemodus</Button></div></A.Stack>;
  if (tab === "skole") body = g.school ? <A.Stack><KeyValue items={[["Skole", g.school.name, { mono: false }], ["Kontakt", g.school.contact, { mono: false }], ["Fravær meldt denne uka", g.school.absence + " spillere", { hint: "WANG TOPPIDRETT · 26.09.2026" }]]} /><A.Head k="Prøver som påvirker trening" />{g.school.exams.map(([d, t]) => <div key={d} style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: "8px 0", borderTop: "1px solid var(--border-hairline)" }}><span style={{ font: "var(--type-num-s)" }}>{d}</span><span style={{ font: "var(--type-body-s)" }}>{t}</span></div>)}</A.Stack> : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{g.name} har ingen skolekobling. Skoledata finnes bare for WANG Toppidrett.</p>;
  const detail = <A.Card gap={14}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "var(--type-title-s)", flex: "1 1 180px" }}>{g.name}</span>{g.side && <A.Meta>{g.side.toUpperCase()}</A.Meta>}</div>
    <KeyValue columns={mob ? 1 : 2} items={[["Alder", g.age, { mono: false }], ["Spillere", empty ? null : g.n], ["Coach", g.coach, { mono: false }], ["Rolle", g.role, { mono: false }]]} />
    <Tabs tabs={[{ value: "med", label: "Medlemmer" }, { value: "tider", label: "Faste tider" }, { value: "aar", label: "Årsplan" }, { value: "skole", label: "Skoledata" }]} value={tab} onChange={setTab} />
    {body}
  </A.Card>;
  return <A.Page>
    <PageHeader kicker="Grupper" title="Grupper" sub="AK-stigen har fire trinn. Knøtt og WANG Toppidrett er egne grupper ved siden av stigen." actions={<Button variant="secondary" icon="plus" onClick={() => A.toast("Ny gruppe", "VELG NAVN, ALDER OG COACH")}>Ny gruppe</Button>} />
    <A.Gate state={state} loading="Henter grupper …" error={{ title: "Gruppene kunne ikke hentes", text: "Ingen grupper er endret. Prøv igjen.", code: "FEIL 502 · GRUPPER" }}>
      {stige}
      {empty ? <EmptyState icon="users" title="Ingen spillere i gruppene" text="Legg spillere inn fra Stall. Gruppen styrer faste tider og årsplan." action="Åpne Stall" actionIcon="users" onAction={() => go("AG-07")} /> : detail}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-16"] = { id: "AG-16", parent: "AG-07", name: "Grupper", route: "/admin/grupper", Component: AG16 };
})();
