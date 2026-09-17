import { NivaStige } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };

/** Spillerkategori A–K som stige: høyest øverst, «Nå» på dagens trinn, nådde trinn med hake. */
export function Spillerkategori() {
  return (
    <div style={boks}>
      <NivaStige
        trinn={["C · National U21", "D · Regional Elite", "E · Regional U18", "F · Klubbspiller senior", "G · Klubbspiller junior"]}
        naa="E · Regional U18"
        beskrivelser={{
          "E · Regional U18": "Snittscore 76,8 · siste 20 runder",
          "D · Regional Elite": "Krever snitt under 76",
        }}
      />
    </div>
  );
}

/** Aldersnivåer for referanseverdier: senior øverst, U16 nå. */
export function Aldersnivaa() {
  return (
    <div style={boks}>
      <NivaStige
        trinn={["Senior", "U18", "U16", "U14", "U12"]}
        naa="U16"
        beskrivelser={{ U16: "Referanseverdier for 2026", U18: "Fra 1. januar 2027" }}
      />
    </div>
  );
}
