import { RadarProfil, Kort, Caps } from "akgolf-hq-komponenter";

/* Talentprofil 1–10 på fem ord-akser. Etikettene har 34 px plass ved de nesten
   vannrette aksene, så de lengste ordene legges øverst eller på skrå. */
const TALENT = [
  { label: "Fysisk", verdi: 7 }, { label: "Teknikk", verdi: 6 }, { label: "Motivasjon", verdi: 9 },
  { label: "Mental", verdi: 8 }, { label: "Taktikk", verdi: 5 },
];
const PEER = [6, 7, 7, 6, 6];

const swatch = { width: 12, height: 12, borderRadius: 3, background: "color-mix(in srgb, var(--tl-fill) 40%, transparent)", border: "1px solid var(--tl-fill)" };
const strek = { width: 12, height: 0, borderTop: "1.5px dashed var(--tl-mute)" };
const legendTekst = { fontFamily: "var(--tl-font-sans)", fontSize: 12, color: "var(--tl-mute)" };

/** Kanonisk bruk: spillerens talentprofil alene, max 10, størrelse 300. */
export function Talent() {
  return <RadarProfil akser={TALENT} max={10} size={300} />;
}

/** Med peer-snitt som stiplet mute-polygon, justert 1:1 mot aksene. */
export function MedPeer() {
  return <RadarProfil akser={TALENT} sammenlign={PEER} max={10} size={300} />;
}

/** Slik den står i AgencyOS: sentrert i et kort med legende under (spiller + nivåsnitt). */
export function IKort() {
  return (
    <div style={{ maxWidth: 460 }}>
      <Kort eyebrow="Talentprofil · vurdert 09.09.2026">
        <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
          <RadarProfil akser={TALENT} sammenlign={PEER} max={10} size={300} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, marginTop: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={swatch} /><span style={legendTekst}>Øyvind Rohjan</span></span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={strek} /><span style={legendTekst}>B-snitt (14)</span></span>
        </div>
      </Kort>
    </div>
  );
}

/** Uvurdert akse (null) tegnes som 0 i polygonet uten punkt — tabellen ved siden av viser tankestrek. */
export function Uvurdert() {
  const akser = [
    { label: "Fysisk", verdi: 7 }, { label: "Teknikk", verdi: 6 }, { label: "Motivasjon", verdi: null },
    { label: "Mental", verdi: 8 }, { label: "Taktikk", verdi: 5 },
  ];
  return (
    <div style={{ maxWidth: 520 }}>
      <Kort eyebrow="Talentprofil · delvis vurdert">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: "none", width: 240 }}>
            <RadarProfil akser={akser} max={10} size={240} />
          </div>
          <div style={{ flex: 1, display: "grid", gap: 8 }}>
            {akser.map((a) => (
              <div key={a.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Caps size={9}>{a.label}</Caps>
                <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 12, fontWeight: 700, color: a.verdi == null ? "var(--tl-mute)" : "var(--tl-text)", fontVariantNumeric: "tabular-nums" }}>
                  {a.verdi == null ? "—" : `${a.verdi} / 10`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Kort>
    </div>
  );
}

/** Åtte akser (spillområder): korte ord på de vannrette aksene, lange øverst/nederst og på skrå. */
export function AatteAkser() {
  return (
    <RadarProfil
      size={340}
      max={10}
      akser={[
        { label: "Driving", verdi: 7 }, { label: "Approach", verdi: 6 }, { label: "Mental", verdi: 6 },
        { label: "Putting", verdi: 5 }, { label: "Nærspill", verdi: 8 }, { label: "Taktikk", verdi: 5 },
        { label: "Fysisk", verdi: 7 }, { label: "Turnering", verdi: 4 },
      ]}
    />
  );
}
