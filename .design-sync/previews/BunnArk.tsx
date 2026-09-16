import { AkseChip, BunnArk, CTAPill, Caps, Icon, Knapp, MikroMeta, Rad } from "akgolf-hq-komponenter";

/**
 * BunnArk er `position: fixed` og rendrer ingenting uten `open`. Scenen er en 390 px-telefon med
 * `transform: translateZ(0)`, så bakteppet og arket holdes inne i kortet (en transformert forelder er
 * containing block for fixed). Bak arket ligger uke 38, slik at scrimmen har noe å dempe.
 */
const scene = {
  position: "relative" as const,
  height: 560,
  width: 390,
  margin: "0 auto",
  overflow: "hidden",
  borderRadius: 28,
  border: "1px solid var(--tl-hair)",
  background: "var(--tl-scene)",
  transform: "translateZ(0)",
};
const mono = { fontFamily: "var(--tl-font-mono)", fontSize: 11, color: "var(--tl-mute)" };
const chip = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontFamily: "var(--tl-font-mono)",
  fontSize: 9,
  fontWeight: 700,
  color: "var(--tl-mute)",
  background: "var(--tl-dock)",
  border: "1px solid var(--tl-hair)",
  borderRadius: 5,
  padding: "3px 7px",
};

/** Uka bak arket: Øyvind Rohjans uke 38. */
function Uke() {
  return (
    <div style={{ padding: "22px 16px" }}>
      <Caps>Uke 38 · 14.–20. september</Caps>
      <div style={{ fontFamily: "var(--tl-font-sans)", fontWeight: 700, fontSize: 22, color: "var(--tl-text)", marginTop: 8 }}>
        Øyvind Rohjan
      </div>
      <div style={{ marginTop: 10 }}>
        <Rad title="Teknisk — P4 topp-posisjon" sub="Mandag 16:00 · 75 min · GFGK range" meta={<AkseChip a="TEK" />} trailing={null} />
        <Rad title="WANG — fellesøkt" sub="Onsdag 17:00–19:00 · egentrening 18:00–18:45" meta={<AkseChip a="SPILL" />} trailing={null} />
        <Rad title="Wedge 60–100 m" sub="Torsdag 16:00 · 60 baller · TrackMan" meta={<AkseChip a="SLAG" />} trailing={null} />
        <Rad title="Styrke — underkropp" sub="Fredag 07:00 · 45 min · Treningslokalet" meta={<AkseChip a="FYS" />} trailing={null} last />
      </div>
    </div>
  );
}

/** Trykk på en økt i uka: detaljene i arket, med tittel og lukk-knapp. */
export function OktDetaljer() {
  return (
    <div style={scene}>
      <Uke />
      <BunnArk open onClose={() => {}} tittel="Wedge 60–100 m">
        <span style={{ ...mono, display: "block" }}>Torsdag 17. sep · 16:00–17:15 · GFGK range · TrackMan</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          <AkseChip a="SLAG" />
          <span style={chip}><span>Område</span>Innspill ~100 m</span>
          <span style={chip}><span>Miljø</span>Treningsområde</span>
          <span style={chip}><span>Press</span>Alene</span>
          <span style={chip}><span>Dose</span>60 baller slått</span>
        </div>
        <Caps size={9} style={{ marginTop: 16 }}>Øvelser</Caps>
        <div style={{ marginTop: 4 }}>
          <Rad title="Lengdekontroll 60–100 m" sub="3 × 20 baller · Carry ± 5 m" trailing={null} />
          <Rad title="Variasjonstrening — tre køller" sub="Bytt kølle hver ball · 30 baller" trailing={null} last />
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
          <MikroMeta icon="radar">Carry ± 5 m</MikroMeta>
          <MikroMeta icon="repeat">Hver torsdag</MikroMeta>
        </div>
        <div style={{ marginTop: 16 }}>
          <CTAPill icon="play" full>Start økt</CTAPill>
        </div>
      </BunnArk>
    </div>
  );
}

const HANDLINGER: [string, string][] = [
  ["pencil", "Rediger økt"],
  ["copy", "Dupliser til fredag"],
  ["arrow-right", "Flytt til en annen dag"],
  ["trash-2", "Slett økt"],
];

/** Uten tittel: rent handlingsark etter langt trykk på en øktbrikke. */
export function Handlinger() {
  return (
    <div style={scene}>
      <Uke />
      <BunnArk open onClose={() => {}}>
        <span style={{ ...mono, display: "block", marginBottom: 4 }}>Wedge 60–100 m · torsdag 16:00</span>
        {HANDLINGER.map(([ikon, navn], i) => (
          <Rad
            key={navn}
            leading={<Icon name={ikon} size={18} style={{ color: "var(--tl-mute)" }} />}
            title={navn}
            trailing={null}
            last={i === HANDLINGER.length - 1}
            onClick={() => {}}
          />
        ))}
      </BunnArk>
    </div>
  );
}

/** Kort ark (`maxHeight` satt lavt): bekreftelse med to valg. */
export function Bekreft() {
  return (
    <div style={scene}>
      <Uke />
      <BunnArk open onClose={() => {}} tittel="Publiser uke 38?" maxHeight="46vh">
        <p style={{ margin: 0, fontFamily: "var(--tl-font-sans)", fontSize: 13.5, lineHeight: 1.5, color: "var(--tl-mute)" }}>
          Øyvind får fem økter i planen og svarer godta eller avvis på hver av dem. Du kan endre uka etterpå.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <Knapp ghost full>Avbryt</Knapp>
          <Knapp full icon="send">Publiser</Knapp>
        </div>
      </BunnArk>
    </div>
  );
}
