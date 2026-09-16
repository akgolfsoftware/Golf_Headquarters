import { Skjelett } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

/** Standard: etikett, stort tall og tre linjer — plassholder for et KPI-kort mens tallene hentes. */
export function MedTall() {
  return (
    <div style={boks}>
      <Skjelett />
    </div>
  );
}

/** Uten tall: bare tekstlinjer, som en liste eller et notat under lasting. */
export function BareLinjer() {
  return (
    <div style={boks}>
      <Skjelett tall={false} linjer={4} />
    </div>
  );
}

/** To fliser side om side, slik KPI-raden på «I dag» ser ut før tallene er inne. */
export function KpiRad() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 440 }}>
      <Skjelett linjer={1} />
      <Skjelett linjer={1} />
    </div>
  );
}
