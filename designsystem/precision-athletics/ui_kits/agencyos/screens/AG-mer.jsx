/* AgencyOS · Mer — runde 30 (Anders 28.09.2026). Fem punkter: Booking · Grupper · Tester · Økonomi · Oppsett. Jarvis (AG-19) fra hurtigknappen.
   AG-17 → Workbench og Plan · AG-18 → Spiller 360 › Samtaler · AG-21 → Notion via Cockpit · AG-24 → Oppsett. Turneringspåmeldinger bekreftes ikke. */
(() => {
const D = () => window.MER;
const kr = (n) => n == null ? "—" : n.toLocaleString("nb-NO").replace(/ /g, " ") + " kr";
const Sec = ({ k, meta, children, gap = 8 }) => <section aria-label={k} className="pa-card" style={{ padding: 16, gap, minWidth: 0 }}><div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto" }}>{k}</span>{meta != null && React.createElement(window.AGQ.Meta, null, meta)}</div>{children}</section>;
const Row = ({ a, sub, b, i, tpl = "minmax(0,1fr) auto" }) => <div role="listitem" style={{ display: "grid", gridTemplateColumns: tpl, gap: 12, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none", padding: "6px 0", minWidth: 0 }}><span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{a}</span>{sub && React.createElement(window.AGQ.Meta, null, sub)}</span>{b != null && <span style={{ font: "600 13px/1.3 var(--font-mono)", color: "var(--text-primary)", textAlign: "right", display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>{b}</span>}</div>;
const Muted = ({ children }) => <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{children}</p>;

/* ---------- AG-06 Booking ---------- */
const STEPS = ["Spiller", "Tjeneste", "Tid", "Bekreft"];
function AG06({ state, go, nav, ny }) {
  const { PageHeader, Button, ChoicePill, StatusPill, Sheet, EmptyState, SearchField, InlineAlert } = window.AGQ.ns(), A = window.AGQ, { cw } = A.useW(), empty = state === "tom", two = cw >= 1100;
  const [flow, setFlow] = React.useState(!!ny), [st, setSt] = React.useState(0), [pl, setPl] = React.useState(null), [sv, setSv] = React.useState(null), [tm, setTm] = React.useState(null), [q, setQ] = React.useState("");
  const [bk, setBk] = React.useState(empty ? [] : D().bookings), [cancel, setCancel] = React.useState(null);
  const svc = D().services.find((s) => s.id === sv), player = D().players.find((p) => p[0] === pl);
  const reset = () => { setFlow(false); setSt(0); setPl(null); setSv(null); setTm(null); setQ(""); };
  const confirm = () => { setBk([{ id: "n" + Date.now(), who: player[1], svc: svc.name, when: tm[0] + " · " + tm[1], coach: "AK", src: "Coach", st: "Bekreftet", test: svc.kind === "Test" }, ...bk]); A.toast("Booking bekreftet", (player[1] + " · " + svc.name + (svc.kind === "Test" ? " · TESTEN ER TILDELT" : "")).toUpperCase()); reset(); };
  const can = [pl, sv, tm, true][st];
  const flowBody = st === 0 ? <><SearchField value={q} onChange={setQ} placeholder="Søk spiller" /><div role="radiogroup" aria-label="Spiller">{D().players.filter((p) => p[1].toLowerCase().includes(q.toLowerCase())).map((p, i) => <button key={p[0]} type="button" role="radio" aria-checked={pl === p[0]} onClick={() => setPl(p[0])} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: (pl === p[0] ? "600" : "500") + " 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{p[1]}</span><A.Meta>{p[2].toUpperCase()}</A.Meta></span>{pl === p[0] && <StatusPill tone="ok">Valgt</StatusPill>}</button>)}</div></>
    : st === 1 ? <div role="radiogroup" aria-label="Tjeneste">{D().services.map((s, i) => <button key={s.id} type="button" role="radio" aria-checked={sv === s.id} onClick={() => setSv(s.id)} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 56, borderTop: i ? "1px solid var(--border-hairline)" : "none", padding: "4px 0" }}><span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span style={{ font: (sv === s.id ? "600" : "500") + " 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{s.name}</span><A.Meta>{s.kind.toUpperCase()} · {s.min} MIN{s.test ? " · TILDELER TESTEN AUTOMATISK" : ""}</A.Meta></span><span style={{ font: "600 14px/1 var(--font-mono)", color: "var(--text-primary)" }}>{kr(s.price)}</span></button>)}</div>
    : st === 2 ? <div role="radiogroup" aria-label="Tid" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{D().slots.map((x) => <ChoicePill key={x.join()} role="radio" aria-checked={tm === x} selected={tm === x} onClick={() => setTm(x)}>{x[0] + " · " + x[1]}</ChoicePill>)}</div>
    : <><div role="list"><Row i={0} a="Spiller" b={player[1]} /><Row i={1} a="Tjeneste" sub={svc.kind.toUpperCase() + " · " + svc.min + " MIN"} b={svc.name} /><Row i={2} a="Tid" b={tm[0] + " · " + tm[1]} /><Row i={3} a="Pris" sub={D().priceSrc} b={kr(svc.price)} /></div>{svc.test && <InlineAlert tone="info" title="Testen tildeles automatisk">{svc.test} legges i {player[1].split(" ")[0]}s plan og i Tester.</InlineAlert>}</>;
  const list = <Sec k="Bookinger" meta={bk.length ? bk.length + " KOMMENDE" : "INGEN"}>{!bk.length ? <EmptyState icon="calendar-check" title="Ingen bookinger" text="Nye bookinger fra coach og offentlig booking kommer hit." action="Ny booking" actionIcon="plus" onAction={() => setFlow(true)} /> : <div role="list">{bk.map((b, i) => <Row key={b.id} i={i} a={b.who + " · " + b.svc} sub={(b.when + " · " + b.coach + " · " + b.src + (b.test ? " · TEST TILDELT" : "")).toUpperCase()} b={<><StatusPill tone="ok">{b.st}</StatusPill><Button size="sm" variant="ghost" onClick={() => setCancel(b)}>Avlys</Button></>} />)}</div>}<A.Meta>OFFENTLIG BOOKING BEKREFTES AUTOMATISK · COACH KAN AVLYSE</A.Meta></Sec>;
  const svcs = <Sec k="Tjenester og priser" meta={D().priceSrc}><div role="list">{D().services.map((s, i) => <Row key={s.id} i={i} a={s.name} sub={(s.kind + " · " + s.min + " min · " + s.coach).toUpperCase()} b={kr(s.price)} />)}</div><div><Button variant="ghost" size="sm" iconRight="arrow-right" onClick={() => go("AG-23")}>Endre i Oppsett</Button></div></Sec>;
  return <A.Page max={1200}>
    <PageHeader kicker="Mer · Booking" title="Booking" actions={<Button icon="plus" onClick={() => setFlow(true)}>Ny booking</Button>} />
    <A.Gate state={state} loading="Henter bookinger …" error={{ title: "Bookingene kunne ikke hentes", text: "Ingen bookinger er endret. Prøv igjen.", code: "FEIL 503 · BOOKING · 08:20" }}>
      {two ? <A.Cols tpl="minmax(0,1.3fr) minmax(0,1fr)">{list}{svcs}</A.Cols> : <A.Stack>{list}{svcs}</A.Stack>}
    </A.Gate>
    {flow && <Sheet open onClose={reset} kicker={"Ny booking · steg " + (st + 1) + " av 4 · " + STEPS[st]} title={STEPS[st] === "Bekreft" ? "Bekreft booking" : "Velg " + STEPS[st].toLowerCase()} footer={<><Button fullWidth icon={st === 3 ? "check" : "arrow-right"} disabled={!can} onClick={() => st === 3 ? confirm() : setSt(st + 1)}>{st === 3 ? "Bekreft booking" : "Neste"}</Button><Button variant="ghost" fullWidth onClick={() => st ? setSt(st - 1) : reset()}>{st ? "Tilbake" : "Avbryt"}</Button></>}>
      <div role="list" aria-label="Steg" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 4 }}>{STEPS.map((s, i) => <span role="listitem" key={s} aria-current={i === st ? "step" : undefined} style={{ display: "flex", flexDirection: "column", gap: 4 }}><span aria-hidden="true" style={{ height: 3, background: i <= st ? "var(--primary)" : "var(--border-hairline)" }}></span><A.Meta s={{ color: i === st ? "var(--text-primary)" : undefined }}>{s.toUpperCase()}</A.Meta></span>)}</div>
      {flowBody}
    </Sheet>}
    {cancel && <Sheet open onClose={() => setCancel(null)} kicker={cancel.when} title={"Avlyse " + cancel.svc + "?"} footer={<><Button fullWidth variant="signal" icon="x" onClick={() => { const b = cancel; setBk(bk.filter((x) => x.id !== b.id)); setCancel(null); nav && nav.undo ? nav.undo("Bookingen er avlyst", (b.who + " FÅR VARSEL · PUSH ELLER E-POST").toUpperCase(), () => setBk((l) => [b, ...l])) : A.toast("Avlyst", b.who.toUpperCase()); }}>Avlys booking</Button><Button variant="ghost" fullWidth onClick={() => setCancel(null)}>Behold</Button></>}><Muted>{cancel.who} får varsel med en gang. Betalte bookinger refunderes i Stripe.</Muted></Sheet>}
  </A.Page>;
}

/* ---------- AG-16 Grupper ---------- */
function AG16({ state, go }) {
  const { PageHeader, Button, ChoicePill, StatusPill, Sheet, EmptyState, SearchField, Checkbox } = window.AGQ.ns(), A = window.AGQ, { cw } = A.useW(), empty = state === "tom", two = cw >= 1100;
  const [g, setG] = React.useState("g1"), [add, setAdd] = React.useState(false), [q, setQ] = React.useState("Emil"), [pick, setPick] = React.useState(null), [marks, setMarks] = React.useState({}), [asg, setAsg] = React.useState(false);
  const grp = D().groups.find((x) => x.id === g), mem = empty ? [] : D().members[g];
  const hits = D().search.filter((s) => s[0].toLowerCase().includes(q.toLowerCase()));
  const members = <Sec k={"Medlemmer · " + grp.name} meta={mem.length + " SPILLERE · " + grp.coach.toUpperCase()}>{!mem.length ? <Muted>Ingen medlemmer ennå. Søk opp spillere med PlayerHQ og hak av gruppa.</Muted> : <div role="list" style={{ display: "grid", gridTemplateColumns: cw >= 700 ? "repeat(2,minmax(0,1fr))" : "minmax(0,1fr)", columnGap: 16 }}>{mem.map((n, i) => <button key={n} type="button" role="listitem" onClick={() => go("AG-08")} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", minHeight: 44, borderTop: "1px solid var(--border-hairline)", font: "400 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{n}</button>)}</div>}<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" icon="user-plus" onClick={() => setAdd(true)}>Legg til spillere</Button><Button size="sm" variant="secondary" icon="clipboard-check" onClick={() => setAsg(true)}>Tildel test eller TrackMan-økt</Button></div></Sec>;
  const plan = <Sec k="Timeplan og skoledata" meta="GRUPPEPLAN I WORKBENCH"><div role="list"><Row i={0} a="Faste tider" b={grp.times} /><Row i={1} a="Skoledata" sub={grp.school === "—" ? null : "FRA SKOLEN"} b={grp.school === "—" ? "—" : grp.school.split(" · ")[1]} /></div>{grp.school !== "—" && <A.Meta>{grp.school.toUpperCase()}</A.Meta>}<div><Button variant="secondary" size="sm" iconRight="arrow-right" onClick={() => go("AG-11-GRUPPE")}>Åpne gruppeplanen i Workbench</Button></div></Sec>;
  const tild = <Sec k="Tildelt gruppa" meta={empty ? "INGEN" : D().assign.length + " TILDELT"}>{empty ? <Muted>Ingen tester eller TrackMan-økter tildelt.</Muted> : <div role="list">{D().assign.map(([n, k, w], i) => <Row key={n} i={i} a={n} sub={k.toUpperCase()} b={w} />)}</div>}</Sec>;
  return <A.Page max={1200}>
    <PageHeader kicker="Mer · Grupper" title="Grupper" />
    <A.Gate state={state} loading="Henter grupper …" error={{ title: "Gruppene kunne ikke hentes", text: "Ingen medlemskap er endret. Prøv igjen.", code: "FEIL 503 · GRUPPER · 08:20" }}>
      <div role="tablist" aria-label="Gruppe" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{D().groups.map((x) => <ChoicePill key={x.id} role="tab" aria-selected={g === x.id} selected={g === x.id} onClick={() => setG(x.id)}>{x.name + " · " + (empty ? 0 : x.n)}</ChoicePill>)}</div>
      {two ? <A.Cols tpl="minmax(0,1.3fr) minmax(0,1fr)"><A.Stack>{members}</A.Stack><A.Stack>{plan}{tild}</A.Stack></A.Cols> : <A.Stack>{members}{plan}{tild}</A.Stack>}
    </A.Gate>
    {add && <Sheet open onClose={() => setAdd(false)} kicker="Grupper · søk i PlayerHQ" title="Legg til spillere" footer={<><Button fullWidth icon="check" disabled={!pick} onClick={() => { setAdd(false); A.toast("Gruppene er oppdatert", (pick + " · " + (marks[pick] || []).length + " GRUPPER").toUpperCase()); }}>Lagre</Button><Button variant="ghost" fullWidth onClick={() => setAdd(false)}>Avbryt</Button></>}>
      <SearchField value={q} onChange={setQ} placeholder="Navn eller golf-ID" />
      {!hits.length ? <Muted>Ingen spillere med PlayerHQ passer søket.</Muted> : <div role="list">{hits.map(([n, sub, gs], i) => <button key={n} type="button" role="listitem" onClick={() => { setPick(n); setMarks((m) => m[n] ? m : { ...m, [n]: gs }); }} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: (pick === n ? "600" : "500") + " 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{n}</span><A.Meta>{sub.toUpperCase()}</A.Meta></span>{pick === n && <StatusPill tone="ok">Valgt</StatusPill>}</button>)}</div>}
      {pick && <div role="group" aria-label={"Grupper for " + pick} style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8, borderTop: "1px solid var(--border-hairline)" }}><A.Meta>HAK AV GRUPPENE FOR {pick.toUpperCase()}</A.Meta>{D().groups.map((x) => { const on = (marks[pick] || []).includes(x.id); return <div key={x.id} style={{ minHeight: 44, display: "flex", alignItems: "center" }}><Checkbox checked={on} onChange={() => setMarks((m) => ({ ...m, [pick]: on ? m[pick].filter((y) => y !== x.id) : [...(m[pick] || []), x.id] }))} label={x.name} /></div>; })}</div>}
    </Sheet>}
    {asg && <Sheet open onClose={() => setAsg(false)} kicker={"Tildel · " + grp.name} title="Test eller TrackMan-økt" footer={<Button variant="ghost" fullWidth onClick={() => setAsg(false)}>Lukk</Button>}>
      <div role="list">{[["Team Norway-batteri", "TEST · 90 MIN"], ["TrackMan-baseline driver og 7-jern", "TRACKMAN-ØKT · 45 MIN"], ["Wedge-lengder 50–100 m", "TRACKMAN-ØKT · 45 MIN"], ["Knebøy 1RM", "FYSTEST"]].map(([n, s], i) => <Row key={n} i={i} a={n} sub={s} b={<Button size="sm" variant="secondary" onClick={() => { setAsg(false); A.toast("Tildelt " + grp.name, (n + " · " + grp.n + " SPILLERE FÅR DEN I PLANEN").toUpperCase()); }}>Tildel</Button>} />)}</div>
    </Sheet>}
  </A.Page>;
}

/* ---------- AG-15 tillegg: TrackMan-økter ---------- */
function TmTildel() {
  const { StatusPill } = window.AGQ.ns(), A = window.AGQ;
  return <Sec k="TrackMan-økter" meta="TILDELT · PARAMETERE FRA TRACKMAN"><div role="list">{D().tm.map((t, i) => <Row key={t.id} i={i} a={t.name} sub={(t.who + " · " + t.when + " · " + t.params).toUpperCase()} b={<StatusPill tone="info">{t.st}</StatusPill>} />)}</div></Sec>;
}
window.AG_TM_TILDEL = TmTildel;

/* ---------- AG-20 Økonomi ---------- */
function AG20({ state }) {
  const { PageHeader, Button, StatusPill, TextInput, EmptyState, InlineAlert } = window.AGQ.ns(), A = window.AGQ, E = D().eco, { cw } = A.useW(), empty = state === "tom", two = cw >= 1100;
  const [bud, setBud] = React.useState(false), [up, setUp] = React.useState(false);
  const sumB = E.rows.reduce((a, r) => a + r[1], 0), act = E.rows.filter((r) => r[2] != null), sumA = act.reduce((a, r) => a + r[2], 0);
  const plan = <Sec k={"Budsjett mot regnskap · " + E.month} meta="REGNSKAP FRA TRIPLETEX · ALDRI ANSLÅTT">
    {empty ? <EmptyState icon="wallet" title="Ingen tall ennå" text="Legg inn budsjettet og last opp første Tripletex-eksport." action="Legg inn budsjett" actionIcon="plus" onAction={() => setBud(true)} /> : <>
      <div role="table" aria-label="Budsjett mot regnskap" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", gap: "0 16px" }}>
        {["", "BUDSJETT", "REGNSKAP"].map((h, i) => <A.Meta key={i} s={{ padding: "6px 0", textAlign: i ? "right" : "left" }}>{h}</A.Meta>)}
        {E.rows.map(([n, b, a, src]) => <React.Fragment key={n}><span style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 0", borderTop: "1px solid var(--border-hairline)", minWidth: 0 }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{n}</span><A.Meta>{src}</A.Meta></span><span style={{ font: "500 13px/1 var(--font-mono)", color: "var(--text-secondary)", textAlign: "right", padding: "8px 0", borderTop: "1px solid var(--border-hairline)", alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{kr(b)}</span><span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)", textAlign: "right", padding: "8px 0", borderTop: "1px solid var(--border-hairline)", alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{kr(a)}</span></React.Fragment>)}
        <span style={{ font: "600 14px/1.3 var(--font-sans)", padding: "10px 0", borderTop: "1px solid var(--border-strong)" }}>Sum</span><span style={{ font: "600 13px/1 var(--font-mono)", textAlign: "right", padding: "10px 0", borderTop: "1px solid var(--border-strong)" }}>{kr(sumB)}</span><span style={{ font: "600 13px/1 var(--font-mono)", textAlign: "right", padding: "10px 0", borderTop: "1px solid var(--border-strong)" }}>{kr(sumA)}</span>
      </div>
      <A.Meta>FORDELT PÅ AK GOLFS TJENESTER · BUDSJETT LAGT INN 01.08.2026 · SUM REGNSKAP UTEN LINJER MED «—» · «—» = TALLET FINNES IKKE I KILDEN</A.Meta>
      <div><Button variant="secondary" size="sm" icon="pencil" onClick={() => setBud(true)}>Endre budsjett</Button></div>
    </>}
  </Sec>;
  const rows = E.rows;
  const tt = <Sec k="Tripletex-eksport" meta="LASTES OPP HVER MÅNED">{E.uploads.filter((u) => !empty || u[3] === "Venter").length ? <div role="list">{E.uploads.filter((u) => !empty || u[3] === "Venter").map(([m, f, d, s], i) => <Row key={m} i={i} a={m} sub={(f + " · " + (d === "—" ? "IKKE LASTET OPP" : "LASTET OPP " + d)).toUpperCase()} b={<StatusPill tone={s === "Importert" ? "ok" : "warn"}>{s}</StatusPill>} />)}</div> : null}<div><Button size="sm" icon="upload" onClick={() => setUp(true)}>Last opp eksport for september</Button></div></Sec>;
  const st = <Sec k="Betalinger fra Stripe" meta="LEST AUTOMATISK">{empty ? <Muted>Stripe er ikke koblet.</Muted> : <div role="list">{E.stripe.map(([k, v, src], i) => <Row key={k} i={i} a={k} sub={src} b={v} />)}</div>}</Sec>;
  return <A.Page max={1200}>
    <PageHeader kicker="Mer · Økonomi · bare head coach" title="Økonomi" />
    <A.Gate state={state} loading="Henter tall fra Tripletex og Stripe …" error={{ title: "Økonomi kunne ikke hentes", text: "Stripe svarer ikke. Tall fra Tripletex vises når du prøver igjen.", code: "FEIL 502 · STRIPE · 08:20" }}>
      {two ? <A.Cols tpl="minmax(0,1.4fr) minmax(0,1fr)"><A.Stack>{plan}</A.Stack><A.Stack>{tt}{st}</A.Stack></A.Cols> : <A.Stack>{plan}{tt}{st}</A.Stack>}
    </A.Gate>
    {bud && <window.AGQ_SHEET_BUD onClose={() => setBud(false)} rows={E.rows} />}
    {up && <window.AGQ_SHEET_UP onClose={() => setUp(false)} />}
  </A.Page>;
}
function BudSheet({ onClose, rows }) {
  const { Sheet, Button, TextInput } = window.AGQ.ns(), A = window.AGQ;
  return <Sheet open onClose={onClose} kicker="Økonomi · september 2026" title="Budsjett" footer={<><Button fullWidth icon="check" onClick={() => { onClose(); A.toast("Budsjettet er lagret", "SEPTEMBER 2026"); }}>Lagre</Button><Button variant="ghost" fullWidth onClick={onClose}>Avbryt</Button></>}>
    {rows.map(([n, b]) => <label key={n} style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>{n} (kr)</span><TextInput mono inputMode="numeric" defaultValue={String(b)} /></label>)}
  </Sheet>;
}
function UpSheet({ onClose }) {
  const { Sheet, Button } = window.AGQ.ns(), A = window.AGQ;
  return <Sheet open onClose={onClose} kicker="Økonomi · Tripletex" title="Last opp eksport" footer={<><Button fullWidth icon="upload" onClick={() => { onClose(); A.toast("Eksporten er lastet opp", "TRIPLETEX-2026-09.CSV · IMPORTERES"); }}>Velg fil</Button><Button variant="ghost" fullWidth onClick={onClose}>Avbryt</Button></>}>
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Eksporter «Resultat per avdeling» for september fra Tripletex som CSV. Tallene vises med opplastingsdato og erstatter ikke tidligere måneder.</p>
  </Sheet>;
}
window.AGQ_SHEET_BUD = BudSheet; window.AGQ_SHEET_UP = UpSheet;

/* ---------- AG-23 Oppsett (AG-24 slått inn) ---------- */
const TABS = [["profil", "Profil"], ["team", "Team og invitasjoner"], ["gdpr", "GDPR"], ["logg", "Logger"], ["mark", "Markedsføring"], ["hjelp", "Hjelp"]];
function AG23({ state, tab0 }) {
  const { PageHeader, Button, ChoicePill, StatusPill, TextInput, Sheet, KeyValue } = window.AGQ.ns(), A = window.AGQ, empty = state === "tom";
  const [tab, setTab] = React.useState(tab0 || "profil"), [inv, setInv] = React.useState(false), [role, setRole] = React.useState("Assistant coach");
  const body = tab === "profil" ? <Sec k="Profil" meta="HEAD COACH"><KeyValue columns={1} items={[["Navn", "Anders Kristiansen", { mono: false }], ["E-post", "anders@akgolf.no", { mono: false }], ["Rolle", "Head coach", { mono: false }], ["Google-kalender", "Koblet begge veier · synket 08:20", { mono: false }], ["Tjenester og priser", "6 tjenester · oppdatert 01.08.2026", { mono: false }]]} /></Sec>
    : tab === "team" ? <><Sec k="Team" meta={empty ? "BARE DEG" : D().team.length + " COACHER"}><div role="list">{(empty ? D().team.slice(0, 1) : D().team).map(([n, r, e, s], i) => <Row key={n} i={i} a={n} sub={(r + " · " + e).toUpperCase()} b={<StatusPill tone={s === "Aktiv" ? "ok" : "neutral"}>{s}</StatusPill>} />)}</div><div><Button size="sm" icon="user-plus" onClick={() => setInv(true)}>Inviter coach</Button></div></Sec>
      <Sec k="Roller" meta="TO ROLLER"><div role="list">{D().roles.map(([r, t], i) => <Row key={r} i={i} a={r} sub={t.toUpperCase()} />)}</div></Sec></>
    : tab === "gdpr" ? <Sec k="GDPR" meta="SVAR INNEN 30 DAGER">{empty ? <Muted>Ingen forespørsler.</Muted> : <div role="list">{D().gdpr.map(([n, s, st], i) => <Row key={n} i={i} a={n} sub={s.toUpperCase()} b={<StatusPill tone={st === "Åpen" ? "warn" : "ok"}>{st}</StatusPill>} />)}</div>}</Sec>
    : tab === "logg" ? <Sec k="Logger" meta="ENDRINGER OG FEIL · 90 DAGER">{empty ? <Muted>Ingen hendelser.</Muted> : <div role="list">{D().logs.map(([t, w, h], i) => <Row key={t + h} i={i} a={h} sub={(t + " · " + w).toUpperCase()} />)}</div>}</Sec>
    : tab === "mark" ? <Sec k="Markedsføring" meta="E-POST">{empty ? <Muted>Ingen utsendelser.</Muted> : <div role="list">{D().marketing.map(([n, s, r], i) => <Row key={n} i={i} a={n} sub={s.toUpperCase()} b={r} />)}</div>}</Sec>
    : <Sec k="Hjelp" meta="AK GOLF HQ"><div role="list">{[["Kom i gang som assistant coach", "5 MIN"], ["Slik fungerer gruppeplanen", "3 MIN"], ["Tripletex-eksport steg for steg", "4 MIN"], ["Kontakt support", "post@akgolf.no"]].map(([n, s], i) => <Row key={n} i={i} a={n} b={s} />)}</div></Sec>;
  return <A.Page max={960}>
    <PageHeader kicker="Mer · Oppsett" title="Oppsett" />
    <A.Gate state={state} loading="Henter oppsett …" error={{ title: "Oppsett kunne ikke hentes", text: "Ingen innstillinger er endret.", code: "FEIL 503 · OPPSETT · 08:20" }}>
      <div role="tablist" aria-label="Oppsett" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{TABS.map(([k, l]) => <ChoicePill key={k} role="tab" aria-selected={tab === k} selected={tab === k} onClick={() => setTab(k)}>{l}</ChoicePill>)}</div>
      <A.Stack>{body}</A.Stack>
    </A.Gate>
    {inv && <Sheet open onClose={() => setInv(false)} kicker="Team" title="Inviter coach" footer={<><Button fullWidth icon="send" onClick={() => { setInv(false); A.toast("Invitasjon sendt", role.toUpperCase() + " · GJELDER I 7 DAGER"); }}>Send invitasjon</Button><Button variant="ghost" fullWidth onClick={() => setInv(false)}>Avbryt</Button></>}>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>E-post</span><TextInput type="email" placeholder="fornavn@akgolf.no" /></label>
      <div role="radiogroup" aria-label="Rolle" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["Head coach", "Assistant coach"].map((r) => <ChoicePill key={r} role="radio" aria-checked={role === r} selected={role === r} onClick={() => setRole(r)}>{r}</ChoicePill>)}</div>
      <A.Meta>{D().roles.find((r) => r[0] === role)[1].toUpperCase()}</A.Meta>
    </Sheet>}
  </A.Page>;
}
const Go = (to, text) => ({ go }) => { const { EmptyState } = window.AGQ.ns(), A = window.AGQ; return <A.Page max={720}><EmptyState icon="arrow-right" title="Utgår 28.09" text={text} action="Gå dit" actionIcon="arrow-right" onAction={() => go(to)} /></A.Page>; };
const S = window.AG_SCREENS;
S["AG-06"] = { id: "AG-06", name: "Booking", route: "/admin/bookinger", Component: AG06 };
S["AG-06-NY"] = { id: "AG-06-NY", parent: "AG-06", name: "Booking · ny booking (flyt)", route: "/admin/bookinger/ny", Component: (p) => <AG06 {...p} ny /> };
S["AG-16"] = { id: "AG-16", name: "Grupper", route: "/admin/grupper", Component: AG16 };
S["AG-20"] = { id: "AG-20", name: "Økonomi · bare head coach", route: "/admin/agencyos/okonomi", Component: AG20 };
S["AG-20-ASS"] = { id: "AG-20-ASS", parent: "AG-20", name: "Økonomi · assistant coach (ingen tilgang)", asst: true, route: "/admin/agencyos/okonomi", Component: ({ go, state }) => { const { EmptyState } = window.AGQ.ns(), A = window.AGQ; return <A.Page max={720}><A.Gate state={state === "tom" ? "data" : state} loading="Henter …" error={{ title: "Siden kunne ikke hentes", text: "Prøv igjen.", code: "FEIL 503" }}><EmptyState icon="lock" title="Bare head coach ser Økonomi" text="Økonomi er ikke i Mer for assistant coach. Spør head coach om tall du trenger." action="Til Cockpit" actionIcon="arrow-left" onAction={() => go("AG-01")} /></A.Gate></A.Page>; } };
S["AG-23"] = { id: "AG-23", name: "Oppsett", route: "/admin/oppsett", Component: AG23 };
S["AG-23-TEAM"] = { id: "AG-23-TEAM", parent: "AG-23", name: "Oppsett · team og roller", route: "/admin/oppsett?fane=team", Component: (p) => <AG23 {...p} tab0="team" /> };
S["AG-24"] = { id: "AG-24", parent: "AG-23", name: "Drift · utgår 28.09 → Oppsett", utgar: true, route: "/admin/audit-log → /admin/oppsett?fane=logg", Component: (p) => <AG23 {...p} tab0="logg" /> };
S["AG-17"] = { id: "AG-17", name: "Turneringer · utgår 28.09 → Workbench og Plan", utgar: true, route: "/admin/turnering → /admin/workbench", Component: Go("AG-11", "Turneringer ligger i Workbench (sidefelt Turneringer) og i spillerens Plan. Påmeldinger bekreftes ikke.") };
S["AG-18"] = { id: "AG-18", name: "TrackMan og video · utgår 28.09 → Spiller 360 › Samtaler", utgar: true, route: "/admin/videoer → /admin/spillere/[id]?fane=samtaler", Component: Go("AG-08", "Videoer og opptak ligger i Spiller 360 › Samtaler. TrackMan-økter tildeles i Tester og Grupper.") };
})();
