/* PH-15 Test · gjennomfør og PH-15-TN Test · Team Norway-poengskala · Precision 2.28.0 (09.10.2026). Kandidat. Natt i registeret.
   TestEntry (tests/), ute på 56 px på natt. PH-15: Puttetest 8-ball, treff eller bom per forsøk. PH-15-TN: 8-ball etter Team Norways poengskala
   (data/tn-scoring.js: avstand til mål gir 0–4 poeng per ball), poeng i tallfeltet og appen summerer. Demodata: Tobias Lindvik, 05.10.2026. */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
function Wrap({ state, setState, go, children }) {
  const { Gate, EmptyState } = NS, [attempts, setAttempts] = React.useState(0);
  return <NS.Page narrow bottomInset={24}>
    <span className="kicker">Stats › Tester · Tobias Lindvik</span>
    <Gate state={state} loading="Henter testen …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Testen kunne ikke hentes", text: "Det du har ført, er lagret på telefonen.", code: "FEIL 503 · TEST · 05.10.2026 17:05" }}>
      {state === "tom" ? <EmptyState icon="clipboard-check" title="Ingen test i dag" text="Coachen har ikke lagt inn en test for deg. Testene står i Stats › Tester." action="Se testene" actionIcon="clipboard-check" onAction={() => go("PH-14")} /> : <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0, maxWidth: 640, width: "100%", marginInline: "auto" }}>{children}</div>}
    </Gate>
  </NS.Page>;
}
function PH15(p) {
  return <Wrap {...p}><NS.TestEntry test={{ name: "Puttetest 8-ball", axis: "slag", kind: "treff", attempts: 8 }} initial={[true, false, true, true]} by="egen"
    onSave={(vals,meta) => { const X=window.AK_HANDLING;X.opprett("test-results:"+p.player.id,{id:meta.createId,createId:meta.createId,name:"Puttetest 8-ball",display:vals.filter(Boolean).length+" av "+vals.length+" treff",date:"05.10.2026",values:vals},[]);p.go("PH-14"); }} /></Wrap>;
}
function PH15TN(p) {
  return <Wrap {...p}><NS.TestEntry test={{ name: "8-ball · Team Norway", axis: "slag", unit: "poeng", attempts: 8 }} initial={[4, 3, 3, 2]} by="egen"
    onSave={(vals,meta) => { const X=window.AK_HANDLING;X.opprett("test-results:"+p.player.id,{id:meta.createId,createId:meta.createId,name:"8-ball · Team Norway",display:vals.reduce((a,b)=>a+Number(b),0)+" poeng",date:"05.10.2026",values:vals},[]);p.go("PH-14"); }} /></Wrap>;
}
window.AK_SCREENS["PH-15"] = { id: "PH-15", name: "Test · gjennomfør", route: "/portal/tren/tester/[testId]/gjennomfor", Component: PH15 };
window.AK_SCREENS["PH-15-TN"] = { id: "PH-15-TN", name: "Test · Team Norway-poengskala", route: "/portal/tren/tester/[testId]/gjennomfor", Component: PH15TN };
})();
