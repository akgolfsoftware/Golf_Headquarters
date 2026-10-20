import Link from "next/link";

export interface BookingPrecisionTjeneste {
  slug: string;
  navn: string;
  coachNavn: string | null;
  pris: number;
  enhet: string;
  varighetMin: number;
  beskrivelse: string | null;
}

export interface BookingPrecisionFlowProps {
  tjenester: BookingPrecisionTjeneste[];
  lokasjon: string;
  nesteLedigInit?: string | null;
}

/** Eldre skjermkatalog-port. Booking skjer på den reelle tilgjengelighetsruten.
 *  Katalogens eksempelpriser, tider og coach-ID-er skal aldri nå en betalingshandling. */
export function BookingPrecisionFlow(_props: BookingPrecisionFlowProps) {
  return (
    <section className="pa-root support-booking bkp">
      <div className="bkp-shell">
        <p className="bkp-eyebrow">Booking</p>
        <h1 className="bkp-tittel">Finn en coachingtime</h1>
        <p className="bkp-undertekst">Tjenester, priser, coacher og ledige tider hentes når du åpner booking.</p>
        <Link href="/booking" className="pa-btn pa-btn--primary">Se tjenester og ledige tider</Link>
      </div>
    </section>
  );
}
