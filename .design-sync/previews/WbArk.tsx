import { AkseChip, CTAPill, Caps, Knapp, Rad, WbArk } from "akgolf-hq-komponenter";

/**
 * WbArk er bunn-ark-rammen FlyttTilArk og PreviewArk bygger på: avrundet topp, håndtak, tittel og lukk.
 * Den er ikke fixed (rendres inline), så cellen forankrer den i bunnen av en 390 px-scene med scrim.
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
};
const scrim = { position: "absolute" as const, inset: 0, background: "var(--tl-scrim)" };
const bunn = { position: "absolute" as const, left: 0, right: 0, bottom: 0 };
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
        <Rad title="Wedge 60–100 m" sub="Torsdag 16:00 · 60 baller · TrackMan" meta={<AkseChip a="SLAG" />} trailing={null} last />
      </div>
    </div>
  );
}

/** Kanonisk bruk: tittel + underlinje, formel-chips, øvelser med dose og én handling. */
export function OktDetaljer() {
  return (
    <div style={scene}>
      <Uke />
      <div style={scrim} />
      <div style={bunn}>
        <WbArk tittel="Teknisk — P4 topp-posisjon" under="Mandag 14. sep · 16:00–17:15 · GFGK range" onLukk={() => {}}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
            <AkseChip a="TEK" />
            <span style={chip}><span>Område</span>Utslag</span>
            <span style={chip}><span>Motorikk</span>Lav hastighet</span>
            <span style={chip}><span>Miljø</span>Treningsområde</span>
            <span style={chip}><span>Press</span>Alene</span>
          </div>
          <Caps size={9} style={{ marginTop: 14 }}>Øvelser</Caps>
          <div style={{ marginTop: 4 }}>
            <Rad title="P4-stopp med stang" sub="20 svinger uten ball · hold 2 s i topp" trailing={null} />
            <Rad title="Speilkontroll topp-posisjon" sub="15 svinger i lav hastighet · video" trailing={null} />
            <Rad title="Overføring: driver" sub="20 baller slått · Club Speed 80 %" trailing={null} last />
          </div>
          <div style={{ marginTop: 14 }}>
            <CTAPill icon="play" full>Start økt</CTAPill>
          </div>
        </WbArk>
      </div>
    </div>
  );
}

/** Uten `under`: ny økt uten øvelser ennå, med én vei videre. */
export function TomOkt() {
  return (
    <div style={scene}>
      <Uke />
      <div style={scrim} />
      <div style={bunn}>
        <WbArk tittel="Ny økt — torsdag 17. sep" onLukk={() => {}}>
          <span style={{ ...mono, display: "block", marginTop: 12 }}>16:00 · GFGK range · TrackMan</span>
          <div style={{ padding: "18px 0 6px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--tl-font-sans)", fontWeight: 600, fontSize: 14, color: "var(--tl-text)" }}>Ingen øvelser ennå</div>
            <div style={{ fontFamily: "var(--tl-font-sans)", fontSize: 12, color: "var(--tl-mute)", marginTop: 4 }}>
              Velg fra biblioteket, eller start fra en mal.
            </div>
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <CTAPill icon="plus" full>Legg til øvelse</CTAPill>
            <CTAPill ghost icon="copy" full>Bruk mal</CTAPill>
          </div>
        </WbArk>
      </div>
    </div>
  );
}

/** Bekreftelse: kort tekst og to knapper. */
export function BekreftSletting() {
  return (
    <div style={scene}>
      <Uke />
      <div style={scrim} />
      <div style={bunn}>
        <WbArk tittel="Slett økt?" under="Wedge 60–100 m · torsdag 16:00" onLukk={() => {}}>
          <p style={{ margin: "14px 0 0", fontFamily: "var(--tl-font-sans)", fontSize: 13.5, lineHeight: 1.5, color: "var(--tl-mute)" }}>
            Økta fjernes fra uke 38 hos Øyvind. Serien «hver torsdag» fortsetter fra neste uke.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Knapp ghost full>Avbryt</Knapp>
            <Knapp full icon="trash-2">Slett økt</Knapp>
          </div>
        </WbArk>
      </div>
    </div>
  );
}
