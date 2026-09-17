import { Knapp } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" as const };

/** Solid (ink) er standard-CTA, ghost er sekundær. enTing er «Én ting nå» — maks én per skjerm. */
export function Varianter() {
  return (
    <div style={rad}>
      <Knapp>Publiser uke 38</Knapp>
      <Knapp ghost>Lagre som utkast</Knapp>
      <Knapp enTing icon="play">Start dagens økt</Knapp>
    </div>
  );
}

export function MedIkon() {
  return (
    <div style={rad}>
      <Knapp icon="plus">Ny økt</Knapp>
      <Knapp icon="check">Godkjenn</Knapp>
      <Knapp ghost icon="copy">Kopier forrige uke</Knapp>
    </div>
  );
}

/** disabled: 40 % opasitet, ingen klikk. */
export function Deaktivert() {
  return (
    <div style={rad}>
      <Knapp disabled>Publiserer …</Knapp>
      <Knapp ghost disabled>Ingen uke å kopiere</Knapp>
    </div>
  );
}

/** full: mobil-CTA under et kort på 390 px. */
export function FullBredde() {
  return (
    <div style={{ width: 358, display: "flex", flexDirection: "column", gap: 8 }}>
      <Knapp full icon="play">Start økt · 45 min</Knapp>
      <Knapp full ghost>Utsett til i morgen</Knapp>
    </div>
  );
}
