import { TonnasjeHero } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

/** Økt fullført: total kg løftet i mono, delta mot forrige økt, sett/reps under og «?»-hjelp for tonnasje og ACWR. */
export function Standard() {
  return (
    <div style={boks}>
      <TonnasjeHero
        tonnasje={4320}
        sett={24}
        reps={186}
        delta="+8 %"
        dir="up"
        sub="Beregnet fra loggede sett — mates inn i ACWR og ukevolum"
        hjelp
      />
    </div>
  );
}

/** Slik FysiskV2 bruker den: tom delta skjuler chipen, hjelp på. */
export function UtenDelta() {
  return (
    <div style={boks}>
      <TonnasjeHero tonnasje={2860} sett={16} reps={128} delta="" sub="Beregnet fra loggede sett — mates inn i ACWR og ukevolum" hjelp />
    </div>
  );
}

/** Planlagt lettere uke: nedgang vises som fakta, ikke som feil. */
export function Nedgang() {
  return (
    <div style={boks}>
      <TonnasjeHero tonnasje={3150} sett={20} reps={150} delta="−12 %" dir="down" sub="Lettere uke etter turnering — planlagt" />
    </div>
  );
}
