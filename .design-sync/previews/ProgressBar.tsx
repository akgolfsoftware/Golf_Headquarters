import { ProgressBar } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };
const kort = { ...boks, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 16, padding: 20 };
const eyebrow = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "hsl(var(--muted-foreground))",
};
const kilde = { fontFamily: "var(--font-mono)", fontSize: 9, color: "hsl(var(--muted-foreground))" };

/** showLabel: etikett i mono-versaler til venstre, prosent i mono til høyre. value/max regnes om til prosent. */
export function Standard() {
  return (
    <div style={boks}>
      <ProgressBar value={4} max={6} showLabel label="Økter gjennomført · uke 38" />
    </div>
  );
}

/** Fem varianter, én farge per betydning: primary (plan), accent (mengde), success/warning/danger (status). */
export function Varianter() {
  return (
    <div style={{ ...boks, display: "flex", flexDirection: "column", gap: 14 }}>
      <ProgressBar value={67} variant="primary" showLabel label="Plan gjennomført" />
      <ProgressBar value={82} variant="accent" showLabel label="Treff 1–2 m putt" />
      <ProgressBar value={100} variant="success" showLabel label="Ukesmål nådd" />
      <ProgressBar value={35} variant="warning" showLabel label="Runder registrert" />
      <ProgressBar value={92} variant="danger" showLabel label="Kø-kapasitet" />
    </div>
  );
}

/** sm 4 px · md 6 px (standard) · lg 8 px, uten etikett. */
export function Storrelser() {
  return (
    <div style={{ ...boks, display: "flex", flexDirection: "column", gap: 16 }}>
      <ProgressBar value={62} size="sm" />
      <ProgressBar value={62} size="md" />
      <ProgressBar value={62} size="lg" />
    </div>
  );
}

/** Kantverdier: tomt spor ved 0 og fullt ved 100. Verdier utenfor 0–100 klippes. */
export function TomOgFull() {
  return (
    <div style={{ ...boks, display: "flex", flexDirection: "column", gap: 14 }}>
      <ProgressBar value={0} showLabel label="Ingen økter ennå" />
      <ProgressBar value={100} variant="success" showLabel label="Testuke fullført" />
    </div>
  );
}

/** I et hvitt kort med kilde · dato — etterlevelsen slik den står på spillerkortet i Stall. */
export function IKort() {
  return (
    <div style={kort}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={eyebrow}>Etterlevelse</span>
        <span style={kilde}>Workbench · 16.09.2026</span>
      </div>
      <ProgressBar value={5} max={8} showLabel label="5 av 8 økter" />
    </div>
  );
}
