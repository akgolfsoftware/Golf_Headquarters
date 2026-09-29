(() => {
const { Button, Avatar, StatusPill, Icon, Segmented, ChoicePill, Stepper, Input, Dialog } = window.AKGolfPrecisionAthletics_7d7c29;
const { PageHead, pageWrap, Kv } = window.KIT;
const { useCW, toast, clock, Meta, Pills, Inspector, Bar } = window.AOA;
const D = window.AOA_DATA;
const H0 = 7, H1 = 21, RH = 48;
const hm = (h) => String(Math.floor(h)).padStart(2, "0") + ":" + (h % 1 ? "30" : "00");
const span = (e) => hm(e.s) + "–" + hm(e.s + e.l);
const DAYN = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
const KIND = {
  felles: { bg: "var(--surface-inverse)", fg: "var(--text-inverse)", sub: "var(--sand-400)", bd: "none", label: "Fellestrening" },
  privat: { bg: "var(--surface-card)", fg: "var(--text-primary)", sub: "var(--text-secondary)", bd: "1px solid var(--border-ink)", label: "Privattime" },
  ledig: { bg: "transparent", fg: "var(--text-secondary)", sub: "var(--text-muted)", bd: "1px dashed var(--border-strong)", label: "Ledig · bookbar" },
  opptatt: { bg: "var(--sand-300)", fg: "var(--text-body)", sub: "var(--text-secondary)", bd: "none", label: "Opptatt" },
};
const evTitle = (e) => e.k === "privat" ? e.who : e.k === "ledig" ? "Ledig" : e.title;
function Block({ e, sel, onClick, compact }) {
  const k = KIND[e.k];
  return <button onClick={onClick} aria-pressed={sel} style={{ position: "absolute", top: (e.s - H0) * RH + 2, height: e.l * RH - 4, left: 3, right: 3, background: k.bg, color: k.fg, border: k.bd, borderRadius: 8, padding: "6px 8px", textAlign: "left", cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column", gap: 2, outline: sel ? "2px solid var(--focus-ring)" : "none", outlineOffset: 2, font: "inherit", transition: "transform 120ms var(--ease-out)" }}>
    <span style={{ font: "500 13px/1.25 var(--font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{evTitle(e)}</span>
    {e.l >= 1 && <span style={{ font: "400 11px/1.2 var(--font-mono)", color: k.sub, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{hm(e.s)}{!compact && "–" + hm(e.s + e.l)}</span>}
  </button>;
}
function TimeGrid({ days, events, sel, setSel, compact }) {
  const hours = Array.from({ length: H1 - H0 }, (_, i) => H0 + i);
  return <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: 8, overflow: "hidden", minWidth: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: `48px repeat(${days.length},minmax(0,1fr))`, borderBottom: "1px solid var(--border-hairline)" }}>
      <span></span>
      {days.map((d) => <div key={d} style={{ padding: "10px 8px", borderLeft: "1px solid var(--border-hairline)", display: "flex", gap: 6, alignItems: "baseline", minWidth: 0 }}><span style={{ font: "600 13px/1 var(--font-sans)", color: "var(--text-primary)" }}>{days.length === 1 ? DAYN[d] : D.days[d][0]}</span><Meta>{D.days[d][1]}</Meta></div>)}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: `48px repeat(${days.length},minmax(0,1fr))`, position: "relative" }}>
      <div>{hours.map((h) => <div key={h} style={{ height: RH, borderTop: h > H0 ? "1px solid var(--border-hairline)" : "none", padding: "4px 8px 0 0", textAlign: "right" }}><Meta>{hm(h)}</Meta></div>)}</div>
      {days.map((d) => <div key={d} style={{ position: "relative", borderLeft: "1px solid var(--border-hairline)", background: d === 6 ? "var(--surface-sunken)" : "transparent" }}>
        {hours.map((h) => <div key={h} style={{ height: RH, borderTop: h > H0 ? "1px solid var(--border-hairline)" : "none" }}></div>)}
        {events.filter((e) => e.d === d).map((e) => <Block key={e.id} e={e} sel={sel === e.id} compact={compact} onClick={() => setSel(e.id)} />)}
      </div>)}
    </div>
  </div>;
}
function Agenda({ events, sel, setSel }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{D.days.map(([dn, dd], d) => { const list = events.filter((e) => e.d === d).sort((a, b) => a.s - b.s); return <section key={d} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}><span style={{ font: "600 14px/1 var(--font-sans)", color: "var(--text-primary)" }}>{DAYN[d]}</span><Meta>{dd}</Meta></div>
    {list.length ? list.map((e) => { const k = KIND[e.k]; return <button key={e.id} onClick={() => setSel(e.id)} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 56, padding: "8px 14px", textAlign: "left", background: k.bg, color: k.fg, border: k.bd, borderRadius: 8, cursor: "pointer", outline: sel === e.id ? "2px solid var(--focus-ring)" : "none", outlineOffset: 2, font: "inherit", width: "100%", minWidth: 0 }}>
      <span style={{ font: "500 13px/1.3 var(--font-mono)", fontVariantNumeric: "tabular-nums", width: 88, flex: "none" }}>{span(e)}</span>
      <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", font: "500 14px/1.3 var(--font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{evTitle(e)}</span><span style={{ display: "block", font: "var(--type-body-s)", color: k.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.label}{e.loc ? " · " + e.loc : ""}</span></span>
    </button>; }) : <Meta>— INGEN TIMER</Meta>}
  </section>; })}</div>;
}
function Kalender() {
  const { mob, cw } = useCW();
  const [events, setEvents] = React.useState(D.events);
  const [view, setView] = React.useState("uke");
  const [day, setDay] = React.useState(0);
  const [sel, setSelRaw] = React.useState(null);
  const [move, setMove] = React.useState(null);
  const [dlg, setDlg] = React.useState(false);
  const [nb, setNb] = React.useState({ d: 0, s: 13, l: 1, t: "Opptatt" });
  const setSel = (id) => { setSelRaw(id); setMove(null); };
  const side = cw > 1180;
  const gridW = side && sel ? cw - 340 : cw;
  const grid = view === "dag" || gridW >= 820;
  const ev = events.find((e) => e.id === sel);
  const free = events.filter((e) => e.k === "ledig" && e.id !== sel);
  const doMove = () => {
    const to = events.find((e) => e.id === move);
    setEvents((l) => l.filter((x) => x.id !== move).map((x) => x.id === sel ? { ...x, d: to.d, s: to.s } : x).concat({ id: "f" + Date.now(), d: ev.d, s: ev.s, l: ev.l, k: "ledig" }));
    toast(evTitle(ev) + " flyttet til " + D.days[to.d][0].toLowerCase() + " " + D.days[to.d][1] + " · " + hm(to.s), "SPILLER VARSLET · " + clock()); setMove(null);
  };
  const addBusy = () => { const id = "b" + Date.now(); setEvents((l) => l.filter((x) => !(x.k === "ledig" && x.d === nb.d && x.s >= nb.s && x.s < nb.s + nb.l)).concat({ id, d: nb.d, s: nb.s, l: nb.l, k: "opptatt", title: nb.t || "Opptatt" })); setDlg(false); setView(view); toast("Opptatt-tid lagt inn · " + D.days[nb.d][0].toLowerCase() + " " + hm(nb.s) + "–" + hm(nb.s + nb.l), "SKJULT I /BOOKING"); };
  const toBusy = () => { setEvents((l) => l.map((x) => x.id === sel ? { ...x, k: "opptatt", title: "Opptatt" } : x)); toast("Tidsrommet er ikke lenger bookbart", "OPPDATERT · " + clock()); };
  const removeBusy = () => { setEvents((l) => l.map((x) => x.id === sel ? { ...x, k: "ledig" } : x)); toast("Opptatt-tid fjernet · tidsrommet er bookbart igjen", clock()); };
  const c = ev && ev.who && D.credits[ev.who];
  const counts = { privat: events.filter((e) => e.k === "privat").length, ledig: events.filter((e) => e.k === "ledig").length, felles: events.filter((e) => e.k === "felles").length };
  const insp = ev && <Inspector open side={side} onClose={() => setSel(null)} kicker={KIND[ev.k].label + " · " + D.days[ev.d][0] + " " + D.days[ev.d][1]} title={evTitle(ev)} footer={<>
    {ev.k === "privat" || ev.k === "felles" ? (move ? <><Button variant="primary" icon="check" fullWidth disabled={move === true} onClick={doMove}>Bekreft flytting</Button><Button variant="ghost" fullWidth onClick={() => setMove(null)}>Avbryt</Button></> : <Button variant="primary" icon="move" fullWidth onClick={() => setMove(true)}>Flytt time</Button>) : null}
    {ev.k === "ledig" && <Button variant="secondary" icon="lock" fullWidth onClick={toBusy}>Legg inn opptatt-tid</Button>}
    {ev.k === "opptatt" && <Button variant="secondary" icon="unlock" fullWidth onClick={removeBusy}>Fjern opptatt-tid</Button>}
  </>}>
    <div>
      <Kv k="Tid" v={span(ev)} />
      {ev.loc && <Kv k="Sted" v={ev.loc} mono={false} />}
      {ev.n && <Kv k="Påmeldt" v={ev.n + " spillere"} />}
      {ev.k === "ledig" && <Kv k="Synlig i" v="/booking · privattime 60 min" mono={false} />}
      {(ev.k === "privat" || ev.k === "felles") && <Kv k="Status" v={<StatusPill>Planlagt</StatusPill>} last />}
    </div>
    {c && <div style={{ display: "flex", flexDirection: "column", gap: 12, border: "1px solid var(--border-hairline)", borderRadius: 8, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Avatar name={ev.who} size={36} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{ev.who}</div><Meta>{c.tier} · {c.plan.toUpperCase()}</Meta></div></div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ font: "600 26px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: c.left <= 1 ? "var(--signal-ink)" : "var(--text-primary)" }}>{c.left}</span><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>av {c.total} klipp igjen</span></div>
      <Bar value={c.left} total={c.total} tone={c.left <= 1 ? "var(--signal)" : "var(--text-primary)"} />
      {c.left === 0 && <StatusPill tone="signal">Tomt · timen faktureres enkeltvis</StatusPill>}
      {c.left === 1 && <StatusPill tone="signal">Siste klipp</StatusPill>}
      <div><Kv k="Gyldig til" v={c.exp} /><Kv k="Forrige time" v={c.last} last /></div>
    </div>}
    {move && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span className="kicker">Velg ny ledig tid</span>
      <Pills>{free.sort((a, b) => a.d - b.d || a.s - b.s).map((f) => <ChoicePill key={f.id} mono selected={move === f.id} onClick={() => setMove(f.id)}>{D.days[f.d][0]} {D.days[f.d][1]} · {hm(f.s)}</ChoicePill>)}</Pills>
      <Meta>SPILLEREN FÅR VARSEL I PLAYERHQ</Meta>
    </div>}
  </Inspector>;
  return <div style={{ display: "flex", minWidth: 0 }}>
    <div style={{ ...pageWrap, flex: 1 }}>
      <PageHead kicker="AG-04 · Uke 40 · 28.09–04.10" title="Timeplan og booking" actions={<>
        <Segmented options={[{ value: "dag", label: "Dag" }, { value: "uke", label: "Uke" }]} value={view} onChange={setView} />
        <Button variant="secondary" icon="lock" onClick={() => setDlg(true)}>{mob ? "Opptatt-tid" : "Legg inn opptatt-tid"}</Button>
      </>} />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        {[["privat", counts.privat + " privattimer"], ["felles", counts.felles + " fellestreninger"], ["ledig", counts.ledig + " ledige"], ["opptatt", "Opptatt"]].map(([k, l]) => <span key={k} style={{ display: "flex", alignItems: "center", gap: 6, font: "var(--type-body-s)", color: "var(--text-secondary)" }}><span style={{ width: 14, height: 14, borderRadius: 4, background: KIND[k].bg, border: KIND[k].bd }}></span>{l}</span>)}
      </div>
      {view === "dag" && <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 4 }}>{D.days.map(([dn, dd], i) => <ChoicePill key={i} selected={day === i} onClick={() => setDay(i)} style={{ minWidth: 0, width: "100%", paddingLeft: 0, paddingRight: 0, justifyContent: "center" }}>{mob ? dn : dn + " " + dd.slice(0, 2)}</ChoicePill>)}</div>}
      {view === "dag" ? <TimeGrid days={[day]} events={events} sel={sel} setSel={setSel} /> : grid ? <TimeGrid days={[0, 1, 2, 3, 4, 5, 6]} events={events} sel={sel} setSel={setSel} compact={gridW < 1000} /> : <Agenda events={events} sel={sel} setSel={setSel} />}
    </div>
    {insp}
    <Dialog open={dlg} onClose={() => setDlg(false)} title="Legg inn opptatt-tid" footer={<div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}><Button variant="ghost" onClick={() => setDlg(false)}>Avbryt</Button><Button variant="primary" icon="lock" onClick={addBusy}>Lagre opptatt-tid</Button></div>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span className="kicker">Dag</span>
        <Pills>{D.days.map(([dn], i) => <ChoicePill key={i} selected={nb.d === i} onClick={() => setNb({ ...nb, d: i })}>{dn}</ChoicePill>)}</Pills>
        <span className="kicker">Start</span>
        <Pills>{[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((h) => <ChoicePill key={h} mono selected={nb.s === h} onClick={() => setNb({ ...nb, s: h })}>{hm(h)}</ChoicePill>)}</Pills>
        <Stepper label="Varighet" value={nb.l * 60} step={30} min={30} max={480} unit="min" onChange={(v) => setNb({ ...nb, l: v / 60 })} />
        <Input label="Beskrivelse" value={nb.t} onChange={(e) => setNb({ ...nb, t: e.target.value })} />
        <Meta>TIDSROMMET SKJULES I /BOOKING</Meta>
      </div>
    </Dialog>
  </div>;
}
window.Kalender = Kalender;
})();
