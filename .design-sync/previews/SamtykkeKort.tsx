import { SamtykkeKort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };

/** Venter på foresatt: gult skjold, forklaring i klarspråk og to handlinger. */
export function Venter() {
  return (
    <div style={boks}>
      <SamtykkeKort
        tittel="Foreldresamtykke"
        status="venter"
        tekst="Øyvind er under 18 år. En foresatt må bekrefte at han kan bruke PlayerHQ og dele treningsdata med coachen sin."
        forelder="Sendt til foresatt på e-post · 2. september"
      />
    </div>
  );
}

/** Samtykke gitt: grønt skjold, ingen handlinger. */
export function Gitt() {
  return (
    <div style={boks}>
      <SamtykkeKort
        tittel="Foreldresamtykke"
        status="gitt"
        tekst="Foresatt har bekreftet at Øyvind kan bruke PlayerHQ og dele treningsdata med Anders Kristiansen."
        forelder="Bekreftet av foresatt · 4. september 2026"
      />
    </div>
  );
}

/** Deling med organisasjon: trinn 1 (tester, turneringer, statistikk) til WANG. */
export function Organisasjonsdeling() {
  return (
    <div style={boks}>
      <SamtykkeKort
        tittel="Deling med WANG Toppidrett"
        status="venter"
        tekst="Trinn 1: tester, turneringer og statistikk deles med WANG Toppidrett Fredrikstad. Treningsplan og TrackMan deles ikke. Foresatt må bekrefte."
        forelder="Forespurt av Anders Kristiansen · 14. september"
      />
    </div>
  );
}
