/* AG-04 Innboks — runde 26 (Anders 28.09.2026). Én innboks for alt: e-post fra to kontoer, spillere, godkjenninger og forslag, oppfølging, varsler, sammendrag, leads.
   Haster først, deretter nyeste. Utkast fra Jarvis og AI åpne i raden: Send · Rediger · Forkast. «Ferdig» tar saken ut. Spørsmål fra spiller over 24 t = Haster.
   AG-02 Kø og AG-03 Oppfølgingskø utgår 28.09 og er slått inn her. Jarvis-chatten er egen side (AG-19). */
(() => {
const I = () => window.INBOX;
const haster = (x) => x.f === "Spillere" && x.kind === "Spørsmål" && x.age > 24;
function Item({ x, open, onOpen, onDone, go }) {
  const { Button, StatusPill, Avatar, Icon } = window.AGQ.ns(), A = window.AGQ;
  const [ed, setEd] = React.useState(false), [txt, setTxt] = React.useState(x.draft ? x.draft.text : ""), [gone, setGone] = React.useState(false), [rep, setRep] = React.useState(null);
  const h = haster(x);
  const sub = [x.kind, x.acct, x.grp, x.at].filter(Boolean).join(" · ").toUpperCase();
  return <div role="listitem" style={{ borderTop: "1px solid var(--border-hairline)", minWidth: 0 }}>
    <button type="button" aria-expanded={open} onClick={onOpen} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "grid", gridTemplateColumns: "32px minmax(0,1fr) auto", gap: 12, alignItems: "start", padding: "12px 0", minHeight: 64 }}>
      <Avatar name={x.from} size={32} />
      <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{x.from}</span>{h && <StatusPill tone="warn">Haster</StatusPill>}{x.o && <StatusPill tone="neutral">{x.o}</StatusPill>}{x.draft && <A.Draft>{"Utkast · " + x.draft.by}</A.Draft>}</span>
        <span style={{ font: "500 14px/1.35 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{x.title}</span>
        <A.Meta>{sub}</A.Meta>
      </span>
      <Icon name={open ? "chevron-up" : "chevron-down"} size={16} />
    </button>
    {open && <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 0 14px 44px", minWidth: 0 }}>
      <p style={{ margin: 0, font: "400 14px/1.45 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{x.body}</p>
      {x.meta && <A.Meta>{x.meta}</A.Meta>}
      {x.video && <div><Button variant="secondary" size="sm" icon="play" onClick={() => A.toast("Spiller video", x.from.toUpperCase() + " · " + x.video)}>Se video · {x.video}</Button></div>}
      {x.draft && !gone && <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10, borderTop: "1px dashed var(--border-control)" }}>
        <A.Meta>UTKAST FRA {x.draft.by.toUpperCase()} · SENDES IKKE UTEN TRYKK{x.acct ? " · FRA " + x.acct.toUpperCase() : ""}</A.Meta>
        {ed ? <textarea className="pa-input" rows={4} value={txt} aria-label="Rediger utkast" onChange={(e) => setTxt(e.target.value)} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", font: "var(--type-body)", minHeight: 96, padding: 12 }}></textarea> : <p style={{ margin: 0, font: "400 14px/1.45 var(--font-sans)", color: "var(--text-secondary)", textWrap: "pretty" }}>{txt}</p>}
        {x.note && <A.Meta>{x.note.toUpperCase()}</A.Meta>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" icon="send" onClick={() => { A.toast("Sendt", ("Til " + x.from).toUpperCase()); onDone(); }}>Send</Button><Button size="sm" variant="secondary" icon="pencil" onClick={() => setEd(!ed)}>{ed ? "Ferdig redigert" : "Rediger"}</Button><Button size="sm" variant="ghost" icon="trash-2" onClick={() => { setGone(true); A.toast("Utkastet er forkastet", "SKRIV SELV ELLER MERK FERDIG"); }}>Forkast</Button></div>
      </div>}
      {rep != null && <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10, borderTop: "1px solid var(--border-hairline)" }}>
        <textarea className="pa-input" rows={4} value={rep} aria-label={"Svar til " + x.from} placeholder={"Svar til " + x.from.split(" ")[0]} onChange={(e) => setRep(e.target.value)} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", font: "var(--type-body)", minHeight: 96, padding: 12 }}></textarea>
        <A.Meta>DU SENDER · JARVIS LAGER BARE UTKAST</A.Meta>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" icon="send" disabled={!rep.trim()} onClick={() => { A.toast("Sendt", ("Til " + x.from).toUpperCase()); onDone(); }}>Send</Button><Button size="sm" variant="secondary" icon="sparkles" onClick={() => setRep("Hei " + x.from.split(" ")[0] + ". Takk for meldingen. " + (x.video ? "Hendene er tydelig mer foran enn sist. Hold 50 % fart én uke til før vi øker." : "Jeg ser på det og kommer tilbake i løpet av dagen.") + " Anders")}>Lag utkast</Button><Button size="sm" variant="ghost" onClick={() => setRep(null)}>Avbryt</Button></div>
      </div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(x.actions || []).map((a) => <Button key={a} size="sm" variant={a === "Godkjenn" ? "primary" : "secondary"} onClick={() => { if (a === "Spiller 360") return go("AG-08"); if (a === "Åpne i Workbench") return go("AG-11"); if (a === "Se i kalenderen") return go("AG-05-UKE"); A.toast(a === "Godkjenn" ? "Godkjent" : "Avvist", x.kind === "Ny gruppeøkt" && a === "Godkjenn" ? "LAGT UT TIL BOOKING · VENTELISTA FÅR BESKJED FØRST" : x.title.toUpperCase()); onDone(); }}>{a}</Button>)}
        {(!x.draft || gone) && (x.f === "Spillere" || x.f === "E-post") && rep == null && <Button size="sm" variant="secondary" icon="reply" onClick={() => setRep("")}>Svar</Button>}
        <Button size="sm" variant="ghost" icon="check" onClick={onDone}>Ferdig</Button>
      </div>
    </div>}
  </div>;
}
function AG04({ state, go, f0, hast }) {
  const { PageHeader, ChoicePill, EmptyState, Button } = window.AGQ.ns(), A = window.AGQ, empty = state === "tom";
  const [items, setItems] = React.useState(empty ? [] : hast ? I().items.map((x) => x.id === "i1" ? { ...x, age: 37, at: "Tor 24.09 · 19:40" } : x.id === "i10" ? { ...x, o: "Risiko" } : x) : I().items), [f, setF] = React.useState(f0 || "Alle"), [o, setO] = React.useState(null), [open, setOpen] = React.useState(f0 ? null : "i1");
  const inF = (x) => f === "Alle" || x.f === f;
  const list = items.filter(inF).filter((x) => f !== "Oppfølging" || !o || x.o === o).filter((x) => f === "Oppfølging" || x.o !== "Løst").sort((a, b) => (haster(b) - haster(a)) || a.age - b.age);
  const cnt = (k) => items.filter((x) => (k === "Alle" || x.f === k) && x.o !== "Løst").length;
  const done = (x) => { setItems((l) => l.filter((y) => y.id !== x.id)); A.toast("Ferdig", x.title.slice(0, 40).toUpperCase()); };
  return <A.Page max={1040}>
    <PageHeader kicker={"Innboks · " + I().accounts.join(" · ")} title="Innboks" actions={<Button variant="secondary" icon="sparkles" onClick={() => go("AG-19")}>Jarvis</Button>} />
    <A.Gate state={state} loading="Henter innboksen …" error={{ title: "Innboksen kunne ikke hentes", text: "E-post og meldinger hentes på nytt når du prøver igjen. Ingenting er sendt.", code: "FEIL 503 · INNBOKS · 08:14" }}>
      <div role="group" aria-label="Filter" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{I().filters.map((k) => <ChoicePill key={k} selected={f === k} onClick={() => { setF(k); setO(null); }}>{k + (cnt(k) ? " · " + cnt(k) : "")}</ChoicePill>)}</div>
      {f === "Oppfølging" && <div role="group" aria-label="Oppfølging" style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingLeft: 12, borderLeft: "2px solid var(--border-hairline)" }}>{I().oppf.map((k) => <ChoicePill key={k} selected={o === k} onClick={() => setO(o === k ? null : k)}>{k + " · " + items.filter((x) => x.o === k).length}</ChoicePill>)}</div>}
      {!list.length ? <EmptyState icon="check-check" title="Alt er håndtert." text={f === "Alle" ? "Nye saker fra spillere, e-post, motoren og varsler kommer hit." : "Ingen saker under " + f + (o ? " · " + o : "") + "."} />
        : <section aria-label="Saker" className="pa-card" style={{ padding: "0 16px", minWidth: 0 }}><div role="list" style={{ marginTop: -1 }}>{list.map((x) => <Item key={x.id} x={x} open={open === x.id} onOpen={() => setOpen(open === x.id ? null : x.id)} onDone={() => done(x)} go={go} />)}</div></section>}
      <A.Meta>HASTER FØRST, DERETTER NYESTE · BARE BARE SPØRSMÅL FRA SPILLER UBESVART I 24 T MERKES HASTER · RISIKO ER FILTER UNDER OPPFØLGING · RISIKO ER FILTER UNDER OPPFØLGING · JARVIS-CHATTEN LIGGER I AG-19</A.Meta>
    </A.Gate>
  </A.Page>;
}
const S = window.AG_SCREENS;
S["AG-04"] = { id: "AG-04", name: "Innboks", route: "/admin/innboks", Component: AG04 };
S["AG-04-HASTER"] = { id: "AG-04-HASTER", parent: "AG-04", name: "Innboks · sak som haster (bjella rust)", bellUrgent: true, route: "/admin/innboks", Component: (p) => <AG04 {...p} hast /> };
S["AG-04-OPP"] = { id: "AG-04-OPP", parent: "AG-04", name: "Innboks · Oppfølging", route: "/admin/innboks?filter=oppfolging", Component: (p) => <AG04 {...p} f0="Oppfølging" /> };
S["AG-02"] = { id: "AG-02", parent: "AG-04", name: "Kø · utgår 28.09 → Innboks › Godkjenn", utgar: true, route: "/admin/ko → /admin/innboks?filter=godkjenn", Component: (p) => <AG04 {...p} f0="Godkjenn" /> };
S["AG-03"] = { id: "AG-03", parent: "AG-04", name: "Oppfølgingskø · utgår 28.09 → Innboks › Oppfølging", utgar: true, route: "/admin/queue → /admin/innboks?filter=oppfolging", Component: (p) => <AG04 {...p} f0="Oppfølging" /> };
})();
