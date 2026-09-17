import { KategoriStige } from "akgolf-hq-komponenter";

/* Listekort — i appen står det i en kolonne, ikke over hele skjermen. */
const kolonne = { maxWidth: 520 };

/* Øverst = best. Kravene er eksempler, ikke målte terskler. */
const TRINN = [
  { kat: "A", krav: "Snittscore ≤ 72 · SG ≥ +1,5" },
  { kat: "B", krav: "Snittscore ≤ 74 · SG ≥ +0,5" },
  { kat: "C", krav: "Snittscore ≤ 76 · SG ≥ −0,5" },
  { kat: "D", krav: "Snittscore ≤ 79" },
  { kat: "E", krav: "Snittscore ≤ 82" },
];

/** Kanonisk bruk: fem trinn A–E, spilleren i C. Trinn under er nådd (hake), trinn over gjenstår. */
export function Standard() {
  return (
    <div style={kolonne}>
      <KategoriStige trinn={TRINN} naa="C" />
    </div>
  );
}

/** Nederst på stigen: alt over gjenstår. */
export function Nederst() {
  return (
    <div style={kolonne}>
      <KategoriStige trinn={TRINN} naa="E" />
    </div>
  );
}

/** Øverst: alle trinn under er nådd. */
export function Overst() {
  return (
    <div style={kolonne}>
      <KategoriStige trinn={TRINN} naa="A" />
    </div>
  );
}

/** Egne trinn og krav for en juniorgruppe — fire trinn, spilleren i B. */
export function EgneKrav() {
  return (
    <div style={kolonne}>
      <KategoriStige
        naa="B"
        trinn={[
          { kat: "A", krav: "Hcp ≤ 4,4 · tre turneringer på Srixon Tour" },
          { kat: "B", krav: "Hcp ≤ 9,0 · to turneringer på Olyo Tour" },
          { kat: "C", krav: "Hcp ≤ 15,0 · klubbturnering fullført" },
          { kat: "D", krav: "Grønt kort · 10 registrerte runder" },
        ]}
      />
    </div>
  );
}
