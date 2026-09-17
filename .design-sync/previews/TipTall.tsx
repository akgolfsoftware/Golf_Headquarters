import { AiTipKort, TipTall } from "akgolf-hq-komponenter";

/** Nøkkeltallet i et AI-tips: mono i fyll-farge med tabular-nums — skjermens ene uthevede tall. */
export function IAiTip() {
  return (
    <AiTipKort eyebrow="AI-Caddie · oppdatert for 2 timer siden" tittel="Approach fra 80–120 m koster mest" handling="Se økten" maxBredde={440}>
      Siste tre runder taper du <TipTall>0,6 slag</TipTall> per runde på approach fra 80–120 meter, målt mot ditt eget
      snitt.
    </AiTipKort>
  );
}

/** I løpende tekst utenfor kortet: tallene skiller seg fra Poppins rundt uten å rope. */
export function ILopendeTekst() {
  return (
    <p style={{ fontFamily: "var(--tl-font-sans)", fontSize: 15, lineHeight: 1.55, color: "var(--tl-mute)", maxWidth: 440, margin: 0 }}>
      Snittscore siste 10 runder er <TipTall>74,3</TipTall>, <TipTall>−1,2</TipTall> mot forrige periode. Putt per runde
      ligger på <TipTall>31,4</TipTall>. Kilde: GolfBox, 14.09.2026.
    </p>
  );
}
