import { Icon, KPICard } from "akgolf-hq-komponenter";

const boks = { maxWidth: 300 };

/** Eyebrow i mono-versaler, verdi i IBM Plex Mono 30 px, delta med pil (opp = grønn) og kilde · dato som fotnote. */
export function Standard() {
  return (
    <div style={boks}>
      <KPICard eyebrow="SG totalt" value="+1,8" delta={{ value: "+0,4", direction: "up" }} footnote="GolfBox · 14.09.2026" />
    </div>
  );
}

/** icon legges øverst til høyre i mute. Ned-pil er rød: bruk den der lavere faktisk er dårligere. */
export function MedIkon() {
  return (
    <div style={boks}>
      <KPICard
        eyebrow="Treff 1–2 m putt"
        value="82 %"
        delta={{ value: "−4", direction: "down" }}
        footnote="Siste 5 økter"
        icon={<Icon name="target" size={18} />}
      />
    </div>
  );
}

/** variant="hero": fylt primærflate for dagens ene tall øverst i AgencyOS. */
export function Hero() {
  return (
    <div style={boks}>
      <KPICard
        variant="hero"
        eyebrow="Økter i dag"
        value="6"
        footnote="3 WANG · 3 privattimer"
        icon={<Icon name="calendar" size={18} />}
      />
    </div>
  );
}

/** De fem variantene som cockpit-tall i AgencyOS: hero, default, muted, warn, danger. */
export function Varianter() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, maxWidth: 620 }}>
      <KPICard variant="hero" eyebrow="Økter i dag" value="6" footnote="3 WANG · 3 privat" />
      <KPICard variant="default" eyebrow="Venter på svar" value="4" delta={{ value: "+2", direction: "neutral" }} footnote="Innboks" />
      <KPICard variant="muted" eyebrow="Ledige timer" value="49" footnote="Denne uka" />
      <KPICard variant="warn" eyebrow="Ubekreftet" value="3" footnote="Frist i dag" />
      <KPICard variant="danger" eyebrow="Ubetalte fakturaer" value="2" footnote="Forfalt 14 dager" />
    </div>
  );
}
