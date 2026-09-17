import { Kort, Rad, Skilje, StatusPill, TallHero } from "akgolf-hq-komponenter";

const boks = { maxWidth: 480 };

/** Ren strek i hårlinjefargen mellom to blokker i et kort. */
export function Ren() {
  return (
    <div style={boks}>
      <Kort eyebrow="Neste økt">
        <Rad title="Wedge 60–100 m · 60 slag" sub="Torsdag 16:00 · Range, GFGK" trailing={null} last />
        <div style={{ margin: "4px 0 12px" }}>
          <Skilje />
        </div>
        <p style={{ margin: 0, fontFamily: "var(--tl-font-sans)", fontSize: 12.5, color: "var(--tl-mute)", lineHeight: 1.5 }}>
          Mål: Carry 90 m ± 5. Ta TrackMan-rapporten med inn i recap etterpå.
        </p>
      </Kort>
    </div>
  );
}

/** Mono-etikett i streken: skiller dagens saker fra tidligere i køen. */
export function MedEtikett() {
  return (
    <div style={boks}>
      <Kort eyebrow="Kø · 3 saker">
        <Rad title="Øyvind Rohjan — ukeplan uke 38" sub="Sendt inn i går 21:14" meta={<StatusPill tone="warn">Venter</StatusPill>} trailing={null} last />
        <div style={{ margin: "12px 0" }}>
          <Skilje etikett="Tidligere" />
        </div>
        <Rad title="Bookingforespørsel · lørdag 10:00" sub="Svart mandag" trailing={null} />
        <Rad title="Foreldremøte WANG · agenda" sub="Sendt fredag" trailing={null} last />
      </Kort>
    </div>
  );
}

/** Loddrett: tynn strek mellom to målte verdier i samme rad — krever en flex-forelder. */
export function Loddrett() {
  return (
    <div style={boks}>
      <Kort eyebrow="Siste 10 runder">
        <div style={{ display: "flex", alignItems: "stretch", gap: 20 }}>
          <TallHero label="Snittscore" value="74,3" unit="slag" size={32} />
          <Skilje retning="loddrett" />
          <TallHero label="Putt per runde" value="31,2" size={32} />
          <Skilje retning="loddrett" />
          <TallHero label="SG totalt" value="+1,8" dir="up" size={32} />
        </div>
      </Kort>
    </div>
  );
}
