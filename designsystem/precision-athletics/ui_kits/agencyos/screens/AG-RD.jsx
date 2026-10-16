(() => {
const AG = window.AGQ;
const sg = (v) => v == null ? "—" : (v > 0.04 ? "+" : v < -0.04 ? "−" : "±") + Math.abs(v).toFixed(1).replace(".", ",");
const toPar = (d) => d > 0 ? "+" + d : d < 0 ? "−" + Math.abs(d) : "±0";
const Q = { slag: ["god", "Slag-for-slag"], import: ["manuell", "Importert SG"], manuell: ["manuell", "Manuell SG"], rask: ["tynn", "Scorekort"], delvis: ["tynn", "Delvis slag"] };

/* AG-RD-01 · Coach rundeanalyse */
function AGRD01({ state, go, nav }) {
  const { PageHeader, Button, DataTable, FilterChips, PeriodSelector, DataQualityBadge, SourceBadge, EmptyAnalysisState, InsightCard, StatusPill } = AG.ns();
  const { Card, Head, useW, Meta } = AG, { desk } = useW(), D = window.RD_DATA.coach, empty = state === "tom";
  const [per, setPer] = React.useState("4 uker"), [kind, setKind] = React.useState([]), [q, setQ] = React.useState([]);
  const rows = (empty ? [] : D.rounds).filter((r) => (!kind.length || kind.includes(r.kind)) && (!q.length || q.includes(r.q === "delvis" || r.q === "rask" ? "Ukomplett" : "Komplett")));
  return <AG.Page max={1440}>
    <PageHeader kicker="Innsikt · Runder" title="Rundeanalyse" sub="Runder per spiller med datakvalitet og kilde. Brutto score. Ingen diagnose uten at du godkjenner." actions={<Button variant="secondary" icon="list-checks" onClick={() => go("AG-RD-02")}>Manglende data · {D.gaps.length}</Button>} />
    <AG.Gate state={state} loading="Henter runder …" error={{ title: "Rundene kunne ikke hentes", text: "Ingen runder er endret.", code: "FEIL 503 · RUNDER" }}>
      {empty ? <EmptyAnalysisState title="Ingen runder i perioden" have={0} need={1} unit="runde" text="Spillerne har ikke registrert runder de siste fire ukene." action="Be om runder" actionIcon="send" onAction={() => go("AG-04")} /> : <>
      <PeriodSelector value={per} onChange={setPer} options={["7 dager", "4 uker", "Periode", "Sesong"]} />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><FilterChips label="Rundetype" options={["Turnering", "Trening"]} value={kind} onChange={setKind} /><FilterChips label="Datagrunnlag" options={["Komplett", "Ukomplett"]} value={q} onChange={setQ} /></div>
      <AG.Cols tpl={desk ? "minmax(0,1.7fr) minmax(0,1fr)" : "minmax(0,1fr)"}>
        <Card><Head k={"Runder · " + rows.length} aside={<SourceBadge source="Live, import, manuell" date="26.09.2026" n={rows.length} unit="runder" />} />
          <DataTable caption="Runder" rowKey="id" columns={[{ key: "player", label: "Spiller" }, { key: "date", label: "Dato", mono: true }, { key: "course", label: "Bane" }, { key: "kind", label: "Type" }, { key: "g", label: "Brutto", mono: true, align: "right", render: (r) => r.gross + " (" + toPar(r.gross - r.par) + ")" }, { key: "sg", label: "SG", mono: true, align: "right", render: (r) => sg(r.sg) }, { key: "q", label: "Grunnlag", render: (r) => <DataQualityBadge level={Q[r.q][0]} /> }, { key: "src", label: "Kilde", render: (r) => r.src + (r.cov ? " · " + r.cov : "") }]} rows={rows} onSelect={() => AG.toast("Runden åpnes", "PH-RD-09 FOR SPILLEREN")} emptyText="Ingen runder med dette filteret." />
          <Meta>SG «—» = IKKE NOK DATA. SCOREKORTNIVÅ GIR ALDRI BEREGNET SG.</Meta>
        </Card>
        <InsightCard kind="trend" draft title="Tobias Lindvik: innspill koster slag i turnering" cause="To turneringsrunder: SG innspill −0,7 i snitt. Treningsrunder har ikke nok slagdata." evidence={[["Runder", 2], ["SG APP", "−0,7"], ["Grunnlag", "1 slag · 1 import"]]} quality={{ level: "tynn", have: 2, need: 3, unit: "runder" }} source={{ source: "Live + UpGame CSV", date: "20.09.2026", n: 2, unit: "runder", kind: "golfbox" }} recommendation="Forslag: to innspillsøkter 100–130 m i uke 40. Du godkjenner før noe går til spilleren." actions={[{ label: "Send til Workbench som utkast", icon: "layers", primary: true, onClick: () => nav ? nav.undo("Utkast lagt i Workbench", "TOBIAS LINDVIK · UKE 40 · IKKE PUBLISERT", () => {}) : null }, { label: "Avvis", onClick: () => AG.toast("Forslaget er avvist", "") }]} />
      </AG.Cols>
      </>}
    </AG.Gate>
  </AG.Page>;
}
window.AG_SCREENS["AG-RD-01"] = { id: "AG-RD-01", name: "Rundeanalyse", parent: "AG-A01", route: "/admin/runder", Component: AGRD01 };

/* AG-RD-02 · Datakvalitet og manglende data */
function AGRD02({ state, go, nav }) {
  const { PageHeader, Button, StatusPill, EmptyState, InlineAlert, ConfirmDialog } = AG.ns();
  const { Card, Head, useW, Meta } = AG, { desk } = useW(), D = window.RD_DATA.coach, [rows, setRows] = React.useState(D.gaps.map((g) => ({ ...g, st: null }))), [ign, setIgn] = React.useState(null);
  const act = (id, st) => { const before = rows; setRows((l) => l.map((x) => x.id === id ? { ...x, st } : x)); nav && nav.undo(st, "KAN ANGRES I 8 SEKUNDER", () => setRows(before)); };
  const open = rows.filter((r) => !r.st);
  return <AG.Page max={1200}>
    <PageHeader kicker="Innsikt · Runder · Datakvalitet" title="Manglende SG-grunnlag" sub="Runder der Strokes Gained ikke kan beregnes. Forklart i vanlig språk, med hva som trengs." />
    <AG.Gate state={state} loading="Sjekker runder …" error={{ title: "Datakvaliteten kunne ikke sjekkes", text: "Ingen runder er endret.", code: "FEIL 503 · RUNDER · KVALITET" }}>
      {state === "tom" || !open.length ? <EmptyState icon="check" title="Alle runder har grunnlag" text="Ingen runder mangler slagdata eller SG i perioden." /> : <>
      <InlineAlert tone="info" title={open.length + " runder mangler grunnlag"}>SG vises som «—» for disse til spilleren legger inn slag, SG importeres, eller du godtar scorekortnivå.</InlineAlert>
      <div style={{ display: "grid", gridTemplateColumns: desk ? "repeat(3,minmax(0,1fr))" : "minmax(0,1fr)", gap: 12 }}>{rows.map((r) => <Card key={r.id}><Head k={r.player} aside={r.st ? <StatusPill tone="ok">{r.st}</StatusPill> : <StatusPill>Mangler grunnlag</StatusPill>} />
        <Meta>{r.round.toUpperCase()}</Meta>
        <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-primary)", textWrap: "pretty" }}>{r.why}</p>
        <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}><b>Trengs:</b> {r.need}</p>
        {!r.st && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}><Button size="sm" icon="send" onClick={() => act(r.id, "Bedt om slagdata")}>Be om slagdata</Button><Button size="sm" variant="secondary" icon="upload" onClick={() => act(r.id, "Venter på import")}>Importer SG</Button><Button size="sm" variant="secondary" onClick={() => act(r.id, "Godtatt som scorekort")}>Godta scorekort</Button><Button size="sm" variant="ghost" onClick={() => setIgn(r)}>Ignorer</Button></div>}
      </Card>)}</div>
      </>}
    </AG.Gate>
    <ConfirmDialog open={!!ign} kind="destructive" title="Ignorere runden i analysen?" confirmLabel="Ignorer" consequences={["Runden telles ikke i SG-snitt og trender.", "Spilleren får ingen beskjed.", "Kan angres i 8 sekunder og endres senere."]} onCancel={() => setIgn(null)} onConfirm={() => { const r = ign; setIgn(null); act(r.id, "Ignorert"); }} />
  </AG.Page>;
}
window.AG_SCREENS["AG-RD-02"] = { id: "AG-RD-02", name: "Manglende SG-grunnlag", parent: "AG-RD-01", route: "/admin/runder?fane=kvalitet", Component: AGRD02 };
})();
