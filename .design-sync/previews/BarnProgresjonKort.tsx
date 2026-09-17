import { BarnProgresjonKort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };

/** Forelderen ser barnets uke i klarspråk: oppsummering, tre tall og en hilsen fra coachen. */
export function Standard() {
  return (
    <div style={boks}>
      <BarnProgresjonKort
        barn="Øyvind Rohjan"
        uke="Uke 38"
        oppsummering="Øyvind har gjennomført 4 av 5 planlagte økter denne uken. Han har jobbet mest med putting og nærspill, og coachen er fornøyd med fremgangen."
        tall={[
          { l: "Økter gjennomført", v: "4 av 5" },
          { l: "Timer trent", v: "9,5 t" },
          { l: "Neste økt", v: "Tor 14:00" },
        ]}
        fraCoach="Godt trykk denne uken — han er klar for helgens turnering."
        coach="Anders Kristiansen"
      />
    </div>
  );
}

/** Rolig uke uten melding fra coach. */
export function UtenCoachMelding() {
  return (
    <div style={boks}>
      <BarnProgresjonKort
        barn="Øyvind Rohjan"
        uke="Uke 37"
        oppsummering="Rolig uke med skoleprøver: 2 av 4 økter gjennomført, begge på puttinggreenen. Ingen avvik uten årsak."
        tall={[
          { l: "Økter gjennomført", v: "2 av 4" },
          { l: "Timer trent", v: "3 t" },
          { l: "Neste økt", v: "Man 16:30" },
        ]}
        fraCoach={null}
      />
    </div>
  );
}
