import { VelvaereKort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 420 };

/** Morgensjekk 1–5: fargede prikker per rad, tall i mono, merknad som innsikt-chip. */
export function Standard() {
  return (
    <div style={boks}>
      <VelvaereKort verdier={{ sovn: 4, energi: 3, motivasjon: 5 }} dato="I dag, 07:05" merknad="Litt tung i beina etter gårsdagens FYS-økt." />
    </div>
  );
}

/** Lav dag: røde prikker på 2, gul på 3. Merknaden bærer coachens justering. */
export function LavDag() {
  return (
    <div style={boks}>
      <VelvaereKort
        verdier={{ sovn: 2, energi: 2, motivasjon: 3 }}
        dato="Tirsdag, 07:40"
        merknad="Sov dårlig før prøven. Coach: kort teknikkøkt i dag, ingen tunge løft."
      />
    </div>
  );
}

/** Ufullstendig: bare søvn er fylt ut — tomt er tomt, aldri 0. */
export function Ufullstendig() {
  return (
    <div style={boks}>
      <VelvaereKort verdier={{ sovn: 4, energi: null, motivasjon: null }} dato="I dag, 06:50" merknad={null} />
    </div>
  );
}
