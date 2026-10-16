(() => {
const AG = window.AGQ;
const kg = (v) => v == null ? "—" : String(v).replace(".", ",") + " kg";
const n0 = (v) => v == null ? "—" : String(v);
const ton = (v) => v == null ? "—" : String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kg";
const exTon = (e) => e.sets && e.reps && e.kg ? e.sets * e.reps * e.kg : 0;
const KIND = { Styrke: "dumbbell", Kondisjon: "heart-pulse", Bevegelighet: "move-diagonal" };

/* AG-WB-FYS · Fysisk plan i Workbench. Blokk → uker → økter → øvelser. Samme motor i PlayerHQ (PH-WB-FYS, lesbar og gjennomførbar). */
function AGWBFYS({ state, go, nav }) {
  const { PageHeader, Button, IconButton, StatusPill, EmptyState, DataTable, KeyValue, Sheet, Stepper, FormField, TextInput, Select, InlineAlert, ActionBar, ConfirmDialog, MoveSheet, ConflictSheet, DropZone, DataQualityBadge, SourceBadge, ChoicePill, Icon, Segmented } = AG.ns();
  const { Card, Head, Meta, useW, toast } = AG, { mob, desk, wide } = useW(), D = window.WB_DATA, F = D.fys, empty = state === "tom";
  const [who, setWho] = React.useState("Tobias Lindvik"), [mode, setMode] = React.useState("Spiller"), [scope, setScope] = React.useState("Uke"), [wd, setWd] = React.useState(false), [addS, setAddS] = React.useState(false);
  const [blk, setBlk] = React.useState("b1"), [wk, setWk] = React.useState(40), [ses, setSes] = React.useState(F.sessions), [sel, setSel] = React.useState("f1");
  const [st, setSt] = React.useState("idle"), [pub, setPub] = React.useState(false), [sent, setSent] = React.useState(false), [addEx, setAddEx] = React.useState(false), [mv, setMv] = React.useState(null), [mvTo, setMvTo] = React.useState(null), [cf, setCf] = React.useState(null), [newBlk, setNewBlk] = React.useState(false), [drag, setDrag] = React.useState(null);
  const B = F.blocks.find((b) => b.id === blk), cur = ses.find((s) => s.id === sel), W = F.weeks.find((x) => x.w === wk);
  const dirty = () => { setSt("dirty"); nav && nav.setDirty(true); };
  const snap = (msg, meta) => { const before = ses; nav && nav.undo(msg, meta, () => setSes(before)); };
  const upd = (id, patch) => { setSes((l) => l.map((s) => s.id !== sel ? s : { ...s, ex: s.ex.map((e) => e.id === id ? { ...e, ...patch } : e) })); dirty(); };
  const moveTo = (id, day, force) => { const s = ses.find((x) => x.id === id); if (!s || s.day === day) return;
    if (!force && (day === 3 || day === 1)) { setCf({ id, day, items: [day === 3 ? { kind: "kalender", text: D.days[day] + " er reisedag til Larvik (avreise 15:00).", meta: "TURNERING · REISE" } : { kind: "belastning", text: D.days[day] + ": heldagsprøve i matematikk. Tung styrke gir dårlig restitusjon.", meta: "SKOLE · FORELDER" }] }); return; }
    if (!force && day >= 5) { setCf({ id, day, items: [{ kind: "kalender", text: D.days[day] + " er turneringsdag (Srixon Tour, Larvik).", meta: "WORKBENCH · TURNERING" }, { kind: "belastning", text: "Tung styrke dagen før eller under turnering gir dårligere restitusjon.", meta: "PLANMOTOR · FYS" }] }); return; }
    snap("Fysisk økt flyttet", (s.name + " → " + D.days[day]).toUpperCase()); setSes((l) => l.map((x) => x.id === id ? { ...x, day } : x)); dirty(); };
  const progress = () => { snap("Progresjon lagt inn", "+2,5 KG PER UKE PÅ HOVEDLØFT · UKE 41–42"); toast("Progresjon lagt inn", "+2,5 KG / UKE · DELOAD UKE 43 −40 %"); dirty(); };
  const copyWeek = () => { snap("Uke " + wk + " kopiert til uke " + (wk + 1), ses.length + " ØKTER"); toast("Uke " + wk + " kopiert", "TIL UKE " + (wk + 1) + " · SAMME DAGER"); };
  const save = (partial) => { setSt("saving"); setTimeout(() => { setSt("saved"); nav && nav.setDirty(false); toast(partial ? "Delvis lagret" : "Lagret", partial ? "KAN FULLFØRES SENERE · IKKE PUBLISERT" : "IKKE PUBLISERT"); }, 400); };
  const exCols = [
    { key: "n", label: "Øvelse", render: (e) => <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "500 14px/1.3 var(--font-sans)" }}>{e.n}</span><Meta>{e.area.toUpperCase()}{e.tempo ? " · TEMPO " + e.tempo : ""}</Meta></span> },
    ...(cur && cur.kind === "Kondisjon" ? [{ key: "dur", label: "Varighet", mono: true, align: "right", render: (e) => e.dur == null ? "—" : e.dur + " min" }, { key: "zone", label: "Intensitet" }] : [
      { key: "sets", label: "Serier", mono: true, align: "right", render: (e) => n0(e.sets) }, { key: "reps", label: "Reps", mono: true, align: "right", render: (e) => n0(e.reps) },
      { key: "kg", label: "Kg", mono: true, align: "right", render: (e) => kg(e.kg) }, { key: "rir", label: "RIR", mono: true, align: "right", render: (e) => n0(e.rir) }, { key: "rest", label: "Hvile", mono: true, align: "right", render: (e) => e.rest || "—" }])
  ];
  const card = (s) => <div key={s.id} draggable={desk} onDragStart={(e) => { e.dataTransfer.setData("application/x-ak-fys", s.id); setDrag(s.id); }} onDragEnd={() => setDrag(null)} style={{ position: "relative", display: "flex", alignItems: "stretch", borderRadius: "var(--radius-inner)", border: "1px solid " + (s.id === sel ? "var(--border-ink)" : "var(--border-hairline)"), background: "var(--surface-card)", opacity: drag === s.id ? .45 : 1, minWidth: 0, overflow: "hidden" }}>
    <span aria-hidden="true" style={{ width: 4, background: "var(--axis-fys)", flex: "none" }}></span>
    <button type="button" onClick={() => setSel(s.id)} style={{ all: "unset", cursor: "pointer", flex: 1, minWidth: 0, padding: "8px 8px 8px 10px", display: "flex", flexDirection: "column", gap: 4, minHeight: 44 }}>
      <span style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", font: "500 11px/1.2 var(--font-mono)", color: "var(--text-secondary)" }}><Icon name={KIND[s.kind]} size={14} />{s.t + " · " + s.min + " MIN"}</span>
      <span style={{ font: "500 13px/1.25 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{s.name}</span>
    </button>
    <IconButton icon="move" label={"Flytt " + s.name} onClick={() => { setMv(s); setMvTo(null); }} />
  </div>;
  const board = <div style={{ display: "grid", gridTemplateColumns: mob ? "minmax(0,1fr)" : wide ? "repeat(7,minmax(0,1fr))" : "repeat(auto-fill,minmax(160px,1fr))", gap: mob ? 8 : 6 }}>{D.days.map((d, di) => { const items = ses.filter((s) => s.day === di);
    return <DropZone key={di} label={d} accept={["application/x-ak-fys"]} valid={di < 5 || !drag} reason="TURNERINGSDAG" onDrop={(id) => moveTo(id, di)} minHeight={mob ? 44 : 140} empty="—">
      <span style={{ font: "600 12px/1 var(--font-mono)", color: di >= 5 ? "var(--text-muted)" : "var(--text-primary)", display: "flex", justifyContent: "space-between", gap: 4 }}><span>{d.toUpperCase()}</span>{di >= 5 && <span>TURN</span>}</span>
      {items.map(card)}
    </DropZone>; })}</div>;
  const inspector = cur ? <Card><Head k={"Økt · " + D.days[cur.day] + " · " + cur.t} aside={<StatusPill>{cur.kind}</StatusPill>} />
    <div style={{ font: "var(--type-title-s)", color: "var(--text-primary)" }}>{cur.name}</div>
    <Meta>FRA BLOKK «{B.name.toUpperCase()}» · UKE {wk} AV {B.weeks.length}{W.tag ? " · " + W.tag.toUpperCase() : ""}</Meta>
    <DataTable caption="Øvelser" rowKey="id" columns={exCols} rows={cur.ex} />
    {cur.kind === "Styrke" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{cur.ex.slice(0, 2).map((e) => <div key={e.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 6, paddingTop: 8, borderTop: "1px solid var(--border-hairline)" }}>
      <span style={{ font: "500 13px/1.3 var(--font-sans)" }}>{e.n}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}><Stepper label="Serier" value={e.sets} min={1} max={8} onChange={(v) => upd(e.id, { sets: v })} /><Stepper label="Reps" value={e.reps} min={1} max={20} onChange={(v) => upd(e.id, { reps: v })} /><Stepper label="Kg" value={e.kg} min={0} max={200} step={2.5} onChange={(v) => upd(e.id, { kg: v })} /></div>
    </div>)}<Meta>SETT, REPS OG KG ENDRES MED STEPPER — ALDRI MED DRA</Meta></div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,140px),1fr))", gap: 8 }}><Button variant="secondary" icon="plus" onClick={() => setAddEx(true)}>Legg til øvelse</Button><Button variant="secondary" icon="trending-up" onClick={progress}>Juster progresjon</Button><Button variant="secondary" icon="copy" onClick={copyWeek}>Kopier uke</Button><Button variant="ghost" icon="move" onClick={() => { setMv(cur); setMvTo(null); }}>Flytt økt</Button></div>
  <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}><span className="kicker">Belastning og respons</span>
      <KeyValue columns={2} items={[["ACWR", String(F.load.acwr).replace(".", ","), { hint: F.load.src }], ["Uke " + wk, W.planMin + " min plan"], ["Siste RPE", String(F.response.rpe), { hint: F.response.date }], ["Dagsform", F.response.form + " / 5"]]} />
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>«{F.response.note}»</p></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}><span className="kicker" style={{ paddingBottom: 6 }}>Historikk</span>{F.history.map((h) => <div key={h.t} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 0", borderTop: "1px solid var(--border-hairline)" }}><span style={{ font: "var(--type-body-s)" }}>{h.what}</span><Meta>{h.by.toUpperCase()} · {h.t}</Meta></div>)}</div>
    {cur.kind === "Kondisjon" && <KeyValue items={[["Mål", F.cond.goal, { mono: false }], ["Sone", F.cond.zone, { mono: false }]]} />}
  </Card> : null;
  const L = F.last, lt = (r, p) => r[p + "s"] && r[p + "r"] && r[p + "k"] ? r[p + "s"] * r[p + "r"] * r[p + "k"] : null;
  const tp = L.rows.reduce((a, r) => a + (lt(r, "p") || 0), 0), td = L.rows.some((r) => r.ds == null) ? null : L.rows.reduce((a, r) => a + (lt(r, "d") || 0), 0), tdPart = L.rows.reduce((a, r) => a + (lt(r, "d") || 0), 0);
  return <AG.Page max={1440}>
    <PageHeader kicker={"Workbench · Fysisk plan · " + who} title="Fysisk plan" meta={<span style={{ display: "inline-flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><StatusPill tone={sent ? "ok" : st === "saved" ? "info" : F.status[blk] === "Endret etter publisering" ? "warn" : "neutral"}>{sent ? "Publisert" : st === "saved" ? "Delvis lagret" : F.status[blk]}</StatusPill><span>{B.src}</span></span>}
      actions={<><Button variant="secondary" icon="plus" onClick={() => setNewBlk(true)}>Legg til fysisk blokk</Button>{sent ? <Button variant="secondary" icon="undo-2" onClick={() => setWd(true)}>Trekk tilbake</Button> : <Button icon="send" disabled={state !== "data"} onClick={() => setPub(true)}>Publiser til spiller</Button>}</>} />
    <AG.Gate state={state} loading="Henter fysisk plan …" error={{ title: "Den fysiske planen kunne ikke hentes", text: "Ingen økter er endret. Endringer du gjorde er lagret lokalt.", code: "FEIL 503 · WORKBENCH · FYS" }}>
      {empty ? <EmptyState icon="dumbbell" title="Ingen fysisk plan ennå" text="Lag en blokk med mål, uker og økter. Øktene legges i ukeplanen som FYS og kobles til blokken." action="Legg til fysisk blokk" actionIcon="plus" onAction={() => setNewBlk(true)} secondary="La Caddie foreslå" onSecondary={() => toast("Caddie lager et utkast", "DU GODKJENNER FØR NOE PUBLISERES")} /> : <>
      <div role="tablist" aria-label="Blokker" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{F.blocks.map((b) => <ChoicePill key={b.id} role="tab" aria-selected={blk === b.id} selected={blk === b.id} onClick={() => setBlk(b.id)}>{b.name + " · uke " + b.weeks[0] + "–" + b.weeks[b.weeks.length - 1]}</ChoicePill>)}</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "0 1 auto" }}><Segmented options={["Spiller", "Gruppe"]} value={mode} onChange={setMode} /></div>
        <div style={{ flex: "1 1 220px", minWidth: 0, maxWidth: 320 }}><Select label={mode === "Gruppe" ? "Gruppe" : "Spiller"} value={who} onChange={(e) => setWho(e.target.value)} options={mode === "Gruppe" ? D.groups : D.players} /></div>
        <div style={{ flex: "0 1 auto" }}><Segmented options={["Uke", "6-ukers blokk", "Sesong"]} value={scope} onChange={setScope} /></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}><Button variant="secondary" icon="calendar-plus" onClick={() => { snap("Uke lagt til", "UKE " + (B.weeks[B.weeks.length - 1] + 1) + " · TOM"); dirty(); }}>Legg til uke</Button><Button variant="secondary" icon="plus" onClick={() => setAddS(true)}>Legg til økt</Button></div>
      </div>
      {mode === "Gruppe" && <InlineAlert tone="info" title="Gruppemodus">Felles program for gruppen. Kg settes per spiller fra siste test. Individuelle endringer beholdes.</InlineAlert>}
      {F.status[blk] === "Endret etter publisering" && !sent && <InlineAlert tone="warn" title="Endret etter publisering">Tobias ser fortsatt versjonen fra 21.09. Publiser på nytt for å sende endringene ({F.changedAt}).</InlineAlert>}
      <AG.Cols tpl={desk ? "minmax(0,1fr) minmax(0,1.4fr)" : "minmax(0,1fr)"}>
        <Card><Head k="Blokk" aside={<SourceBadge source={B.src.split(" · ")[0]} date={B.src.split(" · ").pop()} kind="coach" />} />
          <KeyValue items={[["Mål", B.goal, { mono: false }], ["Uker", B.weeks[0] + "–" + B.weeks[B.weeks.length - 1] + " · " + B.weeks.length + " uker"], ["Deload", B.deload ? "Uke " + B.deload : null], ["Testuke", B.test ? "Uke " + B.test : null], ["Innhold", "Styrke · kondisjon · bevegelighet · skadeforebygging", { mono: false }]]} />
        </Card>
        <Card><Head k="Ukevolum" aside={<Meta>PLAN · GJENNOMFØRT</Meta>} />
          <DataTable caption="Ukevolum" rowKey="w" selected={wk} onSelect={(k) => setWk(k)} columns={[{ key: "w", label: "Uke", mono: true, render: (r) => r.w + (r.tag ? " · " + r.tag : "") }, { key: "planMin", label: "Plan", mono: true, align: "right", render: (r) => r.planMin + " min" }, { key: "planTon", label: "Tonnasje", mono: true, align: "right", render: (r) => ton(r.planTon) }, { key: "doneMin", label: "Faktisk", mono: true, align: "right", render: (r) => r.doneMin == null ? "—" : r.doneMin + " min" }, { key: "doneTon", label: "Faktisk tonnasje", mono: true, align: "right", render: (r) => ton(r.doneTon) }]} rows={F.weeks} />
        </Card>
      </AG.Cols>
      <AG.Cols tpl={wide ? "minmax(0,1fr) 380px" : "minmax(0,1fr)"}>
        <Card><Head k={"Uke " + wk + " · " + ses.length + " fysiske økter"} aside={<Meta>{desk ? "DRA ØKT TIL NY DAG · ELLER FLYTT" : "TRYKK FLYTT"}</Meta>} />{board}
          <Meta>ØKTENE LIGGER OGSÅ I UKEPLANEN SOM FYS OG PEKER HIT</Meta></Card>
        {inspector}
      </AG.Cols>
      <Card><Head k={"Planlagt mot gjennomført · " + L.name + " · " + L.date} aside={<DataQualityBadge level={td == null ? "tynn" : "god"} have={L.rows.filter((r) => r.ds != null).length} need={L.rows.length} unit="øvelser" />} />
        <DataTable caption="Planlagt mot gjennomført" rowKey="n" columns={[{ key: "n", label: "Øvelse" }, { key: "p", label: "Plan", mono: true, align: "right", render: (r) => r.ps + " × " + r.pr + " · " + kg(r.pk) }, { key: "d", label: "Gjennomført", mono: true, align: "right", render: (r) => r.ds == null ? "—" : r.ds + " × " + r.dr + " · " + kg(r.dk) }, { key: "t", label: "Tonnasje", mono: true, align: "right", render: (r) => ton(lt(r, "d")) + " / " + ton(lt(r, "p")) }]} rows={L.rows} />
        <KeyValue columns={mob ? 1 : 4} items={[["Tonnasje", td == null ? ton(tdPart) + " av " + ton(tp) : ton(td), { hint: td == null ? "DELVIS · PALLOF PRESS IKKE REGISTRERT" : null }], ["Minutter", L.min[1] + " av " + L.min[0]], ["RPE", n0(L.rpe)], ["Dagsform", n0(L.form) + " / 5"]]} />
        <SourceBadge source={L.src} date={L.date} kind="okt" />
      </Card>
      <ActionBar sticky={mob} status={st} statusMeta={st === "saved" ? "14:02" : undefined} secondary={<><Button variant="ghost" onClick={() => go("AG-11")}>Avbryt</Button><Button variant="secondary" onClick={() => save(true)}>Lagre delvis</Button></>} primary={<Button icon="check" onClick={() => save(false)}>Lagre</Button>} />
      </>}
    </AG.Gate>
    <MoveSheet open={!!mv} onClose={() => setMv(null)} item={mv && mv.name} title="Flytt fysisk økt" targets={D.days.map((d, i) => ({ id: String(i), label: d, meta: ses.filter((s) => s.day === i).length + " FYS-ØKTER", reason: i >= 5 ? "TURNERINGSDAG · GIR KONFLIKT" : null, warn: i >= 5, disabled: mv && mv.day === i }))} value={mvTo} onChange={setMvTo} note="Spilleren ser endringen når planen publiseres." onConfirm={() => { const m = mv; setMv(null); moveTo(m.id, +mvTo); }} />
    <ConflictSheet open={!!cf} onClose={() => setCf(null)} conflicts={cf ? cf.items : []} options={[{ id: "annen", label: "Velg annen dag", description: "Anbefalt: tirsdag eller onsdag." }, { id: "likevel", label: "Flytt likevel", description: "Konflikten vises i Kø og i spillerens plan." }]} onResolve={(o) => { const c = cf; setCf(null); if (o === "likevel") moveTo(c.id, c.day, true); else { setMv(ses.find((s) => s.id === c.id)); setMvTo(null); } }} />
    <Sheet open={addEx} onClose={() => setAddEx(false)} kicker={cur ? "Legg til øvelse · " + cur.name : ""} title="Ny øvelse" footer={<><Button fullWidth icon="plus" onClick={() => { setAddEx(false); snap("Øvelse lagt til", "SLEDE-SKYV · 3 × 20 M"); dirty(); }}>Legg til</Button><Button variant="ghost" fullWidth onClick={() => setAddEx(false)}>Avbryt</Button></>}>
      <Select label="Øvelse" options={["Slede-skyv", "Hoftehev", "Nordic hamstring", "Face pull", "Intervaller 4 × 4"]} /><Select label="Område" options={["Underkropp", "Overkropp", "Kjerne", "Kondisjon", "Bevegelighet", "Skadeforebygging"]} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,110px),1fr))", gap: 12 }}><FormField label="Serier"><TextInput mono inputMode="numeric" defaultValue="3" /></FormField><FormField label="Reps"><TextInput mono inputMode="numeric" defaultValue="8" /></FormField><FormField label="Kg" optional><TextInput mono inputMode="decimal" placeholder="—" /></FormField><FormField label="RIR" optional><TextInput mono inputMode="numeric" placeholder="—" /></FormField><FormField label="Hvile" optional><TextInput mono placeholder="1:30" /></FormField><FormField label="Varighet / sone" optional><TextInput placeholder="Kondisjon: min og sone" /></FormField></div>
    </Sheet>
    <Sheet open={newBlk} onClose={() => setNewBlk(false)} kicker="Workbench · Fysisk plan" title="Ny fysisk blokk" footer={<><Button fullWidth icon="check" onClick={() => { setNewBlk(false); toast("Blokken er lagt til som utkast", "UKE 50–51 · IKKE PUBLISERT"); }}>Legg til som utkast</Button><Button variant="ghost" fullWidth onClick={() => setNewBlk(false)}>Avbryt</Button></>}>
      <FormField label="Navn"><TextInput defaultValue="Styrke · vedlikehold" /></FormField><FormField label="Mål"><TextInput defaultValue="Holde styrkenivå gjennom vinteren" /></FormField>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,120px),1fr))", gap: 12 }}><Select label="Fra uke" options={["50", "51", "52", "1"]} /><Select label="Antall uker" options={["4", "6", "8"]} /><Select label="Deload" options={["Uke 4", "Ingen"]} /><Select label="Testuke" options={["Siste uke", "Ingen"]} /></div>
      <InlineAlert tone="info" title="Kobles til årsplanen">Blokken legges i perioden «Grunn» og får FYS-økter i ukeplanen. Samlet mengde oppdateres i Workbench År.</InlineAlert>
    </Sheet>
    <ConfirmDialog open={wd} kind="destructive" title="Trekke tilbake den fysiske planen?" confirmLabel="Trekk tilbake" consequences={["Øktene fjernes fra " + who + " sin Plan og I dag.", "Gjennomførte økter og logger beholdes.", "Kan angres i 8 sekunder."]} onCancel={() => setWd(false)} onConfirm={() => { setWd(false); setSent(false); nav && nav.undo("Planen er trukket tilbake", "KAN ANGRES I 8 SEKUNDER", () => setSent(true)); }} />
    <Sheet open={addS} onClose={() => setAddS(false)} kicker={"Uke " + wk + " · " + B.name} title="Ny fysisk økt" footer={<><Button fullWidth icon="plus" onClick={() => { setAddS(false); const before = ses; setSes((l) => [...l, { id: "f" + Date.now(), day: 1, t: "07:00", name: "Kondisjon · intervaller", kind: "Kondisjon", min: 30, src: blk, ex: [{ id: "x" + Date.now(), n: "Intervaller 4 × 4 min", area: "Kondisjon", dur: 30, zone: "Sone 4 · 170–180 slag/min" }] }]); dirty(); nav && nav.undo("Økt lagt til", "TIR 29.09 · 30 MIN", () => setSes(before)); }}>Legg til økt</Button><Button variant="ghost" fullWidth onClick={() => setAddS(false)}>Avbryt</Button></>}>
      <Select label="Type" options={["Styrke", "Kondisjon", "Mobilitet og skadeforebygging"]} /><Select label="Dag" options={D.days.slice(0, 5)} /><div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}><FormField label="Tid"><TextInput mono defaultValue="07:00" /></FormField><FormField label="Varighet (min)"><TextInput mono inputMode="numeric" defaultValue="30" /></FormField></div>
    </Sheet>
    <ConfirmDialog open={pub} kind="publish" title="Publisere fysisk plan til Tobias Lindvik?" consequences={[B.weeks.length + " uker, " + ses.length + " økter i uke " + wk + ".", "Tobias får økter i Plan og I dag. Forelder får kopi under 18 år.", "Kan trekkes tilbake etterpå."]} onCancel={() => setPub(false)} onConfirm={() => { setPub(false); setSent(true); nav ? nav.undo("Fysisk plan publisert", "TIL TOBIAS LINDVIK · KAN TREKKES TILBAKE", () => setSent(false)) : toast("Publisert", ""); }} />
  </AG.Page>;
}
window.AG_SCREENS["AG-WB-FYS"] = { id: "AG-WB-FYS", name: "Workbench · fysisk plan", parent: "AG-11", route: "/admin/workbench/[playerId]?pille=fys", Component: AGWBFYS };
})();
