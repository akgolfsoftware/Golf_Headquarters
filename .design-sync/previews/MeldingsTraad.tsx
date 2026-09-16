import { MeldingsTraad } from "akgolf-hq-komponenter";

const boks = { maxWidth: 480 };

/** Coach til venstre med avsendernavn, spilleren til høyre. Tid under hver boble. */
export function Samtale() {
  return (
    <div style={boks}>
      <MeldingsTraad
        meldinger={[
          { meg: false, fra: "Anders Kristiansen", tekst: "Så på TrackMan-økten din — Carry-spredningen på 7-jern er nede i 8,4 m. Sterkt.", tid: "09:12" },
          { meg: true, tekst: "Takk! Kjente at P4-følelsen satt mye bedre i dag.", tid: "09:15" },
          { meg: false, fra: "Anders Kristiansen", tekst: "Enig. Vi holder lav hastighet ut uken, så går vi opp i fart på mandag.", tid: "09:16" },
          { meg: true, tekst: "Høres bra ut. Kan jeg legge inn 30 min putting torsdag før styrke?", tid: "09:20" },
        ]}
      />
    </div>
  );
}

/** Tom tråd: tom tilstand med én vei videre. */
export function Tom() {
  return (
    <div style={boks}>
      <MeldingsTraad meldinger={[]} />
    </div>
  );
}
