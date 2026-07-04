/* Tilstandsgalleriet — familier: Golfdata + Kategori.
   Lastes av guidelines/tilstander.html (babel). Registrerer på window. */
const dsGolf = window.AKGolfHQDesignSystem_a3d5af;
const {
  NesteFokusKort, SgTotalKort, SgKategoriBar, SgTrend, Scorekort, TigerFiveKort,
  GappingChart, PuttModellKort, KategoriKravKort, SpillerTilstandKort,
  SlagLekkasjeKart, DiagnoseKort, LaunchWindowKort, StrikeSmashKort,
  KategoriStige, TidsPyramide, KategoriFjell,
} = dsGolf;

function GSec({ label, children }) {
  return (
    <div className="sec">
      <p className="sec__lbl">{label}</p>
      {children}
    </div>
  );
}

const G_LEKK = [
  { id: "tee", label: "Tee-slag", sg: 0.3, slag: 42 },
  { id: "app150", label: "Innspill 150–100 m", sg: -0.8, slag: 34 },
  { id: "putt6", label: "Putting 0–6 ft", sg: -0.6, slag: 88 },
];
const G_SKUDD = [{ launch: 12.8, spinn: 2350 }, { launch: 13.4, spinn: 2210 }, { launch: 10.4, spinn: 3120 }, { launch: 13.9, spinn: 2050 }, { launch: 11.1, spinn: 3260 }, { launch: 12.5, spinn: 2440 }];
const G_SONER = [
  { andel: 0.04, smash: 1.42 }, { andel: 0.09, smash: 1.46 }, { andel: 0.05, smash: 1.44 },
  { andel: 0.12, smash: 1.45 }, { andel: 0.28, smash: 1.50 }, { andel: 0.14, smash: 1.48 },
  { andel: 0.10, smash: 1.41 }, { andel: 0.13, smash: 1.44 }, { andel: 0.00, smash: null },
];
const G_KAT = [{ akse: "OTT", sg: 0.9 }, { akse: "APP", sg: -0.3 }, { akse: "ARG", sg: 0.4 }, { akse: "PUTT", sg: -1.2 }];

function FamGolfdata() {
  return (
    <React.Fragment>
      <GSec label="NesteFokusKort — normal / tomt (onboarding)">
        <div className="stack">
          <NesteFokusKort akse="PUTT" omrade="Putting innenfor 6 ft er største lekkasje" sgTap="−1,2" baseline="Team Norway IUP" begrunnelse="Du taper mest på de korte puttene." nivaa="ovet" onHandling={() => {}} />
          <NesteFokusKort tomt onHandling={() => {}} />
        </div>
      </GSec>
      <GSec label="SgTotalKort / SgKategoriBar / SgTrend — normal + tomt">
        <div className="stack">
          <SgTotalKort verdi="+1,2" baseline="Broadie scratch" runder={10} trend="+0,4" nivaa="ovet" />
          <SgKategoriBar kategorier={G_KAT} baseline="Broadie scratch" />
          <SgTrend punkter={[{ sg: -0.4 }, { sg: 0.2 }, { sg: 0.6 }, { sg: 0.9 }]} baseline="Broadie scratch" />
          <SgTrend punkter={[]} baseline="Broadie scratch" />
        </div>
      </GSec>
      <GSec label="SlagLekkasjeKart — nivåer (nybegynner/elite) / loading / tomt">
        <div className="stack">
          <SlagLekkasjeKart baand={G_LEKK} baseline="Kat. A-snitt" grunnlag="14 runder" nivaa="nybegynner" />
          <SlagLekkasjeKart baand={G_LEKK} baseline="Kat. A-snitt" grunnlag="14 runder" valgtId="app150" onVelgBaand={() => {}} nivaa="elite" />
          <SlagLekkasjeKart loading />
          <SlagLekkasjeKart tomt />
        </div>
      </GSec>
      <GSec label="DiagnoseKort — elite (m/ fagkode) / tomt">
        <div className="stack">
          <DiagnoseKort symptom="Mister 0,8 slag på innspill 100–150 m" grunnlag="14 runder · 62 innspill"
            bevis={{ enhet: "%", spiller: { label: "Deg", verdi: 52 }, baseline: { label: "Kat. A-snitt", verdi: 68 } }}
            resept={{ akse: "SLAG", kode: "M2", tekst: "Kravtrening på innspill 100–150 m." }} onPlanlegg={() => {}} nivaa="elite" />
          <DiagnoseKort tomt />
        </div>
      </GSec>
      <GSec label="LaunchWindowKort — elite / loading · StrikeSmashKort — ovet / tomt">
        <div className="stack">
          <LaunchWindowKort kolle="Driver" csNivaa="CS90" skudd={G_SKUDD} vindu={{ launchMin: 11, launchMax: 15, spinnMin: 1900, spinnMax: 2600 }} meterIgjen={9} grunnlag="26 slag · TrackMan" dom="Spinnen ligger ~400 rpm for høyt." nivaa="elite" />
          <LaunchWindowKort loading />
          <StrikeSmashKort kolle="Driver" soner={G_SONER} idealSmash={1.5} grunnlag="86 slag · TrackMan" dom="Lav hæl-treff koster 0,06 smash." nivaa="ovet" />
          <StrikeSmashKort tomt />
        </div>
      </GSec>
      <GSec label="Scorekort / TigerFive / Gapping / PuttModell / KategoriKrav / SpillerTilstand">
        <div className="stack">
          <Scorekort sammendrag={{ score: 71, par: 72, sg: 1.2 }} hull={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ nr: n, par: [4, 3, 4, 5, 4, 4, 3, 5, 4][n - 1], score: [4, 2, 5, 5, 3, 4, 3, 6, 4][n - 1], sg: [0.1, 0.8, -0.6, 0.2, 0.7, 0, 0.3, -0.9, 0.2][n - 1] }))} />
          <TigerFiveKort metrikker={[{ navn: "SG Total", verdi: "+1,2", enhet: "slag", status: "god", trend: "+0,4" }, { navn: "GIR", verdi: 62, enhet: "%", status: "varsel", trend: "−2" }]} />
          <GappingChart koller={[{ navn: "Driver", carry: 248, spredning: 12 }, { navn: "5-jern", carry: 175, spredning: 8 }]} />
          <PuttModellKort band={[{ band: "0–3 ft", pct: 98, baseline: 99 }, { band: "3–6 ft", pct: 74, baseline: 82 }]} baseline="Team Norway IUP" />
          <KategoriKravKort nivaa="B" nesteNivaa="A" krav={[{ navn: "SG Total ≥ +1,0", bestatt: true, verdi: "+1,2", mal: "+1,0" }, { navn: "Putting 3–6 ft ≥ 80 %", bestatt: false, verdi: "74 %", mal: "80 %" }]} nesteKrav="Løft putting 3–6 ft til 80 %." />
          <SpillerTilstandKort navn="Sofie Lindqvist" tilstand="risiko" sgTrend="+0,6" sisteAktivitet="3t siden" flagg="ACWR 1,46" onClick={() => {}} />
        </div>
      </GSec>
    </React.Fragment>
  );
}

const G_KATEGORIER = [
  { id: "A", niva: "World Elite", score: "68–70", hcp: "+4 til 0", alder: "18–28", spillere: "Verdens beste spillere.", tours: "PGA TOUR · DP WORLD TOUR", bane: { cr: "75+", slope: "145+", oppsett: "Championship-oppsett, bakerste tee.", arenaer: "Tour-baner" }, timerUke: "30", aar: { fys: 180, tek: 200, slag: 230, spill: 270, turn: 420, total: 1300, tw: 20, rd: 4, rh: "5,25" }, sg: { ott: 0.9, app: 1.1, arg: 0.5, putt: 0.6 }, tester: { kolle: "120", ball: "178", cmj: "58", sprint: "2,9" }, mx: 90, my: 20 },
  { id: "B", niva: "National Elite", score: "70–72", hcp: "+2 til 1", alder: "17–22", spillere: "Landslag senior.", tours: "CHALLENGE TOUR", bane: { cr: "73–75", slope: "140–150", oppsett: "Mesterskapsoppsett.", arenaer: "Nasjonale baner" }, timerUke: "26", aar: { fys: 150, tek: 180, slag: 200, spill: 214, turn: 336, total: 1080, tw: 16, rd: 4, rh: "5,25" }, sg: { ott: 0.6, app: 0.7, arg: 0.3, putt: 0.4 }, tester: { kolle: "116", ball: "172", cmj: "54", sprint: "3,0" }, mx: 84, my: 26 },
  { id: "E", niva: "Regional U18", score: "76–78", hcp: "3 til 6", alder: "14–17", spillere: "Distriktslag U18.", tours: "SRIXON TOUR", bane: { cr: "70–72", slope: "125–135", oppsett: "Junior-/regionoppsett.", arenaer: "Regionbaner" }, timerUke: "16", aar: { fys: 110, tek: 150, slag: 130, spill: 60, turn: 90, total: 540, tw: 10, rd: 2, rh: "4,5" }, sg: { ott: -0.2, app: -0.2, arg: -0.1, putt: -0.1 }, tester: { kolle: "107", ball: "158", cmj: "44", sprint: "3,3" }, mx: 68, my: 45 },
  { id: "K", niva: "Nybegynner Junior", score: "100+", hcp: "36 til 54", alder: "8–11", spillere: "Banetilvenning og lek.", tours: "GRØNT KORT JUNIOR", bane: { cr: "—", slope: "—", oppsett: "Par-3 og treningsfelt.", arenaer: "Treningsområde" }, timerUke: "3", aar: { fys: 8, tek: 30, slag: 12, spill: 1, turn: 3, total: 54, tw: 1, rd: 1, rh: "3,0" }, sg: { ott: -2.0, app: -2.1, arg: -1.3, putt: -1.2 }, tester: { kolle: "80", ball: "118", cmj: "28", sprint: "4,1" }, mx: 34, my: 82 },
];

function FamKategori() {
  return (
    <React.Fragment>
      <GSec label="KategoriStige — normal (utdrag A/B/E/K) / loading / tomt">
        <div className="stack">
          <KategoriStige kategorier={G_KATEGORIER} seksjoner={[{ ved: "A", label: "A–D · Topp & elite" }, { ved: "E", label: "E–K · Klubb & utvikling" }]} />
          <KategoriStige loading />
          <KategoriStige tomt />
        </div>
      </GSec>
      <GSec label="TidsPyramide — normal / uten årsmodell (ærlig tom)">
        <div className="stack">
          <TidsPyramide aarsmodell={{ fys: 140, tek: 175, slag: 200, spill: 195, turn: 210, total: 920, tw: 14, rd: 3, rh: "5,0" }} perUke="23" />
          <TidsPyramide />
        </div>
      </GSec>
      <GSec label="KategoriFjell — m/ foto / uten foto (gradient-fallback) / tom liste">
        <div className="stack">
          <KategoriFjell kategorier={G_KATEGORIER} bilde="../assets/imagery/fjell.jpeg" onAapneProfil={() => {}} />
          <KategoriFjell kategorier={G_KATEGORIER.slice(0, 2)} />
          <KategoriFjell kategorier={[]} />
        </div>
      </GSec>
    </React.Fragment>
  );
}

Object.assign(window, { FamGolfdata, FamKategori });
