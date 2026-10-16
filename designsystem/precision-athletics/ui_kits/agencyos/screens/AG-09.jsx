(() => {
const sgc = (v) => v == null ? "—" : (v > 0.04 ? "+" : v < -0.04 ? "−" : "±") + Math.abs(v).toFixed(1).replace(".", ",");
const toPar = (d) => d > 0 ? "+" + d : d < 0 ? "−" + Math.abs(d) : "±0";
function Bar({ label, sub, v, max = 1.2 }) {
  const w = v == null ? 0 : Math.min(50, Math.abs(v) / max * 50);
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(56px,110px) minmax(0,1fr) 52px", gap: 10, alignItems: "center", minHeight: 40 }}>
    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)" }}>{label}</span>{sub && <span style={{ font: "var(--type-body-s)", fontSize: 12, color: "var(--text-muted)" }}>{sub}</span>}</span>
    <span style={{ position: "relative", height: 12, background: "var(--surface-sunken)" }} aria-hidden="true"><span style={{ position: "absolute", left: "50%", top: -3, bottom: -3, width: 1, background: "var(--border-ink)" }}></span>{v != null && <span style={{ position: "absolute", top: 0, bottom: 0, background: v < 0 ? "var(--text-secondary)" : "var(--text-primary)", left: v < 0 ? (50 - w) + "%" : "50%", width: w + "%" }}></span>}</span>
    <span style={{ font: "600 14px/1 var(--font-mono)", color: "var(--text-primary)", textAlign: "right" }}>{sgc(v)}</span>
  </div>;
}
function AG09({ state, go }) {
  const { PageHeader, Button, EmptyState, DataTable, Sparkline, Tabs, Select, InlineAlert } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA2, { mob, desk } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState("spiller"), [cat, setCat] = React.useState("APP");
  const cats = D.sg.cats, tot = cats.reduce((a, c) => a + c[2], 0);
  const adh = D.adherence.slice(-4), planH = adh.reduce((a, r) => a + r[3], 0), doneH = adh.reduce((a, r) => a + r[4], 0);
  const ci = { OTT: 2, APP: 3, ARG: 4, PUTT: 5 }[cat];
  const sgCard = <A.Card gap={10}><A.Head k="Strokes Gained per runde" aside={empty ? "—" : D.sg.src} />
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>{empty ? "—" : sgc(tot)}</span><A.Meta>SG TOTAL · SNITT</A.Meta></div>
    {cats.map(([k, n, v]) => <Bar key={k} label={k} sub={n} v={empty ? null : v} />)}
    <div><A.Meta>SG TOTAL · 7 SISTE PERIODER À 3 RUNDER</A.Meta><div style={{ marginTop: 8 }}>{empty ? <A.Meta>—</A.Meta> : <Sparkline values={D.sg.trend} height={44} label="SG total over tid" />}</div></div>
  </A.Card>;
  const adhCard = <A.Card gap={10}><A.Head k="Etterlevelse · siste fire uker" aside={empty ? "—" : "GJENNOMFØRT MOT PLANLAGT TID · UKE 36–39 · ØKTLOGG 26.09.2026"} />
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>{empty ? "—" : Math.round(doneH / planH * 100) + " %"}</span><A.Meta>{empty ? "—" : (doneH.toFixed(1) + " AV " + planH.toFixed(1) + " T").replace(/\./g, ",")}</A.Meta></div>
    {!empty && adh.map(([w, pl, dn, ph, dh]) => { const r = Math.min(1.2, dh / ph); return <div key={w} style={{ display: "grid", gridTemplateColumns: "56px minmax(0,1fr) 88px", gap: 10, alignItems: "center", minHeight: 28 }}><span style={{ font: "var(--type-num-s)" }}>{w}</span><span style={{ position: "relative", height: 8, background: "var(--surface-sunken)" }}><span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: Math.min(100, r * 100) + "%", background: "var(--text-primary)" }}></span><span style={{ position: "absolute", left: "calc(100% / 1.2)", top: -3, bottom: -3, width: 1, background: "var(--border-ink)", display: "none" }}></span></span><span style={{ font: "var(--type-num-s)", textAlign: "right" }}>{String(dh).replace(".", ",")} / {String(ph).replace(".", ",")} t</span></div>; })}
    {empty && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen plan publisert. Etterlevelse regnes fra første publiserte uke.</p>}
  </A.Card>;
  const rounds = empty ? <A.Card><A.Head k="Runder" /><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>—</p></A.Card>
    : <DataTable caption="Runder · brutto · /admin/runder" rowKey="id" columns={[{ key: "date", label: "Dato", mono: true }, { key: "course", label: "Bane" }, { key: "holes", label: "Hull", mono: true, align: "right" }, { key: "score", label: "Brutto", mono: true, align: "right", render: (r) => r.score + " slag (" + toPar(r.score - r.par) + ")" }, { key: "sg", label: "SG total", mono: true, align: "right", render: (r) => sgc(r.sg) }]} rows={D.rounds} />;
  const C = D.cohort, crow = C.rows.map(([n, k, ...v]) => ({ id: n, n, k, v, s: v[ci - 2] })).sort((a, b) => b.s - a.s);
  const stall = <A.Stack>
    <InlineAlert tone="info" title="Bare for coach">Kohortsammenligning vises aldri for spillere eller foreldre. Navn på andre spillere deles ikke.</InlineAlert>
    <A.Cols tpl={desk ? "minmax(0,1fr) minmax(0,1.3fr)" : "minmax(0,1fr)"}>
      <A.Card gap={10}><div style={{ maxWidth: 260 }}><Select label="Kategori" value={cat} onChange={(e) => setCat(e.target.value)} options={["OTT", "APP", "ARG", "PUTT"]} /></div><A.Meta>{empty ? "—" : C.src}</A.Meta>
        {empty ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>—</p> : crow.map((r) => <Bar key={r.id} label={r.n.split(" ")[0]} sub={"Kat. " + r.k} v={r.s} />)}</A.Card>
      {empty ? <A.Card><p style={{ margin: 0 }}>—</p></A.Card> : <DataTable caption={"Stall-analyse · SG per kategori · " + C.src.toLowerCase()} rowKey="id" defaultSort={{ key: "tot", dir: "desc" }} columns={[{ key: "n", label: "Spiller", sortable: true }, { key: "k", label: "Kat.", mono: true }, ...["OTT", "APP", "ARG", "PUTT"].map((c, i) => ({ key: c, label: c, mono: true, align: "right", sortable: true, render: (r) => sgc(r.v[i]), sortValue: (r) => r.v[i] })), { key: "tot", label: "Total", mono: true, align: "right", sortable: true, render: (r) => sgc(r.v.reduce((a, b) => a + b, 0)), sortValue: (r) => r.v.reduce((a, b) => a + b, 0) }]} rows={crow} />}
    </A.Cols>
  </A.Stack>;
  return <A.Page>
    <PageHeader kicker={tab === "spiller" ? "Spilleranalyse · Tobias Lindvik" : "Stall-analyse · WANG Toppidrett"} title="Spilleranalyse" sub="Strokes Gained mot kategori C, etterlevelse av plan og runder. Datagrunnlag og dato står på hvert tall." actions={<Button variant="secondary" icon="user-round" onClick={() => go("AG-08")}>Spiller 360</Button>} />
    <A.Gate state={state} loading="Regner ut Strokes Gained …" error={{ title: "Analysen kunne ikke lastes", text: "Rundene er lagret. Tallene regnes ut på nytt når du prøver igjen.", code: "FEIL 503 · SG-MOTOR" }}>
      <Tabs tabs={[{ value: "spiller", label: "Tobias Lindvik" }, { value: "stall", label: "Stall-analyse" }]} value={tab} onChange={setTab} />
      {empty && tab === "spiller" && <EmptyState icon="flag" title="Ingen runder å analysere" text="Strokes Gained krever minst tre registrerte runder. Be spilleren registrere runder i PlayerHQ." action="Registrer runde" actionIcon="flag" onAction={() => A.toast("Registrer runde", "BRUK HURTIGKNAPPEN")} />}
      {tab === "spiller" ? (desk ? <A.Cols tpl="minmax(0,1fr) minmax(0,1fr)"><A.Stack>{sgCard}</A.Stack><A.Stack>{adhCard}{rounds}</A.Stack></A.Cols> : <A.Stack>{sgCard}{adhCard}{rounds}</A.Stack>) : stall}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-09"] = { id: "AG-09", parent: "AG-08", name: "Spilleranalyse", route: "/admin/spillere/[id]/analyse", Component: AG09 };
})();
