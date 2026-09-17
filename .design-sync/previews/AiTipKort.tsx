import { AiTipKort, TipTall } from "akgolf-hq-komponenter";

/** Caddie-innsikt med tittel, nøkkeltall i TipTall og rolig handling — anbefaling, aldri sperre. */
export function Standard() {
  return (
    <AiTipKort
      eyebrow="AI-Caddie · oppdatert for 2 timer siden"
      tittel="Approach fra 80–120 m koster mest"
      handling="Se økten"
      maxBredde={440}
    >
      Siste tre runder taper du <TipTall>0,6 slag</TipTall> per runde på approach fra 80–120 meter, målt mot ditt eget
      snitt. Wedge-økten torsdag er lagt inn som utkast.
    </AiTipKort>
  );
}

/** Kompakt: bare eyebrow og tekst, ingen tittel eller handling. */
export function Kompakt() {
  return (
    <AiTipKort eyebrow="AI-Caddie" maxBredde={440}>
      Du har fullført <TipTall>4 av 6</TipTall> økter denne uka. To gjenstår: onsdag og lørdag.
    </AiTipKort>
  );
}

/** TrackMan-innsikt: parametere på engelsk med stor forbokstav, forslaget venter hos coach. */
export function TrackMan() {
  return (
    <AiTipKort
      eyebrow="AI-Caddie · TrackMan 14.09.2026"
      tittel="Attack Angle har gått fra −6° til −3°"
      handling="Åpne forslaget"
      maxBredde={440}
    >
      På 168 slag med driver siste 14 dager er Attack Angle i snitt <TipTall>−3,1°</TipTall>. Spredningen er
      uendret. Forslaget om nytt krav i P5 ligger hos Anders Kristiansen.
    </AiTipKort>
  );
}
