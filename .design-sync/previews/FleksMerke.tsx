import { FleksMerke } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "center" };

/** Fleksibel (åpen hengelås, blå) mot fast tid (lukket hengelås, grå). */
export function Varianter() {
  return (
    <div style={rad}>
      <FleksMerke fleks />
      <FleksMerke fleks={false} />
    </div>
  );
}

/** Egen tekst: klarspråk om hva som kan flyttes, og hvorfor ikke. */
export function EgenTekst() {
  return (
    <div style={rad}>
      <FleksMerke fleks tekst="Flyttbar innen uka" />
      <FleksMerke fleks={false} tekst="Gruppetid man 08:00" />
    </div>
  );
}
