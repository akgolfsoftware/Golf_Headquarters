import { Stegviser } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };
const STEG = ["Profil", "Målsetting", "Baseline-test", "Plan"];

/** Første steg aktivt: ring i fill, resten i mute — ingen linje er grønnet ennå. */
export function ForsteSteg() {
  return (
    <div style={boks}>
      <Stegviser steg={STEG} aktiv={1} />
    </div>
  );
}

/** Underveis: fullførte steg får hake på fylt sirkel, linjen fram til aktivt steg følger fill. */
export function Underveis() {
  return (
    <div style={boks}>
      <Stegviser steg={STEG} aktiv={3} />
    </div>
  );
}

/** Onboarding på Mac: seks steg med lengre etiketter i 640 px, fjerde steg aktivt. */
export function Onboarding() {
  return (
    <div style={{ maxWidth: 640 }}>
      <Stegviser steg={["Konto", "Profil", "Klubb og tee", "Samtykke", "Målsetting", "Ferdig"]} aktiv={4} />
    </div>
  );
}

/** Alt fullført: aktiv utenfor lista gir hake på alle steg og hel linje. */
export function AlleFullfort() {
  return (
    <div style={boks}>
      <Stegviser steg={STEG} aktiv={5} />
    </div>
  );
}
