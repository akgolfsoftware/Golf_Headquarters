import { SendKnapp, Skrivefelt } from "akgolf-hq-komponenter";

const noop = () => {};
const rad = { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" as const };
const etikett = {
  fontFamily: "var(--tl-font-mono)",
  fontSize: 10,
  color: "var(--tl-mute)",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

/** Aktiv: blekkfylt rund knapp med pil — aldri papirfly (det leses som «send e-post»). */
export function Aktiv() {
  return (
    <div style={rad}>
      <SendKnapp aktiv onClick={noop} />
    </div>
  );
}

/** Inaktiv: dempet flate, ingen peker (tomt felt, sender, eller ikke tillatt). */
export function Inaktiv() {
  return (
    <div style={rad}>
      <SendKnapp aktiv={false} onClick={noop} />
    </div>
  );
}

/** 44 px er fasitens tap-mål i PlayerHQ-chatten; konsollens composer bruker 48. */
export function Storrelser() {
  return (
    <div style={{ ...rad, gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <SendKnapp aktiv onClick={noop} storrelse={44} />
        <span style={etikett}>44 · chat</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <SendKnapp aktiv onClick={noop} storrelse={48} />
        <span style={etikett}>48 · konsoll</span>
      </div>
    </div>
  );
}

/** Konsollens composer: ytre ramme eier layouten, Skrivefelt er «bare», SendKnapp 48 til høyre. */
export function IComposer() {
  return (
    <div
      style={{
        maxWidth: 560,
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        background: "var(--tl-dock)",
        border: "1px solid var(--tl-hair)",
        borderRadius: 16,
        padding: "10px 10px 10px 16px",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Skrivefelt variant="bare" value="Sett opp gruppeuke for WANG med to felles økter" onChange={noop} onSend={noop} />
      </div>
      <SendKnapp aktiv onClick={noop} storrelse={48} />
    </div>
  );
}
