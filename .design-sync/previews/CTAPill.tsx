import { CTAPill } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" as const };

/** Solid = ink-CTA (44 px), ghost = sekundær handling med hårlinje. */
export function Standard() {
  return (
    <div style={rad}>
      <CTAPill icon="calendar">Åpne uke i Workbench</CTAPill>
      <CTAPill ghost icon="arrow-right">Se hele planen</CTAPill>
      <CTAPill ghost>Avbryt</CTAPill>
    </div>
  );
}

/** enTing: «Én ting nå» — 56 px høy, 14 px tekst, radius 12. Maks én per skjerm. */
export function EnTing() {
  return <CTAPill enTing icon="play">Start dagens økt · 45 min</CTAPill>;
}

/** full: strekker seg til forelderens bredde (mobil-CTA under et kort). */
export function FullBredde() {
  return (
    <div style={{ width: 358, display: "flex", flexDirection: "column", gap: 8 }}>
      <CTAPill full enTing icon="play">Start økt</CTAPill>
      <CTAPill full ghost>Utsett til i morgen</CTAPill>
    </div>
  );
}
