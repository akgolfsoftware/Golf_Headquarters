import { AkseChip, Caps, FlyttTilArk, Rad } from "akgolf-hq-komponenter";

/**
 * FlyttTilArk erstatter dra-og-slipp på mobil: langt trykk → dag- og tidsvelger. Komponenten
 * forhåndsvelger onsdag 15:00 selv, så varselet vises kun når onsdag bærer et. Rammen er inline,
 * derfor 390 px-scene med scrim.
 */
const scene = {
  position: "relative" as const,
  height: 560,
  width: 390,
  margin: "0 auto",
  overflow: "hidden",
  borderRadius: 28,
  border: "1px solid var(--tl-hair)",
  background: "var(--tl-scene)",
};
const scrim = { position: "absolute" as const, inset: 0, background: "var(--tl-scrim)" };
const bunn = { position: "absolute" as const, left: 0, right: 0, bottom: 0 };

/** Uka bak arket: Øyvind Rohjans uke 38. */
function Uke() {
  return (
    <div style={{ padding: "22px 16px" }}>
      <Caps>Uke 38 · 14.–20. september</Caps>
      <div style={{ fontFamily: "var(--tl-font-sans)", fontWeight: 700, fontSize: 22, color: "var(--tl-text)", marginTop: 8 }}>
        Øyvind Rohjan
      </div>
      <div style={{ marginTop: 10 }}>
        <Rad title="Teknisk — P4 topp-posisjon" sub="Mandag 16:00 · 75 min · GFGK range" meta={<AkseChip a="TEK" />} trailing={null} />
        <Rad title="Wedge 60–100 m" sub="Torsdag 16:00 · 60 baller · TrackMan" meta={<AkseChip a="SLAG" />} trailing={null} last />
      </div>
    </div>
  );
}

const DAGER = [
  { id: "man", l: "Man", d: "14", varsel: null },
  { id: "tir", l: "Tir", d: "15", varsel: null },
  { id: "ons", l: "Ons", d: "16", varsel: null },
  { id: "tor", l: "Tor", d: "17", varsel: "WANG-samling hele dagen" },
  { id: "fre", l: "Fre", d: "18", varsel: null },
  { id: "lor", l: "Lør", d: "19", varsel: null },
  { id: "son", l: "Søn", d: "20", varsel: "Hviledag i planen" },
];
const TIDER = ["07:00", "09:00", "12:00", "15:00", "17:30", "19:00"];

/** Uke 38 uten varsel på valgt dag: dag, tid, kapasitet og «Flytt hit». */
export function Standard() {
  return (
    <div style={scene}>
      <Uke />
      <div style={scrim} />
      <div style={bunn}>
        <FlyttTilArk
          okt="Wedge 60–100 m · torsdag 16:00"
          dager={DAGER}
          tider={TIDER}
          kapasitet="2 t 15 min av 3 t brukt onsdag"
          onFlytt={() => {}}
          onLukk={() => {}}
        />
      </div>
    </div>
  );
}

/** Valgt dag bærer et varsel: anbefaling i klarspråk, aldri en sperre. */
export function MedVarsel() {
  const dager = DAGER.map((d) => (d.id === "ons" ? { ...d, varsel: "WANG-fellesøkt 17:00–19:00 samme dag — vurder en kortere økt" } : d));
  return (
    <div style={scene}>
      <Uke />
      <div style={scrim} />
      <div style={bunn}>
        <FlyttTilArk
          okt="Styrke — underkropp · fredag 07:00"
          dager={dager}
          tider={TIDER}
          kapasitet="2 t 45 min av 3 t brukt onsdag"
          onFlytt={() => {}}
          onLukk={() => {}}
        />
      </div>
    </div>
  );
}
