(() => {
const TONE = { Aktiv: "ok", Skadet: "warn", Pause: "neutral", Ny: "info", Inaktiv: "neutral" };
const nf = (v) => v == null ? null : v.toFixed(1).replace(".", ",");
function AG07({ state, go }) {
  const { PageHeader, Button, StatusPill, EmptyState, DataTable, SegmentedFilter, SearchField, Sheet, FormField, TextInput, Select, InlineAlert, Checkbox, ActionBar, ConfirmDialog } = window.AGQ.ns();
  const A = window.AGQ, nav = window.AGQ.useW().nav, D = window.AG_DATA2, { mob, desk } = A.useW(), empty = state === "tom";
  const [pick, setPick] = React.useState(null), [bulk, setBulk] = React.useState(null), [bulkTo, setBulkTo] = React.useState("Talent U16");
  const [q, setQ] = React.useState(""), [grp, setGrp] = React.useState(["Alle"]), [list, setList] = React.useState(D.roster), [nu, setNu] = React.useState(false);
  const [f, setF] = React.useState({ first: "", last: "", born: "", email: "", grp: "Talent U16" }), [err, setErr] = React.useState({}), [tried, setTried] = React.useState(false);
  const rows = (empty ? [] : list).filter((p) => (grp.includes("Alle") || grp.includes(p.grp)) && (!q || p.name.toLowerCase().includes(q.toLowerCase())));
  const setG = (v) => { const last = v[v.length - 1]; setGrp(!v.length || last === "Alle" ? ["Alle"] : v.filter((x) => x !== "Alle")); };
  const validate = (x) => { const e = {}; if (!x.first.trim()) e.first = "Skriv fornavnet."; if (!x.last.trim()) e.last = "Skriv etternavnet."; if (!/^(19|20)\d\d$/.test(x.born)) e.born = "Skriv fødselsår med fire sifre, for eksempel 2011."; else if (+x.born >= 2008 && !x.email.trim()) e.email = "Spillere født 2008 eller senere trenger en forelder med e-post for samtykke."; if (x.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x.email)) e.email = "E-postadressen mangler @ eller domene."; return e; };
  const save = () => { setTried(true); const e = validate(f); setErr(e); if (Object.keys(e).length) return; const name = f.first.trim() + " " + f.last.trim(); setList((l) => [{ id: "n" + Date.now(), name, born: +f.born, grp: f.grp, cat: null, hcp: null, last: "—", st: "Ny", adh: null, note: "Lagt til 26.09" }, ...l]); setNu(false); setF({ first: "", last: "", born: "", email: "", grp: "Talent U16" }); setTried(false); setErr({}); A.toast(name + " er lagt til", f.email ? "SAMTYKKE SENDES SOM UTKAST TIL FORELDER" : "STATUS NY"); };
  const upd = (k, v) => { const n = { ...f, [k]: v }; setF(n); if (tried) setErr(validate(n)); };
  const tog = (id) => setPick((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const cols = [
    ...(pick ? [{ key: "sel", label: "Velg", width: 56, render: (r) => <span onClick={(e) => e.stopPropagation()}><Checkbox aria-label={"Velg " + r.name} checked={pick.includes(r.id)} onChange={() => tog(r.id)} /></span> }] : []),
    { key: "name", label: "Spiller", sortable: true, render: (r) => <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "500 14px/1.3 var(--font-sans)" }}>{r.name}</span>{r.note && <A.Meta>{r.note.toUpperCase()}</A.Meta>}</span>, sortValue: (r) => r.name },
    { key: "grp", label: "Gruppe", sortable: true },
    { key: "cat", label: "Kategori", mono: true, sortable: true },
    { key: "hcp", label: "HCP", mono: true, align: "right", sortable: true, render: (r) => nf(r.hcp), sortValue: (r) => r.hcp ?? 99 },
    { key: "adh", label: "Etterlevelse", mono: true, align: "right", sortable: true, render: (r) => r.adh == null ? null : r.adh + " %", sortValue: (r) => r.adh ?? -1 },
    { key: "last", label: "Siste økt", mono: true, render: (r) => r.last === "—" ? null : r.last },
  ];
  return <A.Page>
    <PageHeader kicker={"Stall · " + (empty ? "—" : list.length + " spillere")} title="Stall" sub="Gruppert etter status. Etterlevelse = gjennomført tid mot planlagt tid, siste fire uker (uke 36–39 · ØKTLOGG · 26.09.2026)." actions={<><Button variant="secondary" icon={pick ? "x" : "list-checks"} onClick={() => setPick(pick ? null : [])}>{pick ? "Avbryt valg" : "Velg flere"}</Button><Button icon="user-plus" onClick={() => setNu(true)}>Ny spiller</Button></>} />
    <A.Gate state={state} loading="Henter stallen …" error={{ title: "Stallen kunne ikke hentes", text: "Ingen spillere er endret. Prøv igjen.", code: "FEIL 502 · SPILLERE" }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}><div style={{ flex: "1 1 260px", minWidth: 0, maxWidth: 420 }}><SearchField value={q} onChange={(e) => setQ(e.target ? e.target.value : e)} placeholder="Søk etter navn" label="Søk" /></div><SegmentedFilter label="Gruppe" multi value={grp} onChange={setG} options={["Alle"].concat(D.groups)} /></div>
      {empty ? <EmptyState icon="users" title="Ingen spillere ennå" text="Legg til første spiller. Spillere under 18 får samtykke sendt til forelder som utkast." action="Ny spiller" actionIcon="user-plus" onAction={() => setNu(true)} />
        : rows.length === 0 ? <EmptyState icon="search-x" title="Ingen treff" text={"Ingen spillere heter «" + q + "» i valgte grupper."} action="Nullstill søk" actionIcon="x" onAction={() => { setQ(""); setGrp(["Alle"]); }} />
        : D.statuses.map((st) => { const r = rows.filter((p) => p.st === st); if (!r.length) return null; return <section key={st} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><StatusPill tone={TONE[st]}>{st}</StatusPill><A.Meta>{r.length} {r.length === 1 ? "SPILLER" : "SPILLERE"}</A.Meta></div>
          <DataTable rowKey="id" onSelect={(id) => id === "p1" ? go("AG-08") : A.toast("Spiller 360", "DEMO VISER TOBIAS LINDVIK")} columns={cols} rows={r} defaultSort={{ key: "name", dir: "asc" }} />
        </section>; })}
      {pick && pick.length > 0 && <ActionBar sticky status="idle" secondary={<><Button variant="ghost" onClick={() => setPick([])}>Fjern valg</Button><Button variant="secondary" icon="send" onClick={() => go("AG-04")}>Send melding</Button><Button variant="secondary" icon="users" onClick={() => setBulk("gruppe")}>Legg i gruppe</Button></>} primary={<Button icon="layers" onClick={() => setBulk("plan")}>Tildel plan · {pick.length}</Button>} />}
    </A.Gate>
    <Sheet open={!!bulk} onClose={() => setBulk(null)} kicker={(pick ? pick.length : 0) + " spillere valgt"} title={bulk === "plan" ? "Tildel plan" : "Legg i gruppe"} footer={<><Button fullWidth icon="check" onClick={() => { const n = pick.length; setBulk(null); setPick(null); nav ? nav.undo(bulk === "plan" ? "Planen er tildelt som utkast" : n + " spillere lagt i " + bulkTo, "KAN ANGRES I 8 SEKUNDER", () => {}) : A.toast("Lagret", ""); }}>{bulk === "plan" ? "Tildel som utkast" : "Legg i " + bulkTo}</Button><Button variant="ghost" fullWidth onClick={() => setBulk(null)}>Avbryt</Button></>}>
      <Select label={bulk === "plan" ? "Plan" : "Gruppe"} value={bulkTo} onChange={(e) => setBulkTo(e.target.value)} options={bulk === "plan" ? ["Grunnperiode høst · 8 uker", "Konkurranse · 4 uker"] : D.groups} />
      <InlineAlert tone="info" title="Tilgang følger gruppen">{bulk === "plan" ? "Planen legges som utkast i hver spillers Workbench. Ingen får varsel før du publiserer." : "Coachene i gruppen får se spillerne. Spillere under 16 år trenger samtykke fra forelder før data deles i gruppen."}</InlineAlert>
      <A.Meta>INGEN DRA-OG-SLIPP HER · TILGANGSREGLER MÅ VÆRE SYNLIGE</A.Meta>
    </Sheet>
    <Sheet open={nu} onClose={() => setNu(false)} kicker="/admin/spillere/ny" title="Ny spiller" footer={<><Button fullWidth icon="check" onClick={save}>Legg til spiller</Button><Button variant="ghost" fullWidth onClick={() => setNu(false)}>Avbryt</Button></>}>
      {tried && Object.keys(err).length > 0 && <InlineAlert tone="warn" title={Object.keys(err).length === 1 ? "Ett felt må rettes" : Object.keys(err).length + " felt må rettes"}>Spilleren er ikke lagret.</InlineAlert>}
      <FormField label="Fornavn" required error={err.first}><TextInput value={f.first} onChange={(e) => upd("first", e.target.value)} autoComplete="off" /></FormField>
      <FormField label="Etternavn" required error={err.last}><TextInput value={f.last} onChange={(e) => upd("last", e.target.value)} autoComplete="off" /></FormField>
      <FormField label="Fødselsår" required error={err.born}><TextInput mono inputMode="numeric" value={f.born} onChange={(e) => upd("born", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2011" /></FormField>
      <FormField label="E-post til forelder" hint="Påkrevd for spillere født 2008 eller senere." error={err.email}><TextInput type="email" value={f.email} onChange={(e) => upd("email", e.target.value)} placeholder="forelder@demo.no" /></FormField>
      <Select label="Gruppe" value={f.grp} onChange={(e) => upd("grp", e.target.value)} options={D.groups} />
    </Sheet>
  </A.Page>;
}
window.AG_SCREENS["AG-07"] = { id: "AG-07", name: "Stall", route: "/admin/spillere", Component: AG07 };
})();
