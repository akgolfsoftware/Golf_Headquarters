import { BunnNav, CTAPill, Kort, Rad, Tittel } from "akgolf-hq-komponenter";

const telefon = {
  width: 390,
  height: 440,
  background: "var(--tl-scene)",
  border: "1px solid var(--tl-hair)",
  borderRadius: 28,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column" as const,
};

/** Mobil bunn-nav: fem faner, 44 px berøringsmål, aktiv i handlingsfargen med tyngre strek. */
export function Hjem() {
  return (
    <div style={{ width: 390 }}>
      <BunnNav aktiv="hjem" />
    </div>
  );
}

export function Analyse() {
  return (
    <div style={{ width: 390 }}>
      <BunnNav aktiv="analyse" />
    </div>
  );
}

/** Nederst i 390 px-ramma, under innholdet, med 82 % scene-bakgrunn og blur. */
export function IMobilramme() {
  return (
    <div style={telefon}>
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <Tittel mobile>I dag</Tittel>
        <Kort eyebrow="Nå">
          <Rad title="Wedge 60–100 m · 60 slag" sub="16:00 · Range, GFGK" naa trailing={null} last />
          <div style={{ marginTop: 12 }}>
            <CTAPill full enTing icon="play">Start økt · 45 min</CTAPill>
          </div>
        </Kort>
      </div>
      <BunnNav aktiv="hjem" />
    </div>
  );
}
