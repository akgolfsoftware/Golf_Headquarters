import { ProgressRing, Rad } from "akgolf-hq-komponenter";

/** showLabel: prosent i IBM Plex Mono 18 px i midten, label i 9 px versaler under. value/max regnes om. */
/** Ringen viser alltid prosent i midten (aldri rå value/max) — label under beskriver ANDELEN, ikke telleren. */
export function Standard() {
  return <ProgressRing value={4} max={6} size={96} showLabel label="gjennomført denne uka" />;
}

/** Fem varianter à 72 px — samme fargegrammatikk som ProgressBar. */
export function Varianter() {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <ProgressRing value={67} variant="primary" size={72} showLabel label="Plan" />
      <ProgressRing value={82} variant="accent" size={72} showLabel label="Putt" />
      <ProgressRing value={100} variant="success" size={72} showLabel label="Mål" />
      <ProgressRing value={35} variant="warning" size={72} showLabel label="Runder" />
      <ProgressRing value={92} variant="danger" size={72} showLabel label="Kø" />
    </div>
  );
}

/** size og strokeWidth skalerer ringen: 40/4 som radpynt, 80/6 standard, 128/10 som hero. */
export function Storrelser() {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <ProgressRing value={75} size={40} strokeWidth={4} />
      <ProgressRing value={75} size={80} />
      <ProgressRing value={75} size={128} strokeWidth={10} showLabel label="Fullført" />
    </div>
  );
}

/** Liten ring uten etikett som leading i en rad — sett gjennomført per øvelse i live-økta. */
export function IRad() {
  return (
    <div style={{ maxWidth: 480 }}>
      <Rad leading={<ProgressRing value={100} size={28} strokeWidth={3} variant="success" />} title="Wedge 80–120 m" sub="4 av 4 sett · 20 min" trailing={null} />
      <Rad leading={<ProgressRing value={50} size={28} strokeWidth={3} />} title="Putting 1–2 m" sub="2 av 4 sett · 15 min" trailing={null} naa />
      <Rad leading={<ProgressRing value={0} size={28} strokeWidth={3} />} title="Driver, Club Speed-serie" sub="0 av 3 sett · 15 min" trailing={null} last />
    </div>
  );
}
