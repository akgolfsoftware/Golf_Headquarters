/* Tilstandsgalleriet — familier: Datavisualisering + TrackMan (med data).
   Lastes av guidelines/tilstander.html (babel). Registrerer på window. */
const dsData = window.AKGolfHQDesignSystem_a3d5af;
const {
  KpiTile, HeroTall, DeltaIndikator, StatStrip, Progress, RingGauge,
  Radar, Pyramid, PyramideFasett, Heatmap, PercentileBar, PPositionRail,
  CompareChart, SGTrend, LoadChart, BarChart,
  DispersionPlot, TrajectoryPlot, KolleStatKort, TrackmanSammendrag, LengdeAvvik,
} = dsData;

function Sec({ label, children }) {
  return (
    <div className="sec">
      <p className="sec__lbl">{label}</p>
      {children}
    </div>
  );
}
function St({ l, children }) {
  return (
    <div className="st">
      <span className="st__lbl">{l}</span>
      {children}
    </div>
  );
}

function FamDataVis() {
  const [pos, setPos] = React.useState("p3");
  return (
    <React.Fragment>
      <Sec label="To tall, aldri blandet — HeroTall × 2 (plan-kvalitet / gjennomføring)">
        <div className="row" style={{ gap: 40 }}>
          <HeroTall label="Plan-kvalitet" verdi="87" enhet="av 100" size="lg"
            delta={<DeltaIndikator verdi="+4" srLabel="siden forrige uke" />} />
          <HeroTall label="Gjennomføring" verdi="92" enhet="%" size="lg"
            delta={<DeltaIndikator verdi="−3" srLabel="siden forrige uke" />} />
        </div>
      </Sec>
      <Sec label="KpiTile — md / sparkline / trend ned · StatStrip">
        <div className="row" style={{ gap: 18, alignItems: "flex-start" }}>
          <KpiTile size="md" label="Snitt carry" value="214" unit="m" delta="+3,2" deltaSuffix="vs forrige økt" sparkline={[204, 208, 206, 211, 214]} />
          <KpiTile size="md" label="ACWR" value="1,24" delta="+0,18" trend="down" />
        </div>
        <div style={{ marginTop: 14 }}>
          <StatStrip stats={[
            { label: "Økter uke 27", value: "9" },
            { label: "Timer", value: "14,5" },
            { label: "Hit-rate", value: "78", unit: "%", delta: "+6" },
          ]} />
        </div>
      </Sec>
      <Sec label="DeltaIndikator — opp / ned / flat / invertert (ACWR: ned er bra)">
        <div className="row" style={{ gap: 18 }}>
          <DeltaIndikator verdi="+0,4" size="md" />
          <DeltaIndikator verdi="−1,2" size="md" />
          <DeltaIndikator verdi="0" retning="flat" size="md" />
          <DeltaIndikator verdi="−0,3" invertert size="md" srLabel="ACWR ned — bra" />
        </div>
      </Sec>
      <Sec label="Progress — ring / bar / streak / segment · RingGauge m/ ACWR-soner">
        <div className="row" style={{ gap: 22, alignItems: "flex-end" }}>
          <Progress variant="ring" value={72} label="Ukemål" />
          <div style={{ width: 160 }}><Progress variant="bar" value={45} max={60} label="Baller" showValue /></div>
          <Progress variant="streak" total={7} active={5} flame label="Streak" />
          <Progress variant="segment" total={5} filled={3} label="Trinn" />
          <RingGauge value={1.24} min={0.6} max={2} decimals={2} label="ACWR" unit=""
            zones={[{ from: 0.6, to: 1.3, color: "var(--success)" }, { from: 1.3, to: 1.5, color: "var(--warning)" }, { from: 1.5, to: 2, color: "var(--error)" }]} />
        </div>
      </Sec>
      <Sec label="Radar (SG m/ baseline) · Pyramid (plan-markører) · PyramideFasett (terskler)">
        <div className="row" style={{ gap: 26, alignItems: "flex-start" }}>
          <Radar size={170} data={{ ott: 0.4, app: -0.3, arg: 0.1, putt: 0.6 }} baseline={{ ott: 0, app: 0, arg: 0, putt: 0 }} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <Pyramid showValues activeAxis="SLAG" data={[
              { axis: "TURN", value: 8, plan: 10 },
              { axis: "SPILL", value: 22, plan: 20 },
              { axis: "SLAG", value: 28, plan: 25 },
              { axis: "TEK", value: 24, plan: 25 },
              { axis: "FYS", value: 18, plan: 20 },
            ]} />
          </div>
          <PyramideFasett visTerskler fordeling={{ FYS: 18, TEK: 24, SLAG: 28, SPILL: 22, TURN: 8 }} />
        </div>
      </Sec>
      <Sec label="Heatmap — belastning (signal) / risiko (error)">
        <div className="row" style={{ gap: 26, alignItems: "flex-start" }}>
          <Heatmap rows={["Øyvind", "Mia", "Jonas"]} cols={["M", "T", "O", "T", "F", "L", "S"]}
            values={[[0.2, 0.5, 0.8, 0.4, 0.6, 1, 0], [0.1, 0.3, 0.5, 0.7, 0.2, 0.4, 0.1], [0, 0.4, 0.6, 0.3, 0.8, 0.5, 0.2]]} />
          <Heatmap color="var(--error)" rows={["ACWR", "Søvn"]} cols={["U24", "U25", "U26", "U27"]}
            values={[[0.2, 0.4, 0.7, 0.9], [0.1, 0.2, 0.5, 0.6]]} />
        </div>
      </Sec>
      <Sec label="PercentileBar · PPositionRail (klikkbar)">
        <div className="grid2">
          <PercentileBar percentile={72} benchmark={55} label="Driver-distanse vs Kat. A" valueLabel="topp 28 %" />
          <PPositionRail selectedId={pos} onSelect={setPos} positions={[
            { id: "p1", label: "P1", status: "ferdig" },
            { id: "p2", label: "P2", status: "ferdig" },
            { id: "p3", label: "P3", status: "aktiv" },
            { id: "p4", label: "P4", status: "planlagt" },
            { id: "p5", label: "P5", status: "planlagt" },
          ]} />
        </div>
      </Sec>
      <Sec label="CompareChart · SGTrend m/ benchmark · LoadChart m/ soner · BarChart m/ rank">
        <div className="grid2">
          <CompareChart height={150} labels={["U23", "U24", "U25", "U26", "U27"]}
            primary={[68, 72, 70, 78, 82]} secondary={[65, 66, 69, 71, 72]}
            primaryLabel="Øyvind" secondaryLabel="Kat. A-snitt" />
          <SGTrend height={150} benchmark={0} rounds={[
            { label: "R1", ott: 0.2, app: -0.4, arg: 0.1, putt: 0.6 },
            { label: "R2", ott: 0.4, app: -0.1, arg: 0.2, putt: 0.3 },
            { label: "R3", ott: 0.1, app: 0.3, arg: -0.2, putt: 0.5 },
            { label: "R4", ott: 0.5, app: 0.4, arg: 0.1, putt: 0.4 },
          ]} />
          <LoadChart height={150} min={0.4} max={2}
            series={[{ label: "U22", value: 0.9 }, { label: "U23", value: 1.1 }, { label: "U24", value: 1.0 }, { label: "U25", value: 1.3 }, { label: "U26", value: 1.5 }, { label: "U27", value: 1.24 }]}
            zones={[{ from: 0.6, to: 1.3, color: "var(--success)", label: "trygg" }, { from: 1.3, to: 1.5, color: "var(--warning)", label: "varsel" }, { from: 1.5, to: 2, color: "var(--error)", label: "over" }]} />
          <BarChart showRank items={[
            { label: "Øyvind R.", value: 82, active: true },
            { label: "Mia B.", value: 76 },
            { label: "Jonas H.", value: 71 },
            { label: "Sara L.", value: 66 },
          ]} />
        </div>
      </Sec>
    </React.Fragment>
  );
}

function FamTrackman() {
  const slagData = [
    { kolle: "6i", carry: 168, side: -4 }, { kolle: "6i", carry: 172, side: 2 },
    { kolle: "6i", carry: 165, side: -7 }, { kolle: "6i", carry: 170, side: 5 },
    { kolle: "6i", carry: 174, side: -2 }, { kolle: "6i", carry: 169, side: 1 },
    { kolle: "dr", carry: 248, side: -12 }, { kolle: "dr", carry: 255, side: 8 },
    { kolle: "dr", carry: 243, side: -18 }, { kolle: "dr", carry: 252, side: 15 },
    { kolle: "dr", carry: 258, side: -5 }, { kolle: "dr", carry: 246, side: 10 },
  ];
  const kollerDef = [{ id: "6i", navn: "6-jern" }, { id: "dr", navn: "Driver" }];
  return (
    <React.Fragment>
      <Sec label="DispersionPlot — carry × side (m, − = venstre) · to serier + ellipse">
        <DispersionPlot slag={slagData} koller={kollerDef} hoyde={240} />
      </Sec>
      <Sec label="TrajectoryPlot — ballbaner (apex × carry)">
        <TrajectoryPlot hoyde={190} koller={kollerDef} baner={[
          { kolle: "6i", carry: 168, apex: 26 }, { kolle: "6i", carry: 172, apex: 28 },
          { kolle: "6i", carry: 165, apex: 24 }, { kolle: "dr", carry: 248, apex: 32 },
          { kolle: "dr", carry: 255, apex: 35 }, { kolle: "dr", carry: 243, apex: 30 },
        ]} />
      </Sec>
      <Sec label="KolleStatKort — data / loading">
        <div className="grid2">
          <KolleStatKort navn="6-jern" antall={24} csNivaa="CS80" stats={[
            { label: "Club speed", snitt: "38,5", konsistens: "0,4", enhet: "m/s" },
            { label: "Carry", snitt: "169,7", konsistens: "3,1", enhet: "m" },
            { label: "Spin", snitt: "6240", konsistens: "310", enhet: "rpm" },
          ]} />
          <KolleStatKort loading navn="Driver" antall={0} stats={[]} />
        </div>
      </Sec>
      <Sec label="TrackmanSammendrag · LengdeAvvik (+langt/−kort)">
        <div className="grid2">
          <TrackmanSammendrag dato="2. juli 2026" spiller="Øyvind Rohjan" kilde="TrackMan Range"
            totalSlag={64} hoydepunkt="Beste 6-jern-konsistens hittil i år (±3,1 m)."
            koller={[{ navn: "Driver", antall: 18 }, { navn: "6-jern", antall: 24 }, { navn: "52°", antall: 22 }]}
            onClick={() => {}} />
          <LengdeAvvik size={190} range={20} showOuter shots={[
            { x: -4, y: 6 }, { x: 2, y: -3 }, { x: -7, y: 2 }, { x: 5, y: 9 },
            { x: -2, y: -6 }, { x: 1, y: 4 }, { x: 8, y: -2 }, { x: -5, y: -8 },
          ]} />
        </div>
      </Sec>
    </React.Fragment>
  );
}

Object.assign(window, { FamDataVis, FamTrackman });
