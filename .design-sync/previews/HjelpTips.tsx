import { HjelpTips, Kort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };
const tall = { fontFamily: "var(--tl-font-mono)", fontSize: 28, fontWeight: 700, color: "var(--tl-text)", fontVariantNumeric: "tabular-nums" as const };
const etikett = { fontFamily: "var(--tl-font-sans)", fontSize: 12.5, color: "var(--tl-mute)", display: "inline-flex", alignItems: "center", gap: 6 };

/** «?» ved kort-eyebrow: teksten hentes fra hjelpetekster.ts (nøkkel tonnasje) og åpnes ved hover/trykk/fokus. */
export function VedEyebrow() {
  return (
    <div style={boks}>
      <Kort eyebrow="Tonnasje · økt fullført" action={<HjelpTips k="tonnasje" align="right" />}>
        <span style={tall}>4 320 <span style={{ fontSize: 14, color: "var(--tl-mute)", fontWeight: 400 }}>kg løftet</span></span>
      </Kort>
    </div>
  );
}

/** Størrelser 11/13/16 ved siden av begrepet den forklarer, i løpende etiketter. */
export function Storrelser() {
  return (
    <div style={{ ...boks, display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={etikett}>ACWR 1,1 <HjelpTips k="acwr" size={11} /></span>
      <span style={etikett}>Ukevolum 6 t 40 min <HjelpTips k="ukevolum" /></span>
      <span style={etikett}>SG totalt +1,8 <HjelpTips k="sgTotal" size={16} /></span>
    </div>
  );
}

/** Inne i en setning, slik TonnasjeHero legger den etter «ACWR». */
export function ISetning() {
  return (
    <div style={boks}>
      <span style={{ fontFamily: "var(--tl-font-sans)", fontSize: 11.5, color: "var(--tl-mute)", display: "inline-flex", alignItems: "center", gap: 5 }}>
        Beregnet fra loggede sett — mates inn i ACWR og ukevolum <HjelpTips k="acwr" size={11} />
      </span>
    </div>
  );
}
