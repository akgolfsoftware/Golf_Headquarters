import { TestResultatKort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 480 };

/** På vei: målt Carry driver mot referanse for aldersnivå, markør på skalaen U14–Senior. */
export function PaaVei() {
  return (
    <div style={boks}>
      <TestResultatKort
        test="Carry driver"
        verdi="238"
        enhet="m"
        delta="+6 m"
        dir="up"
        krav="Referanse U18: 245 m"
        pct={68}
        stops={["U14", "U16", "U18", "Senior"]}
        dato="Testet 12. september 2026"
        bestaatt={false}
      />
    </div>
  );
}

/** Nådd: grønn pill, treff av 20 som enhet. */
export function Naadd() {
  return (
    <div style={boks}>
      <TestResultatKort
        test="Putt 3–6 fot"
        verdi="17"
        enhet="av 20"
        delta="+3"
        dir="up"
        krav="Referanse U18: 15 av 20"
        pct={84}
        stops={["U14", "U16", "U18", "Senior"]}
        dato="Testet 9. september 2026"
        bestaatt
      />
    </div>
  );
}

/** Tilbakegang: delta ned i rødt, fortsatt «På vei». */
export function Tilbakegang() {
  return (
    <div style={boks}>
      <TestResultatKort
        test="Carry 7-jern"
        verdi="152"
        enhet="m"
        delta="−4 m"
        dir="down"
        krav="Referanse U18: 158 m"
        pct={46}
        stops={["U14", "U16", "U18", "Senior"]}
        dato="Testet 5. september 2026"
        bestaatt={false}
      />
    </div>
  );
}
