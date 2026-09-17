import { Kort, PercentilBar } from "akgolf-hq-komponenter";

/** Coachens verktøy: plassering i stallen med stall-snittet som tick. Vises aldri til spiller eller forelder. */
export function Standard() {
  return <PercentilBar percentile={78} benchmark={54} label="SG Total i stallen" valueLabel="78." />;
}

/** Under snittet: samme geometri, fotnoten viser minus. */
export function UnderSnitt() {
  return <PercentilBar percentile={31} benchmark={54} label="Innslag 3–6 ft i stallen" valueLabel="31." />;
}

/** Uten stall-snitt: ingen tick og ingen fotnote — bare kvartilstrekene. */
export function UtenSnitt() {
  return <PercentilBar percentile={62} benchmark={null} label="Driver-carry i stallen" valueLabel="62." />;
}

/** Tre metrikker i samme kort, slik spillerkortet i Stall viser dem. */
export function IKort() {
  return (
    <Kort eyebrow="Plassering i stallen" action={<span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" }}>18 spillere · 30 dager</span>}>
      <div style={{ display: "grid", gap: 20 }}>
        <PercentilBar percentile={78} benchmark={54} label="SG Total" valueLabel="78." />
        <PercentilBar percentile={88} benchmark={51} label="Driver-carry · 248 m" valueLabel="88." />
        <PercentilBar percentile={31} benchmark={54} label="Innslag 3–6 ft · 84 %" valueLabel="31." />
      </div>
    </Kort>
  );
}
