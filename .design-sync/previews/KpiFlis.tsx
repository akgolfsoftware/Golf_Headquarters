import { KpiFlis } from "akgolf-hq-komponenter";

const rekke = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, maxWidth: 560 };

/** Målt tall i en tett flis: etikett 9 px, verdi i IBM Plex Mono 24–28 px, delta ved siden av. */
export function Standard() {
  return (
    <div style={{ maxWidth: 200 }}>
      <KpiFlis label="SG totalt" value="+1,8" delta="+0,4" dir="up" />
    </div>
  );
}

/** Tre fliser på rad, slik de står øverst på Analyse. */
export function Rekke() {
  return (
    <div style={rekke}>
      <KpiFlis label="Snittscore" value="74,3" delta="−1,2" dir="down" instant />
      <KpiFlis label="Putt per runde" value="31,2" delta="−0,6" dir="down" instant />
      <KpiFlis label="GIR" value="58 %" delta="+4" dir="up" />
    </div>
  );
}

/** varsle: tonet flate for et tall som trenger blikk. sub gir kontekst. */
export function Varsle() {
  return (
    <div style={{ maxWidth: 240 }}>
      <KpiFlis label="Etterlevelse" value="62 %" varsle sub="5 av 8 økter fullført denne uka" />
    </div>
  );
}

/** Tom verdi gir tankestrek, aldri 0. instant viser absolutte tall uten opptelling. */
export function TomOgInstant() {
  return (
    <div style={{ ...rekke, gridTemplateColumns: "repeat(2, minmax(0, 1fr))", maxWidth: 400 }}>
      <KpiFlis label="Fysisk score" value="" sub="Ingen test registrert" />
      <KpiFlis label="Ledige timer" value={49} instant sub="49 av 119 timeluker" />
    </div>
  );
}
