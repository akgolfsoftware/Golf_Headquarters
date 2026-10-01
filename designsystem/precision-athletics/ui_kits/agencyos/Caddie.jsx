(() => {
const { Button, Avatar, AxisBadge, StatusPill, Icon, IconButton, ChoicePill } = window.AKGolfPrecisionAthletics_7d7c29;
const { PageHead, Panel, pageWrap } = window.KIT;
const { useCW, toast, clock, Meta, Pills } = window.AOA;
const D = window.AOA_DATA;
const nf = (v) => v.toFixed(2).replace(".", ",");
function AddBtn({ label, done, onAdd, mob }) {
  return done ? <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><StatusPill tone="neutral">Venter på spiller</StatusPill><Meta>LAGT TIL {done}</Meta></div>
    : <div style={{ display: "flex" }}><Button variant="primary" icon="calendar-plus" fullWidth={mob} onClick={onAdd}>{label}</Button></div>;
}
function SessionCard({ s, who, done, onAdd, mob }) {
  return <div style={{ border: "1px solid var(--border-hairline)", borderRadius: 8, background: "var(--surface-card)", padding: 16, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><AxisBadge axis={s.axis} /><Meta>FORSLAG · {s.min} MIN</Meta></div>
    <div><div style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{s.title}</div><div style={{ font: "var(--type-meta)", color: "var(--text-muted)", marginTop: 4, overflowWrap: "anywhere" }}>{s.code}</div></div>
    <div>{s.items.map(([k, v], i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid var(--border-hairline)", font: "var(--type-body-s)", color: "var(--text-body)" }}><span style={{ minWidth: 0 }}>{k}</span><span style={{ font: "var(--type-num-s)", fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)", flex: "none" }}>{v}</span></div>)}</div>
    <AddBtn label={mob ? "Legg til i ukeplan" : "Legg til i spillerens ukeplan"} done={done} onAdd={onAdd} mob={mob} />
    <Meta>MOTTAKER · {who.toUpperCase()} · UKE 40</Meta>
  </div>;
}
function Analysis({ p, done, add, mob }) {
  const a = D.analysis[p];
  return <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,220px),1fr))", gap: 12 }}>
      <div style={{ border: "1px solid var(--border-hairline)", borderRadius: 8, background: "var(--surface-card)", padding: 16, minWidth: 0 }}>
        <span className="kicker">Siste 3 runder · brutto</span>
        {a.rounds.map(([c, d, s]) => <div key={d} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border-hairline)" }}><span style={{ font: "var(--type-body-s)", color: "var(--text-body)", minWidth: 0 }}>{c} <Meta>{d}</Meta></span><span style={{ font: "var(--type-num-s)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)", flex: "none" }}>{s}</span></div>)}
      </div>
      <div style={{ border: "1px solid var(--border-hairline)", borderRadius: 8, background: "var(--surface-card)", padding: 16, minWidth: 0 }}>
        <span className="kicker">Strokes Gained · snitt</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8, marginTop: 8 }}>{a.sg.map(([k, v]) => { const neg = v.startsWith("−"); const worst = a.sg.reduce((m, x) => parseFloat(x[1].replace("−", "-").replace(",", ".")) < parseFloat(m[1].replace("−", "-").replace(",", ".")) ? x : m)[0] === k; return <div key={k} style={{ padding: "8px 10px", borderRadius: 8, background: worst ? "var(--warn-tint)" : "var(--surface-sunken)" }}><Meta s={worst ? { color: "var(--warn)" } : null}>{k}</Meta><div style={{ font: "600 17px/1.2 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: worst ? "var(--warn)" : neg ? "var(--text-primary)" : "var(--ok)" }}>{v}</div></div>; })}</div>
      </div>
    </div>
    <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-body)", textWrap: "pretty" }}>{a.finding}</p>
    <SessionCard s={a.session} who={p} done={done[p]} onAdd={() => add(p, a.session.title)} mob={mob} />
  </div>;
}
function Wedge({ done, add, mob }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,180px),1fr))", gap: 8 }}>
      {D.wedge.map(([w, f, a, m], i) => <div key={w} style={{ border: "1px solid var(--border-hairline)", borderRadius: 8, background: "var(--surface-card)", padding: 14, display: "flex", flexDirection: "column", gap: 6, boxShadow: `inset 0 3px 0 var(--period-${["grunn", "spesial", "turnering", "evaluering"][i]})` }}>
        <Meta>{w.toUpperCase()}</Meta><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{f}</span><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{a}</span><span style={{ font: "var(--type-num-s)", color: "var(--text-body)" }}>{m}</span>
      </div>)}
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><AxisBadge axis="slag" /><Meta>7 ØKTER · 7 T 30 MIN · 12 SPILLERE</Meta></div>
    <AddBtn label="Legg til i ukeplan · WANG" done={done.wang} onAdd={() => add("wang", "4-ukers wedge-blokk")} mob={mob} />
  </div>;
}
function Acwr({ done, add, mob }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ border: "1px solid var(--border-hairline)", borderRadius: 8, background: "var(--surface-card)", padding: "8px 16px" }}>
      {D.acwr.map(([n, v]) => { const hi = v > 1.5, warn = v > 1.3 || v < 0.8; const c = hi ? "var(--signal)" : warn ? "var(--warn)" : "var(--text-primary)"; return <div key={n} style={{ display: "grid", gridTemplateColumns: mob ? "minmax(0,1fr) 44px" : "160px minmax(0,1fr) 44px", gap: mob ? "4px 12px" : 12, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-hairline)" }}>
        <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n}</span>
        <div style={{ position: "relative", height: 8, background: "var(--surface-sunken)", gridColumn: mob ? "1 / -1" : "auto", gridRow: mob ? 2 : "auto" }}>
          <span style={{ position: "absolute", left: "40%", width: "25%", top: 0, bottom: 0, background: "var(--ok-tint)" }}></span>
          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: Math.min(v / 2, 1) * 100 + "%", background: c }}></span>
        </div>
        <span style={{ font: "600 13px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: hi ? "var(--signal-ink)" : "var(--text-primary)", textAlign: "right", gridRow: mob ? 1 : "auto", gridColumn: mob ? 2 : "auto" }}>{nf(v)}</span>
      </div>; })}
      <div style={{ padding: "8px 0 4px" }}><Meta>GRØNN SONE 0,80–1,30 · VARSEL OVER 1,50 · 28 DAGER</Meta></div>
    </div>
    <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-body)" }}>Magnus Aasheim er over varselgrensen. Thea Nilsen nærmer seg. Oskar Vik har for lav belastning.</p>
    <SessionCard s={{ axis: "fys", title: "Hviledag · aktiv restitusjon", code: "FYS_BEVEGELIGHET_INNENDØRS_ALENE", min: 30, items: [["Thorakal mobilitet", "2 × 10"], ["Gange eller sykkel · S1", "20 min"]] }} who="Magnus Aasheim" done={done.hvile} onAdd={() => add("hvile", "Hviledag for Magnus Aasheim")} mob={mob} />
  </div>;
}
function Caddie() {
  const { mob, cw } = useCW();
  const [p, setP] = React.useState("Ingrid Berg");
  const [msgs, setMsgs] = React.useState([{ from: "caddie", t: "14:02", text: "Hei Anders. 18 spillere i stallen, 3 ukeplaner venter på godkjenning. Velg en hurtighandling eller skriv hva du trenger." }]);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState({});
  const [q, setQ] = React.useState("");
  const endRef = React.useRef(null);
  const add = (k, what) => { const t = clock(); setDone((d) => ({ ...d, [k]: t })); toast(what + " · lagt til i ukeplan", "VENTER PÅ SPILLER · " + t); };
  const ask = (text, kind, arg) => {
    setMsgs((m) => [...m, { from: "coach", t: clock(), text }]); setBusy(true);
    setTimeout(() => {
      const reply = kind === "analyse" ? { text: "Analyse av siste 3 runder for " + arg + ".", kind, arg } : kind === "wedge" ? { text: "Utkast til 4-ukers wedge-spesialisering for WANG Toppidrett, uke 40–43. Én teknisk dimensjon per øvelse.", kind } : kind === "acwr" ? { text: "Treningsbelastning (ACWR) for hele stallen, siste 28 dager.", kind } : { text: "Notert. Jeg lager et utkast og legger det i godkjenningskøen. Du godkjenner før noe publiseres." };
      setMsgs((m) => [...m, { from: "caddie", t: clock(), ...reply }]); setBusy(false);
    }, 900);
  };
  React.useEffect(() => { const m = document.querySelector("main"); if (m && msgs.length > 1) m.scrollTo({ top: m.scrollHeight, behavior: "smooth" }); }, [msgs.length, busy]);
  const wide = cw > 1100;
  const QA = [["bar-chart-3", "Analyser siste 3 runder for " + p, "analyse", p], ["layers", "Bygg 4-ukers wedge-spesialisering for Toppidrett", "wedge"], ["activity", "Sjekk treningsbelastning (ACWR) for hele stallen", "acwr"]];
  const quick = <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <span className="kicker">Spiller</span>
    <Pills>{Object.keys(D.analysis).map((n) => <ChoicePill key={n} selected={p === n} onClick={() => setP(n)}>{n}</ChoicePill>)}</Pills>
    <span className="kicker" style={{ marginTop: 4 }}>Hurtighandlinger</span>
    {QA.map(([ic, l, k, a]) => <button key={k} disabled={busy} onClick={() => ask(l, k, a)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%", minHeight: 56, padding: "10px 14px", border: "1px solid var(--border-hairline)", borderRadius: 8, background: "var(--surface-card)", cursor: busy ? "default" : "pointer", font: "500 14px/1.35 var(--font-sans)", color: "var(--text-primary)", transition: "border-color 150ms var(--ease-out)" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-ink)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-hairline)")}><Icon name={ic} size={18} color="var(--text-secondary)" /><span style={{ flex: 1, minWidth: 0 }}>{l}</span><Icon name="arrow-up-right" size={16} color="var(--text-muted)" /></button>)}
  </div>;
  return <div style={pageWrap}>
    <PageHead kicker="AG-03 · Caddie & AI-hub" title="Caddie" sub="Caddie foreslår. Du godkjenner før noe publiseres til spiller." />
    <div style={{ display: "grid", gridTemplateColumns: wide ? "minmax(0,1fr) 340px" : "minmax(0,1fr)", gap: 16, alignItems: "start" }}>
      {!wide && <Panel>{quick}</Panel>}
      <Panel pad="0" style={{ gap: 0 }}>
        <div style={{ padding: "var(--card-pad)", display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {msgs.map((m, i) => m.from === "coach"
            ? <div key={i} style={{ alignSelf: "flex-end", maxWidth: "min(80%, 520px)", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}><div style={{ background: "var(--surface-inverse)", color: "var(--text-inverse)", borderRadius: 8, padding: "10px 14px", font: "var(--type-body)" }}>{m.text}</div><Meta>ANDERS · {m.t}</Meta></div>
            : <div key={i} style={{ display: "flex", gap: 12, minWidth: 0 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-sunken)", border: "1px solid var(--border-hairline)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="sparkles" size={16} color="var(--text-primary)" /></span>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}><span style={{ font: "600 14px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>Caddie</span><Meta>{m.t}</Meta></div>
                <div style={{ font: "var(--type-body)", color: "var(--text-body)", textWrap: "pretty" }}>{m.text}</div>
                {m.kind === "analyse" && <Analysis p={m.arg} done={done} add={add} mob={mob} />}
                {m.kind === "wedge" && <Wedge done={done} add={add} mob={mob} />}
                {m.kind === "acwr" && <Acwr done={done} add={add} mob={mob} />}
              </div>
            </div>)}
          {busy && <Meta>CADDIE ANALYSERER …</Meta>}
          <div ref={endRef}></div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) { ask(q.trim()); setQ(""); } }} style={{ borderTop: "1px solid var(--border-hairline)", padding: 12, display: "flex", gap: 8, alignItems: "center", background: "var(--surface-sunken)", borderRadius: "0 0 8px 8px" }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Skriv en instruksjon til Caddie" aria-label="Instruksjon til Caddie" style={{ flex: 1, minWidth: 0, height: 44, padding: "0 14px", border: "1px solid var(--border-control)", borderRadius: 8, background: "var(--surface-card)", font: "var(--type-body)", color: "var(--text-primary)" }} />
          <Button type="submit" variant="primary" icon="send" aria-label="Send" disabled={!q.trim() || busy}>{mob ? "" : "Send"}</Button>
        </form>
      </Panel>
      {wide && <div style={{ position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <Panel>{quick}</Panel>
        <Panel kicker="Lagt til fra Caddie" title={Object.keys(done).length ? Object.keys(done).length + " i dag" : "Ingenting ennå"}>
          <Meta>ALT HAVNER SOM «VENTER PÅ SPILLER» I PLAYERHQ</Meta>
        </Panel>
      </div>}
    </div>
  </div>;
}
window.Caddie = Caddie;
})();
