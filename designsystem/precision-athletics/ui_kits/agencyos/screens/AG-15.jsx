(() => {
function AG15({ state, go, nav }) {
  const { PageHeader, Button, StatusPill, EmptyState, Tabs, DataTable, Sheet, Select, FormField, InlineAlert, Icon, ChoicePill, AxisBadge } = window.AGQ.ns();
  const TD = window.TD, X = window.TEST_DATA;
  const [dt, setDt] = React.useState("pt510"), [choice, setChoice] = React.useState(() => Object.fromEntries(X.tests.map((t) => [t.id, t.choice]))), [added, setAdded] = React.useState({}), [pick, setPick] = React.useState(null), [ses, setSes] = React.useState(null);
  const A = window.AGQ, D = window.AG_DATA3, { mob, desk } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState("detalj"), [tid, setTid] = React.useState("t1"), [as, setAs] = React.useState(false), [f, setF] = React.useState({ who: "Tobias Lindvik", test: "t3", week: "Uke 41" }), [res, setRes] = React.useState(D.results);
  const T = (id) => D.tests.find((t) => t.id === id);
  const lvl = (t, v) => v == null ? null : t.ladder.filter((l) => v >= l[1]).slice(-1)[0]?.[0] || "Under nivå 1";
  const rows = (empty ? [] : res).map((r) => { const t = T(r.test), full = r.done >= t.slag; return { ...r, t, full, name: t.name }; });
  const sync = (r) => { setRes((l) => l.map((x) => x.id === r.id ? { ...x, sync: true } : x)); A.toast("Synket til talentprofilen", (r.who + " · " + r.t.name).toUpperCase()); };
  const t = T(tid), tr = rows.filter((r) => r.test === tid && r.full);
  let body;
  if (tab === "res") body = rows.length ? <DataTable caption="Resultater · teller bare med alle slag registrert" rowKey="id" columns={[{ key: "who", label: "Spiller", sortable: true }, { key: "name", label: "Test" }, { key: "v", label: "Resultat", mono: true, align: "right", render: (r) => r.full ? r.v + " " + r.t.unit : null }, { key: "lvl", label: "Nivå", render: (r) => r.full ? lvl(r.t, r.v) : null }, { key: "done", label: "Slag", mono: true, align: "right", render: (r) => r.done + " av " + r.t.slag }, { key: "date", label: "Dato", mono: true }, { key: "st", label: "Status", render: (r) => !r.full ? <span style={{ display: "inline-flex", gap: 6, alignItems: "center", font: "var(--type-label)", color: "var(--warn)" }}><Icon name="triangle-alert" size={14} />Teller ikke · {r.t.slag - r.done} slag mangler</span> : r.sync ? <StatusPill tone="ok">Synket</StatusPill> : <Button size="sm" variant="secondary" icon="refresh-cw" onClick={(e) => { e.stopPropagation(); sync(r); }}>Synk til talentprofil</Button> }]} rows={rows} /> : null;
  if (tab === "stige") body = <A.Cols tpl={desk ? "280px minmax(0,1fr)" : "minmax(0,1fr)"}>
    <A.Card gap={4}><A.Head k="Protokoller" />{D.tests.map((x, i) => <button key={x.id} type="button" aria-pressed={x.id === tid} onClick={() => setTid(x.id)} style={{ all: "unset", cursor: "pointer", minHeight: 52, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, padding: "6px 8px", borderTop: i ? "1px solid var(--border-hairline)" : "none", boxShadow: x.id === tid ? "inset 2px 0 0 var(--border-ink)" : "none" }}><span style={{ font: "500 14px/1.3 var(--font-sans)" }}>{x.name}</span><A.Meta>{x.src.toUpperCase()} · {x.slag} SLAG</A.Meta></button>)}</A.Card>
    <A.Card gap={12}><A.Head k={"Nivåstige · " + t.name} aside={t.src.toUpperCase() + " · 2026"} />
      {t.ladder.slice().reverse().map(([n, v]) => { const who = tr.filter((r) => lvl(t, r.v) === n); return <div key={n} style={{ display: "grid", gridTemplateColumns: "80px 88px minmax(0,1fr)", gap: 10, alignItems: "center", minHeight: 48, borderTop: "1px solid var(--border-hairline)" }}><span style={{ font: "600 14px/1 var(--font-sans)" }}>{n}</span><span style={{ font: "var(--type-num-s)" }}>≥ {v} {t.unit}</span><span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{who.length ? who.map((r) => <span key={r.id} style={{ padding: "4px 8px", borderRadius: 4, background: "var(--surface-sunken)", font: "500 12px/1.2 var(--font-sans)" }}>{r.who}</span>) : <A.Meta>—</A.Meta>}</span></div>; })}
      <A.Meta>BARE TESTER MED ALLE {t.slag} SLAG REGISTRERT ER PLASSERT</A.Meta>
    </A.Card>
  </A.Cols>;
  if (tab === "detalj") { const t = X.tests.find((x) => x.id === dt), ch = choice[dt];
    const choose = (c) => { const prev = ch, lbl = X.CHOICES.find((x) => x[0] === c)[1]; setChoice((m) => ({ ...m, [dt]: c })); const m = (t.short + " · SPILLEREN SER STATUS").toUpperCase(); nav ? nav.undo("Valget er lagret: " + lbl, m, () => setChoice((x) => ({ ...x, [dt]: prev }))) : A.toast("Valget er lagret", m); if (c === "tek") go("AG-TP-01", "fra-test"); };
    body = <A.Stack>
      <div role="group" aria-label="Test" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}><A.Meta s={{ marginRight: 4 }}>TOBIAS LINDVIK</A.Meta>{X.tests.map((x) => <ChoicePill key={x.id} selected={x.id === dt} aria-pressed={x.id === dt} onClick={() => setDt(x.id)}>{x.name}</ChoicePill>)}</div>
      <A.Cols tpl={desk ? "minmax(0,1.2fr) minmax(0,1fr)" : "minmax(0,1fr)"}>
        <A.Card gap={16}><TD.TestHead t={t} /><TD.TestSignal t={t} /></A.Card>
        <A.Card gap={12}><A.Head k="Coachens valg" aside={ch ? "VALGT 27.09.2026" : "IKKE VALGT"} /><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Ett resultat avgjør ingenting alene. Systemet foreslår, du bestemmer. Planen endres ikke automatisk.</p>
          <div role="group" aria-label="Coachens valg" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8 }}>{X.CHOICES.map(([c, l]) => <ChoicePill key={c} size="lg" selected={ch === c} aria-pressed={ch === c} onClick={() => choose(c)}>{l}</ChoicePill>)}</div>
          <A.Meta>SPILLEREN SER: {ch === "ingen" ? "INGEN ENDRING NÅ" : "ANDERS VURDERER PLANEN"} · HVERT VALG KAN ANGRES</A.Meta>
        </A.Card>
      </A.Cols>
      <A.Card gap={12}><A.Head k="Resultathistorikk" aside={t.hist.length + " RESULTATER · " + t.hist.filter((h) => h.dev).length + " UTENFOR TRENDEN"} /><TD.TestHistory t={t} /></A.Card>
      {ch === "mer" && <A.Card gap={12}><A.Head k={"Forslag fra øvelsesbanken · " + t.suggest.length} aside={t.area.toUpperCase()} /><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Testen legges aldri i en økt. Velg en øvelse fra banken. Den ligger som utkast i Workbench til du publiserer.</p>
        {t.suggest.length === 0 ? <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}><span style={{ font: "var(--type-body)", flex: "1 1 220px" }}>Ingen øvelser i banken passer.</span><Button size="sm" variant="secondary" icon="plus" onClick={() => go("AG-14")}>Opprett øvelse</Button></div> : t.suggest.map((o) => { const a = added[o.id], S = a && X.sessions.find((x) => x.id === a); return <div key={o.id} style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><TD.Tag kind={a ? "okt" : "bank"} /><AxisBadge axis={o.axis} /><span style={{ font: "600 14px/1.3 var(--font-sans)", flex: "1 1 220px", minWidth: 0 }}>{o.name}</span></div>
          <A.Meta>{o.area.toUpperCase()} · {o.dose.toUpperCase()}{a ? " · " + o.code : ""}</A.Meta>
          <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-body)", textWrap: "pretty" }}><b style={{ fontWeight: 600 }}>Hvorfor:</b> {o.why}</p><A.Meta>KILDE {o.src}</A.Meta>
          {a ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><StatusPill tone="ok">Lagt i økt som utkast</StatusPill><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", flex: "1 1 200px" }}>{S.d} {S.t} · {S.name} · ikke publisert</span><Button size="sm" variant="ghost" iconRight="arrow-right" onClick={() => go("AG-11")}>Åpne økten</Button></div> : <div><Button size="sm" variant="secondary" icon="calendar-plus" onClick={() => { setPick(o); setSes(null); }}>Legg i økt</Button></div>}
        </div>; })}
      </A.Card>}
    </A.Stack>; }
  return <A.Page>
    <PageHeader kicker="Tester · coach" title="Tester" sub="Testdetalj, resultater, nivåstiger og tildeling. Tester planlegges i Workbench, og resultatet synkes til spillerens talentprofil." actions={<Button icon="clipboard-plus" onClick={() => setAs(true)}>Tildel test</Button>} />
    <A.Gate state={state} loading="Henter testresultater …" error={{ title: "Testene kunne ikke hentes", text: "Ingen resultater er endret. Prøv igjen.", code: "FEIL 502 · TESTER" }}>
      {state !== "tom" && window.TN_SKALA && <window.TN_SKALA Meta={A.Meta} />}
      {state !== "tom" && window.AG_TM_TILDEL && <window.AG_TM_TILDEL />}
      <Tabs tabs={[{ value: "detalj", label: "Testdetalj" }, { value: "res", label: "Resultater", count: empty ? undefined : rows.length }, { value: "stige", label: "Nivåstiger" }]} value={tab} onChange={setTab} />
      {empty ? <EmptyState icon="clipboard-list" title="Ingen testresultater" text="Tildel en test til en spiller. Den legges inn som økt i Workbench." action="Tildel test" actionIcon="clipboard-plus" onAction={() => setAs(true)} /> : body}
    </A.Gate>
    <Sheet open={as} onClose={() => setAs(false)} kicker="Tildel test" title="Tildel test til spiller" footer={<><Button fullWidth icon="layers" onClick={() => { setAs(false); A.toast("Testen er lagt i Workbench som utkast", (f.who + " · " + f.week + " · PUBLISER FOR Å SENDE").toUpperCase()); }}>Legg i Workbench</Button><Button variant="ghost" fullWidth onClick={() => setAs(false)}>Avbryt</Button></>}>
      <Select label="Spiller" value={f.who} onChange={(e) => setF({ ...f, who: e.target.value })} options={["Tobias Lindvik", "Magnus Aasheim", "Sara Holm", "Ingrid Berg", "Emil Solberg"]} />
      <Select label="Test" value={f.test} onChange={(e) => setF({ ...f, test: e.target.value })} options={D.tests.map((x) => ({ value: x.id, label: x.name + " · " + x.slag + " slag" }))} />
      <Select label="Uke" value={f.week} onChange={(e) => setF({ ...f, week: e.target.value })} options={["Uke 40", "Uke 41", "Uke 42"]} />
      <InlineAlert tone="info">Testen blir en økt i Workbench. Resultatet teller bare når alle {T(f.test).slag} slag er registrert.</InlineAlert>
    </Sheet>
    <Sheet open={!!pick} onClose={() => setPick(null)} kicker="Legg i økt · Tobias Lindvik" title={pick ? pick.name : ""} footer={<><Button fullWidth icon="check" disabled={!ses} onClick={() => { const S = X.sessions.find((x) => x.id === ses); setAdded((m) => ({ ...m, [pick.id]: ses })); setPick(null); A.toast("Øvelsen ligger som utkast i Workbench", (S.d + " · " + S.name + " · IKKE PUBLISERT").toUpperCase()); }}>Legg i økt som utkast</Button><Button variant="ghost" fullWidth onClick={() => setPick(null)}>Avbryt</Button></>}>
      <div role="radiogroup" aria-label="Velg økt" style={{ display: "flex", flexDirection: "column", gap: 8 }}>{X.sessions.map((x) => <button key={x.id} type="button" role="radio" aria-checked={ses === x.id} onClick={() => setSes(x.id)} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", minHeight: 56, padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid " + (ses === x.id ? "var(--border-ink)" : "var(--border-hairline)"), boxShadow: ses === x.id ? "inset 0 0 0 1px var(--border-ink)" : "none", display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "500 14px/1.3 var(--font-sans)" }}>{x.name}</span><A.Meta>{x.d.toUpperCase()} · {x.t} · {x.min} MIN · WORKBENCH UKE 40</A.Meta></button>)}</div>
      {pick && <A.Meta>{pick.dose.toUpperCase()} · {pick.code}</A.Meta>}
      <InlineAlert tone="info">Øvelsen legges som utkast. Tobias ser den først når du publiserer uka.</InlineAlert>
    </Sheet>
  </A.Page>;
}
window.AG_SCREENS["AG-15"] = { id: "AG-15", parent: "AG-07", name: "Tester (coach)", route: "/admin/tester", Component: AG15 };
})();
