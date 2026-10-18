/* PH-TP-01 Teknisk plan (spiller) · Precision 2.28.1 (09.10.2026, liste A krav 2). Kandidat.
   TechPlan med role «spiller»: slaget, Fra → til med TrackMan, P1.0–P10.0 med oppgavene fra coachen og mengde. Under 600 px LargeTitle.
   Data: data/tek.js og data/tekplan-belastning.js (demodata, Tobias Lindvik). */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
function PHTP01({ state, setState, go }) {
  const { Gate, TechPlan, PageHeader, LargeTitle, EmptyState } = NS;
  const { cw } = H.useW(), A = window.AK_DATA, T = A.tekPlan, narrow = cw < 600, tom = state === "tom";
  const [attempts, setAttempts] = React.useState(0);
  const kicker = "7-JERN · INNSPILL 150–200 M · ANDERS KRISTIANSEN";
  return <NS.Page bottomInset={80}>
    {narrow ? <LargeTitle title="Teknisk plan" kicker={kicker} /> : <PageHeader title="Teknisk plan" kicker={kicker} />}
    <Gate state={tom ? "data" : state} loading="Henter den tekniske planen …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente den tekniske planen", text: "Tilkoblingen ble brutt. Ingenting er endret.", code: "FEIL 503 · TEKNISK PLAN · 05.10.2026 08:14" }}>
      {tom ? <EmptyState icon="crosshair" title="Ingen teknisk plan ennå" text="Coachen din lager planen sammen med deg. Spør Anders når dere skal starte." action="Skriv til Anders" actionIcon="message-square" onAction={() => go("PH-21")} />
        : <window.AK_WB.Technical role="spiller" playerId="tobias-lindvik" go={go}/>}
    </Gate>
  </NS.Page>;
}
window.AK_SCREENS["PH-TP-01"] = { id: "PH-TP-01", name: "Teknisk plan (spiller)", route: "/portal/planlegge/teknisk-plan", Component: PHTP01 };
})();
