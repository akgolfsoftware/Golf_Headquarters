import { Kort, MuskelgruppeChip } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 6, flexWrap: "wrap" as const, alignItems: "center", maxWidth: 440 };
const kilde = { fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" };

/** Kategori-chip per muskelgruppe: mono caps på dock-flate, aldri farge — gruppene er data, ikke status. */
export function Standard() {
  return (
    <div style={rad}>
      <MuskelgruppeChip navn="Sete/hofte" />
      <MuskelgruppeChip navn="Lår" />
      <MuskelgruppeChip navn="Rygg" />
      <MuskelgruppeChip navn="Kjerne" />
      <MuskelgruppeChip navn="Skuldre" />
      <MuskelgruppeChip navn="Bryst" />
      <MuskelgruppeChip navn="Bakside lår" />
    </div>
  );
}

/** Slik chipene står under øvelsesnavnet i en styrkeøkt. */
export function UnderOvelse() {
  return (
    <div style={{ maxWidth: 440 }}>
      <Kort eyebrow="Øvelse 2 av 5" action={<span style={kilde}>Hoveddel · 4 sett</span>}>
        <div style={{ fontFamily: "var(--tl-font-sans)", fontWeight: 700, fontSize: 16, color: "var(--tl-text)" }}>Knebøy</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 7 }}>
          <MuskelgruppeChip navn="Lår" />
          <MuskelgruppeChip navn="Sete/hofte" />
          <MuskelgruppeChip navn="Kjerne" />
        </div>
      </Kort>
    </div>
  );
}
