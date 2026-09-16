import { LiveBar } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 560 };

/** Pågående økt: lime prikk, tittel, timer i mono og «Åpne økt». */
export function Live() {
  return (
    <div style={kolonne}>
      <LiveBar tittel="Golfslag — wedge 60–100 m" tid="42:18" cta="Åpne økt" />
    </div>
  );
}

/** Gruppeøkt: deltakertall før timeren. */
export function Gruppeokt() {
  return (
    <div style={kolonne}>
      <LiveBar tittel="WANG morgenøkt — teknikk" tid="1:12:05" deltakere={8} cta="Åpne økt" />
    </div>
  );
}

/** Kritisk: rød flate og «STARTER SNART» når neste økt er rett rundt hjørnet. */
export function StarterSnart() {
  return (
    <div style={kolonne}>
      <LiveBar kritisk tittel="Privattime — Øyvind Rohjan" tid="08:00" cta="Start" />
    </div>
  );
}

/** Uten handling: baren bærer bare status og tid. Lang tittel klippes med ellipse. */
export function UtenHandling() {
  return (
    <div style={{ ...kolonne, maxWidth: 360 }}>
      <LiveBar tittel="Fysisk — styrke underkropp og rotasjon, uke 38" tid="12:40" cta={null} />
    </div>
  );
}
