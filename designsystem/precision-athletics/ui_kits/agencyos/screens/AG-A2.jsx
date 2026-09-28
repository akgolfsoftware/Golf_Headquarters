(() => {
const AG = window.AGQ, AGX = window.AGA || {};
const T = () => window.TR_DATA.coach, A = () => window.AGQ, X = () => window.AGA;

/* AG-A05 · Datakvalitet */
function AA05({ state, go, nav }) {
  const { DataTable, StatusPill, Button, InlineAlert, EmptyAnalysisState, SourceBadge } = A().ns();
  const { Card, Head, toast } = A();
  const [rows, setRows] = React.useState(T().imports);
  const tone = { "Importert": "ok", "Til kontroll": "info", "Feilet": "signal", "Mulig dublett": "warn" };
  const set = (id, status) => { const before = rows; setRows((l) => l.map((r) => r.id === id ? { ...r, status } : r)); nav && nav.undo(status === "Importert" ? "Godkjent" : status, "KAN ANGRES I 8 SEKUNDER", () => setRows(before)); };
  const act = (r) => r.status === "Feilet" ? <Button size="sm" variant="secondary" icon="refresh-cw" onClick={() => { toast("Prøver igjen", r.src.toUpperCase()); set(r.id, "Importert"); }}>Prøv igjen</Button>
    : r.status === "Til kontroll" ? <Button size="sm" variant="secondary" icon="check" onClick={() => set(r.id, "Importert")}>Godkjenn</Button>
    : r.status === "Mulig dublett" ? <Button size="sm" variant="secondary" icon="merge" onClick={() => set(r.id, "Importert")}>Slå sammen</Button> : null;
  const bad = rows.filter((r) => r.status !== "Importert").length;
  return <AGX.Frame id="AG-A05" title="Datakvalitet" sub="Importstatus, manuell data til kontroll, dubletter og manglende kilder." go={go} state={state} loading="Sjekker importer …" period={false}
    empty={<EmptyAnalysisState title="Ingen importer ennå" text="Koble TrackMan og GolfBox i Oppsett for å få data inn automatisk." action="Åpne Oppsett" onAction={() => go("AG-23")} />}>
    {bad > 0 ? <InlineAlert tone="warn" title={bad + " importer trenger deg"}>Tallene fra disse brukes ikke i analysen før de er godkjent eller rettet.</InlineAlert> : <InlineAlert tone="info" title="Alt er importert">Ingen importer venter.</InlineAlert>}
    <Card><Head k="Importer siste 7 dager" aside={<SourceBadge source="TrackMan, GolfBox, manuell" date="26.09.2026" n={rows.length} unit="importer" />} />
      <DataTable caption="Importer" rowKey="id" columns={[{ key: "src", label: "Kilde" }, { key: "what", label: "Hva" }, { key: "status", label: "Status", render: (r) => <StatusPill tone={tone[r.status]}>{r.status}</StatusPill> }, { key: "date", label: "Tid", mono: true, render: (r) => r.err ? r.date + " · " + r.err : r.date }, { key: "a", label: "", render: act }]} rows={rows} />
    </Card>
    <Card><Head k="Manglende kilder" /><ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, font: "var(--type-body-s)" }}><li>Henrik Dahl — ingen økter siden 02.09.2026</li><li>Jonas Berg — TrackMan ikke koblet</li><li>3 spillere i Talent U18 uten tester i sesongen</li></ul></Card>
  </AGX.Frame>;
}
X().reg("AG-A05", "Datakvalitet", AA05);

/* AG-A06 · Tiltaksverksted: analyse → forslag → rediger → publiser */
function AA06({ state, go, nav }) {
  const { DataTable, StatusPill, Button, Sheet, FormField, Select, ActionBar, ConfirmDialog, EmptyAnalysisState, InlineAlert } = A().ns();
  const { Card, Head, toast, useW } = A(), { mob } = useW();
  const [rows, setRows] = React.useState(T().actions), [ed, setEd] = React.useState(null), [txt, setTxt] = React.useState(""), [conf, setConf] = React.useState(false), [st, setSt] = React.useState("idle");
  const open = (r) => { setEd(r); setTxt(r.draft); setSt("idle"); };
  const change = (v) => { setTxt(v); setSt("dirty"); nav && nav.setDirty(true); };
  const close = () => { if (st === "dirty") { setConf("unsaved"); return; } setEd(null); };
  const save = (status) => { setRows((l) => l.map((r) => r.id === ed.id ? { ...r, draft: txt, status } : r)); nav && nav.setDirty(false); setSt("saved"); };
  const ta = { width: "100%", boxSizing: "border-box", minHeight: 120, padding: 12, borderRadius: 8, border: "1px solid var(--border-control)", font: "var(--type-body)", background: "var(--surface-card)", color: "var(--text-primary)", resize: "vertical" };
  return <AGX.Frame id="AG-A06" title="Tiltaksverksted" sub="Fra analyse til handling. Caddie lager utkast, du redigerer og publiserer til spiller eller gruppe." go={go} state={state} loading="Henter forslag …" period={false}
    empty={<EmptyAnalysisState title="Ingen tiltak ennå" text="Lag et tiltak fra Innsikt, eller be Caddie foreslå ut fra siste fire uker." action="Be Caddie foreslå" actionIcon="sparkles" onAction={() => go("AG-A08")} />}>
    <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: 8 }}>{["1 · Analyse", "2 · Forslag", "3 · Rediger", "4 · Publiser"].map((s) => <li key={s} style={{ font: "var(--type-meta)", letterSpacing: ".04em", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--border-hairline)" }}>{s}</li>)}</ol>
    <Card><DataTable caption="Tiltak" rowKey="id" columns={[{ key: "player", label: "Gjelder" }, { key: "from", label: "Fra analyse" }, { key: "draft", label: "Tiltak" }, { key: "status", label: "Status", render: (r) => <StatusPill tone={r.status === "Publisert" ? "ok" : "neutral"}>{r.status}</StatusPill> }, { key: "by", label: "Laget av" }, { key: "tg", label: "Legges i", render: (r) => r.target ? <Button size="sm" variant="ghost" icon={r.target === "AG-WB-TURN" ? "trophy" : "dumbbell"} onClick={(e) => { e.stopPropagation(); go(r.target); }}>{r.target === "AG-WB-TURN" ? "Turneringsplan" : "Fysisk plan"}</Button> : "Workbench uke" }, { key: "a", label: "", render: (r) => r.status !== "Publisert" ? <Button size="sm" variant="secondary" icon="pencil" onClick={(e) => { e.stopPropagation(); open(r); }}>Rediger</Button> : <Button size="sm" variant="ghost" icon="undo-2" onClick={(e) => { e.stopPropagation(); setConf({ withdraw: r }); }}>Trekk tilbake</Button> }]} rows={rows} onSelect={(k, r) => r.status !== "Publisert" && open(r)} /></Card>
    <Sheet open={!!ed} onClose={close} kicker={ed ? "Tiltak · " + ed.player : ""} title="Rediger tiltak" footer={<ActionBar status={st} statusMeta={st === "saved" ? "14:02" : undefined} secondary={<><Button variant="ghost" onClick={close}>Avbryt</Button><Button variant="secondary" onClick={() => { save("Utkast"); toast("Utkastet er lagret", "IKKE SENDT"); }}>Lagre utkast</Button></>} primary={<Button icon="send" onClick={() => setConf("publish")}>Lagre og publiser</Button>} />}>
      {ed && <><InlineAlert tone="info" title={"Fra analyse: " + ed.from}>Endringen går til {ed.player}. Ingenting sendes før du publiserer.</InlineAlert>
        <FormField label="Tiltak"><textarea aria-label="Tiltak" style={ta} value={txt} onChange={(e) => change(e.target.value)} /></FormField>
        <Select label="Gjelder fra" value="Uke 40" onChange={() => change(txt)} options={["Uke 40", "Uke 41", "Neste periode"]} /></>}
    </Sheet>
    <ConfirmDialog open={conf === "publish"} kind="publish" title={"Publisere til " + (ed ? ed.player : "") + "?"} consequences={["Planen for uke 40 endres i Workbench.", "Spilleren får varsel. Forelder får kopi under 18 år.", "Kan trekkes tilbake etterpå."]} onCancel={() => setConf(false)} onConfirm={() => { save("Publisert"); setConf(false); setEd(null); nav && nav.undo("Tiltaket er publisert", "SENDT TIL " + (ed ? ed.player.toUpperCase() : ""), () => setRows(T().actions)); }} />
    <ConfirmDialog open={conf === "unsaved"} kind="unsaved" onCancel={() => setConf(false)} onSecondary={() => { nav && nav.setDirty(false); setConf(false); setEd(null); }} onConfirm={() => { save("Utkast"); setConf(false); setEd(null); }} />
    <ConfirmDialog open={!!(conf && conf.withdraw)} kind="destructive" title="Trekke tilbake tiltaket?" confirmLabel="Trekk tilbake" consequences={["Planendringen fjernes fra Workbench.", "Spilleren får beskjed om at tiltaket er trukket."]} onCancel={() => setConf(false)} onConfirm={() => { const r = conf.withdraw; setRows((l) => l.map((x) => x.id === r.id ? { ...x, status: "Trukket tilbake" } : x)); setConf(false); nav && nav.undo("Tiltaket er trukket tilbake", "KAN ANGRES I 8 SEKUNDER", () => setRows((l) => l.map((x) => x.id === r.id ? { ...x, status: "Publisert" } : x))); }} />
  </AGX.Frame>;
}
X().reg("AG-A06", "Tiltaksverksted", AA06);

/* AG-A07 · Rapportbygger */
function AA07({ state, go, nav }) {
  const { Segmented, Select, Switch, SortableList, MoveSheet, Button, ActionBar, Checkbox, EmptyAnalysisState } = A().ns();
  const { Card, Head, toast, useW } = A(), { desk } = useW();
  const [rec, setRec] = React.useState("Spiller"), [anon, setAnon] = React.useState(false), [st, setSt] = React.useState("idle"), [mv, setMv] = React.useState(null), [to, setTo] = React.useState(null);
  const [secs, setSecs] = React.useState([{ id: "s1", label: "Sammendrag", on: true }, { id: "s2", label: "Belastning og volum", on: true }, { id: "s3", label: "Strokes Gained", on: true }, { id: "s4", label: "TrackMan", on: false }, { id: "s5", label: "Tester", on: true }, { id: "s6", label: "Tiltak neste periode", on: true }]);
  const dirty = () => { setSt("dirty"); nav && nav.setDirty(true); };
  const reorder = (ids) => { const before = secs; setSecs(ids.map((id) => secs.find((s) => s.id === id))); dirty(); nav && nav.undo("Rekkefølgen er endret", "KAN ANGRES I 8 SEKUNDER", () => setSecs(before)); };
  const on = secs.filter((s) => s.on);
  return <AGX.Frame id="AG-A07" title="Rapportbygger" sub="Periode, mottaker og innhold. Forhåndsvis før du sender som utkast eller eksporterer." go={go} state={state} loading="Henter rapportmal …"
    actions={<ActionBar status={st} secondary={<Button variant="secondary" icon="download" onClick={() => toast("Eksporterer PDF", "RAPPORT UKE 36–39")}>Eksporter PDF</Button>} primary={<Button icon="send" onClick={() => { setSt("saved"); nav && nav.setDirty(false); toast("Sendt som utkast", "MOTTAKER GODKJENNER IKKE · DU SENDER ENDELIG"); }}>Send som utkast</Button>} />}
    empty={<EmptyAnalysisState title="Ingen data i perioden" text="Rapporten trenger minst én registrert økt eller runde." action="Velg annen periode" onAction={() => toast("Velg periode over", "")} />}>
    <AG.Cols tpl={desk ? "minmax(0,1fr) minmax(0,1.2fr)" : "minmax(0,1fr)"}>
      <AG.Stack>
        <Card><Head k="Mottaker" /><Segmented options={["Spiller", "Forelder", "Gruppe"]} value={rec} onChange={(v) => { setRec(v); setAnon(v === "Gruppe"); dirty(); }} />
          <Select label={rec === "Gruppe" ? "Gruppe" : "Spiller"} value={rec === "Gruppe" ? "Talent U16" : "Tobias Lindvik"} onChange={dirty} options={rec === "Gruppe" ? ["Elite", "Talent U18", "Talent U16"] : ["Tobias Lindvik", "Emma Solberg", "Sara Nilsen"]} />
          <Switch checked={anon} onChange={(e) => { setAnon(e.target.checked); dirty(); }} label="Anonymiser enkeltspillere" />
          {rec === "Gruppe" && <AG.Meta>GRUPPERAPPORT VISER BARE SNITT · INGEN RANGERING</AG.Meta>}
        </Card>
        <Card><Head k="Innhold og rekkefølge" aside={<AG.Meta>DRA, PILTASTER ELLER FLYTT</AG.Meta>} />
          <SortableList label="Seksjoner i rapporten" items={secs} onReorder={reorder} onMove={(it) => { setMv(it); setTo(null); }} renderItem={(s, c) => <div style={{ display: "flex", alignItems: "center", gap: 4, minHeight: 52, borderTop: c.index ? "1px solid var(--border-hairline)" : "none", background: c.dragging ? "var(--surface-sunken)" : "transparent" }}>{c.handle}<span style={{ flex: 1, minWidth: 0 }}><Checkbox checked={s.on} onChange={(e) => { setSecs((l) => l.map((x) => x.id === s.id ? { ...x, on: e.target.checked } : x)); dirty(); }} label={s.label} /></span>{c.moveButton}</div>} />
        </Card>
      </AG.Stack>
      <Card><Head k="Forhåndsvisning" aside={<AG.Meta>UKE 36–39 · {rec.toUpperCase()}</AG.Meta>} />
        <div style={{ border: "1px solid var(--border-hairline)", borderRadius: 8, padding: 20, display: "flex", flexDirection: "column", gap: 14, background: "var(--surface-page)" }}>
          <span className="kicker">AK Golf · Rapport</span><h3 style={{ margin: 0, font: "var(--type-title-m)" }}>{rec === "Gruppe" ? "Talent U16" : anon ? "Spiller A" : "Tobias Lindvik"} · uke 36–39</h3>
          {on.map((s, i) => <div key={s.id} style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 10, borderTop: "1px solid var(--border-hairline)" }}><span style={{ font: "600 14px/1.3 var(--font-sans)" }}>{i + 1}. {s.label}</span><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{s.id === "s3" ? "SG totalt −0,6 · 6 runder · GolfBox 20.09.2026" : s.id === "s2" ? "540 min uke 39 mot plan 420 · ACWR 1,42" : s.id === "s6" ? "Lettere uke 40 før turnering 03.10 — utkast" : "Tekst og tall hentes fra perioden."}</span></div>)}
          {!on.length && <AG.Meta>— INGEN SEKSJONER VALGT</AG.Meta>}
        </div>
      </Card>
    </AG.Cols>
    <MoveSheet open={!!mv} onClose={() => setMv(null)} item={mv && mv.label} title="Ny plass i rapporten" targets={secs.map((s, i) => ({ id: String(i), label: "Plass " + (i + 1), meta: s.id === (mv && mv.id) ? "NÅVÆRENDE" : "FØR «" + s.label.toUpperCase() + "»", disabled: mv && s.id === mv.id }))} value={to} onChange={setTo} onConfirm={() => { const ids = secs.map((s) => s.id).filter((id) => id !== mv.id); ids.splice(+to, 0, mv.id); reorder(ids); setMv(null); }} />
  </AGX.Frame>;
}
X().reg("AG-A07", "Rapportbygger", AA07);

/* AG-A08 · Caddie/Jarvis-forslag med kilder og konsekvens */
function AA08({ state, go, nav }) {
  const { Button, StatusPill, SourceBadge, EmptyAnalysisState, ConfirmDialog, InlineAlert } = A().ns();
  const { Card, toast, useW } = A(), { desk } = useW();
  const [rows, setRows] = React.useState(T().caddie.map((c) => ({ ...c, st: "Venter" }))), [ok, setOk] = React.useState(null);
  const setS = (id, st) => { const before = rows; setRows((l) => l.map((r) => r.id === id ? { ...r, st } : r)); nav && nav.undo(st === "Avvist" ? "Forslaget er avvist" : "Forslaget er godkjent", st === "Avvist" ? "CADDIE LÆRER AV AVVISNINGEN" : "UTFØRES NÅ", () => setRows(before)); };
  return <AGX.Frame id="AG-A08" title="Caddie-forslag" sub="Forslag fra analysen med kilde og konsekvens. Ingenting utføres før du godkjenner." go={go} state={state} loading="Caddie går gjennom siste fire uker …" period={false}
    empty={<EmptyAnalysisState title="Ingen forslag nå" text="Caddie foreslår når data viser et avvik. Siste gjennomgang 26.09.2026 06:00." action="Be om ny gjennomgang" actionIcon="sparkles" onAction={() => toast("Caddie går gjennom stallen", "SVAR INNEN 2 MIN")} />}>
    <InlineAlert tone="info" title="Du godkjenner alt">Caddie og Jarvis lager bare utkast. Godkjenn, rediger i Tiltak, eller avvis.</InlineAlert>
    <div style={{ display: "grid", gridTemplateColumns: desk ? "repeat(3,minmax(0,1fr))" : "minmax(0,1fr)", gap: 12 }}>{rows.map((r) => <Card key={r.id}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><StatusPill tone="neutral">Utkast fra Caddie</StatusPill>{r.st !== "Venter" && <StatusPill tone={r.st === "Godkjent" ? "ok" : "neutral"}>{r.st}</StatusPill>}</div>
      <h3 style={{ margin: 0, font: "var(--type-title-s)", textWrap: "pretty" }}>{r.title}</h3>
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}><b>Hvorfor:</b> {r.why}</p>
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}><b>Konsekvens:</b> {r.effect}</p>
      <SourceBadge source={r.src} kind="caddie" />
      {r.st === "Venter" && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" icon="check" onClick={() => setOk(r)}>Godkjenn</Button><Button size="sm" variant="secondary" icon="pencil" onClick={() => go("AG-A06")}>Rediger</Button><Button size="sm" variant="ghost" icon="x" onClick={() => setS(r.id, "Avvist")}>Avvis</Button></div>}
    </Card>)}</div>
    <ConfirmDialog open={!!ok} kind="publish" title="Godkjenne forslaget?" confirmLabel="Godkjenn og utfør" consequences={ok ? [ok.effect] : []} onCancel={() => setOk(null)} onConfirm={() => { setS(ok.id, "Godkjent"); setOk(null); }} />
  </AGX.Frame>;
}
X().reg("AG-A08", "Caddie-forslag", AA08);
})();
