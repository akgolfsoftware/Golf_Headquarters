import { Prikker } from "akgolf-hq-komponenter";

/** Frekvens-heatmap: 84 prikker i 28 kolonner (12 uker × 7 dager), treff i handlingsfargen. 8 px pitch (5 px prikk + 3 px gap). */
export function Standard() {
  return (
    <div style={{ width: 232 }}>
      <Prikker />
    </div>
  );
}

/** Egne treff: dager med gjennomført økt siste 8 uker (56 dager, 14 kolonner = to uker per rad). Man/tir/tor/lør, med en sykeuke i uke 7. */
export function AatteUker() {
  return (
    <div style={{ width: 120 }}>
      <Prikker
        n={56}
        cols={14}
        hits={[0, 1, 3, 5, 7, 8, 10, 12, 14, 15, 17, 21, 22, 24, 26, 28, 30, 33, 35, 36, 38, 40, 43, 45, 49, 50, 52, 54]}
      />
    </div>
  );
}

/** on: annen treff-farge — grønn for fullført, rød for hoppet over (samme fire uker). */
export function Farger() {
  return (
    <div style={{ width: 232, display: "flex", flexDirection: "column", gap: 12 }}>
      <Prikker n={28} cols={28} on="var(--tl-ok)" hits={[0, 1, 3, 5, 7, 8, 10, 12, 14, 15, 17, 21, 22, 24, 26]} />
      <Prikker n={28} cols={28} on="var(--tl-danger)" hits={[19, 24]} />
    </div>
  );
}
