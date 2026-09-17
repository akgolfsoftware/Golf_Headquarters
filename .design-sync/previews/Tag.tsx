import { Tag } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" as const };

/** Tag er StatusPill med core-paritetsnavn: samme 20 px-pille, samme toner. Brukes som merkelapp på økter og drills. */
export function Standard() {
  return (
    <div style={rad}>
      <Tag>Wedge</Tag>
      <Tag>Range</Tag>
      <Tag>TrackMan</Tag>
    </div>
  );
}

/** Tonene på en drill-liste: bekreftet, fullført, mangler drill, avlyst, live. */
export function Toner() {
  return (
    <div style={rad}>
      <Tag tone="up">Bekreftet</Tag>
      <Tag tone="warm">Fullført</Tag>
      <Tag tone="warn">Mangler drill</Tag>
      <Tag tone="down">Avlyst</Tag>
      <Tag tone="info">Live</Tag>
    </div>
  );
}
