(() => {
const TONE = { "Venter på coach": "info", "Godkjent": "ok", "Feilet": "warn" };
const ta = { width: "100%", boxSizing: "border-box", minHeight: 72, padding: 12, borderRadius: 8, border: "1px solid var(--border-control)", background: "var(--surface-card)", color: "var(--text-primary)", font: "var(--type-body)", resize: "vertical" };
function AG19({ state, go }) {
  const { PageHeader, Button, StatusPill, EmptyState, Tabs, Switch, KeyValue, Icon } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA4, { mob, desk } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState("ko"), [rid, setRid] = React.useState("j1"), [runs, setRuns] = React.useState(D.runs), [chat, setChat] = React.useState(D.chat), [q, setQ] = React.useState(""), [saved, setSaved] = React.useState(false), [skills, setSkills] = React.useState(D.skills);
  const R = empty ? [] : runs, r = R.find((x) => x.id === rid);
  const approve = (x) => { setRuns((l) => l.map((y) => y.id === x.id ? { ...y, st: "Godkjent", by: "Anders Kristiansen · " + new Date().toTimeString().slice(0, 5) } : y)); A.toast("Godkjent av deg", x.out.toUpperCase()); };
  const ask = () => { if (!q.trim()) return; const t = new Date().toTimeString().slice(0, 5); setChat((c) => [...c, ["coach", t, q], ["caddie", t, "Jeg har laget et utkast: bevegelighet 30 min i stedet for Innspill ca. 150 m torsdag for Tobias og Magnus. Ingenting er sendt eller endret.", "PLAN UKE 40 · 26.09.2026"]]); setQ(""); setSaved(false); };
  let body;
  if (tab === "ko") body = <A.Cols tpl={desk ? "minmax(0,1fr) minmax(0,1.2fr)" : "minmax(0,1fr)"}>
    <div className="pa-card" style={{ padding: 0, overflow: "hidden" }}>{R.map((x, i) => <button key={x.id} type="button" aria-pressed={x.id === rid} onClick={() => setRid(x.id)} style={{ all: "unset", boxSizing: "border-box", width: "100%", cursor: "pointer", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "12px 16px", minHeight: 64, borderTop: i ? "1px solid var(--border-hairline)" : "none", background: x.id === rid ? "var(--surface-flat)" : "transparent", boxShadow: x.id === rid ? "inset 2px 0 0 var(--border-ink)" : "none" }}>
      <span style={{ flex: "1 1 180px", minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}><span style={{ font: "500 14px/1.3 var(--font-sans)" }}>{x.agent} · {x.skill}</span><A.Meta>26.09 {x.t} · {x.dur} · {x.out.toUpperCase()}</A.Meta></span><StatusPill tone={TONE[x.st]}>{x.st}</StatusPill></button>)}</div>
    {r && <A.Card gap={12}><A.Head k="Kjøringsdetalj" aside={"26.09 " + r.t + " · " + r.dur} /><div style={{ font: "var(--type-title-s)" }}>{r.agent} · {r.skill}</div>
      {r.err && <div style={{ display: "flex", gap: 8, padding: 12, borderRadius: 8, background: "var(--warn-tint)" }}><span style={{ color: "var(--warn)", display: "inline-flex" }}><Icon name="triangle-alert" size={16} /></span><span style={{ font: "var(--type-body-s)" }}>{r.err}</span></div>}
      <div>{r.steps.map(([t, s, src], i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "72px minmax(0,1fr)", gap: 10, padding: "8px 0", borderTop: "1px solid var(--border-hairline)" }}><span style={{ font: "var(--type-num-s)", color: "var(--text-muted)" }}>{t}</span><span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "var(--type-body-s)" }}>{s}</span><A.Meta>{src}</A.Meta></span></div>)}</div>
      <KeyValue items={[["Går ut som", r.out, { mono: false }], ["Godkjent av", r.by || null, { mono: false }]]} />
      <A.Meta>JARVIS SENDER OG ENDRER INGENTING SELV</A.Meta>
      {r.st === "Venter på coach" && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button icon="check" onClick={() => approve(r)}>Godkjenn og send</Button><Button variant="secondary" icon="pencil" onClick={() => go("AG-02", "agent")}>Rediger i Kø</Button><Button variant="ghost" onClick={() => { setRuns((l) => l.filter((y) => y.id !== r.id)); A.toast("Forkastet", "INGENTING SENDT"); }}>Forkast</Button></div>}
      {r.st === "Feilet" && <div><Button variant="secondary" icon="rotate-ccw" onClick={() => A.toast("Kjører på nytt", "FOR 15 SPILLERE MED PLAN · 3 HOPPES OVER")}>Kjør for de 15 som har plan</Button></div>}
    </A.Card>}
  </A.Cols>;
  if (tab === "prosj") body = <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,260px),1fr))", gap: 12 }}>{D.projects.map(([n, c, s]) => <A.Card key={n} gap={6}><span style={{ font: "600 15px/1.3 var(--font-sans)" }}>{n}</span><A.Meta>{c.toUpperCase()}</A.Meta><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{s}</span><div><Button size="sm" variant="ghost" icon="arrow-right" onClick={() => go("AG-21")}>Åpne i Oppgaver</Button></div></A.Card>)}</div>;
  if (tab === "skills") body = <A.Card gap={0}>{skills.map(([n, a, when, on], i) => <div key={n} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", minHeight: 56, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><span style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "600 13px/1.3 var(--font-mono)" }}>{n}</span><A.Meta>{a.toUpperCase()} · {when.toUpperCase()}</A.Meta></span><Switch checked={on} onChange={(e) => setSkills((l) => l.map((x, j) => j === i ? [x[0], x[1], x[2], e.target.checked] : x))} label={on ? "Aktiv" : "Av"} /></div>)}</A.Card>;
  if (tab === "chat") body = <A.Card gap={12} style={{ maxWidth: 820 }}>
    <A.Head k="Caddie · samtale" aside="SVARER MED KILDE OG DATO" />
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{chat.map(([who, t, txt, src], i) => { const me = who === "coach"; return <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "min(92%, 600px)", padding: "10px 12px", borderRadius: 8, background: me ? "var(--surface-sunken)" : "var(--surface-card)", border: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 4 }}><A.Meta>{me ? "ANDERS KRISTIANSEN" : "CADDIE"} · {t}</A.Meta><span style={{ font: "var(--type-body)", textWrap: "pretty" }}>{txt}</span>{src && <A.Meta>KILDE · {src}</A.Meta>}{!me && i === chat.length - 1 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}><A.Draft>{saved ? "Lagret som utkast" : "Forslag"}</A.Draft>{!saved && <Button size="sm" variant="secondary" icon="save" onClick={() => { setSaved(true); A.toast("Lagret som utkast i Workbench", "IKKE PUBLISERT · DU GODKJENNER"); }}>Lagre som utkast</Button>}</div>}</div>; })}</div>
    <textarea style={ta} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Spør Caddie om stallen, planer eller tall" aria-label="Spørsmål til Caddie" />
    <div><Button icon="send" disabled={!q.trim()} onClick={ask}>Spør Caddie</Button></div>
  </A.Card>;
  const pend = R.filter((x) => x.st === "Venter på coach").length;
  return <A.Page>
    <PageHeader kicker="Caddie · Jarvis" title="Caddie" sub="Jarvis og agentene forbereder alt. Ingenting går ut til et menneske før du har godkjent utkastet." />
    <A.Gate state={state} loading="Henter agentkøen …" error={{ title: "Caddie svarer ikke", text: "Ingen utkast er sendt eller slettet. Prøv igjen om litt.", code: "FEIL 503 · AGENTER" }}>
      <Tabs tabs={[{ value: "ko", label: "Agentkø", count: empty ? undefined : pend }, { value: "prosj", label: "Prosjekter" }, { value: "skills", label: "Skills" }, { value: "chat", label: "Samtale" }]} value={tab} onChange={setTab} />
      {empty && tab === "ko" ? <EmptyState icon="sparkles" title="Ingen kjøringer i dag" text="Agentene kjører hver morgen kl. 06:00. Du kan også spørre Caddie direkte." action="Åpne samtale" actionIcon="message-square" onAction={() => setTab("chat")} /> : body}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-19"] = { id: "AG-19", name: "Caddie / Jarvis", route: "/admin/caddie", Component: AG19 };
})();
