/* AgencyOS · Cockpit (AG-01), Live coachingøkt (AG-13) og Øktark etter live (AG-12) — runde 25, Anders 28.09.2026.
   AG-21 Oppgaver utgår: oppgaver fra Notion ligger i Cockpit. Lastes etter AG-12/13/21 og overstyrer dem. */
(() => {
const C = () => window.COCKPIT;
const Sec = ({ k, meta, children, label, gap = 8 }) => <section aria-label={label || k} className="pa-card" style={{ padding: 16, gap, minWidth: 0 }}><div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto" }}>{k}</span>{meta != null && React.createElement(window.AGQ.Meta, null, meta)}</div>{children}</section>;
const Muted = ({ children }) => <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{children}</p>;
const Row = ({ children, i, tpl = "minmax(0,1fr) auto", min = 56 }) => <div role="listitem" style={{ display: "grid", gridTemplateColumns: tpl, gap: 12, alignItems: "center", minHeight: min, borderTop: i ? "1px solid var(--border-hairline)" : "none", padding: "6px 0", minWidth: 0 }}>{children}</div>;
const Lbl = ({ a, sub }) => <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere", textWrap: "pretty" }}>{a}</span>{sub && React.createElement(window.AGQ.Meta, null, sub)}</span>;
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

/* ---------- AG-01 Cockpit ---------- */
function Kalender({ empty, go }) {
  const { Button, StatusPill } = window.AGQ.ns(), A = window.AGQ, L = empty ? [] : C().cal, H0 = 5 * 60, H1 = 22 * 60, X = (t) => (toMin(t) - H0) / (H1 - H0) * 100;
  const nextId = (L.find((x) => x.st === "Neste") || {}).id;
  return <Sec k="Dagens kalender · 05:00–22:00" meta={empty ? "INGEN ØKTER" : L.length + " ØKTER"} label="Dagens kalender">
    <div aria-hidden="true" style={{ position: "relative", height: 20, background: "var(--surface-sunken)", borderRadius: 4 }}>{L.map((x) => <span key={x.id} style={{ position: "absolute", top: 3, bottom: 3, left: X(x.t) + "%", width: (X(x.end) - X(x.t)) + "%", background: x.st === "Ferdig" ? "var(--graphite-400)" : "var(--primary)", borderRadius: 2 }}></span>)}<span style={{ position: "absolute", top: -3, bottom: -3, width: 2, left: "calc(" + X(C().now) + "% - 1px)", background: "var(--text-primary)" }}></span></div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>{["05", "09", "13", "17", "22"].map((h) => <A.Meta key={h}>{h}</A.Meta>)}</div>
    {!L.length ? <Muted>Ingen coaching- eller gruppeøkter i dag.</Muted> : <div role="list">{L.map((x, i) => <Row key={x.id} i={i} tpl="56px minmax(0,1fr) auto" min={64}>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "600 15px/1 var(--font-mono)", color: x.st === "Ferdig" ? "var(--text-muted)" : "var(--text-primary)" }}>{x.t}</span><A.Meta>{x.end}</A.Meta></span>
      <Lbl a={x.kind + " · " + x.who + (x.n ? " (" + x.n + ")" : "")} sub={x.where.toUpperCase()} />
      {x.st === "Ferdig" ? <StatusPill tone="ok">Ferdig</StatusPill> : x.live ? <Button size="sm" variant={x.id === nextId ? "primary" : "secondary"} icon="play" onClick={() => go("AG-13")}>Start live</Button> : null}
    </Row>)}</div>}
  </Sec>;
}
function Venter({ empty, go }) {
  const { Button, TextInput, Avatar, IconButton } = window.AGQ.ns(), A = window.AGQ;
  const [l, setL] = React.useState(empty ? [] : C().waiting), [txt, setTxt] = React.useState({});
  const send = (w) => { const t = (txt[w.id] || "").trim(); if (!t) return; setL((x) => x.filter((y) => y.id !== w.id)); A.toast("Svar sendt til " + w.who, t.slice(0, 40).toUpperCase()); };
  return <Sec k="Venter på svar" meta={l.length ? l.length + " · NYESTE FØRST · EGNE GRUPPER" : "INGEN"} label="Venter på svar">
    {!l.length ? <Muted>Alle er besvart.</Muted> : <div role="list">{l.map((w, i) => <div role="listitem" key={w.id} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}><Avatar name={w.who} size={32} /><span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{w.who}</span><A.Meta>{w.kind.toUpperCase()} · {w.at.toUpperCase()} · {w.grp.toUpperCase()}</A.Meta></span></div>
      <span style={{ font: "400 14px/1.4 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{w.text}</span>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 44px", gap: 8 }}><TextInput aria-label={"Kort svar til " + w.who} value={txt[w.id] || ""} onChange={(e) => setTxt((x) => ({ ...x, [w.id]: e.target.value }))} placeholder="Kort svar" /><IconButton icon="send" label={"Send svar til " + w.who} variant="secondary" disabled={!(txt[w.id] || "").trim()} onClick={() => send(w)} /></div>
      <div><Button variant="ghost" size="sm" iconRight="arrow-right" onClick={() => go("AG-04")}>Hele samtalen i Innboks</Button></div>
    </div>)}</div>}
  </Sec>;
}
function Oppgaver({ empty }) {
  const { Checkbox } = window.AGQ.ns(), A = window.AGQ;
  const [l, setL] = React.useState(empty ? [] : C().tasks.map((t) => ({ ...t, done: false })));
  const tog = (t) => { setL((x) => x.map((y) => y.id === t.id ? { ...y, done: !y.done } : y)); A.toast(t.done ? "Oppgaven er åpnet igjen" : "Oppgaven er huket av", "OPPDATERT I NOTION"); };
  return <Sec k="Oppgaver fra Notion" meta={empty ? "—" : l.filter((t) => t.over && !t.done).length + " FORFALT · " + l.filter((t) => !t.over && !t.done).length + " I DAG"} label="Oppgaver fra Notion">
    {!l.length ? <Muted>Ingen oppgaver med frist i dag.</Muted> : <div role="list">{l.map((t, i) => <Row key={t.id} i={i} min={52}><Checkbox checked={t.done} onChange={() => tog(t)} label={<span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--text-muted)" : "var(--text-primary)" }}>{t.t}</span><A.Meta>{t.src.toUpperCase()}</A.Meta></span>} /><A.Meta s={{ color: t.over && !t.done ? "var(--text-primary)" : undefined }}>{t.over ? "FORFALT " + t.due : "FRIST I DAG"}</A.Meta></Row>)}</div>}
    <A.Meta>{C().tasksSrc}</A.Meta>
  </Sec>;
}
function Turneringer({ empty }) {
  const A = window.AGQ, l = empty ? [] : C().tournaments;
  return <Sec k="Turneringer denne uka" meta={empty ? "INGEN" : "EGNE GRUPPER"} label="Turneringer denne uka">
    {!l.length ? <Muted>Ingen spillere i egne grupper spiller turnering denne uka.</Muted> : <div role="list">{l.map((t, i) => <Row key={t.id} i={i}><Lbl a={t.who + " · " + t.name} sub={t.where.toUpperCase()} /><span style={{ font: "600 13px/1.3 var(--font-mono)", color: "var(--text-primary)", textAlign: "right" }}>{t.res || (t.days === 0 ? "I dag" : "Om " + t.days + (t.days === 1 ? " dag" : " dager"))}</span></Row>)}</div>}
  </Sec>;
}
function Etterlevelse({ empty, go }) {
  const A = window.AGQ, l = empty ? [] : [...C().offPlan].sort((a, b) => a.pct[1] - b.pct[1]);
  return <Sec k="Følger ikke planen" meta={empty ? "INGEN" : "LAVESTE FØRST"} label="Følger ikke planen">
    {!l.length ? <Muted>Alle ligger over 70 %.</Muted> : <div role="list">{l.map((p, i) => <button key={p.id} type="button" role="listitem" onClick={() => go("AG-08-PLAN")} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 56, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><Lbl a={p.who} sub={p.grp.toUpperCase() + " · " + p.weeks + " UKER PÅ RAD"} /><span style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}><span style={{ font: "600 15px/1 var(--font-mono)", color: "var(--text-primary)" }}>{p.pct[1]} %</span><A.Meta>UKA FØR {p.pct[0]} %</A.Meta></span></button>)}</div>}
    <A.Meta>{C().offSrc} · TRYKK FOR HELE PLANEN</A.Meta>
  </Sec>;
}
function AG01({ state, go }) {
  const { PageHeader } = window.AGQ.ns(), A = window.AGQ, { cw } = A.useW(), empty = state === "tom", two = cw >= 1000;
  const counts = <div role="list" aria-label="Tellere" style={{ display: "grid", gridTemplateColumns: cw >= 700 ? "repeat(4,minmax(0,1fr))" : "repeat(2,minmax(0,1fr))", gap: 8 }}>{C().counts.map(([k, l, n, to]) => <button key={k} type="button" role="listitem" onClick={() => go(to)} className="pa-card pa-card--interactive" style={{ padding: 14, gap: 6, textAlign: "left", font: "inherit", cursor: "pointer", minWidth: 0, minHeight: 84 }}><span style={{ font: "600 28px/1 var(--font-mono)", color: "var(--text-primary)" }}>{empty ? 0 : n}</span><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>{l}</span></button>)}</div>;
  const keys = <Sec k="Nøkkeltall" meta="INGEN ØKONOMI HER" label="Nøkkeltall"><div role="list">{C().keys.map(([k, v, src], i) => <Row key={k} i={i}><Lbl a={k} sub={empty ? "—" : src} /><span style={{ font: "600 17px/1 var(--font-mono)", color: "var(--text-primary)" }}>{empty ? "—" : v}</span></Row>)}</div></Sec>;
  const left = <A.Stack><Kalender empty={empty} go={go} /><Venter empty={empty} go={go} /><Oppgaver empty={empty} /></A.Stack>;
  const right = <A.Stack><Turneringer empty={empty} /><Etterlevelse empty={empty} go={go} />{keys}</A.Stack>;
  return <A.Page>
    <PageHeader kicker={C().date} title="Cockpit" />
    <A.Gate state={state} loading="Henter dagen …" error={{ title: "Cockpit kunne ikke lastes", text: "Kalender, meldinger og oppgaver hentes på nytt når du prøver igjen. Ingenting er endret.", code: "FEIL 503 · COCKPIT · 08:14" }}>
      {counts}
      {two ? <A.Cols tpl="minmax(0,1.2fr) minmax(0,1fr)">{left}{right}</A.Cols> : <A.Stack>{left}{right}</A.Stack>}
    </A.Gate>
  </A.Page>;
}

/* ---------- AG-13 Live coachingøkt ---------- */
function AG13({ state, go, noConsent }) {
  const { PageHeader, Button, StatusPill, Avatar, IconButton, InlineAlert, EmptyState, Icon } = window.AGQ.ns(), A = window.AGQ, V = C().live, { cw } = A.useW(), empty = state === "tom", two = cw >= 1000;
  const consent = !noConsent && V.consent;
  const [rec, setRec] = React.useState(false), [note, setNote] = React.useState(empty ? "" : "P7.0 i 50 %: 8 av 10 med hendene foran. Mister det når farten øker."), [hw, setHw] = React.useState({}), [media, setMedia] = React.useState(empty ? [] : [["Video · P7.0 fra siden", "10:24"]]);
  const addM = (k) => { const t = new Date().toTimeString().slice(0, 5); setMedia((m) => [...m, [k, t]]); A.toast(k + " lagt til", "FRA IPHONE · " + t); };
  const PT = { "Godkjent": "ok", "Jobber med": "info", "Ikke startet": "neutral" };
  const card = <Sec k="Spiller" meta={V.kind.toUpperCase()} label="Spillerkort" gap={12}>
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}><Avatar name={V.player} size={48} /><span style={{ flex: "1 1 160px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "600 17px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{V.player}</span><A.Meta>KATEGORI {V.cat} · HCP {V.hcp}</A.Meta></span></div>
    <Lbl a="Siste runde" sub={empty ? "—" : V.last} />
    <A.Meta>AKTIVE MÅLSETNINGER</A.Meta>
    <div role="list">{(empty ? [] : V.goals).map(([n, v, due], i) => <Row key={n} i={i} min={44}><Lbl a={n} sub={"FRIST " + due} /><span style={{ font: "600 13px/1.3 var(--font-mono)", color: "var(--text-primary)", textAlign: "right" }}>{v}</span></Row>)}{empty && <Muted>Ingen målsetninger.</Muted>}</div>
  </Sec>;
  const plan = <Sec k="Teknisk plan" meta="FRA AG-10 · ANDERS KRISTIANSEN" label="Teknisk plan" gap={12}>
    <div role="list" aria-label="P-posisjoner" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 4 }}>{V.pos.map(([p, s]) => <span role="listitem" key={p} aria-label={p + " " + s} style={{ minHeight: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, borderRadius: 6, border: "1px solid " + (s === "Jobber med" ? "var(--border-ink)" : "var(--border-hairline)"), background: s === "Godkjent" ? "var(--surface-sunken)" : "var(--surface-card)" }}><span style={{ font: "600 12px/1 var(--font-mono)", color: "var(--text-primary)" }}>{p}</span><span style={{ font: "500 9px/1 var(--font-sans)", color: "var(--text-muted)" }}>{s === "Godkjent" ? "OK" : s === "Jobber med" ? "NÅ" : "—"}</span></span>)}</div>
    <div role="list">{V.tasks.map(([p, t, sub, img], i) => <Row key={p} i={i} tpl="56px minmax(0,1fr) auto" min={64}><span style={{ width: 56, height: 56, borderRadius: 6, overflow: "hidden", background: "var(--surface-sunken)", display: "grid", placeItems: "center" }}>{img ? <img src="../../assets/photos/academy-30.webp" alt={"Bilde " + t} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="image" size={18} />}</span><Lbl a={p + " · " + t} sub={sub.toUpperCase()} /><IconButton icon="play" label={"Video " + t} variant="ghost" onClick={() => A.toast("Video", p + " · " + t.toUpperCase())} /></Row>)}</div>
  </Sec>;
  const phone = <Sec k="Fra iPhone" meta={media.length + " LAGT TIL"} label="Video, bilde og målbilde">
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>{[["video", "Video"], ["camera", "Bilde"], ["target", "Målbilde"]].map(([ic, l]) => <Button key={l} variant="secondary" icon={ic} onClick={() => addM(l)} style={{ minHeight: 52, minWidth: 0, padding: "0 8px" }}>{l}</Button>)}</div>
    {media.length > 0 && <div role="list">{media.map(([k, t], i) => <Row key={i} i={i} min={40}><span style={{ font: "400 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{k}</span><A.Meta>{t}</A.Meta></Row>)}</div>}
  </Sec>;
  const recSec = <Sec k="Opptak og notater" meta={rec ? "OPPTAK PÅGÅR" : consent ? "SAMTYKKE GITT VED OPPSTART" : "SAMTYKKE MANGLER"} label="Opptak og notater" gap={12}>
    {consent ? <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}><Button variant={rec ? "secondary" : "primary"} icon={rec ? "square" : "mic"} onClick={() => { setRec(!rec); A.toast(rec ? "Opptaket er stoppet" : "Opptak startet", rec ? "LAGRES PÅ ØKTA" : "TOBIAS SER «OPPTAK PÅGÅR»"); }} style={{ minHeight: 52 }}>{rec ? "Stopp opptak" : "Start opptak"}</Button>{rec && <StatusPill tone="live">Opptak pågår</StatusPill>}<A.Meta>SPILLEREN SER «OPPTAK PÅGÅR»</A.Meta></div>
      : <><div><Button variant="secondary" icon="mic-off" disabled style={{ minHeight: 52 }}>Start opptak</Button></div><InlineAlert tone="neutral" title="Opptak er sperret">Tobias har ikke samtykket til opptak i coachingøkt ved oppstart. Han kan slå det på i PlayerHQ › Meg › Innstillinger. Notater kan du skrive som vanlig.</InlineAlert></>}
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>Notater</span><textarea className="pa-input" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Hva jobbet dere med?" style={{ width: "100%", boxSizing: "border-box", resize: "vertical", font: "var(--type-body)", minHeight: 96, padding: 12 }}></textarea></label>
    <A.Meta>SAMMENDRAG BLIR UTKAST TIL DEG · GODKJENT GÅR RETT TIL SPILLEREN · NAVN TAS UT FØR TEKSTEN SENDES TIL AI.</A.Meta>
  </Sec>;
  const home = <Sec k="Hjemmelekse" meta="ETT TRYKK · LEGGES I PLANEN" label="Hjemmelekse">
    <div role="list">{V.homework.map(([t, sub, ax], i) => <Row key={t} i={i}><Lbl a={t} sub={ax + " · " + sub.toUpperCase()} />{hw[t] ? <StatusPill tone="ok">I planen</StatusPill> : <Button size="sm" variant="secondary" icon="calendar-plus" onClick={() => { setHw((x) => ({ ...x, [t]: true })); A.toast("Lagt i planen", (t + " · " + V.player).toUpperCase()); }}>Legg i planen</Button>}</Row>)}</div>
  </Sec>;
  return <A.Page>
    <PageHeader kicker={"Live coachingøkt · " + V.t + " · " + V.where} title={V.player} actions={<Button icon="check" onClick={() => go("AG-12")}>Avslutt økta</Button>} />
    <A.Gate state={state} loading="Kobler til økta …" error={{ title: "Økta kunne ikke startes", text: "Spillerkortet og den tekniske planen kunne ikke hentes. Notater og opptak lagres på telefonen.", code: "FRAKOBLET · 10:02" }}>
      {empty && <EmptyState icon="clipboard" title="Ingen teknisk plan ennå" text="Du kan coache og ta notater som vanlig. Lag planen i Spiller 360 etterpå." action="Åpne teknisk plan" actionIcon="list-checks" onAction={() => go("AG-10")} />}
      {two ? <A.Cols tpl="minmax(0,1fr) minmax(0,1.2fr)"><A.Stack>{card}{home}</A.Stack><A.Stack>{recSec}{plan}{phone}</A.Stack></A.Cols> : <A.Stack>{card}{recSec}{plan}{phone}{home}</A.Stack>}
    </A.Gate>
  </A.Page>;
}

/* ---------- AG-12 Øktark etter live: sammendrag som utkast, TrackMan-baseline ---------- */
function AG12({ state, go }) {
  const { PageHeader, Button, StatusPill, EmptyState } = window.AGQ.ns(), A = window.AGQ, X = C().after, V = C().live, { cw } = A.useW(), empty = state === "tom", two = cw >= 1000;
  const [sum, setSum] = React.useState(X.summary), [sent, setSent] = React.useState(false), [base, setBase] = React.useState(false);
  const draft = <Sec k="Sammendrag" meta={sent ? "SENDT TIL " + V.player.toUpperCase() : "UTKAST TIL DEG"} label="Sammendrag" gap={12}>
    {!sent && <A.Draft>Utkast fra Caddie</A.Draft>}
    <textarea className="pa-input" rows={6} value={sum} disabled={sent} onChange={(e) => setSum(e.target.value)} aria-label="Sammendrag" style={{ width: "100%", boxSizing: "border-box", resize: "vertical", font: "var(--type-body)", minHeight: 140, padding: 12 }}></textarea>
    <A.Meta>BYGGER PÅ NOTATER OG OPPTAK · NAVN TAS UT FØR TEKSTEN SENDES TIL AI.</A.Meta>
    {sent ? <StatusPill tone="ok">Sendt 11:04</StatusPill> : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button icon="send" onClick={() => { setSent(true); A.toast("Sendt til " + V.player, "GODKJENT SAMMENDRAG · VISES I PLAYERHQ"); }}>Godkjenn og send</Button><Button variant="ghost" onClick={() => setSum(X.summary)}>Tilbakestill</Button></div>}
  </Sec>;
  const tm = <Sec k="TrackMan-baseline" meta={X.tm.n + " SLAG · " + X.tm.club.toUpperCase() + " · " + X.tm.date} label="TrackMan-baseline" gap={12}>
    <Lbl a={"Første TrackMan-økt på oppgaven «" + X.tm.task + "»"} sub="KAN BRUKES SOM STARTVERDI I TEKNISK PLAN" />
    <div role="list">{X.tm.rows.map(([k, v, mal], i) => <Row key={k} i={i} tpl="minmax(0,1fr) auto auto" min={44}><span style={{ font: "400 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{k}</span><span style={{ font: "600 14px/1 var(--font-mono)", color: "var(--text-primary)" }}>{v}</span><A.Meta s={{ minWidth: 88, textAlign: "right" }}>MÅL {mal.toUpperCase()}</A.Meta></Row>)}</div>
    {base ? <StatusPill tone="ok">Startverdi lagret 26.09.2026</StatusPill> : <div><Button variant="secondary" icon="flag" onClick={() => { setBase(true); A.toast("Brukt som startverdi", (X.tm.task + " · TEKNISK PLAN").toUpperCase()); }}>Bruk som startverdi</Button></div>}
    <A.Meta>MÅL FRA TEKNISK PLAN · ANDERS KRISTIANSEN · 12.09.2026</A.Meta>
  </Sec>;
  const clips = <Sec k="Fra økta" meta={X.clips.length + " FILER"} label="Fra økta"><div role="list">{X.clips.map(([k, l, t], i) => <Row key={k} i={i} min={44}><span style={{ font: "400 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{k}</span><A.Meta>{l} · {t}</A.Meta></Row>)}</div></Sec>;
  const hw = <Sec k="Hjemmelekse i planen" meta="2 ØKTER" label="Hjemmelekse"><div role="list">{V.homework.map(([t, sub, ax], i) => <Row key={t} i={i}><Lbl a={t} sub={ax + " · " + sub.toUpperCase()} /><StatusPill tone="ok">I planen</StatusPill></Row>)}</div></Sec>;
  return <A.Page>
    <PageHeader kicker={"Øktark · " + V.kind + " · " + V.t} title={V.player} actions={<Button variant="secondary" icon="arrow-left" onClick={() => go("AG-01")}>Cockpit</Button>} />
    <A.Gate state={state} loading="Lager sammendrag …" error={{ title: "Sammendraget kunne ikke lages", text: "Notater og opptak er lagret. Du kan skrive sammendraget selv.", code: "FEIL 503 · CADDIE · 11:02" }}>
      {empty ? <EmptyState icon="file-text" title="Ingen notater eller opptak" text="Det finnes ikke noe å lage sammendrag av. Skriv et kort sammendrag selv, eller hopp over." action="Skriv sammendrag" actionIcon="pencil" onAction={() => A.toast("Tomt sammendrag åpnet", "—")} />
        : two ? <A.Cols tpl="minmax(0,1.2fr) minmax(0,1fr)"><A.Stack>{draft}{hw}</A.Stack><A.Stack>{tm}{clips}</A.Stack></A.Cols> : <A.Stack>{draft}{tm}{hw}{clips}</A.Stack>}
    </A.Gate>
  </A.Page>;
}
const S = window.AG_SCREENS;
S["AG-01"] = { id: "AG-01", name: "Cockpit", route: "/admin/agencyos", Component: AG01 };
S["AG-13"] = { id: "AG-13", parent: "AG-01", name: "Live coachingøkt", route: "/admin/agencyos/live/[sessionId]", Component: AG13 };
S["AG-13-U"] = { id: "AG-13-U", parent: "AG-01", name: "Live coachingøkt · uten samtykke til opptak", route: "/admin/agencyos/live/[sessionId]", Component: (p) => <AG13 {...p} noConsent /> };
S["AG-12"] = { id: "AG-12", parent: "AG-13", name: "Øktark etter live", route: "/admin/gjennomfore/okter/[id]", Component: AG12 };
S["AG-21"] = { id: "AG-21", parent: "AG-01", name: "Oppgaver · utgår 28.09 → Cockpit", utgar: true, route: "/admin/oppgaver → /admin/agencyos", Component: AG01 };
})();
