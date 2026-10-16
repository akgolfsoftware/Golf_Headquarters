(() => {
const ta = { width: "100%", boxSizing: "border-box", minHeight: 220, padding: 12, borderRadius: 8, border: "1px solid var(--border-control)", background: "var(--surface-card)", color: "var(--text-primary)", font: "var(--type-body)", lineHeight: 1.55, resize: "vertical" };
function AG12({ state, go }) {
  const { PageHeader, Button, StatusPill, EmptyState, KeyValue, AxisBadge, Checkbox, FormField, TextInput } = window.AGQ.ns();
  const A = window.AGQ, S = window.AG_DATA2.sheet, { mob, desk } = A.useW(), empty = state === "tom";
  const [drills, setDrills] = React.useState(empty ? [] : S.drills), [note, setNote] = React.useState(empty ? "" : S.note), [saved, setSaved] = React.useState(empty ? null : { text: S.note, by: S.noteBy }), [editing, setEditing] = React.useState(empty);
  const done = drills.filter((d) => d.ok).length;
  const upd = (id, k, v) => setDrills((l) => l.map((d) => d.id === id ? { ...d, [k]: v } : d));
  const save = () => { setSaved({ text: note, by: "Anders Kristiansen · 26.09 " + new Date().toTimeString().slice(0, 5) }); setEditing(false); A.toast("Notatet er lagret", note.split("\n").length + " LINJER · SYNLIG FOR TOBIAS ETTER PUBLISERING"); };
  const info = <A.Card gap={12}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><AxisBadge axis="tek" /><AxisBadge axis="slag" /><span style={{ flex: 1 }}></span><StatusPill tone="ok">{S.status}</StatusPill></div>
    <KeyValue items={[["Spiller", S.who, { mono: false }], ["Tid", S.date + " " + S.t], ["Varighet", S.min + " min"], ["Sted", S.where, { mono: false }], ["Coach", "Anders Kristiansen", { mono: false }], ["Gjennomført", empty ? null : done + " av " + drills.length + " øvelser", { hint: "COACH · 26.09.2026" }], ["Klipp", "1 klipp · Performance Pro", { mono: false }]]} />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" variant="ghost" icon="list-checks" onClick={() => go("AG-10")}>Teknisk plan</Button><Button size="sm" variant="ghost" icon="user-round" onClick={() => go("AG-08")}>Spiller 360</Button></div>
  </A.Card>;
  const list = <A.Card gap={10}><A.Head k="Øvelser og gjennomføring" aside={empty ? "—" : done + " AV " + drills.length + " GJENNOMFØRT"} />
    {drills.length === 0 ? <EmptyState icon="list-plus" title="Ingen øvelser i økta" text="Legg til øvelser fra teknisk plan eller øvelsesbanken før økta starter." action="Åpne Workbench" actionIcon="layers" onAction={() => go("AG-11")} />
      : drills.map((d) => <A.EvCard key={d.id} axes={[d.axis]}>
        <span style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}><span style={{ flex: "1 1 200px", minWidth: 0, font: "600 14px/1.3 var(--font-sans)" }}>{d.name}</span><Checkbox checked={d.ok} onChange={(e) => upd(d.id, "ok", e.target.checked)} label="Gjennomført" /></span>
        <span style={{ display: "grid", gridTemplateColumns: mob ? "minmax(0,1fr)" : "repeat(2,minmax(0,1fr))", gap: 8, paddingTop: 6 }}>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><A.Meta>PLANLAGT</A.Meta><span style={{ font: "var(--type-num-s)" }}>{d.plan}</span></span>
          <FormField label="Gjort"><TextInput mono value={d.done ?? ""} placeholder="—" onChange={(e) => upd(d.id, "done", e.target.value || null)} /></FormField>
        </span>
        <FormField label="Kort merknad" optional><TextInput value={d.note} onChange={(e) => upd(d.id, "note", e.target.value)} /></FormField>
      </A.EvCard>)}
  </A.Card>;
  const noteCard = <A.Card gap={12}><A.Head k="Coachens notat" aside={saved ? saved.by.toUpperCase() : "IKKE LAGRET"} />
    {editing ? <><FormField label="Notat til økta" hint="Flere linjer er lov. Linjeskift og lister beholdes nøyaktig slik du skriver dem."><textarea style={ta} value={note} onChange={(e) => setNote(e.target.value)} placeholder={"Hva gikk bra?\nHva jobber vi med neste gang?"} /></FormField>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button icon="check" disabled={!note.trim()} onClick={save}>Lagre notat</Button>{saved && <Button variant="ghost" onClick={() => { setNote(saved.text); setEditing(false); }}>Avbryt</Button>}</div></>
      : <><div data-note-readback style={{ font: "var(--type-body)", lineHeight: 1.6, color: "var(--text-primary)", whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 14, borderRadius: 8, background: "var(--surface-flat)", border: "1px solid var(--border-hairline)" }}>{saved.text}</div>
        <A.Meta>{saved.text.split("\n").length} LINJER · {saved.text.length} TEGN · VISES I SIN HELHET</A.Meta>
        <div><Button variant="secondary" icon="pencil" onClick={() => { setNote(saved.text); setEditing(true); }}>Rediger notat</Button></div></>}
  </A.Card>;
  return <A.Page>
    <PageHeader kicker={"Øktark · " + S.date} title={S.title} sub={S.who + " · " + S.t + " · " + S.where} actions={<Button variant="secondary" icon="arrow-left" onClick={() => go("AG-05")}>Kalender</Button>} />
    <A.Gate state={state} loading="Henter øktarket …" error={{ title: "Øktarket kunne ikke hentes", text: "Notater du har skrevet er lagret lokalt og sendes når nettet er tilbake.", code: "FEIL 502 · ØKT O13" }}>
      {desk ? <A.Cols tpl="minmax(0,.8fr) minmax(0,1.2fr)"><A.Stack>{info}{noteCard}</A.Stack>{list}</A.Cols> : <A.Stack>{info}{list}{noteCard}</A.Stack>}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-12"] = { id: "AG-12", parent: "AG-05", name: "Øktark (coach)", route: "/admin/gjennomfore/okter/[id]", Component: AG12 };
})();
