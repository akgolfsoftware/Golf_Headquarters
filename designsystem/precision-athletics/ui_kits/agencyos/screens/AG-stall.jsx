/* AG-07 Stall — runde 27 (Anders 28.09.2026). Tre bånd: I dag · Trener nå · Hele stallen (stall-matrisen fra kildematerialet).
   Rad per spiller sortert etter hvem som trenger deg først. Kortrader på mobil. ACWR vises «—». */
(() => {
const T = () => window.STALL;
const sgf = (n) => n == null ? "—" : (n > 0.04 ? "+" : n < -0.04 ? "−" : "±") + Math.abs(n).toFixed(1).replace(".", ",");
const Band = ({ k, meta, children }) => <section aria-label={k} className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}><div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto" }}>{k}</span>{meta != null && React.createElement(window.AGQ.Meta, null, meta)}</div>{children}</section>;
const Muted = ({ children }) => <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{children}</p>;
const score = (p) => p.g === "r" ? 9 : (p.g === "f" ? 0 : 5) + (p.adh == null ? 0 : p.adh / 100);

function MsgSheet({ p, onClose }) {
  const { Sheet, Button, ChoicePill, TextInput } = window.AGQ.ns(), A = window.AGQ;
  const [q, setQ] = React.useState(null), [txt, setTxt] = React.useState("");
  if (!p) return null;
  const msg = q || txt.trim();
  return <Sheet open onClose={onClose} kicker={"Under økta · " + p.what} title={"Melding til " + p.who} footer={<><Button fullWidth icon="send" disabled={!msg} onClick={() => { A.toast("Sendt som varsel", (p.who + " · SVARER MED ETT TRYKK").toUpperCase()); onClose(); }}>Send varsel</Button><Button variant="ghost" fullWidth onClick={onClose}>Avbryt</Button></>}>
    <A.Meta>HURTIGMELDING</A.Meta>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{T().quick.map((m) => <ChoicePill key={m} selected={q === m} onClick={() => { setQ(q === m ? null : m); setTxt(""); }}>{m}</ChoicePill>)}</div>
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>Eller skriv selv</span><TextInput value={txt} onChange={(e) => { setTxt(e.target.value); setQ(null); }} placeholder="Kort melding" /></label>
    <A.Meta>SPILLEREN SVARER MED ETT TRYKK: OK · SPØRSMÅL · IKKE NÅ</A.Meta>
  </Sheet>;
}
function Follow({ p, onClose }) {
  const { Sheet, Button } = window.AGQ.ns(), A = window.AGQ;
  if (!p) return null;
  return <Sheet open onClose={onClose} kicker={"Følger økta · startet " + p.start} title={p.who + " · " + p.what} footer={<Button variant="secondary" fullWidth onClick={onClose}>Lukk</Button>}>
    <A.Meta>BARE LESING · DU KAN IKKE ENDRE REPETISJONENE</A.Meta>
    <div role="list">{p.done.map(([n, r, pl], i) => <div role="listitem" key={n} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 48, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}><span style={{ font: (i === p.drill - 1 ? "600" : "400") + " 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{n}{i === p.drill - 1 ? " · pågår" : ""}</span><span aria-hidden="true" style={{ height: 4, background: "var(--surface-sunken)", position: "relative" }}><span style={{ position: "absolute", inset: 0, width: Math.min(100, r / pl * 100) + "%", background: "var(--primary)" }}></span></span></span><span style={{ font: "600 14px/1 var(--font-mono)", color: "var(--text-primary)" }}>{r} / {pl}</span></div>)}</div>
  </Sheet>;
}
function PlayerRow({ p, i, wide, go }) {
  const { Avatar, Sparkline, StatusPill } = window.AGQ.ns(), A = window.AGQ;
  const d = p.sg ? p.sg[p.sg.length - 1] - p.sg[0] : null;
  const cells = [["ETTERLEVELSE 4 U", p.adh == null ? "—" : p.adh + " %"], ["SG PER RUNDE · ESTIMAT", p.sg ? sgf(p.sg[p.sg.length - 1]) : "—"], ["SG-ENDRING 30 D", p.sg ? sgf(d) : "—"], ["SISTE ØKT", p.last], ["NESTE TURNERING", p.turn || "—"], ["PLAN SLUTTER", p.planDays == null ? "—" : "om " + p.planDays + " d"], ["AVTALE", p.clip ? p.clip[0] + " av " + p.clip[1] + " klipp · fornyes " + p.clip[2].slice(0, 5) : "—"], ["ACWR", "—"]];
  return <button type="button" role="listitem" onClick={() => go("AG-08")} aria-label={p.name + (p.why ? " · " + p.why : "")} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "flex", flexDirection: "column", gap: 8, padding: "12px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}>
    <span style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}><Avatar name={p.name} size={32} /><span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{p.name}</span><A.Meta>KATEGORI {p.cat} · {p.grp.toUpperCase()}</A.Meta></span>{p.sg && <span style={{ width: 80, flex: "none", display: "flex", flexDirection: "column", gap: 2 }}><Sparkline values={p.sg} height={24} label={"SG per runde siste 30 dager, " + p.name} /><A.Meta s={{ fontSize: 10 }}>SG · 30 D</A.Meta></span>}</span>
    {p.why && <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><StatusPill tone={p.g === "r" ? "neutral" : "warn"}>{p.g === "r" ? "Hviler" : "Trenger deg"}</StatusPill><span style={{ font: "500 13px/1.35 var(--font-sans)", color: "var(--text-primary)" }}>{p.why}</span></span>}
    <span style={{ display: "grid", gridTemplateColumns: wide ? "repeat(8,minmax(0,1fr))" : "repeat(2,minmax(0,1fr))", gap: "6px 12px" }}>{cells.map(([k, v]) => <span key={k} style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><A.Meta>{k}</A.Meta><span style={{ font: "500 13px/1.3 var(--font-mono)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{v}</span></span>)}</span>
  </button>;
}
function AG07({ state, go }) {
  const { PageHeader, Button, EmptyState, ChoicePill } = window.AGQ.ns(), A = window.AGQ, { cw } = A.useW(), empty = state === "tom", wide = cw >= 1100;
  const [msg, setMsg] = React.useState(null), [fol, setFol] = React.useState(null), [g, setG] = React.useState("alle");
  const P = empty ? [] : [...T().players].sort((a, b) => score(a) - score(b));
  const shown = g === "alle" ? P : P.filter((p) => p.g === g);
  const today = <Band k="I dag" meta={empty ? "INGEN" : T().today.length + " AVTALER"}>{empty ? <Muted>Du coacher ingen i dag.</Muted> : <div role="list">{T().today.map((x, i) => <button key={x.id} type="button" role="listitem" onClick={() => go("AG-08")} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "grid", gridTemplateColumns: "56px minmax(0,1fr)", gap: 12, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><span style={{ font: "600 15px/1 var(--font-mono)", color: "var(--text-primary)" }}>{x.t}</span><span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{x.who}</span><A.Meta>{x.what.toUpperCase()}</A.Meta></span></button>)}</div>}</Band>;
  const live = <Band k="Trener nå" meta={empty ? "INGEN" : T().live.length + " ØKTER I GANG"}>{empty ? <Muted>Ingen er i gang med en økt.</Muted> : <div role="list">{T().live.map((x, i) => <div role="listitem" key={x.id} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}>
    <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{x.who} · {x.what}</span><A.Meta>{x.where.toUpperCase()} · STARTET {x.start} · DRILL {x.drill} AV {x.drills} · {x.cur.toUpperCase()}</A.Meta></span>
    <span aria-label={x.reps + " av " + x.plan + " repetisjoner"} style={{ display: "flex", gap: 8, alignItems: "center" }}><span aria-hidden="true" style={{ flex: 1, height: 6, background: "var(--surface-sunken)", position: "relative" }}><span style={{ position: "absolute", inset: 0, width: (x.reps / x.plan * 100) + "%", background: "var(--primary)" }}></span></span><span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)" }}>{x.reps} / {x.plan}</span></span>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" icon="send" onClick={() => setMsg(x)}>Send melding</Button><Button size="sm" variant="ghost" icon="eye" onClick={() => setFol(x)}>Følg repetisjonene</Button></div>
  </div>)}</div>}</Band>;
  const all = <Band k="Hele stallen" meta={empty ? "0 SPILLERE" : P.length + " SPILLERE · TRENGER DEG FØRST"}>
    {!empty && <div role="group" aria-label="Stall-matrise" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{[["alle", "Alle"], ...T().groups].map(([k, l]) => <ChoicePill key={k} selected={g === k} onClick={() => setG(k)}>{l + " · " + (k === "alle" ? P.length : P.filter((p) => p.g === k).length)}</ChoicePill>)}</div>}
    {empty ? <EmptyState icon="users" title="Ingen spillere i stallen" text="Inviter en spiller eller legg til en gruppe." action="Inviter spiller" actionIcon="user-plus" onAction={() => A.toast("Invitasjon", "SKRIV E-POST")} /> : <div role="list">{shown.map((p, i) => <PlayerRow key={p.id} p={p} i={i} wide={wide} go={go} />)}</div>}
    <A.Meta>{T().src} · ACWR VISES «—» TIL DET ER AVKLART</A.Meta>
  </Band>;
  return <A.Page>
    <PageHeader kicker="Stall · Anders Kristiansen" title="Stall" />
    <A.Gate state={state} loading="Henter stallen …" error={{ title: "Stallen kunne ikke hentes", text: "Ingen spillere er endret. Prøv igjen.", code: "FEIL 503 · STALL · 10:24" }}>
      {cw >= 1000 ? <A.Cols tpl="minmax(0,1fr) minmax(0,1.2fr)">{today}{live}</A.Cols> : <A.Stack>{today}{live}</A.Stack>}
      {all}
    </A.Gate>
    <MsgSheet p={msg} onClose={() => setMsg(null)} />
    <Follow p={fol} onClose={() => setFol(null)} />
  </A.Page>;
}
window.AG_SCREENS["AG-07"] = { id: "AG-07", name: "Stall", route: "/admin/spillere", Component: AG07 };
})();
