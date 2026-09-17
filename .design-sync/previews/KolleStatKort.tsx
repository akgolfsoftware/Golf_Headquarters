import { KolleStatKort } from "akgolf-hq-komponenter";

/* Radkort — står i en liste/kolonne i appen. */
const kolonne = { maxWidth: 440 };

/** Kanonisk bruk: 7-jern med snitt-carry, spredning, antall slag og sidesnitt. */
export function SyvJern() {
  return (
    <div style={kolonne}>
      <KolleStatKort kolle="7-jern" snitt={156} enhet="m" spredning={8} side="2 m høyre" slag={24} />
    </div>
  );
}

/** Driver: større tall og spredning. Ikonruten viser de tre første tegnene når navnet er lengre enn fire. */
export function Driver() {
  return (
    <div style={kolonne}>
      <KolleStatKort kolle="Driver" snitt={238} enhet="m" spredning={14} side="4 m høyre" slag={31} />
    </div>
  );
}

/** Wedge: kort navn vises helt i ikonruten. Tom `side` skjuler sidesnittet. */
export function Wedge() {
  return (
    <div style={kolonne}>
      <KolleStatKort kolle="56°" snitt={82} enhet="m" spredning={4} side="" slag={18} />
    </div>
  );
}

/** Klikkbare rader i en liste (`onClick` gir peker-markør): tre køller stablet med 8 px luft. */
export function Liste() {
  const aapne = () => {};
  return (
    <div style={{ ...kolonne, display: "grid", gap: 8 }}>
      <KolleStatKort kolle="Driver" snitt={238} enhet="m" spredning={14} side="4 m høyre" slag={31} onClick={aapne} />
      <KolleStatKort kolle="5-jern" snitt={178} enhet="m" spredning={10} side="1 m venstre" slag={20} onClick={aapne} />
      <KolleStatKort kolle="PW" snitt={118} enhet="m" spredning={5} side="1 m høyre" slag={26} onClick={aapne} />
    </div>
  );
}
