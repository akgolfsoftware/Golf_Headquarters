import { LaeringsTrapp } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

/* De tre motorikk-stegene (UTEN_BALL / LAV_HAST / AUTO) med anbefalt tempo som underlinje. */
const TRINN = [
  { l: "Uten ball", sub: "Grunnbevegelsen bygges", cs: "rolig, uten ball" },
  { l: "Lav hastighet", sub: "Ball i redusert tempo", cs: "50–80 % tempo" },
  { l: "Auto", sub: "Automatisk under press", cs: "full fart" },
];

/** Lav hastighet er aktivt trinn: fylt prikk, Uten ball ferdig med hake, Auto venter. */
export function Standard() {
  return (
    <div style={boks}>
      <LaeringsTrapp trinn={TRINN} aktiv={1} />
    </div>
  );
}

/** Helt i starten: bevegelsen bygges uten ball. */
export function UtenBall() {
  return (
    <div style={boks}>
      <LaeringsTrapp trinn={TRINN} aktiv={0} tittel="Læringstrapp — hoftedreining" />
    </div>
  );
}

/** Alle tre trinn fullført: tre haker og sluttsetningen. */
export function AlleFullfort() {
  return (
    <div style={boks}>
      <LaeringsTrapp trinn={TRINN} aktiv={3} tittel="Læringstrapp — takeaway" />
    </div>
  );
}
