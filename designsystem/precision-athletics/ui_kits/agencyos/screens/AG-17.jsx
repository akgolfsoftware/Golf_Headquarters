(() => {
const TABS = [{ value: "alle", label: "Alle" }, { value: "mine", label: "Mine spillere" }, { value: "kart", label: "Kart" }, { value: "dup", label: "Dubletter" }, { value: "ny", label: "Ny turnering" }];
const TONE = { "Påmeldt": "info", "Åpen": "neutral", "Spilt": "ok" };
function AG17({ state, go }) {
  const { PageHeader, Button, StatusPill, EmptyState, Tabs, DataTable, FormField, TextInput, Select, InlineAlert, KeyValue } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA3, { mob, desk } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState("alle"), [list, setList] = React.useState(D.tournaments), [dups, setDups] = React.useState(D.tDups), [sel, setSel] = React.useState(null), [f, setF] = React.useState({ name: "", date: "", course: "Borregaard GK", level: "Regional" }), [err, setErr] = React.useState({});
  const T = empty ? [] : list, cur = T.find((x) => x.id === sel);
  const cols = [{ key: "date", label: "Dato", mono: true, sortable: true, sortValue: (r) => r.date.split(".").reverse().join("") }, { key: "name", label: "Turnering", sortable: true }, { key: "course", label: "Bane" }, { key: "level", label: "Nivå" }, { key: "mine", label: "Mine spillere", mono: true, align: "right", render: (r) => r.mine.length || null }, { key: "st", label: "Status", render: (r) => <StatusPill tone={TONE[r.st]}>{r.st}</StatusPill> }];
  const detail = cur && <A.Card gap={12}><div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "var(--type-title-s)", flex: "1 1 200px" }}>{cur.name}</span><StatusPill tone={TONE[cur.st]}>{cur.st}</StatusPill></div>
    <KeyValue items={[["Dato", cur.date], ["Bane", cur.course + " · " + cur.place, { mono: false }], ["Nivå", cur.level, { mono: false }], ["Mine spillere", cur.mine.length ? cur.mine.join(", ") : null, { mono: false }]]} />
    {cur.result && <DataTable caption="Resultat · brutto · GOLFBOX · 20.09.2026" rowKey="0" columns={[{ key: "0", label: "Spiller" }, { key: "1", label: "Runder", mono: true }, { key: "2", label: "Brutto", mono: true, align: "right" }, { key: "3", label: "Plass", mono: true, align: "right" }]} rows={cur.result.map((r) => ({ ...r }))} />}
    {cur.result && <div style={{ padding: 12, borderRadius: 8, background: "var(--surface-flat)", border: "1px dashed var(--border-strong)", display: "flex", flexDirection: "column", gap: 6 }}><div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><A.Meta s={{ flex: 1 }}>BARE SYNLIG FOR ANDERS KRISTIANSEN</A.Meta><span style={{ font: "500 11px/1 var(--font-sans)", color: "var(--text-secondary)", padding: "4px 8px", border: "1px solid var(--border-hairline)", borderRadius: 4 }}>Powered by Data Golf</span></div><KeyValue items={D.dg.rows.map(([k, v]) => [k, v, { hint: D.dg.src }])} /></div>}
    <div><Button variant="ghost" size="sm" onClick={() => setSel(null)}>Lukk</Button></div>
  </A.Card>;
  const table = (rows) => rows.length ? <A.Cols tpl={desk && cur ? "minmax(0,1.3fr) minmax(0,1fr)" : "minmax(0,1fr)"}><DataTable rowKey="id" selected={sel} onSelect={setSel} defaultSort={{ key: "date", dir: "asc" }} columns={cols} rows={rows} />{cur && detail}</A.Cols> : <EmptyState icon="trophy" title="Ingen turneringer" text="Ingen av spillerne dine er meldt på en turnering." action="Ny turnering" actionIcon="plus" onAction={() => setTab("ny")} />;
  let body;
  if (tab === "alle") body = table(T);
  if (tab === "mine") body = table(T.filter((t) => t.mine.length));
  if (tab === "kart") { const la = [58, 60.2], lo = [7.6, 11.6]; body = <A.Cols tpl={desk ? "minmax(0,1.2fr) minmax(0,1fr)" : "minmax(0,1fr)"}>
    <A.Card gap={8}><A.Head k="Kart · Sør-Norge" aside="SKJEMATISK · IKKE MÅLESTOKK" />
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", background: "var(--surface-flat)", border: "1px solid var(--border-hairline)", borderRadius: 8, backgroundImage: "repeating-linear-gradient(to right, var(--border-hairline) 0 1px, transparent 1px 25%), repeating-linear-gradient(to bottom, var(--border-hairline) 0 1px, transparent 1px 25%)" }}>
        {T.map((t) => { const x = (t.lon - lo[0]) / (lo[1] - lo[0]) * 100, y = (1 - (t.lat - la[0]) / (la[1] - la[0])) * 100, on = t.id === sel; return <button key={t.id} type="button" aria-label={t.name} onClick={() => setSel(t.id)} style={{ all: "unset", cursor: "pointer", position: "absolute", left: "calc(" + x + "% - 22px)", top: "calc(" + y + "% - 22px)", width: 44, height: 44, display: "grid", placeItems: "center" }}><span style={{ width: on ? 16 : 12, height: on ? 16 : 12, borderRadius: 999, background: t.mine.length ? "var(--primary)" : "var(--surface-card)", border: "2px solid var(--border-ink)" }}></span></button>; })}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 10, height: 10, borderRadius: 999, background: "var(--primary)" }}></span><A.Meta>MINE SPILLERE</A.Meta></span><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 10, height: 10, borderRadius: 999, border: "2px solid var(--border-ink)" }}></span><A.Meta>INGEN AV MINE</A.Meta></span></div>
    </A.Card>
    {cur ? detail : <A.Card><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Trykk på et punkt for å se turneringen.</p></A.Card>}
  </A.Cols>; }
  if (tab === "dup") body = !dups.length || empty ? <EmptyState icon="check" title="Ingen dubletter" text="Turneringer fra GolfBox og manuelle oppføringer sammenlignes hver natt." /> : <A.Stack>{dups.map((d) => <A.Card key={d.id} gap={12}><A.Head k="Mulig dublett" aside={d.match.toUpperCase()} />
    <div style={{ display: "grid", gridTemplateColumns: mob ? "minmax(0,1fr)" : "repeat(2,minmax(0,1fr))", gap: 8 }}>{["a", "b"].map((s) => <div key={s} style={{ padding: 12, borderRadius: 6, border: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 4 }}><A.Meta>{s.toUpperCase()} · {d[s].src.toUpperCase()}</A.Meta><span style={{ font: "500 14px/1.3 var(--font-sans)" }}>{d[s].name}</span><span style={{ font: "var(--type-num-s)" }}>{d[s].date} · {d[s].course}</span></div>)}</div>
    <A.Meta>A BEHOLDES SOM HOVEDOPPFØRING · PÅMELDINGER FRA BEGGE FLYTTES</A.Meta>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button icon="git-merge" onClick={() => { setDups((l) => l.filter((x) => x.id !== d.id)); A.toast("Turneringene er slått sammen", d.a.name.toUpperCase()); }}>Slå sammen</Button><Button variant="ghost" onClick={() => { setDups((l) => l.filter((x) => x.id !== d.id)); A.toast("Merket som ikke dublett", "BEGGE BEHOLDES"); }}>Ikke dublett</Button></div>
  </A.Card>)}</A.Stack>;
  if (tab === "ny") body = <A.Card gap={14} style={{ maxWidth: 640 }}><A.Head k="Ny turnering" aside="/ADMIN/TURNERINGER/NY" />
    {Object.keys(err).length > 0 && <InlineAlert tone="warn" title="Turneringen er ikke lagret">Rett feltene under.</InlineAlert>}
    <FormField label="Navn" required error={err.name}><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Høstpokalen" /></FormField>
    <FormField label="Dato" required hint="DD.MM.ÅÅÅÅ" error={err.date}><TextInput mono value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} placeholder="17.10.2026" /></FormField>
    <Select label="Bane" value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })} options={["Borregaard GK", "Fredrikstad GK", "Hvaler GK", "Onsøy GK", "Oslo GK", "Larvik GK"]} />
    <Select label="Nivå" value={f.level} onChange={(e) => setF({ ...f, level: e.target.value })} options={["Klubb", "Regional", "Nasjonal", "Internasjonal"]} />
    <div><Button icon="check" onClick={() => { const e = {}; if (!f.name.trim()) e.name = "Skriv navnet på turneringen."; if (!/^\d\d\.\d\d\.\d{4}$/.test(f.date)) e.date = "Skriv dato som DD.MM.ÅÅÅÅ, for eksempel 17.10.2026."; setErr(e); if (Object.keys(e).length) return; setList((l) => [...l, { id: "u" + Date.now(), name: f.name, date: f.date, course: f.course, place: "—", lat: 59.2, lon: 10.9, level: f.level, mine: [], st: "Åpen" }]); setTab("alle"); A.toast("Turneringen er lagt til", "SJEKKES MOT GOLFBOX I NATT"); }}>Legg til turnering</Button></div>
  </A.Card>;
  return <A.Page>
    <PageHeader kicker="Turneringer · høst 2026" title="Turneringer" sub="Kun brutto score. Resultater hentes fra GolfBox." actions={<Button variant="secondary" icon="plus" onClick={() => setTab("ny")}>Ny turnering</Button>} />
    <A.Gate state={state} loading="Henter turneringer …" error={{ title: "Turneringene kunne ikke hentes", text: "GolfBox svarer ikke. Påmeldinger du har gjort er lagret.", code: "GOLFBOX · 504" }}>
      <Tabs tabs={TABS.map((t) => t.value === "dup" ? { ...t, count: empty ? undefined : dups.length } : t)} value={tab} onChange={(v) => { setTab(v); setSel(null); }} />
      {empty && tab !== "ny" && tab !== "dup" ? <EmptyState icon="trophy" title="Ingen turneringer" text="Legg inn en turnering, eller vent på nattlig henting fra GolfBox." action="Ny turnering" actionIcon="plus" onAction={() => setTab("ny")} /> : body}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-17"] = { id: "AG-17", parent: "AG-01", name: "Turneringer", route: "/admin/turneringer", Component: AG17 };
})();
