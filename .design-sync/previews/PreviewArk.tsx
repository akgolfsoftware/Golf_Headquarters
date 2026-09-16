import { AkseChip, Caps, PreviewArk, Rad } from "akgolf-hq-komponenter";

/**
 * PreviewArk er langtrykk-forhåndsvisningen av en økt på mobil. Standard-`formel` i kilden bruker
 * utgått vokabular (L-fase, CS), så hver celle sender formelen fra ordboka eksplisitt:
 * område · motorikk · miljø (belastning) · press · dose. Rammen er inline, derfor 390 px-scene med scrim.
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
        <Rad title="Wedge 60–100 m" sub="Torsdag 16:00 · 60 baller · TrackMan" meta={<AkseChip a="SLAG" />} trailing={null} />
        <Rad title="Banespill 9 hull" sub="Lørdag 10:00 · GFGK bane" meta={<AkseChip a="SPILL" />} trailing={null} last />
      </div>
    </div>
  );
}

const noop = () => {};

/** Teknisk økt: fullsving har motorikk-steg, så formelen har fire ledd. */
export function TekniskOkt() {
  return (
    <div style={scene}>
      <Uke />
      <div style={scrim} />
      <div style={bunn}>
        <PreviewArk
          tittel="Teknisk — P4 topp-posisjon"
          axis="TEK"
          varighet="Mandag 14. sep · 75 min · GFGK range"
          formel={[
            { l: "Område", v: "Utslag" },
            { l: "Motorikk", v: "Lav hastighet" },
            { l: "Miljø", v: "Treningsområde" },
            { l: "Press", v: "Alene" },
          ]}
          ovelser={[
            { navn: "P4-stopp med stang", mal: "20 svinger uten ball · hold 2 s i topp" },
            { navn: "Speilkontroll topp-posisjon", mal: "15 svinger i lav hastighet · video" },
            { navn: "Overføring: driver", mal: "20 baller slått · Club Speed 80 %" },
          ]}
          sist="Sist gjennomført: mandag 7. sep — selvvurdering 4 av 5"
          onLukk={noop}
          onRediger={noop}
          onDupliser={noop}
          onFlytt={noop}
        />
      </div>
    </div>
  );
}

/** Golfslag-økt med TrackMan-mål: dose i baller slått, press Observert (coach ser på). */
export function GolfslagOkt() {
  return (
    <div style={scene}>
      <Uke />
      <div style={scrim} />
      <div style={bunn}>
        <PreviewArk
          tittel="Wedge 60–100 m"
          axis="SLAG"
          varighet="Torsdag 17. sep · 60 min · GFGK range · TrackMan"
          formel={[
            { l: "Område", v: "Innspill ~100 m" },
            { l: "Miljø", v: "Treningsområde" },
            { l: "Press", v: "Observert" },
            { l: "Dose", v: "60 baller slått" },
          ]}
          ovelser={[
            { navn: "Lengdekontroll 60–100 m", mal: "3 × 20 baller · Carry ± 5 m" },
            { navn: "Variasjonstrening — tre køller", mal: "Bytt kølle hver ball · 30 baller" },
          ]}
          sist="Ikke gjennomført ennå — planlagt"
          onLukk={noop}
          onRediger={noop}
          onDupliser={noop}
          onFlytt={noop}
        />
      </div>
    </div>
  );
}

/** Spill-økt på banen uten «sist»-linje (aldri gjennomført før). */
export function SpillOkt() {
  return (
    <div style={scene}>
      <Uke />
      <div style={scrim} />
      <div style={bunn}>
        <PreviewArk
          tittel="Banespill 9 hull — strategioppgave"
          axis="SPILL"
          varighet="Lørdag 19. sep · 2 t 30 min · GFGK bane"
          formel={[
            { l: "Område", v: "Banespill" },
            { l: "Miljø", v: "Bane" },
            { l: "Press", v: "Konkurranse" },
            { l: "Måte", v: "Spill/test" },
          ]}
          ovelser={[
            { navn: "Strategioppgave: køllevalg fra tee", mal: "Noter valget før hvert slag · 9 hull" },
            { navn: "Scorekort med lie", mal: "Registrer slag og lie per hull" },
          ]}
          sist={null}
          onLukk={noop}
          onRediger={noop}
          onDupliser={noop}
          onFlytt={noop}
        />
      </div>
    </div>
  );
}
