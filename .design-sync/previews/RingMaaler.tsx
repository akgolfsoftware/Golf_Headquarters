import { Kort, RingMaaler } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 28, flexWrap: "wrap" as const, alignItems: "flex-start" };
const meta = { fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" };

const ACWR_SONER = [
  { from: 0.5, to: 0.8, color: "var(--tl-warn)", label: "Lav belastning" },
  { from: 0.8, to: 1.3, color: "var(--tl-ok)", label: "Trygg 0,8–1,3" },
  { from: 1.3, to: 2.01, color: "var(--tl-danger)", label: "Risiko over 1,3" },
];

/** Én avgrenset metrikk: planetterlevelse denne uka. Tallet i mono, enheten i halv størrelse. */
export function Standard() {
  return <RingMaaler label="Gjennomført" value={78} unit="%" />;
}

/** Soner farger buen etter hvor verdien lander. ACWR 1,46 er i risikosonen, 1,05 er trygg. Sonelabelen står under ringen og må holde én linje (ringens bredde). */
export function MedSoner() {
  return (
    <div style={{ ...rad, paddingBottom: 24 }}>
      <RingMaaler label="ACWR" value={1.46} min={0.5} max={2} unit="" decimals={2} zones={ACWR_SONER} />
      <RingMaaler label="ACWR" value={1.05} min={0.5} max={2} unit="" decimals={2} zones={ACWR_SONER} />
    </div>
  );
}

/** Størrelse og tykkelse: under 100 px krymper tallet til 18 px. */
export function Storrelser() {
  return (
    <div style={rad}>
      <RingMaaler label="Søvn" value={7.4} min={0} max={9} unit="t" decimals={1} size={84} thickness={7} />
      <RingMaaler label="Ukesvolum" value={12.5} min={0} max={16} unit="t" decimals={1} size={120} />
      <RingMaaler label="Innslag 3–6 ft" value={84} unit="%" size={160} thickness={12} />
    </div>
  );
}

/** Slik den står i et kort: to ringer med hver sin forklaring. */
export function IKort() {
  return (
    <Kort eyebrow="Denne uka" action={<span style={meta}>uke 38 · oppdatert i dag</span>}>
      <div style={{ ...rad, gap: 36 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <RingMaaler label="Økter" value={5} min={0} max={6} unit="" size={104} />
          <span style={{ fontFamily: "var(--tl-font-sans)", fontSize: 11.5, color: "var(--tl-mute)" }}>5 av 6 planlagte</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <RingMaaler label="Slag" value={1240} min={0} max={1500} unit="" size={104} color="var(--tl-text)" />
          <span style={{ fontFamily: "var(--tl-font-sans)", fontSize: 11.5, color: "var(--tl-mute)" }}>1 240 av 1 500 i planen</span>
        </div>
      </div>
    </Kort>
  );
}
