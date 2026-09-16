import { FordelingHode, FordelingRad } from "akgolf-hq-komponenter";

const boks = { maxWidth: 480 };

/** Mengde/andel (uten signal): fyll i handlingsfargen, verdi i tekstfarge. Timer per område denne måneden. */
export function Mengde() {
  return (
    <div style={boks}>
      <FordelingRad label="Teknikk" pct={42} value="6,3 t" />
      <FordelingRad label="Slag" pct={28} value="4,2 t" />
      <FordelingRad label="Spill" pct={20} value="3,0 t" />
      <FordelingRad label="Fysisk" pct={10} value="1,5 t" last />
    </div>
  );
}

/** signal: opp/ned-data (SG) — positiv grønn, neg rød. Aldri aksentfarge på data. */
export function Signal() {
  return (
    <div style={boks}>
      <FordelingHode kol1="Andel" kol2="SG" />
      <FordelingRad label="Tee" pct={22} value="+0,6" signal kol2 />
      <FordelingRad label="Approach" pct={41} value="−0,9" signal neg kol2 />
      <FordelingRad label="Kort spill" pct={17} value="+0,2" signal kol2 />
      <FordelingRad label="Putting" pct={20} value="−0,4" signal neg kol2 last />
    </div>
  );
}

/** emphasis: uthever svakeste rad — tykkere stolpe, større verdi, tonet bakgrunn. */
export function Uthevet() {
  return (
    <div style={boks}>
      <FordelingRad label="Tee" pct={22} value="+0,6" signal />
      <FordelingRad label="Approach" pct={41} value="−0,9" signal neg emphasis />
      <FordelingRad label="Kort spill" pct={17} value="+0,2" signal />
      <FordelingRad label="Putting" pct={20} value="−0,4" signal neg last />
    </div>
  );
}

/** code: kort mono-kode foran etiketten — P-posisjoner i teknisk plan, antall økter som verdi (kol2 gir plass til ordet). */
export function MedKode() {
  return (
    <div style={boks}>
      <FordelingRad code="P2" label="Takeaway" pct={35} value="8 økter" kol2 />
      <FordelingRad code="P4" label="Topp" pct={25} value="6 økter" kol2 />
      <FordelingRad code="P6" label="Nedsving" pct={30} value="7 økter" kol2 />
      <FordelingRad code="P7" label="Treff" pct={10} value="2 økter" kol2 last />
    </div>
  );
}
