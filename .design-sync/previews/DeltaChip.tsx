import { DeltaChip, TallHero } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" as const };

/** Ren mono-tekst med retningsfarge: ned = rød, ellers grønn. Fortegnet bærer retningen, ingen pil. */
export function Retninger() {
  return (
    <div style={rad}>
      <DeltaChip v="+0,4" dir="up" />
      <DeltaChip v="−0,9" dir="down" />
      <DeltaChip v="+2 økter" />
    </div>
  );
}

/** Slik den står i appen: rett ved siden av et målt tall. */
export function VedTall() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 360 }}>
      <TallHero label="SG totalt" value="+1,8" delta="+0,4" dir="up" sub="Siste 10 runder mot eget snitt" />
      <TallHero label="SG approach" value="−0,9" delta="−0,3" dir="down" sub="80–120 m koster mest" />
    </div>
  );
}
