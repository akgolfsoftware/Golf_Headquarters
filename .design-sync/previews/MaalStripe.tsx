import { MaalStripe } from "akgolf-hq-komponenter";

/** Mål-sporet på mobil: resultatmål med nedtelling og prosessmål som ringer. Trykk veksler åpen/chip. */
const boks = { maxWidth: 440 };
const prosess = [
  { l: "Putt < 3 m", pct: 72 },
  { l: "Nærspill-økter", pct: 55 },
  { l: "FYS-volum", pct: 88 },
];

/** Åpen: Srixon Tour om 17 dager, tre prosessmål. */
export function Apen() {
  return (
    <div style={boks}>
      <MaalStripe resultatmal="Srixon Tour — topp 10" dagerIgjen={17} prosessmal={prosess} startApen />
    </div>
  );
}

/** Kollapset til chip (`startApen={false}`): mål og dager igjen på én linje. */
export function Kollapset() {
  return (
    <div style={boks}>
      <MaalStripe resultatmal="Srixon Tour — topp 10" dagerIgjen={17} prosessmal={prosess} startApen={false} />
    </div>
  );
}

/** Lengre horisont og to prosessmål. */
export function LangHorisont() {
  return (
    <div style={boks}>
      <MaalStripe
        resultatmal="Uttak Team Norway U18"
        dagerIgjen={74}
        prosessmal={[
          { l: "Baller slått per uke", pct: 64 },
          { l: "Banespill-økter", pct: 40 },
        ]}
        startApen
      />
    </div>
  );
}
