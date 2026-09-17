import { ValgKort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

/** Valgt = fill-kant, dim-flate og fylt dot. */
export function Valgt() {
  return (
    <div style={boks}>
      <ValgKort
        tittel="Performance"
        tittelSuffix="1 200 kr/mnd"
        tag="Mest valgt"
        sub="Fire økter i måneden med coach, TrackMan i hver økt og ukeplan i Workbench."
        valgt
      />
    </div>
  );
}

export function IkkeValgt() {
  return (
    <div style={boks}>
      <ValgKort
        tittel="Performance Pro"
        tittelSuffix="2 220 kr/mnd"
        sub="Åtte økter i måneden, turneringsoppfølging og analyse etter hver runde."
      />
    </div>
  );
}

/** Varsel-tag i warn-tone. */
export function WarnTag() {
  return (
    <div style={boks}>
      <ValgKort
        tittel="Kartleggingsøkt"
        tittelSuffix="90 min"
        tag="2 plasser igjen"
        tagTone="warn"
        sub="Første økt med coach: tester, TrackMan-måling og skriftlig plan etterpå."
      />
    </div>
  );
}

/** Gruppe av kort som ett enkeltvalg — én valgt om gangen. */
export function Gruppe() {
  return (
    <div role="radiogroup" aria-label="Type økt" style={{ ...boks, display: "flex", flexDirection: "column", gap: 8 }}>
      <ValgKort tittel="Individuell økt" tittelSuffix="60 min" tag="Range" sub="Én spiller, én coach. TrackMan hele økten." valgt />
      <ValgKort tittel="Gruppeøkt" tittelSuffix="90 min" tag="Bane" sub="Tre til fem spillere. Spill med coach på hull 1–9." />
      <ValgKort tittel="Simulator" tittelSuffix="45 min" tag="Mulligan" sub="Innendørs på Mulligan Indoor Golf. Booking bekreftes av coach." />
    </div>
  );
}
