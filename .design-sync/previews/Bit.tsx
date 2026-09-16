import { Bit } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 6, flexWrap: "wrap" as const, alignItems: "center" };

/** Nøytral formel-brikke: ren tekst, med ikon, og mono-variant for koder. */
export function Varianter() {
  return (
    <div style={rad}>
      <Bit>Innspill</Bit>
      <Bit icon="map-pin">Treningsområde</Bit>
      <Bit monoTekst>ALENE</Bit>
    </div>
  );
}

/** Rad av brikker slik de står under en økt: varighet, gruppe, radar, sted og P-posisjon. */
export function IRad() {
  return (
    <div style={rad}>
      <Bit icon="clock">60 min</Bit>
      <Bit icon="users">8 spillere</Bit>
      <Bit icon="radar">TrackMan</Bit>
      <Bit icon="ruler">Range 240 m</Bit>
      <Bit monoTekst>P4</Bit>
    </div>
  );
}
