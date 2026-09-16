import { VisningsVelger } from "akgolf-hq-komponenter";

const boks = { maxWidth: 620 };

/** Kalenderhodet i ukevisning: faner, periode, «I dag» og pilene. */
export function Uke() {
  return (
    <div style={boks}>
      <VisningsVelger visning="uke" periode="Uke 38 · september 2026" onVisning={() => {}} onForrige={() => {}} onNeste={() => {}} onIdag={() => {}} />
    </div>
  );
}

/** Dagvisning med dagens dato som periode. */
export function Dag() {
  return (
    <div style={boks}>
      <VisningsVelger visning="dag" periode="Onsdag 16. september" onVisning={() => {}} onForrige={() => {}} onNeste={() => {}} onIdag={() => {}} />
    </div>
  );
}

/** Alle seks visningene coachens kalender kan tilby, agenda aktiv. */
export function AlleVisninger() {
  return (
    <div style={{ maxWidth: 720 }}>
      <VisningsVelger visning="agenda" visninger={["dag", "agenda", "uke", "maned", "tidslinje", "aar"]} periode="Uke 38" onVisning={() => {}} onForrige={() => {}} onNeste={() => {}} onIdag={() => {}} />
    </div>
  );
}

/** Uten onIdag: «I dag»-knappen vises ikke (null slår den av). Månedsvisning. */
export function UtenIdagKnapp() {
  return (
    <div style={boks}>
      <VisningsVelger visning="maned" periode="September 2026" onVisning={() => {}} onForrige={() => {}} onNeste={() => {}} />
    </div>
  );
}
