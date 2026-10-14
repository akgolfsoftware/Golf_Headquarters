/* 2.32.0: kortet «SG per kategori» med SGValue; trykk åpner SGCategoryPanel (rolle spiller). */
/* PH-18 Stats › Snittscore · runder · Precision 2.28.1 (09.10.2026, liste A krav 4). Kandidat. Omtegnet uten DataGolf-tall (D-19).
   Svaret først: snittscore brutto over 8 runder (TrendChart). Rundene som DataRow (brutto med til par); trykk på en runde åpner SG for runden (PH-RD-09). Mønster 7: under 600 px én graf om gangen, fra 900 px innholdsbredde to kolonner (1024 med NavRail).
   Data: data/kjerne.js (demodata). */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
const Meta = ({ children }) => <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{children}</span>;
function PH18({ state, setState, go }) {
  const { Gate, TrendChart, DataRow, EmptyState, PageHeader, LargeTitle, Button, SGValue, SGCategoryPanel } = NS;
  const AN = window.AK_DATA.analyse, sg = AN.sgAvg(8), [cat, setCat] = React.useState(null);
  const tp = (r) => { const d = r.score - r.par; return r.score + " (" + (d > 0 ? "+" + d : d < 0 ? "−" + Math.abs(d) : "E") + ")"; };
  const { cw } = H.useW(), A = window.AK_DATA, narrow = cw < 600, two = cw >= 900, tom = state === "tom";
  const [attempts, setAttempts] = React.useState(0);
  const R = A.runder, M = A.runderMeta, X=window.AK_HANDLING, saved=X.use("rounds:tobias-lindvik",[]);
  const card = (k, t, c) => <section key={k} aria-label={t} data-graf={k} className="pa-card" style={{ padding: "var(--space-4)", gap: "var(--space-3)", minWidth: 0 }}><h2 style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)" }}>{t}</h2>{c}<Meta>{M.src}</Meta></section>;
  const kicker = "SESONG 2026 · TOBIAS LINDVIK";
  return <NS.Page bottomInset={80}>
    {narrow ? <LargeTitle title="Snittscore" kicker={kicker} /> : <PageHeader title="Snittscore" kicker={kicker} />}
    <Gate state={tom ? "data" : state} loading="Henter rundene …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente rundene", text: "Tilkoblingen ble brutt. Ingen runder er endret.", code: "FEIL 503 · RUNDER · 05.10.2026 08:14" }}>
      {tom ? <EmptyState icon="flag" title="Ingen runder ennå" text="Snittscoren kommer når du har registrert en runde." action="Registrer runde" actionIcon="flag" onAction={() => go("PH-RD-01")} />
        : <div style={{ display: "grid", gridTemplateColumns: two ? "repeat(2,minmax(0,1fr))" : "minmax(0,1fr)", gap: "var(--space-4)", alignItems: "start", minWidth: 0 }}>
          {card("snitt", "Snittscore", <><TrendChart series={[{ label: "Brutto score", values: R.map((r) => r.score) }]} labels={R.map((r) => r.dateLabel)} unit="slag" symmetric={false} zero={false} min={70} max={82} format={(v) => v == null ? "—" : String(v)} answer={M.snitt + " slag snitt · " + M.n + " runder · ned 2 siden august"} />
            <div><Button variant="secondary" iconRight="arrow-right" onClick={() => go("PH-16")}>Se SG per kategori</Button></div></>)}
          {card("sg", "SG per kategori · siste 8 runder", <><div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>{["ott", "app", "arg", "putt"].map((c) => <DataRow key={c} title={AN.NAME[c]} sub={c.toUpperCase()} value={<SGValue v={sg.by[c]} cat={c} onOpen={setCat} />} />)}</div>
            {cat && <SGCategoryPanel cat={cat} detail={AN.detail("spiller")} period="siste 8 runder" role="spiller" onClose={() => setCat(null)} />}</>)}
          {saved.length>0 && card("lagret", "Registrert i denne fanen", <>{saved.map(r=><DataRow key={r.id} title={r.course} sub={r.date+" · "+r.holes.filter(h=>h.score!=null).length+" hull · "+(r.mode==="rask"?"Rask score · uten SG":"Ført i demoen")} value={r.holes.reduce((n,h)=>n+(h.score||0),0)+" slag"} onClick={()=>{X.set("round-draft:tobias-lindvik",r);go("PH-RD-09");}}/>)}</>)}
          {card("runder", "Runder", <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>{R.slice().reverse().map((r, i) => <DataRow key={i} title={r.kind + (r.place ? " · " + r.place + ". plass" : "")} sub={r.dateLabel + ".2026 · " + r.course} value={tp(r)} onClick={() => go("PH-RD-09")} />)}</div>)}
        </div>}
    </Gate>
  </NS.Page>;
}
window.AK_SCREENS["PH-18"] = { id: "PH-18", name: "Snittscore · runder", route: "/portal/analysere/snittscore", Component: PH18 };
})();
