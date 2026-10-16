(() => {
function AG24({ state, go }) {
  const { PageHeader, Button, EmptyState, Tabs, DataTable, Dialog, KeyValue, StatusPill, InlineAlert, FormField, TextInput } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA4, { mob, desk } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState("gdpr"), [req, setReq] = React.useState(D.gdpr), [del, setDel] = React.useState(null), [conf, setConf] = React.useState("");
  const G = empty ? [] : req;
  const doDel = () => { const g = del; setReq((l) => l.map((x) => x.id === g.id ? { ...x, st: "Slettet", doneAt: "26.09.2026 " + new Date().toTimeString().slice(0, 5) } : x)); setDel(null); setConf(""); A.toast("Dataene er slettet", (g.who + " · KVITTERING SOM UTKAST TIL " + g.by).toUpperCase()); };
  let body;
  if (tab === "gdpr") body = G.length ? <A.Stack>{G.map((g) => <A.Card key={g.id} gap={10}><div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "600 15px/1.3 var(--font-sans)", flex: "1 1 200px" }}>{g.who}</span><StatusPill tone={g.st === "Slettet" ? "ok" : "info"}>{g.st}</StatusPill></div>
    <KeyValue items={[["Hvem", g.role, { mono: false }], ["Bedt om av", g.by, { mono: false }], ["Mottatt", g.at], ["Frist", g.due, { hint: "30 DAGER · GDPR ART. 17" }], ["Omfang", g.scope, { mono: false }], ["Slettet", g.doneAt || null]]} />
    {g.st !== "Slettet" && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button variant="secondary" icon="download" onClick={() => A.toast("Innsynskopi laget", "ZIP · SENDES SOM UTKAST")}>Lag innsynskopi først</Button><Button variant="ghost" icon="trash-2" onClick={() => setDel(g)}>Slett data</Button></div>}
  </A.Card>)}</A.Stack> : <EmptyState icon="shield-check" title="Ingen sletteforespørsler" text="Forespørsler fra spillere og foreldre kommer hit. Fristen er 30 dager." />;
  if (tab === "audit") body = <DataTable caption="Revisjonslogg · siste 7 dager" rowKey="t" columns={[{ key: "t", label: "Tid", mono: true }, { key: "who", label: "Hvem" }, { key: "what", label: "Hva" }, { key: "obj", label: "Gjelder" }]} rows={empty ? [] : D.audit} />;
  if (tab === "feil") body = <DataTable caption="Feillogg · siste 7 dager" rowKey="t" columns={[{ key: "t", label: "Tid", mono: true }, { key: "lvl", label: "Nivå", render: (r) => <StatusPill tone={r.lvl === "Feil" ? "warn" : "neutral"}>{r.lvl}</StatusPill> }, { key: "where", label: "Hvor" }, { key: "msg", label: "Melding" }, { key: "n", label: "Antall", mono: true, align: "right" }]} rows={empty ? [] : D.errors} />;
  if (tab === "hjelp") body = <A.Card gap={10} style={{ maxWidth: 720 }}>{[["Hvordan godkjenner jeg et utkast fra Jarvis?", "Åpne Kø eller Caddie, les utkastet og trykk Godkjenn. Ingenting sendes før du godkjenner."], ["Hvordan slettes en spiller?", "Via sletteforespørsel her i Drift. Faktura beholdes i 5 år etter bokføringsloven."], ["Hvem ser økonomitallene?", "Bare admin. Tallene leses fra Tripletex-eksporten."]].map(([q, a], i) => <details key={i} style={{ borderTop: i ? "1px solid var(--border-hairline)" : "none", padding: "10px 0" }}><summary style={{ cursor: "pointer", font: "500 14px/1.4 var(--font-sans)", minHeight: 32 }}>{q}</summary><p style={{ margin: "8px 0 0", font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{a}</p></details>)}<A.Meta>KONTAKT · DRIFT@DEMO.NO</A.Meta></A.Card>;
  return <A.Page>
    <PageHeader kicker="Drift · kun admin" title="Drift" sub="Revisjonslogg, feillogg, sletteforespørsler og hjelp. Bare synlig for admin." />
    <A.Gate state={state} loading="Henter driftsdata …" error={{ title: "Driftsdata kunne ikke hentes", text: "Ingen data er slettet eller endret.", code: "FEIL 503 · DRIFT" }}>
      <Tabs tabs={[{ value: "gdpr", label: "Sletteforespørsler", count: empty ? undefined : G.filter((g) => g.st !== "Slettet").length }, { value: "audit", label: "Revisjonslogg" }, { value: "feil", label: "Feillogg" }, { value: "hjelp", label: "Hjelp" }]} value={tab} onChange={setTab} />
      {empty && tab !== "gdpr" && tab !== "hjelp" ? <EmptyState icon="list" title="Ingen hendelser" text="Loggen er tom for de siste 7 dagene." /> : body}
    </A.Gate>
    <Dialog open={!!del} onClose={() => { setDel(null); setConf(""); }} title="Slette alle data?" footer={<><Button variant="ghost" onClick={() => { setDel(null); setConf(""); }}>Avbryt</Button><Button variant="signal" disabled={conf.trim().toUpperCase() !== "SLETT"} onClick={doDel}>Slett permanent</Button></>}>
      {del && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}><p style={{ margin: 0, font: "var(--type-body)" }}>{del.scope} for {del.who} slettes permanent. Dette kan ikke angres.</p><FormField label="Skriv SLETT for å bekrefte" required><TextInput mono value={conf} onChange={(e) => setConf(e.target.value)} /></FormField></div>}
    </Dialog>
  </A.Page>;
}
window.AG_SCREENS["AG-24"] = { id: "AG-24", parent: "AG-23", name: "Drift", route: "/admin/drift", Component: AG24 };
})();
