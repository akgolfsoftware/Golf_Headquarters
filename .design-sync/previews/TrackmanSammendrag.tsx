import { TrackmanSammendrag } from "akgolf-hq-komponenter";

/* TrackMan-parametere skrives på engelsk med stor forbokstav (Ball Speed, Smash Factor …). */
const kolonne = { maxWidth: 520 };

/** Kanonisk bruk: driverøkt — fire sentrerte KPI-fliser og beste slag som mute prosa. */
export function Driverokt() {
  return (
    <div style={kolonne}>
      <TrackmanSammendrag
        tittel="sammendrag · trackman-økt"
        kpier={[
          { l: "Ball Speed", v: "68,4", enhet: "m/s" },
          { l: "Smash Factor", v: "1,48" },
          { l: "Carry", v: "231", enhet: "m" },
          { l: "Spin Rate", v: "2 540", enhet: "rpm" },
        ]}
        beste="Beste slag: 248 m carry · 1,51 Smash Factor (Driver)"
      />
    </div>
  );
}

/** Jernøkt: andre parametere (Launch Angle, Attack Angle) og dato i tittelen. */
export function Jernokt() {
  return (
    <div style={kolonne}>
      <TrackmanSammendrag
        tittel="sammendrag · 7-jern · 12.09.2026"
        kpier={[
          { l: "Carry", v: "156", enhet: "m" },
          { l: "Launch Angle", v: "18,4", enhet: "°" },
          { l: "Spin Rate", v: "6 900", enhet: "rpm" },
          { l: "Attack Angle", v: "−3,2", enhet: "°" },
        ]}
        beste="Beste slag: 161 m carry · 1,38 Smash Factor"
      />
    </div>
  );
}

/** Tre KPI-er og ingen beste-linje: rutenettet følger antall fliser (maks fire). */
export function Wedgeokt() {
  return (
    <div style={kolonne}>
      <TrackmanSammendrag
        tittel="sammendrag · 56° · 10.09.2026"
        kpier={[
          { l: "Carry", v: "82", enhet: "m" },
          { l: "Spin Rate", v: "9 400", enhet: "rpm" },
          { l: "Landing Angle", v: "48", enhet: "°" },
        ]}
        beste=""
      />
    </div>
  );
}

/** Manglende måling: tankestrek uten enhet — aldri et gjettet tall. */
export function Mangler() {
  return (
    <div style={kolonne}>
      <TrackmanSammendrag
        tittel="sammendrag · foto av skjerm"
        kpier={[
          { l: "Ball Speed", v: "41,2", enhet: "m/s" },
          { l: "Smash Factor", v: null },
          { l: "Carry", v: "118", enhet: "m" },
          { l: "Spin Rate", v: null },
        ]}
        beste="To parametere kunne ikke leses av bildet."
      />
    </div>
  );
}
