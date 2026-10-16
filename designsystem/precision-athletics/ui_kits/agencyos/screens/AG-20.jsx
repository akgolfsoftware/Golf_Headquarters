(() => {
const kr = (v) => v == null ? "Mangler" : (v < 0 ? "−" : "") + String(Math.abs(Math.round(v))).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
const pct = (a, b) => a == null || !b ? null : (a - b) / b * 100;
const pf = (p) => p == null ? "—" : (p > 0.05 ? "+" : p < -0.05 ? "−" : "±") + Math.abs(p).toFixed(1).replace(".", ",") + " %";
function AG20({ state, go }) {
  const { PageHeader, Button, EmptyState, DataTable, InlineAlert, Icon, StatusPill } = window.AGQ.ns();
  const A = window.AGQ, B = window.AG_DATA4.biz, { mob, desk } = A.useW(), empty = state === "tom";
  const [sel, setSel] = React.useState("sw"), [why, setWhy] = React.useState({});
  const rows = (empty ? [] : B.rows).map((r) => { const res = r.rev == null || r.cost == null ? null : r.rev - r.cost, resB = r.revB - r.costB, pr = pct(r.rev, r.revB), pc = pct(r.cost, r.costB); return { ...r, res, resB, pr, pc, flag: (pr != null && Math.abs(pr) > 10) || (pc != null && Math.abs(pc) > 10) }; });
  const cur = rows.find((r) => r.id === sel);
  const flagged = rows.filter((r) => r.flag);
  const cell = (v, p) => <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}><span style={{ color: v == null ? "var(--text-muted)" : "var(--text-primary)" }}>{kr(v)}</span>{p != null && <span style={{ font: "var(--type-meta)", color: Math.abs(p) > 10 ? "var(--warn)" : "var(--text-muted)", display: "inline-flex", gap: 4, alignItems: "center" }}>{Math.abs(p) > 10 && <Icon name="triangle-alert" size={12} />}{pf(p)}</span>}</span>;
  const table = <DataTable caption={"Resultat mot budsjett · " + B.period.toLowerCase() + " · " + B.src.toLowerCase()} rowKey="id" selected={sel} onSelect={setSel} columns={[
    { key: "name", label: "Virksomhet", render: (r) => <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>{r.name}{r.flag && <StatusPill tone="warn">Avvik over 10 %</StatusPill>}</span> },
    { key: "rev", label: "Inntekt", mono: true, align: "right", render: (r) => cell(r.rev, r.pr) }, { key: "revB", label: "Budsjett inntekt", mono: true, align: "right", render: (r) => kr(r.revB) },
    { key: "cost", label: "Kostnad", mono: true, align: "right", render: (r) => cell(r.cost, r.pc) }, { key: "costB", label: "Budsjett kostnad", mono: true, align: "right", render: (r) => kr(r.costB) },
    { key: "res", label: "Resultat", mono: true, align: "right", render: (r) => kr(r.res) }]} rows={rows} />;
  const detail = cur && <A.Card gap={12}><A.Head k={cur.name} aside={B.src} />
    {cur.missing && <InlineAlert tone="warn" title="Mangler">{cur.missing} Tallene gjettes ikke.</InlineAlert>}
    {cur.approx && <InlineAlert tone="neutral" title="Omtrentlig demotall">Kostnaden 33 450 kr er oppgitt av Anders som omtrentlig. Erstattes av tallet fra Tripletex-eksporten.</InlineAlert>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,150px),1fr))", gap: 8 }}>{[["Inntekt", cur.rev, cur.pr], ["Kostnad", cur.cost, cur.pc], ["Resultat", cur.res, pct(cur.res, cur.resB)]].map(([k, v, p]) => <div key={k} style={{ padding: 12, borderRadius: 6, background: "var(--surface-flat)", border: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{k}</span><span style={{ font: "600 19px/1.1 var(--font-mono)", color: v == null ? "var(--text-muted)" : "var(--text-primary)", overflowWrap: "anywhere" }}>{kr(v)}</span><A.Meta>MOT BUDSJETT {pf(p)}</A.Meta></div>)}</div>
    {cur.flag && <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, borderRadius: 8, border: "1px dashed var(--border-strong)" }}><div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><A.Draft>Forklaringsutkast</A.Draft><A.Meta>JARVIS · 26.09 06:05</A.Meta></div>
      <textarea aria-label="Forklaring på avvik" style={{ width: "100%", boxSizing: "border-box", minHeight: 96, padding: 12, borderRadius: 8, border: "1px solid var(--border-control)", background: "var(--surface-card)", color: "var(--text-primary)", font: "var(--type-body)", resize: "vertical" }} value={why[cur.id] ?? cur.why ?? ""} onChange={(e) => setWhy((w) => ({ ...w, [cur.id]: e.target.value }))} />
      <div><Button variant="secondary" icon="check" onClick={() => A.toast("Forklaringen er lagret", "BARE TIL INTERN RAPPORT · INGENTING BOKFØRT")}>Lagre forklaring</Button></div></div>}
    <A.Meta>LESES FRA TRIPLETEX · ÅPNE TRIPLETEX FOR Å BOKFØRE ELLER BETALE</A.Meta>
  </A.Card>;
  return <A.Page max={1440}>
    <PageHeader kicker={"Økonomi · " + B.period} title="Økonomi" sub="Alle tall er lest fra Tripletex-eksporten. Ingenting estimeres. Avvik over 10 % mot budsjett flagges med et forklaringsutkast." actions={<Button variant="secondary" icon="download" onClick={() => A.toast("Rapport lastet ned", "CSV · " + B.src)}>Last ned rapport</Button>} />
    <A.Gate state={state} loading="Leser Tripletex-eksporten …" error={{ title: "Tripletex-eksporten kunne ikke leses", text: "Siste gyldige eksport er fra 24.09.2026. Ingen tall vises før eksporten er lest på nytt.", code: "TRIPLETEX · FILFORMAT · 25.09 23:00" }}>
      {empty ? <EmptyState icon="file-spreadsheet" title="Ingen eksport lest ennå" text="Økonomitallene hentes fra Tripletex-eksporten hver natt kl. 23:00. Første eksport kommer i natt." /> : <>
        <InlineAlert tone="info" title="Demodata">Tallene er demodata i Tripletex-format, ikke ekte regnskap. {flagged.length} av {rows.length} virksomheter har avvik over 10 %.</InlineAlert>
        {desk ? <A.Cols tpl="minmax(0,1.6fr) minmax(0,1fr)">{table}{detail}</A.Cols> : <A.Stack>{table}{detail}</A.Stack>}
      </>}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-20"] = { id: "AG-20", name: "Økonomi", route: "/admin/okonomi", Component: AG20 };
})();
