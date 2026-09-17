import { Kort, Rad, TemaVeksler } from "akgolf-hq-komponenter";

/** Mørk valgt (standard i AgencyOS): månen i fylt sirkel, sola i mute. */
export function Moerk() {
  return <TemaVeksler value="moerk" />;
}

/** Lys valgt. */
export function Lys() {
  return <TemaVeksler value="lys" />;
}

/** I innstillinger: veksleren som trailing i en Rad under «Meg». */
export function IInnstillinger() {
  return (
    <div style={{ maxWidth: 440 }}>
      <Kort eyebrow="Utseende">
        <Rad title="Tema" sub="Lys eller mørk — følger valget ditt på alle enheter" trailing={<TemaVeksler value="lys" />} last />
      </Kort>
    </div>
  );
}
