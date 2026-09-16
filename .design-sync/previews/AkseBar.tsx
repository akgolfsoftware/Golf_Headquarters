import { AkseBar } from "akgolf-hq-komponenter";

const boks = { maxWidth: 480 };

/** Faktisk (fyll) mot mål (strek) per akse, timer denne uka. */
export function UkeMotMaal() {
  return (
    <div style={boks}>
      <AkseBar a="TEK" v={9} m={8} max={12} />
      <AkseBar a="SLAG" v={6} m={8} max={12} />
      <AkseBar a="SPILL" v={3} m={6} max={12} />
      <AkseBar a="FYS" v={4} m={6} max={12} />
      <AkseBar a="TURN" v={0} m={2} max={12} last />
    </div>
  );
}

/** Prosentandel mot målfordeling (max 40, enhet %), slik hjelpeartikkelen om ukefordeling bruker den. */
export function Prosent() {
  return (
    <div style={boks}>
      <AkseBar a="TEK" v={38} m={35} max={40} enhet="%" />
      <AkseBar a="SLAG" v={27} m={30} max={40} enhet="%" />
      <AkseBar a="SPILL" v={20} m={20} max={40} enhet="%" />
      <AkseBar a="FYS" v={15} m={15} max={40} enhet="%" last />
    </div>
  );
}
