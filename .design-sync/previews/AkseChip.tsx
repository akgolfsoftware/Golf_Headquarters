import { AkseChip, Rad } from "akgolf-hq-komponenter";

/** Fem akser i klarspråk (Fysisk/Teknikk/Slag/Spill/Turnering). Datanøklene FYS/TEK/SLAG/SPILL/TURN er uendret. */
export function AlleAkser() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <AkseChip a="FYS" />
      <AkseChip a="TEK" />
      <AkseChip a="SLAG" />
      <AkseChip a="SPILL" />
      <AkseChip a="TURN" />
    </div>
  );
}

/** Aksen som meta på økt-rader i ukeplanen. */
export function IOktRad() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Rad title="Wedge 60–100 m · 60 slag" sub="Torsdag 16:00 · Range, GFGK" meta={<AkseChip a="SLAG" />} trailing={null} />
      <Rad title="P2–P4 med speil" sub="Fredag 08:00 · Mulligan Indoor Golf" meta={<AkseChip a="TEK" />} trailing={null} />
      <Rad title="Styrke · underkropp" sub="Lørdag 10:00 · WANG" meta={<AkseChip a="FYS" />} trailing={null} />
      <Rad title="Klubbmesterskap · runde 1" sub="Søndag 09:10 · GFGK" meta={<AkseChip a="TURN" />} trailing={null} last />
    </div>
  );
}
