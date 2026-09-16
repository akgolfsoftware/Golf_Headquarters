import { DiffKort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };

/** Før → etter i mono, grønn delta når det gikk riktig vei. */
export function Bedre() {
  return (
    <div style={boks}>
      <DiffKort label="Carry-spredning 7-jern" foer="11,2" etter="8,4" enhet="m" delta="−2,8 m" god periode="siste 30 dager" />
    </div>
  );
}

/** Verre: rød delta. */
export function Verre() {
  return (
    <div style={boks}>
      <DiffKort label="Putt per runde" foer="30,1" etter="31,6" enhet="putt" delta="+1,5" god={false} periode="siste 5 runder mot de 5 før" />
    </div>
  );
}

/** Første måling: ingen før-verdi og ingen delta — tankestrek, aldri 0. */
export function UtenFoer() {
  return (
    <div style={boks}>
      <DiffKort label="Attack Angle driver" foer={null} etter="+2,1" enhet="°" delta={null} periode="første måling 12. september" />
    </div>
  );
}
