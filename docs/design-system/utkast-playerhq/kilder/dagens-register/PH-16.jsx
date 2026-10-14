/* 2.32.0: SGTrend har SGValue per kategori (tap med minustegn i tapsfarge); trykk åpner SGCategoryPanel (rolle spiller, bare godkjente forslag). Trening-kortet lenker til PH-17. */
/* PH-16 Stats · 11.10.2026. SGTrend eier periodevalget for runder. PeriodSelector styrer bare trening, tester og TrackMan.
   Under 600 px: faner velger én graf; periodevalget vises bare for dataene det styrer. På desktop får SG egen flate,
   og de tre øvrige grafene deler ett tydelig avgrenset periodevalg. Bredde måles av H.Fit. Kandidat, demodata. */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
const Meta = ({ children }) => <span style={{ font: "var(--type-source)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{children}</span>;
const sgf = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + String(Math.abs(v)).replace(".", ",");
function PH16({ state, setState, go }) {
  const { Gate, Tabs, PeriodSelector, TrendChart, AxisVolumeBars, EmptyState, PageHeader, LargeTitle } = NS;
  const { cw } = H.useW(), S = window.AK_DATA.stats, narrow = cw < 600, cols = cw >= 1200 ? 3 : 2;
  const [per, setPer] = React.useState(S.periods[0]), [cur, setCur] = React.useState("sg"), [attempts, setAttempts] = React.useState(0);
  const P = S[per];
  const [ref, setRef] = React.useState("neste"), RD = window.AK_DATA.runde;
  const sgRef = <><NS.SGReference category="D" value={ref} available={["neste", "egen"]} onChange={setRef} role="spiller" /><NS.SourceBadge kind="ak-sg" date="05.10.2026" est={ref === "neste"} /></>;
  const CH = [
    ["sg", "SG", <><H.Fit fallback={390}><NS.SGTrend rounds={RD.sgRounds} reference={RD.sgRef[ref]} detail={window.AK_DATA.analyse.detail("spiller")} period={window.AK_DATA.analyse.period} role="spiller" /></H.Fit>{sgRef}</>, RD.sgSource],
    ["trening", "Trening", <><AxisVolumeBars rows={P.volume} unit="min" legend /><div><NS.Button variant="secondary" iconRight="arrow-right" onClick={() => go("PH-17")}>Se treningsanalysen</NS.Button></div></>, S.src.trening],
    ["tester", "Tester", <TrendChart series={[{ label: "Puttetest 8-ball", values: P.test }]} labels={P.labels} axis="tek" goal={56} unit="av 96" answer={P.testAnswer} />, S.src.test],
    ["trackman", "TrackMan", <TrendChart series={[{ label: "Club Speed driver", values: P.tm }]} labels={P.labels} axis="tek" unit="mph" answer={P.tmAnswer} />, S.src.tm],
  ];
  const card = ([k, t, c, src]) => <section key={k} aria-label={t} data-graf={k} className="pa-card" style={{ padding: "var(--space-4)", gap: "var(--space-2)", minWidth: 0 }}>{!narrow && <h2 style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)" }}>{t}</h2>}{c}<Meta>{src}</Meta></section>;
  const head = narrow ? <LargeTitle title="Stats" kicker={cur === "sg" ? "Slag vunnet" : P.meta} /> : <PageHeader title="Stats" kicker="Spillerutvikling" />;
  return <NS.Page bottomInset={80}>
    {head}
    <Gate state={state} loading="Henter statistikken …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente statistikken", text: "Tilkoblingen ble brutt. Ingen data er endret.", code: "FEIL 503 · STATS · 05.10.2026 08:14" }}>
      {state === "tom" ? <EmptyState icon="chart-no-axes-column" title="Ingen data ennå" text="Statistikken kommer når du har registrert en runde eller en økt." action="Registrer runde" actionIcon="flag" onAction={() => go("PH-RD-01")} secondary="Bygg økter i Workbench" onSecondary={() => go("PH-11")} />
        : <>
          {narrow ? <>
            <Tabs id="ph16-graf" label="Velg graf" tabs={CH.map(([k, l]) => ({ value: k, label: l }))} value={cur} onChange={setCur} />
            {cur !== "sg" && <PeriodSelector label="Periode" value={per} onChange={setPer} options={S.periods} />}
            {card(CH.find((x) => x[0] === cur))}
          </> : <>
            {card(CH[0])}
            <section aria-label="Trening, tester og TrackMan" style={{ display: "grid", gap: "var(--space-4)", minWidth: 0 }}>
              <div><h2 style={{ margin: 0, font: "var(--type-title-s)" }}>Trening, tester og TrackMan</h2><Meta>{P.meta}</Meta></div>
              <PeriodSelector label="Periode for trening, tester og TrackMan" value={per} onChange={setPer} options={S.periods} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(" + cols + ",minmax(0,1fr))", gap: "var(--space-4)", alignItems: "start", minWidth: 0 }}>{CH.slice(1).map(card)}</div>
            </section>
          </>}
        </>}
    </Gate>
  </NS.Page>;
}
window.AK_SCREENS["PH-16"] = { id: "PH-16", name: "Stats", route: "/portal/analysere", Component: PH16 };
})();
