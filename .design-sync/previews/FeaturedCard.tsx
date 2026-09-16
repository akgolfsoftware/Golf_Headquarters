import { FeaturedCard } from "akgolf-hq-komponenter";

/* Liten SVG som data-URL: kveldsgrønn range med ball og flagg. Fullt URL-kodet fordi
   komponenten setter `url(...)` uten anførselstegn. */
const BILDE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 150">' +
      '<rect width="400" height="150" fill="#0f2a1f"/>' +
      '<rect y="96" width="400" height="54" fill="#1a7745"/>' +
      '<rect y="96" width="400" height="5" fill="#3dbe78" opacity="0.6"/>' +
      '<circle cx="118" cy="104" r="7" fill="#f5f5f5"/>' +
      '<line x1="292" y1="30" x2="292" y2="104" stroke="#f5f5f5" stroke-width="3"/>' +
      '<path d="M292 30 L326 40 L292 50 Z" fill="#e53935"/>' +
      '<circle cx="292" cy="104" r="5" fill="#0b1c14"/>' +
      "</svg>",
  );

/** Kanonisk bruk uten bilde: gradient-plassholder, badge og CTA-pille. */
export function Standard() {
  return (
    <FeaturedCard
      eyebrow="AK Golf Academy"
      tittel="Vintertrening med TrackMan"
      tekst="Hold fremgangen gjennom vinteren — strukturerte økter med full ballflight-data og oppfølging fra coach."
      cta="Se program"
      ctaIcon="arrow-right"
      badge="Få plasser igjen"
    />
  );
}

/** Med bilde (data-URL) og annet ikon på CTA-en. */
export function MedBilde() {
  return (
    <FeaturedCard
      bilde={BILDE}
      eyebrow="AK Golf Junior Academy"
      tittel="Høstgruppe U14 — oppstart 5. oktober"
      tekst="Åtte uker med to økter i uka. Køller til lån til og med U12, og foreldrene får innsyn i planen."
      cta="Meld på"
      ctaIcon="calendar-plus"
      badge="Nytt"
    />
  );
}

/** Uten badge: tom streng skjuler pillen (undefined gir standard-badgen). */
export function UtenBadge() {
  return (
    <FeaturedCard
      eyebrow="Kartleggingsøkt"
      tittel="90 minutter til vanlig timepris"
      tekst="TrackMan-måling, gjennomgang og en skriftlig plan du kan trene etter. Bookes som en vanlig time."
      cta="Book time"
      ctaIcon="calendar"
      badge=""
    />
  );
}
