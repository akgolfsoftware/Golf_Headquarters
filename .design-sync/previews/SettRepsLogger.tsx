import { SettRepsLogger } from "akgolf-hq-komponenter";

const boks = { maxWidth: 460 };

/** Benkpress: vekt × reps logges manuelt per sett, forrige økt står som spøkelsesverdi under raden. */
export function Benkpress() {
  return (
    <div style={boks}>
      <SettRepsLogger
        ovelse="Benkpress"
        muskelgrupper={["Bryst", "Skuldre", "Triceps"]}
        del="Hoveddel"
        sist={[{ vekt: 50, reps: 8 }, { vekt: 50, reps: 8 }, { vekt: 52.5, reps: 6 }]}
        startSett={[{ vekt: 50, reps: 8 }, { vekt: 52.5, reps: 8 }, { vekt: 52.5, reps: 6 }]}
        vektSteg={2.5}
      />
    </div>
  );
}

/** Knebøy med fire sett og 5 kg-steg på vektknappene. */
export function Kneboy() {
  return (
    <div style={boks}>
      <SettRepsLogger
        ovelse="Knebøy"
        muskelgrupper={["Lår", "Sete/hofte", "Kjerne"]}
        del="Hoveddel"
        sist={[{ vekt: 70, reps: 6 }, { vekt: 70, reps: 6 }, { vekt: 70, reps: 6 }, { vekt: 70, reps: 5 }]}
        startSett={[{ vekt: 70, reps: 6 }, { vekt: 70, reps: 6 }, { vekt: 75, reps: 5 }, { vekt: 75, reps: 5 }]}
        vektSteg={5}
      />
    </div>
  );
}

/** Første gang øvelsen logges: ingen «sist»-verdier, ett sett å starte fra. */
export function ForsteGang() {
  return (
    <div style={boks}>
      <SettRepsLogger
        ovelse="Markløft"
        muskelgrupper={["Sete/hofte", "Rygg"]}
        del="Oppvarming"
        sist={[]}
        startSett={[{ vekt: 40, reps: 10 }]}
      />
    </div>
  );
}
