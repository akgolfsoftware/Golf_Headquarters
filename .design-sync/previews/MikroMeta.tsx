import { MikroMeta } from "akgolf-hq-komponenter";

/** Liten mono-meta: ikon + tekst. Sted, tid, gjentakelse. */
export function Standard() {
  return <MikroMeta icon="map-pin">Range · GFGK</MikroMeta>;
}

/** Flere meta på rad under en økt-tittel. */
export function FlereMeta() {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
      <MikroMeta icon="clock">16:00–17:30</MikroMeta>
      <MikroMeta icon="repeat">Hver torsdag</MikroMeta>
      <MikroMeta icon="map-pin">Mulligan Indoor Golf</MikroMeta>
      <MikroMeta icon="users">Gruppe · 6</MikroMeta>
      <MikroMeta icon="radar">TrackMan</MikroMeta>
    </div>
  );
}
