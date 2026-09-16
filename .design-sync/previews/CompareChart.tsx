import { CompareChart } from "akgolf-hq-komponenter";

/* TL-tokens er ikke eksportert fra pakken — seriefargene sendes som CSS-variabler. */
const FILL = "var(--tl-fill)";
const MUTE = "var(--tl-mute)";
const WARM = "var(--tl-warm)";

/** Kanonisk bruk: SG Total per runde, spilleren mot kategorisnittet. Siste 10 runder. */
export function SgMotKategori() {
  return (
    <CompareChart
      tittel="SG Total — deg mot kategori B"
      enhet="SG per runde · siste 10"
      serier={[
        { navn: "Øyvind", farge: FILL, verdier: [-1.4, -0.9, -1.1, -0.2, 0.3, -0.1, 0.6, 0.4, 1.1, 1.3] },
        { navn: "Kat. B-snitt", farge: MUTE, verdier: [0.5, 0.4, 0.5, 0.6, 0.5, 0.5, 0.6, 0.5, 0.6, 0.6] },
      ]}
    />
  );
}

/** Annen enhet og egen formattering: snittscore med komma-desimal, baseline på kravet til kategori C (76). */
export function Snittscore() {
  const slag = (v: number) => v.toFixed(1).replace(".", ",");
  return (
    <CompareChart
      tittel="Snittscore — deg mot kategori C"
      enhet="slag per runde"
      baseline={76}
      fmt={slag}
      serier={[
        { navn: "Øyvind", farge: FILL, verdier: [78.2, 77.5, 76.8, 77.1, 75.9, 75.4, 74.8, 75.0, 74.2, 73.9] },
        { navn: "Kat. C-snitt", farge: MUTE, verdier: [76.4, 76.1, 76.3, 76.0, 75.8, 76.2, 75.9, 76.0, 75.7, 75.9] },
      ]}
    />
  );
}

/** Tre serier: spilleren mot to kategorisnitt. Første serie er alltid heltrukket, resten stiplet. */
export function TreSerier() {
  return (
    <CompareChart
      tittel="SG Putting — deg mot kategori B og A"
      enhet="SG per runde · siste 8"
      height={170}
      serier={[
        { navn: "Øyvind", farge: FILL, verdier: [-0.8, -0.4, -0.6, 0.1, 0.2, 0.5, 0.3, 0.7] },
        { navn: "Kat. B-snitt", farge: MUTE, verdier: [0.1, 0.2, 0.1, 0.2, 0.2, 0.1, 0.2, 0.2] },
        { navn: "Kat. A-snitt", farge: WARM, verdier: [0.6, 0.7, 0.6, 0.7, 0.8, 0.7, 0.7, 0.8] },
      ]}
    />
  );
}

/** Ingen runder ennå: tom tilstand inne i kortet med samme tittel. */
export function Tom() {
  return <CompareChart tittel="SG Total — deg mot kategori B" serier={[]} />;
}
