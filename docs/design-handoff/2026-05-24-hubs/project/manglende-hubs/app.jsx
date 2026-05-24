// Mount — design canvas with 7 missing hubs.

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="meta"
        title="Manglende hubs — 7 stk"
        subtitle="CoachHQ Planlegge · Gjennomføre · Innsikt · Admin   |   PlayerHQ Gjennomføre · Analysere · Meg"
      >
        <DCPostIt x={50} y={-10} rotate={-2}>
          Felles hub-anatomi:{'\n'}eyebrow → italic title → sub → action.{'\n'}
          Grid: 3 col × HubCard.{'\n'}
          Tokens fra workbench-v2.css + pr1-styles.css.
        </DCPostIt>
      </DCSection>

      <DCSection
        id="coach"
        title="CoachHQ · 4 hubs"
        subtitle="Planlegge → Gjennomføre → Innsikt → Admin"
      >
        <DCArtboard id="h1-planlegge" label="1 · CoachHQ — Planlegge" width={1280} height={1080}>
          <CoachPlanlegge/>
        </DCArtboard>
        <DCArtboard id="h2-gjennomfore" label="2 · CoachHQ — Gjennomføre" width={1280} height={1080}>
          <CoachGjennomfore/>
        </DCArtboard>
        <DCArtboard id="h3-innsikt" label="3 · CoachHQ — Innsikt" width={1280} height={1080}>
          <CoachInnsikt/>
        </DCArtboard>
        <DCArtboard id="h4-admin" label="4 · CoachHQ — Admin" width={1280} height={1080}>
          <CoachAdmin/>
        </DCArtboard>
      </DCSection>

      <DCSection
        id="player"
        title="PlayerHQ · 3 hubs"
        subtitle="Gjennomføre → Analysere → Meg"
      >
        <DCArtboard id="h5-pl-gjennomfore" label="5 · PlayerHQ — Gjennomføre" width={1280} height={1080}>
          <PlayerGjennomfore/>
        </DCArtboard>
        <DCArtboard id="h6-pl-analysere" label="6 · PlayerHQ — Analysere" width={1280} height={1080}>
          <PlayerAnalysere/>
        </DCArtboard>
        <DCArtboard id="h7-pl-meg" label="7 · PlayerHQ — Meg" width={1280} height={1180}>
          <PlayerMeg/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
