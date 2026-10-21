/**
 * PH-23 Bekreftet: kvitteringen etter booking — nytt design (pakke 7 Kommunikasjon, godkjent 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «bekreftet».
 * Ingen "use client": siden rendres på serveren med samme data som før (eierskapssjekk og
 * Google Kalender-lenke lages i page.tsx).
 *
 * Avvik:
 *   - Klippekortet er ikke med her: siden har bare bookingen, ikke klippene.
 *   - «Legg i kalender» åpner Google Kalender (som før).
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-23-BEKREFTET.
 */
import Link from "next/link";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-lister-skra.css";
import { SkraFlyt, SkraKort, SkraTopp } from "@/components/precision/skra/Skra";

export type PH23BekreftetData = {
  tjeneste: string;
  dag: string;
  klokkeslett: string;
  coachNavn: string | null;
  sted: string;
  varighetMin: number;
  kalenderUrl: string;
  avbestillingTimer: number;
};

export function PH23Bekreftet({ data }: { data: PH23BekreftetData }) {
  return <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Booking bekreftet"
      bilde="/images/playerhq/slag-simulator.jpg" bildePosisjon="50% 50%"
      overlinje="Booking · bekreftet"
      tittel="Timen er bekreftet"
      ingress="Du får påminnelse på e-post før timen."
    />
    <SkraFlyt lav>
    <div className="phn-k-skra-grid">
      <div>
      <div className="phn-k-booking-helt">
        <div className="phn-k-bt">
          <span className="phn-k-bt-dag">{data.dag}</span>
          <span className="phn-k-bt-tid">{data.klokkeslett}<small>{data.varighetMin} min</small></span>
          <span className="phn-k-navn">{data.tjeneste}{data.coachNavn ? ` med ${data.coachNavn.split(" ")[0]}` : ""}</span>
          <span className="phn-k-info"><span>{data.sted || "—"}</span><span>{data.coachNavn ?? "—"}</span></span>
        </div>
      </div>
      </div>
      <div>
      <SkraKort etikett="Avbestilling" tittel="Avbestilling">
        <div className="phn-k-vilkaar"><b>Gratis avbestilling inntil {data.avbestillingTimer} timer før</b><span>Etter det trekkes klippet, eller du får ikke betalingen tilbake.</span></div>
      </SkraKort>
      <div className="phn-knapper">
        <a href={data.kalenderUrl} target="_blank" rel="noopener noreferrer" className="phn-knapp pri">Legg i kalender</a>
        <Link href="/portal/meg/bookinger" className="phn-knapp sek">Mine bookinger</Link>
      </div>
      </div>
    </div>
    </SkraFlyt>
  </div>;
}
