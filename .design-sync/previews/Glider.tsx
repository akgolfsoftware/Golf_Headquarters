import { Glider } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };

/** Verdien står i IBM Plex Mono øverst til høyre; fyllet er fill-farge. */
export function Standard() {
  return (
    <div style={boks}>
      <Glider label="Innsats (RPE)" min={1} max={10} defaultValue={7} />
    </div>
  );
}

export function MedEnhet() {
  return (
    <div style={boks}>
      <Glider label="Rangelengde" min={100} max={350} step={10} defaultValue={260} enhet="m" />
    </div>
  );
}

/** Egen formatering av verdien. Kontrollert med statisk verdi. */
export function Formatert() {
  return (
    <div style={boks}>
      <Glider label="Andel fokusøkter" min={0} max={100} step={5} value={40} onChange={() => {}} fmt={(v) => `${v} %`} />
    </div>
  );
}

/** Ved minimum: tomt fyll, knott helt til venstre. */
export function VedMinimum() {
  return (
    <div style={boks}>
      <Glider label="Smerte i ryggen" min={0} max={10} defaultValue={0} />
    </div>
  );
}
