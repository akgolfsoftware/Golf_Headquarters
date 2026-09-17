import { Popover } from "akgolf-hq-komponenter";

/**
 * Liten meny forankret under en ghost-utløser, rendret statisk åpen i egen demo-ramme (uten scrim).
 * Første rad er markert; `farge` brukes kun for destruktive handlinger.
 */

/** Kanonisk bruk: handlinger på en økt i ukeplanen. */
export function Handlinger() {
  return (
    <Popover
      trigger="Handlinger"
      items={[
        { i: "pencil", t: "Rediger økt" },
        { i: "copy", t: "Dupliser til uke 39" },
        { i: "trash-2", t: "Slett økt", farge: "var(--tl-danger)" },
      ]}
    />
  );
}

/** Spillermeny i stall-lista: fire nøytrale handlinger, ingen farge. */
export function Spillermeny() {
  return (
    <Popover
      h={300}
      trigger="Mer"
      items={[
        { i: "user", t: "Åpne spillerkortet" },
        { i: "message-circle", t: "Send melding" },
        { i: "calendar", t: "Book time" },
        { i: "file-text", t: "Eksporter runder" },
      ]}
    />
  );
}

/** To valg: sorteringsmeny over en liste. */
export function Sortering() {
  return (
    <Popover
      h={200}
      trigger="Sorter"
      items={[
        { i: "trending-up", t: "Høyest SG først" },
        { i: "clock", t: "Nyeste først" },
      ]}
    />
  );
}
