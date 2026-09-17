import { Kort, PulsSoneVelger } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };
const kilde = { fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" };

/** S3 valgt: tonet bånd, kryss til høyre. Fem bånd à 44 px, pulsgrenser i mono. */
export function Standard() {
  return (
    <div style={boks}>
      <PulsSoneVelger valgt="S3" />
    </div>
  );
}

/** Maks-sonen valgt — rødt bånd, men aldri lime: soner er data, ikke aksent. */
export function Maks() {
  return (
    <div style={boks}>
      <PulsSoneVelger valgt="S5" />
    </div>
  );
}

/** I økt-redigeringen: valget styrer sonen på intervallblokken over. */
export function IKort() {
  return (
    <div style={boks}>
      <Kort eyebrow="Målsone" action={<span style={kilde}>4 × 4 min</span>}>
        <PulsSoneVelger valgt="S4" />
        <span style={{ fontFamily: "var(--tl-font-sans)", fontSize: 11.5, color: "var(--tl-mute)", display: "block", marginTop: 12 }}>
          Pulsgrensene er veiledende. Mål makspulsen din i en test før du stoler på dem.
        </span>
      </Kort>
    </div>
  );
}
