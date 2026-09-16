import { Tittel } from "akgolf-hq-komponenter";

/** Skjermtittel: Poppins 32/600, sporing −0,01 em. */
export function Standard() {
  return <Tittel>God morgen, Øyvind</Tittel>;
}

/** em = kursiv aksent i handlingsfargen, alltid som avsluttende ord — slik AgencyOS-skjermene bruker den. */
export function MedAksent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Tittel em="plan.">Teknisk</Tittel>
      <Tittel em="uke 38.">Uka ·</Tittel>
    </div>
  );
}

/** mobile: 27 px på 390 px-flaten. */
export function Mobil() {
  return (
    <div style={{ width: 358 }}>
      <Tittel mobile em="å gjøre.">3 ting</Tittel>
    </div>
  );
}
