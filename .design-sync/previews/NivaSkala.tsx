import { NivaSkala } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };

/** Posisjon på en benchmark-skala: markør i handlingsfargen på dim-spor, stopp i mono under. Standard-stoppene er CS90–CS120. */
export function Standard() {
  return (
    <div style={boks}>
      <NivaSkala pct={62} />
    </div>
  );
}

/** Egne stopp: nivåstige slik TalentProfil bruker den. */
export function EgneStopp() {
  return (
    <div style={boks}>
      <NivaSkala pct={38} stops={["Klubb", "Region", "Nasjonal", "Landslag"]} />
    </div>
  );
}

/** Nær toppen — markøren holder seg innenfor sporet. */
export function NaerToppen() {
  return (
    <div style={boks}>
      <NivaSkala pct={96} stops={["HCP 10", "HCP 5", "HCP 0", "+3"]} />
    </div>
  );
}
