import { AutoProgresjon, SettRepsLogger } from "akgolf-hq-komponenter";

const boks = { maxWidth: 460 };

/** Anbefaling med godta/avvis — aldri sperre: spilleren bestemmer alltid selv. */
export function Standard() {
  return (
    <div style={boks}>
      <AutoProgresjon forslag="+2,5 kg neste gang" grunnlag="Alle sett fullført to økter på rad" />
    </div>
  );
}

/** Forslaget kan gjelde reps i stedet for vekt. */
export function FlereReps() {
  return (
    <div style={boks}>
      <AutoProgresjon forslag="+1 rep per sett" grunnlag="Siste sett kjentes lettere enn planlagt (RPE 6 av 10)" />
    </div>
  );
}

/** Nedjustering er også bare en anbefaling, med de samme to valgene. */
export function Redusert() {
  return (
    <div style={boks}>
      <AutoProgresjon forslag="−5 kg neste gang" grunnlag="To sett avbrutt før mål, to økter på rad" />
    </div>
  );
}

/** Slik den står etter siste sett i en styrkeøkt: under øvelsen forslaget gjelder. */
export function UnderOvelse() {
  return (
    <div style={{ ...boks, display: "flex", flexDirection: "column", gap: 10 }}>
      <SettRepsLogger
        ovelse="Markløft"
        muskelgrupper={["Sete/hofte", "Rygg"]}
        del="Hoveddel"
        sist={[{ vekt: 80, reps: 5 }, { vekt: 80, reps: 5 }]}
        startSett={[{ vekt: 80, reps: 5 }, { vekt: 80, reps: 5 }]}
        vektSteg={2.5}
      />
      <AutoProgresjon forslag="+2,5 kg neste gang" grunnlag="Alle sett fullført to økter på rad" />
    </div>
  );
}
