(() => {
const { Button, Avatar, AxisBadge, StatusPill, Icon, Segmented } = window.AKGolfPrecisionAthletics_7d7c29;
const { Panel, PageHead, pageWrap } = window.KIT;
const { useCW, toast, clock, Meta, Row } = window.AOA;
const D = window.AOA_DATA;
function Fact({ k, v, hot }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 12px", borderRadius: 8, background: hot ? "var(--warn-tint)" : "var(--surface-sunken)", minWidth: 0 }}>
    <Meta s={{ color: hot ? "var(--warn)" : "var(--text-muted)" }}>{k.toUpperCase()}</Meta>
    <span style={{ font: "600 15px/1.2 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: hot ? "var(--warn)" : "var(--text-primary)" }}>{v}</span>
  </div>;
}
function DispatchCard({ d, onAct }) {
  const s = d.state;
  return <article style={{ border: "1px solid var(--border-hairline)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12, background: s ? "var(--surface-sunken)" : "var(--surface-card)", minWidth: 0, transition: "background-color 200ms var(--ease-out)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Icon name={d.icon} size={16} color="var(--text-secondary)" />
      <Meta>{d.src.toUpperCase()} · {d.t}</Meta>
      <span style={{ marginLeft: "auto" }}><AxisBadge axis={d.axis} /></span>
    </div>
    <div style={{ font: "600 16px/1.3 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{d.title}</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,128px),1fr))", gap: 8 }}>{d.facts.map((f) => <Fact key={f[0]} k={f[0]} v={f[1]} hot={f[2]} />)}</div>
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{d.body}</p>
    {s ? <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><StatusPill tone={s.k === "ok" ? "ok" : "neutral"}>{s.label}</StatusPill><Meta>{s.t}</Meta><span style={{ marginLeft: "auto" }}><Button size="sm" variant="ghost" onClick={() => onAct(d, null)}>Angre</Button></span></div>
      : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" variant="primary" icon="check" onClick={() => onAct(d, "ok")}>Godkjenn</Button><Button size="sm" variant="secondary" icon="list-plus" onClick={() => onAct(d, "queue")}>Send til kø</Button></div>}
  </article>;
}
function Cockpit({ go }) {
  const { mob, cw } = useCW();
  const [disp, setDisp] = React.useState(() => D.dispatch.map((d) => ({ ...d, state: null })));
  const [tab, setTab] = React.useState("idag");
  const act = (d, k) => {
    setDisp((l) => l.map((x) => x.id === d.id ? { ...x, state: k && { k, label: k === "ok" ? "Godkjent" : "I godkjenningskø", t: clock() } } : x));
    if (k) toast(k === "ok" ? d.title + " · godkjent" : "Sendt til godkjenningskø", "AGENTICOS · " + clock());
  };
  const open = disp.filter((d) => !d.state).length;
  const wide = cw > 1180;
  const R = D.roster;
  const tabs = [{ value: "idag", label: (mob ? "Trener" : "Trener i dag") + " · " + R.idag.length }, { value: "skadet", label: "Skadet · " + R.skadet.length }, { value: "ubesvart", label: "Ubesvart · " + R.ubesvart.length }];
  return <div style={pageWrap}>
    <PageHead kicker="AG-01 · Lørdag 26.09 · Uke 39" title="Cockpit" />
    <section data-screen-label="Én ting nå" style={{ background: "var(--surface-inverse)", color: "var(--text-inverse)", borderRadius: 8, padding: mob ? 20 : 32, display: "grid", gridTemplateColumns: mob ? "minmax(0,1fr)" : "minmax(0,1fr) auto", gap: mob ? 20 : 32, alignItems: "end" }}>
      <div style={{ minWidth: 0 }}>
        <div className="kicker" style={{ color: "var(--sand-400)" }}>Én ting nå</div>
        <div style={{ font: "600 clamp(22px, 1.6vw + 14px, 34px)/1.18 var(--font-sans)", letterSpacing: "var(--tracking-display)", marginTop: 12, textWrap: "balance" }}>3 ventende ukeplaner må godkjennes før kl. 18:00</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex" }}>{["Sara Holm", "Ingrid Berg", "Emil Solberg"].map((n, i) => <span key={n} style={{ marginLeft: i ? -8 : 0, borderRadius: 999, boxShadow: "0 0 0 2px var(--surface-inverse)", display: "flex" }}><Avatar name={n} size={28} /></span>)}</div>
          <span style={{ font: "var(--type-body-s)", color: "var(--sand-300)" }}>Sara Holm, Ingrid Berg og Emil Solberg · uke 40 publiseres til spiller og forelder</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: mob ? "stretch" : "flex-end" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: mob ? "flex-start" : "flex-end" }}><span style={{ font: "500 29px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>3 t 12 min</span><Meta s={{ color: "var(--sand-400)", whiteSpace: "nowrap" }}>TIL FRIST</Meta></div>
        <Button variant="primary" size="lg" iconRight="arrow-right" fullWidth={mob} onClick={() => go("godkjenninger")}>Åpne godkjenninger</Button>
      </div>
    </section>
    <div style={{ display: "grid", gridTemplateColumns: wide ? "minmax(0,1.3fr) minmax(0,1fr)" : "minmax(0,1fr)", gap: 16, alignItems: "start" }}>
      <Panel kicker="AgenticOS · AI-dispatch" title={open ? open + " forslag venter på deg" : "Ingen forslag venter"} action={<Meta>CADDIE FORESLÅR · COACH GODKJENNER</Meta>}>
        <div style={{ display: "grid", gridTemplateColumns: cw > 1400 || (cw > 760 && !wide) ? "repeat(2,minmax(0,1fr))" : "minmax(0,1fr)", gap: 12 }}>{disp.map((d) => <DispatchCard key={d.id} d={d} onAct={act} />)}</div>
      </Panel>
      <Panel kicker="Sanntid · stall" title="Stalloverblikk" action={<Meta>OPPDATERT {clock()}</Meta>}>
        <Segmented options={tabs} value={tab} onChange={setTab} fullWidth />
        <div>
          {tab === "idag" && R.idag.map(([n, s, t, st], i) => <Row key={n} last={i === R.idag.length - 1} lead={<span style={{ font: "var(--type-num)", fontVariantNumeric: "tabular-nums", width: 44, flex: "none", color: "var(--text-primary)" }}>{t}</span>} title={n} sub={s} trail={st === "Pågår" ? <StatusPill tone="live">Pågår</StatusPill> : !mob && <StatusPill>Planlagt</StatusPill>} />)}
          {tab === "skadet" && R.skadet.map(([n, s, t, tone], i) => <Row key={n} last={i === R.skadet.length - 1} lead={<Avatar name={n} size={32} />} title={n} sub={s} trail={<StatusPill tone={tone}>{t}</StatusPill>} />)}
          {tab === "ubesvart" && R.ubesvart.map(([n, s, t], i) => <Row key={n} last={i === R.ubesvart.length - 1} lead={<Avatar name={n} size={32} />} title={n} sub={s} trail={<><Meta>{t}</Meta>{!mob && <Button size="sm" variant="secondary">Svar</Button>}</>} onClick={mob ? () => toast("Åpner tråd med " + n, "INNBOKS") : undefined} />)}
        </div>
      </Panel>
    </div>
  </div>;
}
window.Cockpit = Cockpit;
})();
