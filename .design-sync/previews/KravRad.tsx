import { Kort, KravRad } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };

/** De tre statusene i én liste: ferdig (gjennomstreket, grønn stolpe), aktiv (fylt ring, spor-chip) og ikke startet (dempet). Motorikk-steg som nøytral chip. */
export function Statuser() {
  return (
    <div style={boks}>
      <Kort pad="15px 17px">
        <KravRad
          tittel="Hoftedreining 45° før armene starter ned"
          status="done"
          spor="FERDIG"
          repsGjort={300}
          repsMaal={300}
          lFase="Uten ball"
          cs={null}
          tmMaal="Face Angle ±2° på 8 av 10 slag"
          tmNaadd
        />
        <KravRad
          tittel="Venstre arm parallell med skulderlinjen i P4"
          status="active"
          spor="PAA_VEI"
          repsGjort={240}
          repsMaal={300}
          lFase="Lav hastighet"
          cs={null}
          tmMaal="Spredning 7-jern under 9,0 m"
          tmNaadd={false}
        />
        <KravRad
          tittel="Kølleblad square mot svingplan i P4"
          status="pending"
          spor="INAKTIV"
          repsGjort={0}
          repsMaal={200}
          lFase={null}
          cs={null}
          tmMaal={null}
          last
        />
      </Kort>
    </div>
  );
}

/** Står stille: gul spor-chip, halvveis i reps, TrackMan-målet ikke nådd. */
export function StaarStille() {
  return (
    <div style={boks}>
      <Kort pad="15px 17px">
        <KravRad
          tittel="Club Path mellom 0 og +3° med driver"
          status="active"
          spor="STAGNERER"
          repsGjort={120}
          repsMaal={300}
          lFase="Lav hastighet"
          cs={null}
          tmMaal="Club Path 0 til +3° på 7 av 10 slag"
          tmNaadd={false}
          last
        />
      </Kort>
    </div>
  );
}

/** Uten rep-mål (repsMaal 0 skjuler stolpen): kravet måles bare i TrackMan. */
export function BareTrackMan() {
  return (
    <div style={boks}>
      <Kort pad="15px 17px">
        <KravRad
          tittel="Attack Angle −4° med 7-jern"
          status="active"
          spor="PAA_VEI"
          repsGjort={0}
          repsMaal={0}
          lFase="Auto"
          cs={null}
          tmMaal="Attack Angle −5° til −3° på 8 av 10 slag"
          tmNaadd={false}
          last
        />
      </Kort>
    </div>
  );
}
