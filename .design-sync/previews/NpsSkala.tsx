import { NpsSkala } from "akgolf-hq-komponenter";

const boks = { maxWidth: 560 };
const sporsmal = { margin: "0 0 12px", fontFamily: "var(--tl-font-sans)", fontSize: 14, fontWeight: 600, color: "var(--tl-text)" };

/** Kontrollert 0–10-skala. Segmentet farger valgt knapp og merket: 0–6 kritiker (danger). */
export function Kritiker() {
  return (
    <div style={boks}>
      <NpsSkala value={4} onChange={() => {}} />
    </div>
  );
}

/** 7–8 passiv (warn). */
export function Passiv() {
  return (
    <div style={boks}>
      <NpsSkala value={8} onChange={() => {}} />
    </div>
  );
}

/** 9–10 ambassadør (fill). */
export function Ambassador() {
  return (
    <div style={boks}>
      <NpsSkala value={10} onChange={() => {}} />
    </div>
  );
}

/** Slik spørsmålet stilles etter en kartleggingsøkt. */
export function MedSporsmal() {
  return (
    <div style={boks}>
      <p style={sporsmal}>Hvor sannsynlig er det at du anbefaler AK Golf Academy til en golfvenn?</p>
      <NpsSkala value={9} onChange={() => {}} />
    </div>
  );
}
