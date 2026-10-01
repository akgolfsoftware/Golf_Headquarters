(() => {
const f = (k, v) => v == null ? "—" : k === "Spin Rate" ? String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : (v < 0 ? "−" : "") + Math.abs(v).toFixed(k === "Smash Factor" ? 2 : 1).replace(".", ",");
function AG18({ state, go }) {
  const { PageHeader, Button, EmptyState, Tabs, DataTable, KeyValue, Metric, Icon } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA3, { mob, desk } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState("okter"), [sid, setSid] = React.useState("m1"), [vid, setVid] = React.useState(null), [rec, setRec] = React.useState(false);
  const S = empty ? [] : D.tmSessions, s = S.find((x) => x.id === sid), vids = (empty ? [] : D.videos).filter((v) => tab === "video" || v.s === sid), cv = D.videos.find((v) => v.id === vid);
  const v = (k) => { const r = s.rows.find((x) => x[0] === k); return r ? r[2] : null; };
  const src = s ? "TRACKMAN · " + s.bay.toUpperCase() + " · " + s.date : "—";
  const vcard = (x) => <button key={x.id} type="button" onClick={() => setVid(x.id)} aria-pressed={vid === x.id} className="pa-card pa-card--interactive" style={{ padding: 0, overflow: "hidden", textAlign: "left", font: "inherit", cursor: "pointer", minWidth: 0, borderColor: vid === x.id ? "var(--border-ink)" : undefined }}>
    <span style={{ display: "grid", placeItems: "center", aspectRatio: "16/9", background: "var(--surface-sunken)", color: "var(--text-muted)", position: "relative" }}><Icon name="play" size={24} /><span style={{ position: "absolute", right: 8, bottom: 8, font: "500 11px/1 var(--font-mono)", padding: "3px 6px", borderRadius: 4, background: "var(--surface-card)", color: "var(--text-primary)" }}>{x.len}</span></span>
    <span style={{ display: "flex", flexDirection: "column", gap: 3, padding: 10 }}><span style={{ font: "500 13px/1.3 var(--font-sans)" }}>{x.title}</span><A.Meta>{x.by.toUpperCase()} · {x.at}</A.Meta></span>
  </button>;
  const player = cv && <A.Card gap={10}><div style={{ display: "grid", placeItems: "center", aspectRatio: "16/9", background: "var(--surface-sunken)", borderRadius: 6, color: "var(--text-muted)" }}><span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><Icon name="play-circle" size={40} /><A.Meta>VIDEO · {cv.len}</A.Meta></span></div><div style={{ font: "600 15px/1.3 var(--font-sans)" }}>{cv.title}</div><KeyValue items={[["Spiller", D.tmSessions.find((x) => x.id === cv.s).who, { mono: false }], ["Tatt opp", cv.at + " · " + cv.by, { mono: false }], ["Merknad", cv.note || null, { mono: false }]]} /><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" variant="secondary" icon="pen-line" onClick={() => A.toast("Tegneverktøy åpnet", "LINJER OG VINKLER LAGRES PÅ VIDEOEN")}>Tegn på video</Button><Button size="sm" variant="ghost" icon="send" onClick={() => A.toast("Utkast til spilleren", "IKKE SENDT FØR DU TRYKKER SEND")}>Del med spiller</Button></div></A.Card>;
  let body;
  if (tab === "okter") body = <A.Cols tpl={desk ? "minmax(0,1fr) minmax(0,1.2fr)" : "minmax(0,1fr)"}>
    <DataTable caption="TrackMan-økter på tvers av spillere · siste 7 dager" rowKey="id" selected={sid} onSelect={setSid} columns={[{ key: "date", label: "Dato", mono: true }, { key: "who", label: "Spiller", sortable: true }, { key: "club", label: "Kølle", mono: true }, { key: "shots", label: "Slag", mono: true, align: "right" }, { key: "video", label: "Video", mono: true, align: "right", render: (r) => r.video || null }]} rows={S} />
    {s && <A.Card gap={12}><A.Head k={s.who + " · " + s.club + " · " + s.shots + " slag"} aside={src} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,120px),1fr))", rowGap: 16, columnGap: 12 }}>{s.rows.map(([k, u, val]) => <Metric key={k} size="s" label={k} value={f(k, val) === "—" ? null : f(k, val)} unit={u || undefined} />)}</div>
      {v("Carry") == null && <A.Meta>CARRY MANGLER · BALLEN LANDET UTENFOR RADARENS FELT</A.Meta>}
      <A.Head k="Video fra økta" aside={vids.length ? vids.length + " OPPTAK" : "—"} />
      {vids.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,180px),1fr))", gap: 8 }}>{vids.map(vcard)}</div> : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen video fra denne økta.</p>}
      {player}
    </A.Card>}
  </A.Cols>;
  if (tab === "video") body = <A.Cols tpl={desk && cv ? "minmax(0,1.3fr) minmax(0,1fr)" : "minmax(0,1fr)"}><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,200px),1fr))", gap: 8 }}>{vids.map(vcard)}</div>{player}</A.Cols>;
  if (tab === "opptak") body = <A.Card gap={14} style={{ maxWidth: 720 }}><A.Head k="Nytt opptak" aside="STUDIO 1 · KAMERA 1 OG 2" />
    <div style={{ display: "grid", gridTemplateColumns: mob ? "minmax(0,1fr)" : "repeat(2,minmax(0,1fr))", gap: 8 }}>{["Face-on · kamera 1", "Down-the-line · kamera 2"].map((c) => <div key={c} style={{ aspectRatio: "16/9", background: "var(--surface-sunken)", borderRadius: 6, display: "grid", placeItems: "center", border: rec ? "2px solid var(--border-ink)" : "1px solid var(--border-hairline)" }}><A.Meta>{c.toUpperCase()}</A.Meta></div>)}</div>
    <KeyValue items={[["Spiller", "Tobias Lindvik", { mono: false }], ["Samtykke video", "Ja", { hint: "HANNE LINDVIK · BANKID · 26.09.2026" }], ["Knyttes til", "TrackMan-økt 26.09 · Studio 1", { mono: false }]]} />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><Button icon={rec ? "square" : "circle"} onClick={() => { setRec(!rec); A.toast(rec ? "Opptaket er lagret" : "Opptak startet", rec ? "KNYTTET TIL TRACKMAN-ØKTA" : "TRYKK IGJEN FOR Å STOPPE"); }}>{rec ? "Stopp og lagre" : "Start opptak"}</Button>{rec && <A.Meta s={{ color: "var(--text-primary)" }}>TAR OPP · 0:04</A.Meta>}</div>
    <A.Meta>VIDEO AV SPILLERE UNDER 18 KREVER SAMTYKKE FRA FORELDER</A.Meta>
  </A.Card>;
  return <A.Page max={1440}>
    <PageHeader kicker="TrackMan og video" title="TrackMan og video" sub="Økter på tvers av spillere, én økt i detalj og video. Parametere står slik TrackMan viser dem." />
    <A.Gate state={state} loading="Henter TrackMan-økter …" error={{ title: "TrackMan svarer ikke", text: "Øktene er lagret hos TrackMan og hentes når koblingen er tilbake.", code: "TRACKMAN API · 504" }}>
      <Tabs tabs={[{ value: "okter", label: "Økter", count: empty ? undefined : S.length }, { value: "video", label: "Video", count: empty ? undefined : D.videos.length }, { value: "opptak", label: "Opptak" }]} value={tab} onChange={(t) => { setTab(t); setVid(null); }} />
      {empty && tab !== "opptak" ? <EmptyState icon="crosshair" title="Ingen TrackMan-økter denne uka" text="Økter fra Studio 1 og 2 hentes automatisk. Start et opptak for å knytte video til en økt." action="Nytt opptak" actionIcon="video" onAction={() => setTab("opptak")} /> : body}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-18"] = { id: "AG-18", parent: "AG-07", name: "TrackMan og video", route: "/admin/trackman", Component: AG18 };
})();
