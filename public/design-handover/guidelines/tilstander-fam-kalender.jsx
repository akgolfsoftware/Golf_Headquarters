/* Tilstandsgalleriet — familier: Kalender + Domene + Marketing.
   Lastes av guidelines/tilstander.html (babel). Registrerer på window. */
const dsKal = window.AKGolfHQDesignSystem_a3d5af;
const {
  VisningsVelger, DayStrip, AgendaRow, UkeKalender, MaanedKalender,
  TidsGrid, Tidslinje, Periodeplan,
  SpillerKort, OektKort, BookingKort, OppgaveKort, AnbefalingsKort, DiffKort,
  AKFormelChip, FleksMerke, LFaseBadge, BenchmarkBadge, Laeringstrapp,
  SamtykkKort, FakturaRad, VarselRad, SGSplittKort, FeaturedCard,
} = dsKal;

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

function FamKalender() {
  const [visning, setVisning] = React.useState("uke");
  const [dag, setDag] = React.useState(2);
  const [varmeDag, setVarmeDag] = React.useState(3);
  const varmeDays = Array.from({ length: 30 }, (_, i) => ({
    date: i + 1,
    sessions: [0, 1, 2, 0, 3, 1, 0][i % 7],
    today: i + 1 === 3,
  }));
  return (
    <React.Fragment>
      <Sec label="VisningsVelger — kontrollert · DayStrip">
        <VisningsVelger visning={visning} onVisning={setVisning} periode="Uke 27 · juli 2026"
          onForrige={() => {}} onNeste={() => {}} onIdag={() => {}} />
        <div style={{ marginTop: 12, maxWidth: 360 }}>
          <DayStrip value={dag} onChange={setDag} days={[
            { dow: "M", date: 29, state: "done" }, { dow: "T", date: 30, state: "done" },
            { dow: "O", date: 1 }, { dow: "T", date: 2 }, { dow: "F", date: 3, today: true },
            { dow: "L", date: 4 }, { dow: "S", date: 5 },
          ]} />
        </div>
      </Sec>
      <Sec label="AgendaRow — upcoming / live / done">
        <div className="stack" style={{ gap: 6 }}>
          <AgendaRow time="09:00" icon="dumbbell" title="FYS · Styrke underkropp" duration="45 min" state="done" />
          <AgendaRow time="16:00" icon="target" title="M2 · Kravtrening driver" duration="60 min" state="live" />
          <AgendaRow time="18:00" icon="flag" title="M3 · Banetrening 9 hull" duration="90 min" state="upcoming" />
        </div>
      </Sec>
      <Sec label="UkeKalender — compliance on / off / none / planned">
        <UkeKalender week={[
          { date: 29, sessions: [{ time: "09:00", title: "Styrke", axis: "FYS", compliance: "on" }] },
          { date: 30, sessions: [{ time: "16:00", title: "Teknikk P3", axis: "TEK", compliance: "off" }] },
          { date: 1, sessions: [] },
          { date: 2, sessions: [{ time: "16:00", title: "Kravtrening", axis: "SLAG", compliance: "none" }] },
          { date: 3, today: true, sessions: [{ time: "17:00", title: "Spill 9 hull", axis: "SPILL", compliance: "planned" }] },
          { date: 4, sessions: [{ time: "10:00", title: "Klubbturnering", axis: "TURN", compliance: "planned" }] },
          { date: 5, sessions: [] },
        ]} />
      </Sec>
      <Sec label="MaanedKalender — varme / piller">
        <div className="grid2" style={{ alignItems: "start" }}>
          <MaanedKalender year={2026} month={6} modus="varme" days={varmeDays} value={varmeDag} onChange={setVarmeDag} />
          <MaanedKalender year={2026} month={6} modus="piller" maksPiller={2} days={[
            { date: 1, okter: [{ id: "a", tittel: "Styrke", akse: "FYS", tid: "09:00" }] },
            { date: 2, okter: [{ id: "b", tittel: "Kravtrening", akse: "SLAG", tid: "16:00" }, { id: "c", tittel: "Putting", akse: "SPILL", tid: "18:00" }, { id: "d", tittel: "Mobilitet", akse: "FYS", tid: "20:00" }] },
            { date: 3, today: true, okter: [{ id: "e", tittel: "Banetrening", akse: "SPILL", tid: "17:00" }] },
            { date: 4, okter: [{ id: "f", tittel: "Klubbturnering", akse: "TURN", tid: "10:00" }] },
          ]} onOktKlikk={() => {}} onNyOkt={() => {}} onVisAlle={() => {}} />
        </div>
      </Sec>
      <Sec label="TidsGrid — akse-blokk / booking-tilstander / nå-linje">
        <TidsGrid fraTime={8} tilTime={12} naa={9.5}>
          <TidsGrid.Kolonne id="k1" header="Fre 3" idag onNyOkt={() => {}}>
            <TidsGrid.Blokk id="bl1" fra={8.5} til={10} akse="SLAG" onClick={() => {}}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>Kravtrening driver</span>
            </TidsGrid.Blokk>
          </TidsGrid.Kolonne>
          <TidsGrid.Kolonne id="k2" header="Lør 4" onNyOkt={() => {}}>
            <TidsGrid.Blokk id="bl2" fra={9} til={10.5} tilstand="apen">
              <span style={{ fontSize: 12 }}>Åpent vindu</span>
            </TidsGrid.Blokk>
            <TidsGrid.Blokk id="bl3" fra={10.5} til={11.5} tilstand="booket">
              <span style={{ fontSize: 12 }}>Booket · Mia</span>
            </TidsGrid.Blokk>
          </TidsGrid.Kolonne>
        </TidsGrid>
      </Sec>
      <Sec label="Tidslinje — baner, bar / utkast / punkter · Periodeplan">
        <Tidslinje total={12} zoom="uke" naa={2.5}
          ticks={[{ ved: 0, tekst: "U25" }, { ved: 4, tekst: "U29" }, { ved: 8, tekst: "U33" }]}>
          <Tidslinje.Bane id="b1" etikett="Øyvind">
            <Tidslinje.Bar id="p1" fra={0} til={4} akse="TEK">Teknikkblokk</Tidslinje.Bar>
            <Tidslinje.Bar id="p2" fra={5} til={8} akse="SPILL" utkast>Spillblokk (utkast)</Tidslinje.Bar>
            <Tidslinje.Punkt ved={9} variant="turnering" etikett="NM" />
            <Tidslinje.Punkt ved={11} variant="peak" etikett="Peak" />
          </Tidslinje.Bane>
        </Tidslinje>
        <div style={{ marginTop: 14 }}>
          <Periodeplan totalWeeks={26} months={["Jan", "Feb", "Mar", "Apr", "Mai", "Jun"]}
            phases={[
              { label: "Base", startWeek: 1, durationWeeks: 8 },
              { label: "Forberedelse", startWeek: 9, durationWeeks: 6 },
              { label: "Spesialisering", startWeek: 15, durationWeeks: 6 },
              { label: "Taper", startWeek: 21, durationWeeks: 2 },
              { label: "Peak", startWeek: 23, durationWeeks: 2 },
            ]}
            tournaments={[{ name: "NM Junior", week: 24, prio: "A" }, { week: 18, prio: "B" }]} />
        </div>
      </Sec>
    </React.Fragment>
  );
}

function FamDomain() {
  return (
    <React.Fragment>
      <Sec label="SpillerKort · SGSplittKort">
        <div className="grid2">
          <SpillerKort name="Øyvind Rohjan" hcp="+1,2" kategori="Kat. A" sg="+1,8" sgDelta="+0,4" runder={14} adherence={92} onClick={() => {}} />
          <SGSplittKort data={{ ott: { value: 0.4, delta: 0.2 }, app: { value: -0.3, delta: 0.3 }, arg: { value: 0.1, delta: -0.1 }, putt: { value: 0.6, delta: 0.1 } }} />
        </div>
      </Sec>
      <Sec label="OektKort — planned / live / done / cancelled">
        <div className="grid2">
          <OektKort title="Kravtrening driver" axis="SLAG" time="16:00" duration="60 min" location="Rangen" state="planned" onClick={() => {}} />
          <OektKort title="Banetrening 9 hull" axis="SPILL" time="17:00" duration="90 min" coach="Anders" state="live" onClick={() => {}} />
          <OektKort title="Styrke underkropp" axis="FYS" time="09:00" duration="45 min" state="done" />
          <OektKort title="Teknikk P3" axis="TEK" time="18:00" duration="45 min" state="cancelled" />
        </div>
      </Sec>
      <Sec label="BookingKort — available / pending / confirmed / cancelled">
        <div className="grid2">
          <BookingKort type="Privattime" date="Man 6. jul" time="14:00" duration="60 min" location="Studio" coach="Anders Kristiansen" state="available" onBook={() => {}} />
          <BookingKort type="Privattime" date="Tir 7. jul" time="10:00" duration="60 min" coach="Anders Kristiansen" state="pending" onCancel={() => {}} />
          <BookingKort type="TrackMan-økt" date="Ons 8. jul" time="16:00" duration="45 min" location="Simulator 2" state="confirmed" onCancel={() => {}} />
          <BookingKort type="Gruppetrening" date="Tor 9. jul" time="18:00" duration="90 min" state="cancelled" />
        </div>
      </Sec>
      <Sec label="OppgaveKort — venter (+video) / godkjent / forfalt">
        <div className="stack" style={{ gap: 10 }}>
          <OppgaveKort tittel="Face-to-path CS60" beskrivelse="Tren ansiktskontroll i rolig fart — filmes fra face-on." drill="Gate-drill 6-jern" dose="3×/uke" frist="fredag 10.7" status="venter" videoKrav akse="TEK" trinn="Trinn 3 · Kølle" onPrimaer={() => {}} primaerTekst="Marker gjort" onSekundaer={() => {}} sekundaerTekst="Se drill" />
          <div className="grid2">
            <OppgaveKort tittel="Putting-stige 10–30 ft" dose="40 baller" status="godkjent" akse="SPILL" />
            <OppgaveKort tittel="Mobilitet hofte" dose="2×/uke" frist="mandag 6.7" status="forfalt" akse="FYS" onPrimaer={() => {}} primaerTekst="Marker gjort" />
          </div>
        </div>
      </Sec>
      <Sec label="AnbefalingsKort — full / kompakt">
        <AnbefalingsKort kontekst="Uke 28 · Øyvind"
          hvorfor="APP-SG har falt 0,4 over de siste 4 rundene, mens treningsvolumet på SLAG er 30 % over plan."
          hva="Bytt torsdagens M1-økt til M2 · Kravtrening wedge 60–100 m."
          effekt="+0,3 SG APP innen 3 uker (basert på lignende justeringer)."
          hvorforNaa="Neste turnering er om 3 uker — endringen rekker å sette seg."
          onBruk={() => {}} onAvvis={() => {}} onJuster={() => {}} />
        <div style={{ marginTop: 10 }}>
          <AnbefalingsKort kompakt
            hvorfor="ACWR 1,52 — over sonen." hva="Flytt lørdagens FYS-økt til tirsdag."
            effekt="ACWR tilbake i trygg sone (≤1,3)." hvorforNaa="Belastningstoppen er denne uka."
            onBruk={() => {}} />
        </div>
      </Sec>
      <Sec label="DiffKort — fjernes / legges til / effekt">
        <DiffKort>
          <DiffKort.Fjernes>
            <DiffKort.Rad akse="SLAG" meta="Lør 09:00 · 1,5t · CS80">Kravtrening driver</DiffKort.Rad>
          </DiffKort.Fjernes>
          <DiffKort.LeggesTil>
            <DiffKort.Rad akse="SPILL" meta="Lør 09:00 · 1,5t · M3">Banetrening 9 hull</DiffKort.Rad>
          </DiffKort.LeggesTil>
          <DiffKort.Effekt>
            <DiffKort.Metrikk label="Plan-kvalitet" fra="81" til="87" tone="positiv" />
            <DiffKort.Metrikk label="SPILL-andel" fra="18 %" til="24 %" tone="positiv" />
          </DiffKort.Effekt>
        </DiffKort>
      </Sec>
      <Sec label="Formelchips — AKFormelChip / FleksMerke / LFaseBadge / BenchmarkBadge">
        <div className="row" style={{ gap: 8 }}>
          <AKFormelChip kode="M2" navn="Kravtrening" tilstand="arvet" />
          <AKFormelChip kode="CS60" navn="60 % av maksfart" tilstand="overstyrt" onClick={() => {}} />
          <AKFormelChip kode="L3" navn="Trinn 3 · Kølle" visKode={false} />
          <FleksMerke tilstand="fleks" />
          <FleksMerke tilstand="laast" />
          <FleksMerke tilstand="flyttet" grunnkode="REISE" />
        </div>
        <div className="row" style={{ gap: 8, marginTop: 10 }}>
          <LFaseBadge phase="Base" /><LFaseBadge phase="Forberedelse" /><LFaseBadge phase="Spesialisering" /><LFaseBadge phase="Taper" /><LFaseBadge phase="Peak" />
        </div>
        <div className="row" style={{ gap: 8, marginTop: 10 }}>
          <BenchmarkBadge niva="Kategori A" />
          <BenchmarkBadge niva="Challenge-nivå" prefiks="Ligger an til" status="projeksjon" />
        </div>
      </Sec>
      <Sec label="Laeringstrapp — spillervisning (Trinn 3 av 5) / kompakt">
        <div className="grid2" style={{ alignItems: "end" }}>
          <Laeringstrapp aktivtTrinn={3} visStatus />
          <Laeringstrapp aktivtTrinn={5} kompakt visEtiketter={false} />
        </div>
      </Sec>
      <Sec label="SamtykkKort — pending / approved · FakturaRad — paid / pending / overdue">
        <div className="grid2">
          <SamtykkKort playerName="Øyvind Rohjan" type="Foto og video" description="Bilder fra trening kan deles i stallens kanal." status="pending" onApprove={() => {}} onReject={() => {}} />
          <SamtykkKort playerName="Øyvind Rohjan" type="Datadeling med forbund" status="approved" />
        </div>
        <div className="stack" style={{ gap: 6, marginTop: 10 }}>
          <FakturaRad title="PRO månedlig" subtitle="Juni 2026" amount="299" currency="kr" status="paid" onClick={() => {}} />
          <FakturaRad title="PRO månedlig" subtitle="Juli 2026" amount="299" currency="kr" status="pending" />
          <FakturaRad title="Privattime 60 min" subtitle="Forfalt 28.6" amount="850" currency="kr" status="overdue" />
        </div>
      </Sec>
      <Sec label="VarselRad — toner + ulest">
        <div className="stack" style={{ gap: 6 }}>
          <VarselRad tone="success" icon="circle-check" title="Plan godkjent" body="Uke 28 er klar for Øyvind." time="10:12" />
          <VarselRad tone="warning" icon="triangle-alert" title="Avviker fra anbefaling — SPILL over budsjett" time="09:40" unread onClick={() => {}} />
          <VarselRad tone="error" icon="circle-x" title="Sterkt avvik — ACWR 1,6" body="Coach er varslet automatisk." time="08:55" unread onClick={() => {}} />
          <VarselRad tone="info" icon="info" title="Ny TrackMan-økt importert" time="i går" />
          <VarselRad tone="neutral" icon="bell" title="Synkronisert med NGF" time="i går" />
        </div>
      </Sec>
    </React.Fragment>
  );
}

function FamMarketing() {
  return (
    <Sec label="FeaturedCard — uten foto (forest-flate)">
      <FeaturedCard height={260} eyebrow="NM-sporet" title="Fra range til leaderboard"
        description="Strukturert satsing med coach, plan og målbar fremgang."
        ctaLabel="Se hvordan" ctaVariant="signal" onCta={() => {}} />
    </Sec>
  );
}

Object.assign(window, { FamKalender, FamDomain, FamMarketing });
