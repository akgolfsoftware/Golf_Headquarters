import { IkonRail, Kort, KpiFlis, Rad, TallHero, Tittel } from "akgolf-hq-komponenter";

const ramme = {
  display: "flex",
  height: 560,
  width: 640,
  background: "var(--tl-scene)",
  border: "1px solid var(--tl-hair)",
  borderRadius: 20,
  overflow: "hidden",
};
const innhold = { flex: 1, minWidth: 0, padding: "28px 32px", display: "flex", flexDirection: "column" as const, gap: 16 };

/** Smal sidenav (64 px): logo, fem destinasjoner med mono-mikroetikett, søk (⌘K) og profil nederst. Aktiv = tonet flate + venstre markør. */
export function Hjem() {
  return (
    <div style={ramme}>
      <IkonRail aktiv="hjem" />
      <div style={innhold}>
        <Tittel>God morgen, Øyvind</Tittel>
        <Kort eyebrow="Neste økt">
          <TallHero value="16:00" sub="Wedge 60–100 m · Range, GFGK" />
        </Kort>
      </div>
    </div>
  );
}

/** Aktiv «Analyse», coachens navn i profilen nederst. */
export function Analyse() {
  return (
    <div style={ramme}>
      <IkonRail aktiv="analyse" navn="Anders Kristiansen" />
      <div style={innhold}>
        <Tittel em="analyse.">Slag og</Tittel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          <KpiFlis label="SG totalt" value="+1,8" delta="+0,4" dir="up" instant />
          <KpiFlis label="Snittscore" value="74,3" delta="−1,2" dir="down" instant />
          <KpiFlis label="Putt per runde" value="31,2" instant />
        </div>
        <Kort eyebrow="Siste runder">
          <Rad title="Klubbmesterskap · runde 1" sub="Søndag 14.09 · GFGK" trailing={null} />
          <Rad title="Srixon Tour · runde 2" sub="Lørdag 06.09 · Borre GK" trailing={null} last />
        </Kort>
      </div>
    </div>
  );
}
