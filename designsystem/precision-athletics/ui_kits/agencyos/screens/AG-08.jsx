(() => {
function AG08({ state, go, arg, ak }) {
  const { PageHeader, Button, StatusPill, EmptyState, KeyValue, Timeline, Sparkline, Sheet, FormField, TextInput, Select, Avatar, Tabs, InlineAlert } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA2, { mob, pad, desk, wide } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState(arg === "iup" ? "iup" : "oversikt"), [p, setP] = React.useState(D.p360), [hist, setHist] = React.useState(D.p360.history), [ed, setEd] = React.useState(null), [link, setLink] = React.useState(false), [gb, setGb] = React.useState(""), [gbErr, setGbErr] = React.useState(null);
  const now = () => new Date().toTimeString().slice(0, 5);
  const log = (title, meta) => setHist((h) => [{ day: "LØR 26.09", time: now(), title, meta }, ...h.map((x, i) => i === 0 ? { ...x, day: x.day === "LØR 26.09" ? undefined : x.day } : x)]);
  const saveEd = () => { const ch = ["grp", "school", "phone", "parent"].filter((k) => ed[k] !== p[k]); ch.forEach((k) => log({ grp: "Gruppe", school: "Skole", phone: "Telefon", parent: "Forelder" }[k] + " endret " + (p[k] || "—") + " → " + (ed[k] || "—"), "ANDERS KRISTIANSEN · PROFIL")); setP(ed); setEd(null); A.toast(ch.length ? "Profilen er lagret" : "Ingen endringer", ch.length ? ch.length + " FELT · LOGGET I HISTORIKKEN" : "—"); };
  const doLink = () => { if (!/^\d{6,8}$/.test(gb)) { setGbErr("GolfBox-ID er 6–8 siffer. Finn den på spillerens side i GolfBox."); return; } setP({ ...p, golfbox: gb }); log("Koblet til turneringsprofil GolfBox " + gb, "ANDERS KRISTIANSEN · TURNERING-KOBLING"); setLink(false); setGb(""); setGbErr(null); A.toast("Turneringsprofilen er koblet", "RESULTATER HENTES HVER NATT KL. 03:00"); };
  const profile = <A.Card gap={14}>
    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}><Avatar name={p.name} size={56} /><div style={{ flex: "1 1 180px", minWidth: 0 }}><div style={{ font: "var(--type-title-s)", color: "var(--text-primary)" }}>{p.name}</div><A.Meta>{p.grp.toUpperCase()} · KATEGORI {p.cat} · FØDT {p.born}</A.Meta></div><StatusPill tone="ok">Aktiv</StatusPill></div>
    <KeyValue items={[["Skole", p.school, { mono: false }], ["Klubb", p.club, { mono: false }], ["Forelder", p.parent, { mono: false }], ["E-post", p.email, { mono: false }], ["Telefon", p.phone], ["App-nivå", p.tier], ["Coaching-pakke", p.pkg, { mono: false, hint: "4 KLIPP PER MÅNED" }], ["I stallen siden", p.since], ["Turneringsprofil", p.golfbox ? "GolfBox " + p.golfbox : null, { hint: p.golfbox ? "KOBLET 26.09.2026" : "IKKE KOBLET" }]]} />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button variant="secondary" icon="pencil" onClick={() => setEd({ ...p })}>Rediger profil</Button><Button variant="ghost" icon="link" onClick={() => setLink(true)}>{p.golfbox ? "Endre turneringskobling" : "Koble turneringsprofil"}</Button></div>
  </A.Card>;
  const keys = <A.Card gap={12}><A.Head k="Nøkkeltall" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,150px),1fr))", gap: 8 }}>{D.p360.keys.map(([k, v, u, src]) => <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4, padding: 12, borderRadius: 6, background: "var(--surface-flat)", border: "1px solid var(--border-hairline)", minWidth: 0 }}><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{k}</span><span style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ font: "600 22px/1 var(--font-mono)", color: "var(--text-primary)" }}>{empty ? "—" : v}</span>{u && !empty && <span style={{ font: "var(--type-num-s)", color: "var(--text-muted)" }}>{u}</span>}</span><A.Meta s={{ fontSize: 10 }}>{empty ? "—" : src}</A.Meta></div>)}</div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" variant="ghost" icon="chart-no-axes-column" onClick={() => go("AG-09")}>Spilleranalyse</Button><Button size="sm" variant="ghost" icon="list-checks" onClick={() => go("AG-10")}>Teknisk plan</Button><Button size="sm" variant="ghost" icon="layers" onClick={() => go("AG-11")}>Workbench</Button></div>
  </A.Card>;
  const prog = <A.Card gap={10}><A.Head k="Fremgang · snitt brutto per måned" aside={empty ? "—" : "RUNDER · 18 HULL · 2026"} />
    {empty ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen runder registrert.</p> : <><div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><span style={{ font: "var(--type-metric)", color: "var(--text-primary)" }}>−4,8</span><A.Meta>SLAG SIDEN MARS · 79,4 → 74,6</A.Meta></div><Sparkline values={D.p360.progress} height={72} label="Snitt brutto per måned" /><div style={{ display: "flex", justifyContent: "space-between" }}>{D.p360.progMonths.map((m) => <A.Meta key={m}>{m}</A.Meta>)}</div><A.Meta>LAVERE ER BEDRE · 9-HULLSRUNDER TELLER IKKE</A.Meta></>}
  </A.Card>;
  const history = <A.Card gap={10}><A.Head k="Endringshistorikk" aside={empty ? "—" : hist.length + " ENDRINGER"} />{empty ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen endringer.</p> : <Timeline items={hist} dense />}</A.Card>;
  return <A.Page>
    <PageHeader kicker="Stall · Spiller 360" title={p.name} sub="Profil, nøkkeltall, fremgang og hvem som endret hva." actions={<Button variant="secondary" icon="arrow-left" onClick={() => go("AG-07")}>Stall</Button>} />
    <A.Gate state={state} loading="Henter spillerprofilen …" error={{ title: "Profilen kunne ikke hentes", text: "Ingen felt er endret. Prøv igjen.", code: "FEIL 404 · SPILLER P1" }}>
      <Tabs tabs={[{ value: "oversikt", label: "Oversikt" }, { value: "iup", label: "IUP" }]} value={tab} onChange={setTab} />
      {tab === "iup" ? (window.AG_IUP ? <window.AG_IUP empty={empty} ak={ak} /> : null) : <>
      {empty && <InlineAlert tone="info" title="Ny spiller uten data">Profilen er opprettet, men det finnes ingen økter, runder eller tester ennå. Book første privattime.</InlineAlert>}
      {desk ? <A.Cols tpl={wide ? "minmax(0,1fr) minmax(0,1.2fr) minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1.2fr)"}>{wide ? <>{profile}<A.Stack>{keys}{prog}</A.Stack>{history}</> : <><A.Stack>{profile}{history}</A.Stack><A.Stack>{keys}{prog}</A.Stack></>}</A.Cols>
        : pad ? <A.Cols tpl="repeat(2,minmax(0,1fr))"><A.Stack>{profile}{history}</A.Stack><A.Stack>{keys}{prog}</A.Stack></A.Cols> : <A.Stack>{profile}{keys}{prog}{history}</A.Stack>}
      </>}
    </A.Gate>
    <Sheet open={!!ed} onClose={() => setEd(null)} kicker="/admin/spillere/p1/rediger" title="Rediger profil" footer={<><Button fullWidth icon="check" onClick={saveEd}>Lagre</Button><Button variant="ghost" fullWidth onClick={() => setEd(null)}>Avbryt</Button></>}>
      {ed && <><Select label="Gruppe" value={ed.grp} onChange={(e) => setEd({ ...ed, grp: e.target.value })} options={D.groups} /><FormField label="Skole"><TextInput value={ed.school} onChange={(e) => setEd({ ...ed, school: e.target.value })} /></FormField><FormField label="Telefon"><TextInput mono value={ed.phone} onChange={(e) => setEd({ ...ed, phone: e.target.value })} /></FormField><FormField label="Forelder"><TextInput value={ed.parent} onChange={(e) => setEd({ ...ed, parent: e.target.value })} /></FormField><A.Meta>ALLE ENDRINGER LOGGES MED NAVN OG TID</A.Meta></>}
    </Sheet>
    <Sheet open={link} onClose={() => setLink(false)} kicker="/admin/spillere/p1/turnering-kobling" title="Koble turneringsprofil" footer={<><Button fullWidth icon="link" onClick={doLink}>Koble</Button><Button variant="ghost" fullWidth onClick={() => setLink(false)}>Avbryt</Button></>}>
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Turneringsresultater hentes fra GolfBox og vises som brutto score. Ingenting publiseres fra AgencyOS.</p>
      <FormField label="GolfBox-ID" required error={gbErr || undefined}><TextInput mono inputMode="numeric" value={gb} onChange={(e) => { setGb(e.target.value.replace(/\D/g, "").slice(0, 8)); setGbErr(null); }} placeholder="1234567" /></FormField>
    </Sheet>
  </A.Page>;
}
window.AG_SCREENS["AG-08"] = { id: "AG-08", parent: "AG-07", name: "Spiller 360", route: "/admin/spillere/[id]", Component: AG08 };
window.AG_SCREENS["AG-08-IUP"] = { id: "AG-08-IUP", parent: "AG-08", name: "Spiller 360 › IUP", route: "/admin/spillere/[id]?fane=iup", Component: (p) => <AG08 {...p} arg="iup" /> };
window.AG_SCREENS["AG-08-IUP-AK"] = { id: "AG-08-IUP-AK", parent: "AG-08", name: "Spiller 360 › IUP · AK-spiller uten WANG/Team Norway", route: "/admin/spillere/[id]?fane=iup", Component: (p) => <AG08 {...p} arg="iup" ak /> };
})();
