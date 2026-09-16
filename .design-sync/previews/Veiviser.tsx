import { Veiviser } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };
const STEG = ["Spiller", "Mål", "Plan", "Bekreft"];

/** Første steg: Tilbake er skjult, Neste med pil. */
export function Start() {
  return (
    <div style={boks}>
      <Veiviser steg={STEG} aktiv={0} />
    </div>
  );
}

/** Midt i: fullførte steg får hake i fill, aktivt steg ring i fill. */
export function Midt() {
  return (
    <div style={boks}>
      <Veiviser steg={STEG} aktiv={2} />
    </div>
  );
}

/** Siste steg: knappen blir «Fullfør» med hake. */
export function Siste() {
  return (
    <div style={boks}>
      <Veiviser steg={STEG} aktiv={3} />
    </div>
  );
}

/** Onboarding med seks steg og egne knappetekster. */
export function Onboarding() {
  return (
    <div style={{ maxWidth: 640 }}>
      <Veiviser
        steg={["Konto", "Profil", "Klubb", "Samtykke", "Mål", "Ferdig"]}
        aktiv={3}
        nesteTekst="Gå videre"
        tilbakeTekst="Forrige"
        sisteTekst="Start PlayerHQ"
      />
    </div>
  );
}
