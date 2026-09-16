import { AkseChip, Kort, Rad, Sidebar, Tittel } from "akgolf-hq-komponenter";

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

/** Sidebar er bakoverkompat-navnet for IkonRail — samme 64 px-rail. Aktiv «Plan» med ukas økter ved siden av. */
export function Plan() {
  return (
    <div style={ramme}>
      <Sidebar aktiv="plan" />
      <div style={innhold}>
        <Tittel em="uke 38.">Plan ·</Tittel>
        <Kort eyebrow="Torsdag 18. september">
          <Rad title="Oppvarming · mobilitet" sub="08:00 · 15 min" meta={<AkseChip a="FYS" />} trailing={null} />
          <Rad title="Wedge 60–100 m · 60 slag" sub="16:00 · Range, GFGK" meta={<AkseChip a="SLAG" />} naa trailing={null} />
          <Rad title="Putting · 3 m lag-drill" sub="17:00 · 30 putter" meta={<AkseChip a="SPILL" />} trailing={null} last />
        </Kort>
      </div>
    </div>
  );
}

/** Aktiv «Meg». */
export function Meg() {
  return (
    <div style={ramme}>
      <Sidebar aktiv="meg" />
      <div style={innhold}>
        <Tittel>Meg</Tittel>
        <Kort>
          <Rad title="Varsler" />
          <Rad title="Personvern og deling" />
          <Rad title="Abonnement" last />
        </Kort>
      </div>
    </div>
  );
}
