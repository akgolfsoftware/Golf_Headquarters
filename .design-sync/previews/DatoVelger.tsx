import { DatoVelger } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };

/** Uken som inneholder i dag (onsdag 16. september 2026) — valgt dag fylt. */
export function Standard() {
  return (
    <div style={boks}>
      <DatoVelger
        label="Dato"
        maaned="September 2026"
        dager={[
          { d: "Man", n: 14 },
          { d: "Tir", n: 15 },
          { d: "Ons", n: 16 },
          { d: "Tor", n: 17 },
          { d: "Fre", n: 18 },
          { d: "Lør", n: 19 },
          { d: "Søn", n: 20 },
        ]}
        defaultValue={16}
      />
    </div>
  );
}

/** Uke over et månedsskifte. Kontrollert med statisk verdi. */
export function Maanedsskifte() {
  return (
    <div style={boks}>
      <DatoVelger
        label="Første turneringsdag"
        maaned="Sept.–okt. 2026"
        dager={[
          { d: "Man", n: 28 },
          { d: "Tir", n: 29 },
          { d: "Ons", n: 30 },
          { d: "Tor", n: 1 },
          { d: "Fre", n: 2 },
          { d: "Lør", n: 3 },
          { d: "Søn", n: 4 },
        ]}
        value={3}
        onChange={() => {}}
      />
    </div>
  );
}

/** Helgevalg til testdag. */
export function Testdag() {
  return (
    <div style={boks}>
      <DatoVelger
        label="Testdag"
        maaned="Oktober 2026"
        dager={[
          { d: "Man", n: 5 },
          { d: "Tir", n: 6 },
          { d: "Ons", n: 7 },
          { d: "Tor", n: 8 },
          { d: "Fre", n: 9 },
          { d: "Lør", n: 10 },
          { d: "Søn", n: 11 },
        ]}
        defaultValue={10}
      />
    </div>
  );
}
