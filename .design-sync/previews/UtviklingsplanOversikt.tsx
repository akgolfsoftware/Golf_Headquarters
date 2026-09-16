import { UtviklingsplanOversikt } from "akgolf-hq-komponenter";

const boks = { maxWidth: 480 };

const rail = (aktiv: number) =>
  Array.from({ length: 10 }, (_, i) => ({
    p: `P${i + 1}`,
    status: i < aktiv ? ("done" as const) : i === aktiv ? ("active" as const) : ("pending" as const),
    fokus: i === aktiv,
  }));

/** Spillerens speil av coachens plan: navn, periode, P-skinne, aktiv posisjon, neste krav, notat fra coach og én CTA. */
export function Standard() {
  return (
    <div style={boks}>
      <UtviklingsplanOversikt
        planNavn="Teknisk utviklingsplan — høst 2026"
        periode="Spesialisering · uke 36–43"
        posisjoner={rail(3)}
        aktivP="P4"
        nesteKrav={{
          tittel: "Venstre arm parallell med skulderlinjen i P4",
          repsGjort: 240,
          repsMaal: 300,
          lFase: "Lav hastighet",
          cs: null,
          spor: "PAA_VEI",
          status: "active",
          tmMaal: "Spredning 7-jern under 9,0 m",
        }}
        coachNote="Hold lav hastighet ut uken — vi tester full fart mandag."
        cta="Start økt på dette"
      />
    </div>
  );
}

/** Uten coach-notat, sent i planen: P7 aktiv og et krav som står stille. */
export function UtenCoachNote() {
  return (
    <div style={boks}>
      <UtviklingsplanOversikt
        planNavn="Teknisk utviklingsplan — høst 2026"
        periode="Spesialisering · uke 36–43"
        posisjoner={rail(6)}
        aktivP="P7"
        nesteKrav={{
          tittel: "Hendene foran ballen i impact",
          repsGjort: 90,
          repsMaal: 300,
          lFase: "Lav hastighet",
          cs: null,
          spor: "STAGNERER",
          status: "active",
          tmMaal: "Attack Angle −4° med 7-jern",
        }}
        coachNote={null}
        cta="Start økt på dette"
      />
    </div>
  );
}

/** Helt i starten: P1 aktiv, ingenting ferdig, første krav uten ball og uten TrackMan-mål. */
export function TidligIPlanen() {
  return (
    <div style={boks}>
      <UtviklingsplanOversikt
        planNavn="Teknisk utviklingsplan — vinter 2026/27"
        periode="Grunnlag · uke 44–52"
        posisjoner={rail(0)}
        aktivP="P1"
        nesteKrav={{
          tittel: "Nøytralt grep og ballposisjon midt i stansen",
          repsGjort: 0,
          repsMaal: 200,
          lFase: "Uten ball",
          cs: null,
          spor: "PAA_VEI",
          status: "active",
          tmMaal: null,
        }}
        coachNote="Vi starter fra adresse — ta bilde av oppstillingen før hver økt."
        cta="Start økt på dette"
      />
    </div>
  );
}
