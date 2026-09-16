import { FordelingHode, FordelingRad } from "akgolf-hq-komponenter";

const boks = { maxWidth: 480 };

/** Kolonnehode over FordelingRad-er: høyrestilt %-kolonne (36 px). Timer per område denne måneden. */
export function Standard() {
  return (
    <div style={boks}>
      <FordelingHode />
      <FordelingRad label="Teknikk" pct={42} value="6,3 t" />
      <FordelingRad label="Slag" pct={28} value="4,2 t" />
      <FordelingRad label="Spill" pct={20} value="3,0 t" />
      <FordelingRad label="Fysisk" pct={10} value="1,5 t" last />
    </div>
  );
}

/** kol2: egen overskrift for verdikolonnen (84 px); radene settes med kol2. */
export function ToKolonner() {
  return (
    <div style={boks}>
      <FordelingHode kol1="Andel" kol2="SG / runde" />
      <FordelingRad code="TEE" label="Tee" pct={22} value="+0,6" signal kol2 />
      <FordelingRad code="APP" label="Approach" pct={41} value="−0,9" signal neg kol2 />
      <FordelingRad code="ARG" label="Kort spill" pct={17} value="+0,2" signal kol2 />
      <FordelingRad code="PUTT" label="Putting" pct={20} value="−0,4" signal neg kol2 last />
    </div>
  );
}
