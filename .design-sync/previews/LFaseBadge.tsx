import { LFaseBadge } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 10, flexWrap: "wrap" as const, alignItems: "center" };

/** Historisk: L-fasene er utgått (erstattet av de tre motorikk-stegene). Vises kun for eldre data — full og kompakt. */
export function Historisk() {
  return (
    <div style={rad}>
      <LFaseBadge fase="L3" />
      <LFaseBadge fase="L3" kompakt />
    </div>
  );
}
