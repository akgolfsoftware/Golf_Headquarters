import { MilepaelKort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 480 };

const KRAV_P4 = [
  { tittel: "Hoftedreining 45° før armene starter ned", status: "done" as const, spor: "FERDIG" as const, repsGjort: 300, repsMaal: 300, lFase: "Uten ball", cs: null, tmMaal: null },
  { tittel: "Venstre arm parallell med skulderlinjen i P4", status: "active" as const, spor: "PAA_VEI" as const, repsGjort: 240, repsMaal: 300, lFase: "Lav hastighet", cs: null, tmMaal: "Spredning 7-jern under 9,0 m" },
  { tittel: "Kølleblad square mot svingplan i P4", status: "pending" as const, spor: "INAKTIV" as const, repsGjort: 0, repsMaal: 200, lFase: null, cs: null, tmMaal: "Face Angle ±2° på 8 av 10 slag" },
];
const KRAV_P7 = [
  { tittel: "Hendene foran ballen i impact", status: "active" as const, spor: "STAGNERER" as const, repsGjort: 90, repsMaal: 300, lFase: "Lav hastighet", cs: null, tmMaal: "Attack Angle −4° med 7-jern" },
  { tittel: "Trykk mot venstre fot ved impact", status: "pending" as const, spor: "INAKTIV" as const, repsGjort: 0, repsMaal: 200, lFase: null, cs: null, tmMaal: null },
];
const KRAV_P2 = [
  { tittel: "Kølle parallell med målinjen i takeaway", status: "done" as const, spor: "FERDIG" as const, repsGjort: 200, repsMaal: 200, lFase: "Auto", cs: null, tmMaal: null },
  { tittel: "Bladet peker mot ballen, ikke mot himmelen", status: "done" as const, spor: "FERDIG" as const, repsGjort: 200, repsMaal: 200, lFase: "Auto", cs: null, tmMaal: "Face Angle ±2° på 8 av 10 slag", tmNaadd: true },
];

/** Hovedfokus: fyll-stripe til venstre, pille, kravliste med 1/3 ferdig og godkjent-linje fra coach. */
export function Hovedfokus() {
  return (
    <div style={boks}>
      <MilepaelKort p="P4" hovedfokus krav={KRAV_P4} godkjentAv="Anders Kristiansen" godkjentDato="12. september 2026" />
    </div>
  );
}

/** Ikke hovedfokus og ennå ikke godkjent: dempet P, ingen stripe, ingen godkjent-linje. */
export function IkkeGodkjent() {
  return (
    <div style={boks}>
      <MilepaelKort p="P7" hovedfokus={false} krav={KRAV_P7} godkjentAv={null} />
    </div>
  );
}

/** Ferdig milepæl: alle krav gjennomstreket, 2/2, godkjent tidligere i sommer. */
export function Ferdig() {
  return (
    <div style={boks}>
      <MilepaelKort p="P2" hovedfokus={false} krav={KRAV_P2} godkjentAv="Anders Kristiansen" godkjentDato="6. juli 2026" />
    </div>
  );
}
