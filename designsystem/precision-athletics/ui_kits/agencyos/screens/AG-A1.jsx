(() => {
const AG = window.AGQ, AGX = window.AGA || {};
const T = () => window.TR_DATA.coach, A = () => window.AGQ;
const PAGES = [["AG-A01", "Oversikt"], ["AG-A02", "Spiller"], ["AG-A03", "Grupper"], ["AG-A04", "Plan mot faktisk"], ["AG-A05", "Datakvalitet"], ["AG-A06", "Tiltak"], ["AG-A07", "Rapport"], ["AG-A08", "Caddie-forslag"]];
const d2 = (v) => v == null ? "—" : String(v.toFixed(2)).replace(".", ",");
const sg = (v) => v == null ? "—" : (v > 0.04 ? "+" : v < -0.04 ? "−" : "±") + Math.abs(v).toFixed(1).replace(".", ",");
function Frame({ id, title, sub, go, state, loading, children, actions, empty, period = true }) {
  const { PageHeader, ChoicePill, PeriodSelector } = A().ns();
  const [p, setP] = React.useState("4 uker"), [c, setC] = React.useState("Ingen");
  return <AG.Page max={1440}>
    <PageHeader kicker="Innsikt · Analyse av treningsdata" title={title} sub={sub} actions={actions} />
    <nav aria-label="Innsikt" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{PAGES.map(([pid, l]) => <ChoicePill key={pid} selected={pid === id} aria-current={pid === id ? "page" : undefined} onClick={() => pid !== id && go(pid)}>{l}</ChoicePill>)}</nav>
    {period && <PeriodSelector value={p} onChange={setP} options={["7 dager", "4 uker", "Periode", "Sesong"]} compare={c} onCompare={setC} />}
    <AG.Gate state={state} loading={loading} error={{ title: "Innsikten kunne ikke hentes", text: "Ingen planer er endret. Prøv igjen om litt.", code: "FEIL 503 · INNSIKT · " + id }}>{state === "tom" ? empty : children}</AG.Gate>
  </AG.Page>;
}
const reg = (id, name, C, root) => { window.AG_SCREENS[id] = { id, name, parent: root ? undefined : "AG-A01", route: "/admin/analyse", Component: C }; };
const FLAG = { belastning: ["warn", "Belastning"], trend: ["warn", "Negativ trend"], gjennomforing: ["warn", "Gjennomføring"], datamangel: ["neutral", "Datamangel"] };

/* AG-A01 · Coach-oversikt: hvem trenger oppfølging */
function AA01({ state, go }) {
  const { DataTable, StatusPill, FilterChips, DataQualityBadge, Button, InsightCard, EmptyAnalysisState, SourceBadge } = A().ns();
  const { Card, Head, useW } = A(), D = T(), { desk } = useW();
  const [f, setF] = React.useState([]);
  const rows = D.players.filter((p) => p.flag && (!f.length || f.includes(p.flag)));
  return <Frame id="AG-A01" title="Innsikt" sub="Hvem trenger oppfølging nå — basert på belastning, trend, gjennomføring og datamangel. Caddie foreslår, du bestemmer." go={go} state={state} loading="Går gjennom stallen …"
    empty={<EmptyAnalysisState title="Ingen spillere med nok data" have={1} need={3} unit="spillere" text="Innsikt vises når minst tre spillere har registrert økter i perioden." action="Se datakvalitet" onAction={() => go("AG-A05")} />}>
    <FilterChips label="Årsak" options={Object.entries(FLAG).map(([v, [, l]]) => ({ value: v, label: l }))} value={f} onChange={setF} />
    <AG.Cols tpl={desk ? "minmax(0,1.6fr) minmax(0,1fr)" : "minmax(0,1fr)"}>
      <Card><Head k={"Trenger oppfølging · " + rows.length} aside={<SourceBadge source="Øktlogg, runder, TrackMan" date="26.09.2026" n={D.players.length} unit="spillere" />} />
        <DataTable caption="Trenger oppfølging" rowKey="id" columns={[{ key: "name", label: "Spiller" }, { key: "flag", label: "Årsak", render: (r) => <StatusPill tone={FLAG[r.flag][0]}>{FLAG[r.flag][1]}</StatusPill> }, { key: "why", label: "Hvorfor" }, { key: "data", label: "Data", render: (r) => <DataQualityBadge level={r.data} /> }, { key: "last", label: "Sist aktiv", mono: true }, { key: "a", label: "", render: (r) => <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); go("AG-A06"); }}>Lag tiltak</Button> }]} rows={rows} onSelect={() => go("AG-A02")} emptyText="Ingen spillere med denne årsaken." />
      </Card>
      <AG.Stack>
        <InsightCard kind="haster" title="Tobias Lindvik: belastning 1,42" cause="Tre økter på rad over plan. Dagsform 3,1." evidence={[["ACWR", "1,42"], ["Gjennomført", "71 %"]]} quality={{ level: "god", have: 28, unit: "økter" }} actions={[{ label: "Lag tiltak", icon: "wand-2", primary: true, onClick: () => go("AG-A06") }, { label: "Åpne spiller", onClick: () => go("AG-A02") }]} />
        <InsightCard kind="datamangel" title="Henrik Dahl: ingen data på 24 dager" cause="Kan være skade, ferie eller glemt registrering." evidence={[["Sist aktiv", "02.09"], ["Økter", null]]} actions={[{ label: "Send melding", icon: "send", primary: true, onClick: () => go("AG-04") }, { label: "Se datakvalitet", onClick: () => go("AG-A05") }]} />
      </AG.Stack>
    </AG.Cols>
  </Frame>;
}
reg("AG-A01", "Innsikt · oversikt", AA01, true);

/* AG-A02 · Spilleranalyse samlet */
function AA02({ state, go }) {
  const { Segmented, Metric, TrendChart, AxisVolumeBars, DataTable, SourceBadge, DataQualityBadge, InsightCard, EmptyAnalysisState, Select, ChartTable, ChoicePill } = A().ns();
  const { Card, Head, useW } = A(), D = T(), TR = window.TR_DATA, { desk } = useW();
  const [pl, setPl] = React.useState("Tobias Lindvik"), [tab, setTab] = React.useState("Oversikt");
  const notes = [["24.09", "Jobbet med tempo i backswing. Bra respons på metronom 3:1.", "Anders Kristiansen"], ["17.09", "Klager på korsrygg etter styrke. Følg opp med fysio.", "Anders Kristiansen"]];
  return <Frame id="AG-A02" title="Spilleranalyse" sub="Én spiller, én periode: SG, TrackMan, økter, tester, runder og notater samlet med kilde." go={go} state={state} loading="Henter spillerens data …"
    actions={<Select label="Spiller" value={pl} onChange={(e) => setPl(e.target.value)} options={D.players.map((p) => p.name)} />}
    empty={<EmptyAnalysisState title={pl + " har for lite data"} have={2} need={8} unit="økter" text="Spilleranalysen trenger åtte økter eller tre runder." action="Be spilleren registrere" onAction={() => go("AG-04")} />}>
    <div role="tablist" aria-label="Del av analysen" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{["Oversikt", "SG og runder", "TrackMan", "Økter", "Tester", "Notater"].map((x) => <ChoicePill key={x} role="tab" aria-selected={tab === x} selected={tab === x} onClick={() => setTab(x)}>{x}</ChoicePill>)}</div>
    {tab === "Oversikt" && <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 12 }}>
        <Card><Metric label="ACWR" value="1,42" meta="ØKTLOGG · 28 ØKTER · 26.09" /></Card><Card><Metric label="Gjennomført" value="71" unit="%" meta="4 UKER · 15 AV 21" /></Card><Card><Metric label="SG totalt" value="−0,6" meta="6 RUNDER · GOLFBOX" /></Card><Card><Metric label="Driver carry" value="241" unit="m" meta="TRACKMAN · 96 SLAG · 24.09" /></Card>
      </div>
      <InsightCard kind="haster" title="Senk volum før helgens turnering" cause="Belastningen er over 1,3 og konkurranseperioden starter lørdag." evidence={[["Uke 39", "540 min"], ["Plan", "420 min"]]} quality={{ level: "god", have: 28, unit: "økter" }} actions={[{ label: "Lag tiltak", icon: "wand-2", primary: true, onClick: () => go("AG-A06") }, { label: "Åpne Workbench", onClick: () => go("AG-11") }]} />
    </>}
    {tab === "SG og runder" && <Card><Head k="SG totalt per runde" aside={<SourceBadge source="GolfBox" date="20.09.2026" n={6} unit="runder" kind="golfbox" />} /><ChartTable chart={<TrendChart series={[{ label: "Tobias", values: [-1.2, -0.8, null, -0.5, -0.9, -0.6] }, { label: "Forrige periode", values: [-1.4, -1.1, -1.3, -0.9, -1.2, -1.0] }]} labels={["R1", "R2", "R3", "R4", "R5", "R6"]} format={sg} />} rowKey="r" columns={[{ key: "r", label: "Runde", mono: true }, { key: "v", label: "SG", mono: true, align: "right", render: (r) => sg(r.v) }]} rows={[-1.2, -0.8, null, -0.5, -0.9, -0.6].map((v, i) => ({ r: "R" + (i + 1), v }))} /></Card>}
    {tab === "TrackMan" && <Card><Head k="Carry per kølle" aside={<DataQualityBadge level="god" have={412} unit="slag" />} /><DataTable caption="Carry" rowKey="club" columns={[{ key: "club", label: "Club" }, { key: "c", label: "Carry", mono: true, align: "right", render: (r) => r.carry[r.carry.length - 1] + " m" }, { key: "n", label: "Slag", mono: true, align: "right" }, { key: "side", label: "Offline SD", mono: true, align: "right", render: (r) => String(r.side).replace(".", ",") + " m" }]} rows={TR.tm.clubs} /></Card>}
    {tab === "Økter" && <Card><Head k="Volum per akse" aside={<SourceBadge source="Øktlogg" date="26.09.2026" kind="okt" />} /><AxisVolumeBars rows={TR.load.slice(-4)} /></Card>}
    {tab === "Tester" && <Card><DataTable caption="Tester" rowKey="id" columns={[{ key: "name", label: "Test" }, { key: "last", label: "Siste", mono: true, align: "right", render: (r) => r.last == null ? "—" : String(r.last).replace(".", ",") + " " + r.unit }, { key: "date", label: "Dato", mono: true, render: (r) => r.date || "—" }, { key: "next", label: "Neste", mono: true }]} rows={TR.tests} /></Card>}
    {tab === "Notater" && <Card><Head k="Coachnotater" />{notes.map(([d, t, by]) => <div key={d} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 0", borderTop: "1px solid var(--border-hairline)" }}><span style={{ font: "var(--type-body)" }}>{t}</span><AG.Meta>{by.toUpperCase()} · {d}.2026</AG.Meta></div>)}</Card>}
  </Frame>;
}
reg("AG-A02", "Spilleranalyse samlet", AA02);

/* AG-A03 · Gruppeanalyse (ingen rangering) */
function AA03({ state, go }) {
  const { DataTable, InlineAlert, BarRow, EmptyAnalysisState, Button } = A().ns();
  const { Card, Head, useW } = A(), D = T(), { desk } = useW();
  return <Frame id="AG-A03" title="Gruppeanalyse" sub="Nivå, datadekning, belastning og gjennomføring per gruppe. Ingen rangering av enkeltspillere." go={go} state={state} loading="Henter grupper …"
    empty={<EmptyAnalysisState title="Ingen grupper med data" text="Legg spillere i en gruppe for å se gruppeanalysen." action="Åpne grupper" onAction={() => go("AG-16")} />}>
    <InlineAlert tone="info" title="Sammenligning, ikke rangering">Tallene er gruppesnitt. Enkeltspillere vises bare for coacher med tilgang, og aldri som liste fra best til dårligst.</InlineAlert>
    <Card><DataTable caption="Grupper" rowKey="id" columns={[{ key: "name", label: "Gruppe" }, { key: "n", label: "Spillere", mono: true, align: "right" }, { key: "level", label: "Kategori", mono: true }, { key: "cover", label: "Datadekning", mono: true, align: "right", render: (r) => r.cover + " %" }, { key: "acwr", label: "ACWR snitt", mono: true, align: "right", render: (r) => d2(r.acwr) }, { key: "done", label: "Gjennomført", mono: true, align: "right", render: (r) => r.done + " %" }, { key: "note", label: "Viktigst nå" }]} rows={D.groups} onSelect={() => go("AG-16")} /></Card>
    <div style={{ display: "grid", gridTemplateColumns: desk ? "repeat(3,minmax(0,1fr))" : "minmax(0,1fr)", gap: 12 }}>{D.groups.map((g) => <Card key={g.id}><Head k={g.name} aside={<AG.Meta>{g.n} SPILLERE</AG.Meta>} /><BarRow label="Datadekning" value={g.cover} max={100} goal={80} display={g.cover + " %"} /><BarRow label="Gjennomført" value={g.done} max={100} goal={85} display={g.done + " %"} /><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{g.note}.</p><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" variant="secondary" icon="wand-2" onClick={() => go("AG-A06")}>Lag gruppetiltak</Button><Button size="sm" variant="ghost" onClick={() => go("AG-A07")}>Lag rapport</Button></div></Card>)}</div>
  </Frame>;
}
reg("AG-A03", "Gruppeanalyse", AA03);

/* AG-A04 · Plan mot faktisk */
function AA04({ state, go }) {
  const { DataTable, AxisVolumeBars, ChartTable, InsightCard, SourceBadge, EmptyAnalysisState, Select, Button } = A().ns();
  const { Card, Head, useW } = A(), D = T(), TR = window.TR_DATA, { desk } = useW();
  const [pl, setPl] = React.useState("Tobias Lindvik");
  const L = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };
  const dv = (r) => r.actual - r.plan, fd = (v) => (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v) + " min";
  return <Frame id="AG-A04" title="Plan mot faktisk" sub="Avvik per akse, volum og belastning. Konkurranseperiode merkes." go={go} state={state} loading="Sammenligner plan og økter …"
    actions={<Select label="Spiller" value={pl} onChange={(e) => setPl(e.target.value)} options={D.players.map((p) => p.name)} />}
    empty={<EmptyAnalysisState title="Ingen plan i perioden" text={pl + " har ingen publisert plan for perioden."} action="Åpne Workbench" onAction={() => go("AG-11")} />}>
    <AG.Cols tpl={desk ? "minmax(0,1.2fr) minmax(0,1fr)" : "minmax(0,1fr)"}>
      <Card><Head k="Uke 39 per akse" aside={<SourceBadge source="Workbench + øktlogg" date="26.09.2026" kind="okt" />} />
        <ChartTable chart={<AxisVolumeBars legend rows={D.pvf.filter((r) => r.plan || r.actual).map((r) => ({ label: L[r.axis], parts: { [r.axis]: r.actual }, plan: r.plan }))} />} rowKey="axis" columns={[{ key: "axis", label: "Akse", render: (r) => L[r.axis] }, { key: "plan", label: "Plan", mono: true, align: "right", render: (r) => r.plan + " min" }, { key: "actual", label: "Faktisk", mono: true, align: "right", render: (r) => r.actual + " min" }, { key: "d", label: "Avvik", mono: true, align: "right", render: (r) => fd(dv(r)) }]} rows={D.pvf} />
      </Card>
      <AG.Stack>
        <InsightCard kind="haster" title="SLAG +60 min og SPILL +50 min over plan" cause="FYS er 20 min under. Konkurranseperiode starter 03.10." evidence={[["Plan", "500 min"], ["Faktisk", "600 min"], ["Avvik", "+20 %"]]} quality={{ level: "god", have: 7, unit: "økter" }} actions={[{ label: "Juster plan", icon: "layers", primary: true, onClick: () => go("AG-11") }, { label: "Fysisk plan", icon: "dumbbell", onClick: () => go("AG-WB-FYS") }, { label: "Turneringer", icon: "trophy", onClick: () => go("AG-WB-TURN") }, { label: "Lag tiltak", onClick: () => go("AG-A06") }]} />
        <Card><Head k="Fysisk plan og turneringer" aside={<AG.Meta>UKE 39–40</AG.Meta>} /><DataTable caption="Fysisk og turnering" rowKey="k" columns={[{ key: "k", label: "Del" }, { key: "p", label: "Plan", mono: true, align: "right" }, { key: "f", label: "Faktisk", mono: true, align: "right" }, { key: "d", label: "Avvik", mono: true, align: "right" }]} rows={[{ k: "Fysisk · tonnasje uke 39", p: "9 800 kg", f: "7 245 kg", d: "−26 %" }, { k: "Fysisk · økter uke 39", p: "4", f: "3", d: "−1" }, { k: "Turnering · runder uke 40", p: "2", f: "—", d: "—" }, { k: "Turnering · forberedelse", p: "7 punkter", f: "5 publisert", d: "−2" }]} /><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" variant="secondary" icon="dumbbell" onClick={() => go("AG-WB-FYS")}>Fysisk plan</Button><Button size="sm" variant="secondary" icon="trophy" onClick={() => go("AG-WB-TURN")}>Turneringer</Button></div></Card>
        <Card><Head k="Periode" /><AG.Meta>GRUNNPERIODE → KONKURRANSE 03.10.2026</AG.Meta><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>I konkurranseperioden er målet lavere volum og mer SPILL. Avvik over 15 % varsles i Kø.</p></Card>
      </AG.Stack>
    </AG.Cols>
  </Frame>;
}
reg("AG-A04", "Plan mot faktisk", AA04);
window.AGA = { Frame, reg, d2, sg };
})();
