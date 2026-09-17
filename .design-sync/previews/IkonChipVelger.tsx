import { IkonChipVelger } from "akgolf-hq-komponenter";

const STED = [
  { id: "range", navn: "Range", ikon: "target" },
  { id: "bane", navn: "Bane", ikon: "flag" },
  { id: "simulator", navn: "Simulator", ikon: "monitor" },
  { id: "fysisk", navn: "Fysisk", ikon: "dumbbell" },
];

/** Enkeltvalg: aktiv chip er fylt, resten dock-flate med ikon i mute. Kontrollert. */
export function Sted() {
  return <IkonChipVelger valg={STED} value="range" onChange={() => {}} />;
}

/** Samme sett, annet valg aktivt. */
export function AnnetValg() {
  return <IkonChipVelger valg={STED} value="fysisk" onChange={() => {}} />;
}

/** Kilde for TrackMan-import. */
export function Importkilde() {
  return (
    <IkonChipVelger
      valg={[
        { id: "csv", navn: "CSV-fil", ikon: "file-text" },
        { id: "html", navn: "HTML-rapport", ikon: "globe" },
        { id: "foto", navn: "Foto av skjerm", ikon: "camera" },
      ]}
      value="foto"
      onChange={() => {}}
    />
  );
}

/** Mange chips bryter til flere rader i smal kolonne. */
export function MangeValg() {
  return (
    <div style={{ maxWidth: 360 }}>
      <IkonChipVelger
        valg={[
          { id: "tee", navn: "Tee-slag", ikon: "crosshair" },
          { id: "innspill", navn: "Innspill", ikon: "activity" },
          { id: "naerspill", navn: "Nærspill", ikon: "sprout" },
          { id: "putting", navn: "Putting", ikon: "circle-dot" },
          { id: "fysisk", navn: "Fysisk", ikon: "dumbbell" },
          { id: "mental", navn: "Mental", ikon: "lightbulb" },
          { id: "turnering", navn: "Turnering", ikon: "trophy" },
        ]}
        value="putting"
        onChange={() => {}}
      />
    </div>
  );
}
