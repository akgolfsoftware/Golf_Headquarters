import { DataForhaandsvisning } from "akgolf-hq-komponenter";

/** Hover-verdi på SG-trenden: dato i Caps, verdi i mono, enhet i mute — boksen står over hover-punktet. */
export function SG() {
  return <DataForhaandsvisning dato="14. sep" verdi="+1,8" enhet="SG" />;
}

/** TrackMan-parameter: Carry i meter. */
export function Carry() {
  return <DataForhaandsvisning dato="12. sep" verdi="212" enhet="m" />;
}

/** Høyere graf (h=160) for putt-trenden. */
export function Putt() {
  return <DataForhaandsvisning dato="7. sep" verdi="31,2" enhet="putt" h={160} />;
}
