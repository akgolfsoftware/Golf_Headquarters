import { Kort, ProgresjonsBar } from "akgolf-hq-komponenter";

const stakk = { display: "grid", gap: 16 };

/** Standardvarianten: prosent av et mål, label og verdi i mono. Rød kun når tallet krever oppmerksomhet. */
export function Bar() {
  return (
    <div style={stakk}>
      <ProgresjonsBar variant="bar" value={64} max={100} label="Ukesvolum · 9,6 av 15 t" />
      <ProgresjonsBar variant="bar" value={11} max={12} label="Planetterlevelse · 11 av 12 økter" />
      <ProgresjonsBar variant="bar" value={1200} max={4000} label="Sesongmål · 1 200 av 4 000 slag" color="var(--tl-danger)" />
      <ProgresjonsBar variant="bar" value={38} max={60} label="Uten tall" showValue={false} />
    </div>
  );
}

/** Segmenter når enhetene kan telles: økter, tester, uker. */
export function Segment() {
  return (
    <div style={stakk}>
      <ProgresjonsBar variant="segment" total={6} filled={4} label="økter denne uka" />
      <ProgresjonsBar variant="segment" total={5} filled={5} label="tester bestått" color="var(--tl-ok)" />
      <ProgresjonsBar variant="segment" total={12} filled={7} showValue={false} />
    </div>
  );
}

/** Streak: prikk per dag, flamme på dagens. Uten flamme når rekka er brutt. */
export function Streak() {
  return (
    <div style={stakk}>
      <ProgresjonsBar variant="streak" total={7} active={5} label="5 dager på rad" />
      <ProgresjonsBar variant="streak" total={7} active={7} label="Hele uka" color="var(--tl-ok)" />
      <ProgresjonsBar variant="streak" total={7} active={3} flame={false} label="3 av 7 · brutt torsdag" />
    </div>
  );
}

/** De tre variantene i samme kort, slik «I dag» viser uka. */
export function IKort() {
  return (
    <Kort eyebrow="Uke 38" action={<span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" }}>man 14.09 – søn 20.09</span>}>
      <div style={{ ...stakk, gap: 18 }}>
        <ProgresjonsBar variant="bar" value={9.6} max={15} label="Volum · 9,6 av 15 t" />
        <ProgresjonsBar variant="segment" total={6} filled={4} label="økter gjennomført" />
        <ProgresjonsBar variant="streak" total={7} active={4} label="4 dager på rad" />
      </div>
    </Kort>
  );
}
