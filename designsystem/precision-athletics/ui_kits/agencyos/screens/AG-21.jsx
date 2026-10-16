(() => {
function AG21({ state, go }) {
  const { PageHeader, Button, EmptyState, Tabs, Checkbox, StatusPill, Sheet, FormField, TextInput, Select } = window.AGQ.ns();
  const A = window.AGQ, T = window.AG_DATA4.tasks, { mob, desk } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState("mine"), [mine, setMine] = React.useState(T.mine), [rt, setRt] = React.useState(T.routines), [nu, setNu] = React.useState(false), [f, setF] = React.useState({ t: "", p: T.projects[0][0], who: "Anders Kristiansen" }), [err, setErr] = React.useState(null);
  const M = empty ? [] : mine;
  let body;
  if (tab === "mine") body = M.length ? <A.Card gap={0}>{M.map((o, i) => <div key={o.id} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", minHeight: 60, borderTop: i ? "1px solid var(--border-hairline)" : "none", opacity: o.done ? .6 : 1 }}>
    <Checkbox checked={o.done} onChange={(e) => { setMine((l) => l.map((x) => x.id === o.id ? { ...x, done: e.target.checked } : x)); A.toast(e.target.checked ? "Oppgaven er ferdig" : "Åpnet igjen", o.t.toUpperCase()); }} label={<span style={{ textDecoration: o.done ? "line-through" : "none" }}>{o.t}</span>} />
    <span style={{ flex: 1 }}></span><A.Meta>{o.p.toUpperCase()} · FRA {o.by.toUpperCase()} · FRIST {o.due}</A.Meta>
  </div>)}</A.Card> : <EmptyState icon="check-square" title="Ingen oppgaver" text="Oppgaver du får tildelt, eller lager selv, samles her." action="Ny oppgave" actionIcon="plus" onAction={() => setNu(true)} />;
  if (tab === "prosj") body = <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,280px),1fr))", gap: 12 }}>{T.projects.map(([n, tot, done, due]) => <A.Card key={n} gap={8}><span style={{ font: "600 15px/1.3 var(--font-sans)" }}>{n}</span><div style={{ height: 6, background: "var(--surface-sunken)" }}><div style={{ height: "100%", width: (done / tot * 100) + "%", background: "var(--primary)" }}></div></div><A.Meta>{done} AV {tot} FERDIG · FRIST {due}</A.Meta></A.Card>)}</div>;
  if (tab === "rutiner") body = <A.Card gap={0}>{rt.map(([d, t, who, ok], i) => <div key={t} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", minHeight: 56, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><span style={{ font: "500 13px/1 var(--font-mono)", width: 72 }}>{d.toUpperCase()}</span><span style={{ flex: "1 1 200px", font: "var(--type-body-s)" }}>{t}</span>{ok ? <StatusPill tone="ok">Gjort denne uka</StatusPill> : <Button size="sm" variant="secondary" onClick={() => setRt((l) => l.map((x, j) => j === i ? [x[0], x[1], x[2], true] : x))}>Marker gjort</Button>}</div>)}</A.Card>;
  if (tab === "notion") body = <A.Card gap={12} style={{ maxWidth: 720 }}><A.Head k="Notion-arbeidsflate" aside={"SIST SYNKET " + T.notion.synced} /><div style={{ font: "var(--type-title-s)" }}>{T.notion.page}</div><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Prosjekter og oppgaver synkes begge veier hvert 15. minutt. Spillerdata synkes aldri til Notion.</p><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button variant="secondary" icon="external-link" onClick={() => A.toast("Åpner Notion", "NY FANE")}>Åpne i Notion</Button><Button variant="ghost" icon="refresh-cw" onClick={() => A.toast("Synker nå", "PROSJEKTER OG OPPGAVER")}>Synk nå</Button></div></A.Card>;
  const add = () => { if (!f.t.trim()) { setErr("Skriv hva som skal gjøres."); return; } setMine((l) => [{ id: "o" + Date.now(), t: f.t, due: "03.10", p: f.p, by: "Anders Kristiansen", done: false }, ...l]); setNu(false); setF({ ...f, t: "" }); setErr(null); setTab("mine"); A.toast("Oppgaven er lagt til", (f.who === "Anders Kristiansen" ? "TIL DEG" : "TIL " + f.who).toUpperCase()); };
  return <A.Page>
    <PageHeader kicker="Oppgaver" title="Oppgaver" sub="Prosjekter, rutiner og oppgaver du har fått. Synkes med Notion." actions={<Button icon="plus" onClick={() => setNu(true)}>Ny oppgave</Button>} />
    <A.Gate state={state} loading="Henter oppgaver …" error={{ title: "Oppgavene kunne ikke hentes", text: "Notion svarer ikke. Endringer lagres og synkes senere.", code: "NOTION API · 502" }}>
      <Tabs tabs={[{ value: "mine", label: "Mine oppgaver", count: empty ? undefined : M.filter((x) => !x.done).length }, { value: "prosj", label: "Prosjekter" }, { value: "rutiner", label: "Rutiner" }, { value: "notion", label: "Notion" }]} value={tab} onChange={setTab} />
      {body}
    </A.Gate>
    <Sheet open={nu} onClose={() => setNu(false)} kicker="Ny oppgave" title="Legg til oppgave" footer={<><Button fullWidth icon="check" onClick={add}>Legg til</Button><Button variant="ghost" fullWidth onClick={() => setNu(false)}>Avbryt</Button></>}>
      <FormField label="Oppgave" required error={err || undefined}><TextInput value={f.t} onChange={(e) => { setF({ ...f, t: e.target.value }); setErr(null); }} /></FormField>
      <Select label="Prosjekt" value={f.p} onChange={(e) => setF({ ...f, p: e.target.value })} options={T.projects.map((p) => p[0])} />
      <Select label="Tildel til" value={f.who} onChange={(e) => setF({ ...f, who: e.target.value })} options={["Anders Kristiansen", "Kari Demo", "Per Demo"]} />
    </Sheet>
  </A.Page>;
}
window.AG_SCREENS["AG-21"] = { id: "AG-21", parent: "AG-01", name: "Oppgaver", route: "/admin/oppgaver", Component: AG21 };
})();
