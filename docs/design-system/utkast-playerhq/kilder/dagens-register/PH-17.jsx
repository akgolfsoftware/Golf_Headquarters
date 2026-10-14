/* PH-17 Stats › Trening · Precision 2.32.0 (09.10.2026). Kandidat. Ingen DataGolf-tall (D-19).
   TrainingAnalysis for spilleren: svaret først, tid per område og sted, banespill mot golfslag per uke, putting per avstand. Hvert tall åpner grunnlaget. Ingen primærknapp.
   10.10.2026: periodevalget bytter datasett (H.PeriodAnalysis, data/analyse.js perioder), bredden måles i kortet.
   Data: data/analyse.js (demodata, Tobias Lindvik). */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
function PH17({ state, setState, go }) {
  const { Gate, TrainingAnalysis, EmptyState, PageHeader, LargeTitle, Button } = NS;
  const { cw } = H.useW(), narrow = cw < 600, tom = state === "tom", [attempts, setAttempts] = React.useState(0);
  return <NS.Page bottomInset={80}>
    <div><Button variant="ghost" icon="chevron-left" onClick={() => go("PH-16")}>Stats</Button></div>
    {narrow ? <LargeTitle title="Trening" kicker="STATS · TOBIAS LINDVIK" /> : <PageHeader title="Trening" kicker="STATS · TOBIAS LINDVIK" />}
    <Gate state={tom ? "data" : state} loading="Henter treningen …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente treningen", text: "Tilkoblingen ble brutt. Ingen økter er endret.", code: "FEIL 503 · TRENINGSANALYSE · 05.10.2026 08:14" }}>
      {tom ? <EmptyState icon="chart-no-axes-column" title="Ingen trening registrert ennå" text="Analysen kommer når du har gjennomført og registrert en økt." action="Bygg økter i Workbench" actionIcon="layers" onAction={() => go("PH-11")} />
        : <section className="pa-card" style={{ padding: "var(--space-4)", minWidth: 0 }}><H.PeriodAnalysis variant="spiller" sets={window.AK_DATA.analyse.perioder.spiller} /></section>}
    </Gate>
  </NS.Page>;
}
window.AK_SCREENS["PH-17"] = { id: "PH-17", name: "Stats › Trening", route: "/portal/analysere/trackman", Component: PH17 };
})();
