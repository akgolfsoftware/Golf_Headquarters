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
import { Check } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";

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
  return <div className="phn">
    <div className="phn-k-smal">
      <div className="phn-k-bekreftet-topp">
        <span className="phn-k-hake"><Check className="phn-ikon" aria-hidden /></span>
        <div>
          <div className="phn-dato">Booking · bekreftet</div>
          <h1 className="phn-tittel">Timen er bekreftet</h1>
          <p className="phn-k-ingress">Du får påminnelse på e-post før timen.</p>
        </div>
      </div>
      <div className="phn-k-booking-helt bred">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/playerhq/slag-simulator.jpg" alt="" />
        <div className="phn-k-bt">
          <span className="phn-k-bt-dag">{data.dag}</span>
          <span className="phn-k-bt-tid">{data.klokkeslett}<small>{data.varighetMin} min</small></span>
          <span className="phn-k-navn">{data.tjeneste}{data.coachNavn ? ` med ${data.coachNavn.split(" ")[0]}` : ""}</span>
          <span className="phn-k-info"><span>{data.sted || "—"}</span><span>{data.coachNavn ?? "—"}</span></span>
        </div>
      </div>
      <div className="phn-k-vilkaar"><b>Gratis avbestilling inntil {data.avbestillingTimer} timer før</b><span>Etter det trekkes klippet, eller du får ikke betalingen tilbake.</span></div>
      <div className="phn-knapper">
        <a href={data.kalenderUrl} target="_blank" rel="noopener noreferrer" className="phn-knapp pri">Legg i kalender</a>
        <Link href="/portal/meg/bookinger" className="phn-knapp sek">Mine bookinger</Link>
      </div>
    </div>
  </div>;
}
