import { OppgaveKort } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 10, maxWidth: 560 };

/** Åpen oppgave fra treningsplanen: ikon, frist med klokke, akse-chip og status-pill. */
export function Aapen() {
  return (
    <div style={kolonne}>
      <OppgaveKort
        tittel="Loggfør puttetest 3–6 fot"
        sub="Fra treningsplanen · uke 38"
        frist="Fredag 18. september"
        status="aapen"
        akse="SLAG"
        onClick={() => {}}
      />
    </div>
  );
}

/** Status-aksen: åpen, pågår, fullført (gjennomstreket, varm) og forfalt (rød frist). */
export function Statuser() {
  return (
    <div style={kolonne}>
      <OppgaveKort tittel="Loggfør puttetest 3–6 fot" sub="Fra treningsplanen · uke 38" frist="Fredag 18. september" status="aapen" akse="SLAG" />
      <OppgaveKort tittel="Last opp TrackMan-økten fra tirsdag" sub="Coachen venter på tallene" frist="I dag" status="paagaar" akse="TEK" />
      <OppgaveKort tittel="Selvvurdering etter styrkeøkten" sub="Uke 37" frist="Søndag 13. september" status="fullfort" akse="FYS" />
      <OppgaveKort tittel="Meld deg på Olyo Tour Østlandet" sub="Påmelding stengt" frist="Mandag 14. september" status="forfalt" akse="TURN" />
    </div>
  );
}

/** Uten frist: notat fra coach, ingen klokke — status og akse som før. */
export function UtenFrist() {
  return (
    <div style={kolonne}>
      <OppgaveKort tittel="Bytt grep på 7-jern før turneringen" sub="Notat fra Anders Kristiansen" frist={null} status="aapen" akse="SLAG" />
    </div>
  );
}
