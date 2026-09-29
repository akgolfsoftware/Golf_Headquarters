(() => {
function AG01({ state, go }) {
  const { PageHeader, Button, Badge, StatusPill, EmptyState, Icon, AxisBadge } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA, { mob, pad, desk, wide } = A.useW(), empty = state === "tom";
  const [done, setDone] = React.useState({}), [nowDone, setNowDone] = React.useState(false);
  const approve = (d) => { setDone((x) => ({ ...x, [d.id]: "godkjent" })); A.toast("Godkjent av deg", (d.out + " · " + d.who).toUpperCase()); };
  const reject = (d) => { setDone((x) => ({ ...x, [d.id]: "avvist" })); A.toast("Forslaget er avvist", "INGENTING SENDT"); };
  const disp = empty ? [] : D.dispatch;
  const tone = { "Pågår": "info", "Gjennomført": "ok", "Bekreftet": "neutral" };
  const nowCard = <A.Card pad={mob ? 16 : 24} gap={12} style={{ borderColor: "var(--border-ink)", boxShadow: "inset 0 0 0 1px var(--border-ink)" }}>
    <A.Head k="Én ting nå" aside={empty || nowDone ? null : "FRIST " + D.now.due} />
    {empty || nowDone ? <EmptyState icon="check" title="Ingenting haster" text="Køen er tom. Neste naturlige steg er å se over uke 40 for stallen." action="Åpne Kalender" actionIcon="calendar-days" onAction={() => go("AG-05")} /> : <>
      <div style={{ font: "600 clamp(19px, 1vw + 14px, 24px)/1.25 var(--font-sans)", color: "var(--text-primary)", textWrap: "balance" }}>{D.now.title}</div>
      <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-secondary)", textWrap: "pretty", maxWidth: 640 }}>{D.now.why}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><Button icon="arrow-right" onClick={() => go("AG-02")}>Åpne i Kø</Button><Button variant="ghost" onClick={() => { setNowDone(true); A.toast("Utsatt til i kveld", "PÅMINNELSE 17:30"); }}>Senere</Button><span style={{ flex: 1 }}></span><A.Meta>{D.now.src}</A.Meta></div>
    </>}
  </A.Card>;
  const counters = <A.Card gap={8}>
    <A.Head k="Kø" aside={empty ? "—" : "OPPDATERT 26.09 14:00"} />
    <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,minmax(0,1fr))" : "repeat(3,minmax(0,1fr))", gap: 8 }}>
      {D.counts.map((c) => <button key={c.id} type="button" onClick={() => go(c.to, c.tab)} className="pa-card pa-card--interactive" style={{ padding: 12, gap: 6, textAlign: "left", font: "inherit", cursor: "pointer", minWidth: 0, minHeight: 76, background: "var(--surface-flat)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}><span style={{ font: "600 24px/1 var(--font-mono)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{empty ? "—" : c.n}</span>{!empty && c.signal && <Badge count={c.n} tone="signal" label="venter" />}</span>
        <span style={{ font: "500 13px/1.25 var(--font-sans)", color: "var(--text-secondary)" }}>{c.label}</span>
      </button>)}
    </div>
  </A.Card>;
  const plan = <A.Card gap={8}>
    <A.Head k={"Dagens plan · " + D.dayLabel} aside={empty ? "—" : D.plan.filter((p) => p.k !== "ledig").length + " HENDELSER"} />
    {empty ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen hendelser i dag. Legg inn tilgjengelighet så spillerne kan booke.</p> :
      D.plan.map((p, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "52px minmax(0,1fr)", gap: 10, alignItems: "stretch" }}>
        <span style={{ font: "500 13px/1 var(--font-mono)", color: "var(--text-secondary)", paddingTop: 10 }}>{p.t}</span>
        <A.EvCard axes={p.axis} dashed={p.k === "ledig"}>
          <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: p.k === "ledig" ? "var(--text-muted)" : "var(--text-primary)", flex: "1 1 160px", minWidth: 0 }}>{p.title}</span>{p.status && <StatusPill tone={tone[p.status]}>{p.status}</StatusPill>}</span>
          <A.Meta>{p.t}–{p.end}{p.where ? " · " + p.where.toUpperCase() : " · KAN BOOKES"}{p.n ? " · " + p.n + " SPILLERE" : ""}</A.Meta>
        </A.EvCard>
      </div>)}
  </A.Card>;
  const dispatch = <A.Card gap={12}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto" }}>Jarvis · forslag</span><A.Meta>{empty ? "—" : disp.filter((d) => !done[d.id]).length + " VENTER"}</A.Meta></div>
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Jarvis og agentene forbereder. Ingenting går ut før du godkjenner.</p>
    {empty ? <EmptyState icon="sparkles" title="Ingen forslag nå" text="Jarvis ser etter belastning, fravær og spillere uten økt hver morgen kl. 06:00." /> :
      disp.map((d, i) => { const st = done[d.id]; return <div key={d.id} style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: i ? 14 : 4, borderTop: i ? "1px solid var(--border-hairline)" : "none", opacity: st ? .7 : 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><Icon name={d.icon} size={16} /><A.Meta s={{ color: "var(--text-secondary)" }}>{d.agent.toUpperCase()} · {d.t}</A.Meta><AxisBadge axis={d.axis} /><span style={{ flex: 1 }}></span>{st ? <StatusPill tone={st === "godkjent" ? "ok" : "neutral"}>{st === "godkjent" ? "Godkjent" : "Avvist"}</StatusPill> : <A.Draft />}</div>
        <div style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{d.title} · {d.who}</div>
        <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{d.body}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,150px),1fr))", gap: 8 }}>{d.facts.map(([k, v, src]) => <div key={k} style={{ display: "flex", flexDirection: "column", gap: 3, padding: "8px 10px", background: "var(--surface-sunken)", borderRadius: 4, minWidth: 0 }}><span style={{ font: "var(--type-body-s)", fontSize: 12, color: "var(--text-secondary)" }}>{k}</span><span style={{ font: "600 15px/1.1 var(--font-mono)", color: "var(--text-primary)" }}>{v}</span><A.Meta s={{ fontSize: 10 }}>{src}</A.Meta></div>)}</div>
        {st ? <A.Meta>{st === "godkjent" ? "GODKJENT AV ANDERS KRISTIANSEN · 26.09 " + new Date().toTimeString().slice(0, 5) + " · " + d.out.toUpperCase() : "AVVIST · INGENTING SENDT"}</A.Meta>
          : <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><Button size="sm" variant="secondary" icon="check" onClick={() => approve(d)}>Godkjenn</Button><Button size="sm" variant="ghost" icon="pencil" onClick={() => go("AG-02", "agent")}>Rediger</Button><Button size="sm" variant="ghost" onClick={() => reject(d)}>Avvis</Button><span style={{ flex: 1 }}></span><A.Meta>GÅR UT: {d.out.toUpperCase()}</A.Meta></div>}
      </div>; })}
  </A.Card>;
  return <A.Page>
    <PageHeader kicker={D.dayLabel + " · uke " + D.week} title="Hjem" sub="God ettermiddag, Anders." />
    <A.Gate state={state} loading="Henter dagen din …" error={{ title: "Hjem kunne ikke lastes", text: "Kø, kalender og forslag er lagret. Prøv igjen, eller gå rett til Kø.", code: "FEIL 503 · COCKPIT" }}>
      {nowCard}
      {desk ? <A.Cols tpl={wide ? "minmax(0,1fr) minmax(0,1fr) minmax(0,1.25fr)" : "minmax(0,1fr) minmax(0,1.2fr)"}>
        {wide ? <>{plan}{counters}{dispatch}</> : <><A.Stack>{counters}{plan}</A.Stack>{dispatch}</>}
      </A.Cols> : pad ? <A.Cols tpl="repeat(2,minmax(0,1fr))"><A.Stack>{counters}{plan}</A.Stack>{dispatch}</A.Cols> : <A.Stack>{counters}{dispatch}{plan}</A.Stack>}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-01"] = { id: "AG-01", name: "Hjem (cockpit)", route: "/admin/agencyos", Component: AG01 };
})();
