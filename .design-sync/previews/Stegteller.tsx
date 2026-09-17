import { Stegteller } from "akgolf-hq-komponenter";

/** Tall i IBM Plex Mono 22 px, enhet i mute, ±-knapper på dim-flate. */
export function Standard() {
  return <Stegteller label="Repetisjoner" defaultValue={30} step={5} enhet="reps" />;
}

/** Slag per øvelse, kontrollert med statisk verdi. */
export function Slag() {
  return <Stegteller label="Antall slag" value={60} onChange={() => {}} step={10} min={10} max={200} enhet="slag" />;
}

export function Varighet() {
  return <Stegteller label="Varighet" defaultValue={45} step={15} min={15} max={180} enhet="min" />;
}

/** Dosering av en styrkeøvelse — tre tellere side om side. */
export function Dosering() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <Stegteller label="Sett" defaultValue={3} step={1} min={1} max={8} enhet="sett" />
      <Stegteller label="Reps" defaultValue={12} step={1} min={1} max={30} enhet="reps" />
      <Stegteller label="Pause" defaultValue={90} step={15} min={0} max={300} enhet="s" />
    </div>
  );
}
