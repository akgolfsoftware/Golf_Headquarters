import { Gapping } from "akgolf-hq-komponenter";

const BAG = [
  { navn: "Driver", carry: 248, spredning: 14 },
  { navn: "3-tre", carry: 224, spredning: 12 },
  { navn: "5-jern", carry: 178, spredning: 9 },
  { navn: "7-jern", carry: 156, spredning: 8 },
  { navn: "9-jern", carry: 128, spredning: 7 },
  { navn: "PW", carry: 112, spredning: 6 },
];

/** Carry per kølle i meter, ±spredning som lysere felt i enden, gap-varsel under. */
export function Standard() {
  return <Gapping koller={BAG} varsler={["Gap 3-tre → 5-jern er 46 m — vurder hybrid."]} />;
}

/** Full bag med jevne gap: ingen varsler. */
export function FullBag() {
  return (
    <Gapping
      koller={[
        { navn: "Driver", carry: 248, spredning: 14 },
        { navn: "3-tre", carry: 224, spredning: 12 },
        { navn: "Hybrid", carry: 205, spredning: 11 },
        { navn: "4-jern", carry: 190, spredning: 10 },
        { navn: "5-jern", carry: 178, spredning: 9 },
        { navn: "6-jern", carry: 167, spredning: 8 },
        { navn: "7-jern", carry: 156, spredning: 8 },
        { navn: "8-jern", carry: 142, spredning: 7 },
        { navn: "9-jern", carry: 128, spredning: 7 },
        { navn: "PW", carry: 112, spredning: 6 },
        { navn: "GW", carry: 98, spredning: 5 },
        { navn: "SW", carry: 82, spredning: 5 },
      ]}
      varsler={[]}
    />
  );
}

/** To varsler — ett som streng, ett som objekt. */
export function FlereVarsler() {
  return (
    <Gapping
      koller={[
        { navn: "Driver", carry: 248, spredning: 14 },
        { navn: "3-tre", carry: 224, spredning: 12 },
        { navn: "5-jern", carry: 178, spredning: 9 },
        { navn: "7-jern", carry: 156, spredning: 8 },
        { navn: "8-jern", carry: 150, spredning: 8 },
        { navn: "9-jern", carry: 128, spredning: 7 },
        { navn: "PW", carry: 112, spredning: 6 },
      ]}
      varsler={[
        "Gap 3-tre → 5-jern er 46 m — vurder hybrid.",
        { tekst: "7-jern og 8-jern overlapper (6 m) — sjekk loft, eller bytt 8-jern mot en gap wedge." },
      ]}
    />
  );
}

/** Uten spredning: kun carry-stolpen — én TrackMan-økt gir for få slag til å måle spredning. */
export function UtenSpredning() {
  return (
    <Gapping
      koller={[
        { navn: "Driver", carry: 241 },
        { navn: "5-jern", carry: 174 },
        { navn: "7-jern", carry: 153 },
        { navn: "PW", carry: 109 },
      ]}
      varsler={[]}
    />
  );
}
