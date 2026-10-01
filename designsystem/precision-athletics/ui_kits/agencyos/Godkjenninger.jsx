(() => {
const { Button, Avatar, AxisBadge, StatusPill, Icon, Segmented, ChoicePill, Input } = window.AKGolfPrecisionAthletics_7d7c29;
const { PageHead, pageWrap } = window.KIT;
const { useCW, toast, clock, Meta, Pills } = window.AOA;
const D = window.AOA_DATA;
const TYPES = { okt: ["Treningsøkt · PlanAction", "sparkles"], endring: ["Endringsforslag", "arrow-left-right"], fravaer: ["Fravær", "calendar-x"], samtykke: ["Foreldresamtykke", "file-pen-line"] };
const DONE = { okt: "Publisert", endring: "Godtatt", fravaer: "Godtatt", samtykke: "Godtatt" };
const REASONS = { okt: ["For høy belastning", "Feil dag", "Mangler øvelse", "Bytt område"], endring: ["Hold opprinnelig plan", "Foreslå annen dag"], fravaer: ["Mangler dokumentasjon", "Feil dato"], samtykke: ["Ufullstendig signatur", "Feil forelder"] };
function Item({ a, mob, onDone }) {
  const [edit, setEdit] = React.useState(false);
  const [why, setWhy] = React.useState(null);
  const [note, setNote] = React.useState("");
  const [type, icon] = TYPES[a.type];
  return <article style={{ background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: 8, padding: mob ? 16 : 20, display: "flex", flexDirection: "column", gap: 14, minWidth: 0, boxShadow: a.due ? "inset 3px 0 0 var(--warn)" : "none" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Icon name={icon} size={16} color="var(--text-secondary)" />
      <Meta>{type.toUpperCase()} · FRA {a.src.toUpperCase()}</Meta>
      <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>{a.age && <StatusPill tone="info">Under 16 år</StatusPill>}{a.due && <StatusPill tone="warn">Frist {a.due}</StatusPill>}{a.axis && !mob && <AxisBadge axis={a.axis} />}</span>
    </div>
    <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
      <Avatar name={a.who} size={36} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ font: "600 16px/1.3 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{a.title}</div>
        <div style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", marginTop: 2 }}>{a.who}{a.age ? " · " + a.age + " år" : ""} · {a.grp}</div>
      </div>
    </div>
    <div style={{ background: "var(--surface-sunken)", borderRadius: 8, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ font: "500 14px/1.4 var(--font-sans)", color: "var(--text-body)", paddingBottom: 8, textWrap: "pretty" }}>{a.summary}</div>
      {a.lines.map(([k, v, n], i) => <div key={i} style={{ display: "grid", gridTemplateColumns: mob ? "minmax(0,1fr) auto" : "150px minmax(0,1fr) auto", gap: mob ? "2px 12px" : 12, padding: "8px 0", borderTop: "1px solid var(--border-hairline)", alignItems: "baseline" }}>
        <Meta s={mob ? { gridColumn: "1 / -1" } : null}>{k.toUpperCase()}</Meta>
        <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)", minWidth: 0 }}>{v}</span>
        <span style={{ font: "var(--type-num-s)", fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>{n}</span>
      </div>)}
    </div>
    {edit ? <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--border-hairline)", paddingTop: 14 }}>
      <span className="kicker">Hva må endres</span>
      <Pills>{REASONS[a.type].map((r) => <ChoicePill key={r} selected={why === r} onClick={() => setWhy(r)}>{r}</ChoicePill>)}</Pills>
      <Input label="Kommentar til Caddie og spiller" placeholder="Valgfritt" value={note} onChange={(e) => setNote(e.target.value)} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button variant="primary" icon="undo-2" disabled={!why} onClick={() => onDone(a, "Utkast", "Sendt tilbake · " + why)}>Send tilbake</Button>
        <Button variant="secondary" disabled={!why} onClick={() => onDone(a, "Avvist", why)}>Avvis</Button>
        <Button variant="ghost" onClick={() => setEdit(false)}>Avbryt</Button>
      </div>
    </div> : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <div style={{ flex: mob ? "1 1 0" : "none", display: "flex" }}><Button variant="primary" icon="check" fullWidth={mob} onClick={() => onDone(a, DONE[a.type])}>Godkjenn</Button></div>
      <div style={{ flex: mob ? "1 1 0" : "none", display: "flex" }}><Button variant="secondary" icon="pencil-line" fullWidth={mob} onClick={() => setEdit(true)}>Avvis / Endre</Button></div>
    </div>}
  </article>;
}
function Godkjenninger() {
  const { mob, cw } = useCW();
  const [items, setItems] = React.useState(D.approvals);
  const [done, setDone] = React.useState([]);
  const [f, setF] = React.useState("alle");
  const onDone = (a, status, why) => {
    setItems((l) => l.filter((x) => x.id !== a.id));
    setDone((l) => [{ ...a, status, why, t: clock() }, ...l]);
    toast(a.who + " · " + a.title, status.toUpperCase() + " · " + clock());
  };
  const undo = (a) => { setDone((l) => l.filter((x) => x.id !== a.id)); setItems((l) => [...l, a].sort((x, y) => x.id.localeCompare(y.id))); };
  const plans = items.filter((a) => a.due);
  const approveAll = () => plans.forEach((a) => onDone(a, "Publisert"));
  const n = (t) => items.filter((a) => t.includes(a.type)).length;
  const filters = [{ value: "alle", label: "Alle · " + items.length }, { value: "okt", label: "Økter · " + n(["okt"]) }, { value: "endr", label: (mob ? "Endring" : "Endring og fravær") + " · " + n(["endring", "fravaer"]) }, { value: "samt", label: "Samtykke · " + n(["samtykke"]) }];
  const shown = items.filter((a) => f === "alle" || (f === "okt" && a.type === "okt") || (f === "endr" && ["endring", "fravaer"].includes(a.type)) || (f === "samt" && a.type === "samtykke"));
  return <div style={{ ...pageWrap, maxWidth: 960 }}>
    <PageHead kicker="AG-02 · Lørdag 26.09" title="Godkjenningskø" sub="Caddie har laget utkastene. Du godkjenner før noe publiseres til spiller eller forelder." actions={plans.length > 1 && <Button variant="secondary" icon="check-check" onClick={approveAll}>Godkjenn alle ukeplaner · {plans.length}</Button>} />
    {mob ? <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>{filters.map((o) => <ChoicePill key={o.value} selected={f === o.value} onClick={() => setF(o.value)} style={{ minWidth: 0, width: "100%", paddingLeft: 8, paddingRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.label}</ChoicePill>)}</div> : <Segmented options={filters} value={f} onChange={setF} />}
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {shown.map((a) => <Item key={a.id} a={a} mob={mob} onDone={onDone} />)}
      {!shown.length && <div style={{ border: "1px dashed var(--border-strong)", borderRadius: 8, padding: 32, textAlign: "center", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}><Icon name="inbox" size={20} color="var(--text-muted)" /><span style={{ font: "500 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>Ingenting venter her</span><Meta>KØEN ER TOM · {clock()}</Meta></div>}
    </div>
    {done.length > 0 && <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span className="kicker">Behandlet i dag · {done.length}</span>
      <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: 8, padding: "0 16px" }}>
        {done.map((a, i) => <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 56, padding: "8px 0", borderBottom: i === done.length - 1 ? "none" : "1px solid var(--border-hairline)", minWidth: 0, flexWrap: cw < 480 ? "wrap" : "nowrap" }}>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}><div style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.who} · {a.title}</div>{a.why && <div style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{a.why}</div>}</div>
          <StatusPill tone={a.status === "Avvist" ? "warn" : a.status === "Utkast" ? "neutral" : "ok"}>{a.status}</StatusPill>
          <Meta>{a.t}</Meta>
          <Button size="sm" variant="ghost" onClick={() => undo(a)}>Angre</Button>
        </div>)}
      </div>
    </section>}
  </div>;
}
window.Godkjenninger = Godkjenninger;
})();
