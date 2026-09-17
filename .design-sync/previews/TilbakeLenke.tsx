import { TilbakeLenke, Tittel } from "akgolf-hq-komponenter";

/** Ett mønster for tilbake-navigasjon i sub-klynger (spiller-360°): ghost CTAPill + arrow-left. */
export function Standard() {
  return <TilbakeLenke href="/admin/spillere">Tilbake til stallen</TilbakeLenke>;
}

/** Slik den står over skjermtittelen på en undersides. */
export function OverTittel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
      <TilbakeLenke href="/admin/spillere/spiller">Øyvind Rohjan</TilbakeLenke>
      <Tittel em="analyse.">Slag og</Tittel>
    </div>
  );
}
