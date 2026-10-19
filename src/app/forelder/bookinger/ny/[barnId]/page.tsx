// FO03NyBarnTid — Precision Athletics (FO03BookingNy). Data og handlinger er beholdt.
/**
 * Foreldreportal · Book ny time for barnet (STEG 9.8). Samme datalogikk
 * (byggBookingNyData) og lenkekontrakt som /portal/booking/ny — kun eier (barnet, ikke forelderen) og wizardBase
 * (denne ruta) er forskjellig. Barnetilhørighet verifiseres her OG på nytt
 * server-side ved selve bookingen (createCreditBooking/opprettBookingMedKort).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder, hentBarnHvisTilhoerer } from "@/lib/forelder";
import { byggBookingNyData } from "@/lib/portal-booking/ny-wizard-data";
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import { FoSkjerm, FoHode, FoTom } from "@/components/forelder/fo-presisjon";
import { FO03BookingNy } from "@/components/forelder/FO03BookingNy";

type Props = {
  params: Promise<{ barnId: string }>;
  searchParams: Promise<{ dato?: string; service?: string; betaling?: string }>;
};

export default async function ForelderNyBookingPage({ params, searchParams }: Props) {
  const { barnId } = await params;
  const { dato, service, betaling } = await searchParams;
  const user = await requirePortalUser({ allow: ["PARENT"] });

  const barn = await hentBarnHvisTilhoerer(user.id, barnId);
  if (!barn) notFound();

  const wizardBase = `/forelder/bookinger/ny/${barnId}`;
  const resultat = await byggBookingNyData({
    eierId: barn.id,
    eierTier: barn.tier,
    wizardBase,
    dato,
    service,
    betaling,
  });

  if (resultat.ingenTjenester) {
    return (
      <ForelderSkall>
        <div className="pa-side">
          <FoSkjerm>
            <FoHode caps="Forelder · booking" tittel="Book time" />
            <FoTom tittel="Ingen tjenester kan bookes nå" sub="Ingen coaching-tjenester er aktive. Skriv til post@akgolf.no." />
          </FoSkjerm>
        </div>
      </ForelderSkall>
    );
  }

  const alleBarn = await hentBarnForForelder(user.id);

  return (
    <ForelderSkall>
      <div className="pa-side">
        <FO03BookingNy data={resultat.data} barnNavn={barn.name} flereBarn={alleBarn.length > 1} />
      </div>
    </ForelderSkall>
  );
}
