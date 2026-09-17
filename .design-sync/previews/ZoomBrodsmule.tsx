import { ZoomBrodsmule } from "akgolf-hq-komponenter";

/** Kompakt zoom-sti på mobil: År › måned › uke › dag. Siste ledd er der du står; de andre hopper ut. */
const boks = { width: 390, padding: "6px 8px", borderBottom: "1px solid var(--tl-hair)" };
/** LangSti har flere ledd enn 390 px rommer — vis den i sin fulle bredde i stedet for å klippe midt i et ledd. */
const bredBoks = { width: 620, padding: "6px 8px", borderBottom: "1px solid var(--tl-hair)" };

/** Dagsnivå: hele stien ned til onsdag i uke 38. */
export function Dagsnivaa() {
  return (
    <div style={boks}>
      <ZoomBrodsmule sti={["År", "September", "Uke 38", "Ons 16."]} onHopp={() => {}} />
    </div>
  );
}

/** Ukenivå. */
export function Ukenivaa() {
  return (
    <div style={boks}>
      <ZoomBrodsmule sti={["År", "September", "Uke 38"]} onHopp={() => {}} />
    </div>
  );
}

/** Årsnivå: ett ledd, ingenting å hoppe ut til. */
export function Aarsnivaa() {
  return (
    <div style={boks}>
      <ZoomBrodsmule sti={["År"]} onHopp={() => {}} />
    </div>
  );
}

/** Lang sti med periode og turneringsuke: på smalere flater ruller den vannrett, her vist i full bredde. */
export function LangSti() {
  return (
    <div style={bredBoks}>
      <ZoomBrodsmule sti={["2026", "Høst", "Turneringsperiode", "Uke 40", "Srixon Tour", "Lør 3."]} onHopp={() => {}} />
    </div>
  );
}
