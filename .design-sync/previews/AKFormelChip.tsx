import { AKFormelChip } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 14 };

/** Øktens oppsett etter dagens formel: pyramide (akse) · område · belastning (miljø) · press. */
export function Standard() {
  return <AKFormelChip formel={{ akse: "SLAG", kategori: "APP", miljo: "Treningsområde", intensitet: "ALENE" }} />;
}

/** Tre oppsett: teknikk innendørs med coach som ser på, nærspill på bane, putting under turneringspress. */
export function Varianter() {
  return (
    <div style={kolonne}>
      <AKFormelChip formel={{ akse: "TEK", kategori: "APP", miljo: "Innendørs", intensitet: "OBSERVERT" }} />
      <AKFormelChip formel={{ akse: "SLAG", kategori: "ARG", miljo: "Bane", intensitet: "KONKURRANSE" }} />
      <AKFormelChip formel={{ akse: "TURN", kategori: "PUTT", miljo: "Konkurranse", intensitet: "TURNERING" }} />
    </div>
  );
}

/** Minimal: bare akse og område. */
export function Minimal() {
  return <AKFormelChip formel={{ akse: "SPILL", kategori: "OTT" }} />;
}

/** Historisk: lFase-feltet og visLFaseNavn viser en L-fase — utgått begrep, kun for eldre data. */
export function MedLFaseHistorisk() {
  return <AKFormelChip formel={{ akse: "TEK", kategori: "APP", miljo: "Innendørs", intensitet: "ALENE", lFase: "L3" }} visLFaseNavn />;
}
