import { LengdeAvvik } from "akgolf-hq-komponenter";

/* Listekort — står i en kolonne i appen. */
const kolonne = { maxWidth: 520 };

/** Kanonisk bruk: avvik mot forventet carry per kølle. Innenfor ±3 m = grønt, ±6 m = gult, mer = rødt. */
export function Standard() {
  return (
    <div style={kolonne}>
      <LengdeAvvik
        enhet="m"
        grense={3}
        koller={[
          { navn: "Driver", avvik: 5 }, { navn: "3-tre", avvik: -7 }, { navn: "4-hybrid", avvik: -2 },
          { navn: "6-jern", avvik: 1 }, { navn: "8-jern", avvik: -3 }, { navn: "PW", avvik: 6 }, { navn: "56°", avvik: 2 },
        ]}
      />
    </div>
  );
}

/** Alt i rute: alle køller innenfor grensen — bare grønne stolper. */
export function AltIRute() {
  return (
    <div style={kolonne}>
      <LengdeAvvik
        koller={[
          { navn: "Driver", avvik: 2 }, { navn: "3-tre", avvik: -1 }, { navn: "5-jern", avvik: 0 },
          { navn: "7-jern", avvik: 1 }, { navn: "9-jern", avvik: -2 }, { navn: "PW", avvik: 3 },
        ]}
      />
    </div>
  );
}

/** Strengere grense (±2 m) og én kølle uten måling — tankestrek, ingen stolpe. */
export function StrengGrense() {
  return (
    <div style={kolonne}>
      <LengdeAvvik
        grense={2}
        koller={[
          { navn: "Driver", avvik: 4 }, { navn: "3-tre", avvik: null }, { navn: "5-jern", avvik: -3 },
          { navn: "7-jern", avvik: 1 }, { navn: "PW", avvik: -2 },
        ]}
      />
    </div>
  );
}
