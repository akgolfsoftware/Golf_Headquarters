/**
 * Foreldreportal · Book ny time for barnet (STEG 9.8). Samme wizard-
 * komponent (BookingNyV2) og datalogikk (byggBookingNyData) som
 * /portal/booking/ny — kun eier (barnet, ikke forelderen) og wizardBase
 * (denne ruta) er forskjellig. Barnetilhørighet verifiseres her OG på nytt
 * server-side ved selve bookingen (createCreditBooking/opprettBookingMedKort).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnHvisTilhoerer } from "@/lib/forelder";
import { byggBookingNyData } from "@/lib/portal-booking/ny-wizard-data";
import { V2Shell, FORELDER_NAV, FORELDER_MER } from "@/components/v2/shell";
import { TilbakeLenke, Kort, TomTilstand } from "@/components/v2";
import { BookingNyV2 } from "@/components/portal/v2/BookingNyV2";

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
      <V2Shell bredde="kolonne" aktiv="oversikt" nav={FORELDER_NAV} mer={FORELDER_MER} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/forelder/bookinger">Bookinger</TilbakeLenke>
        <Kort>
          <TomTilstand
            icon="target"
            title="Ingen tjenester tilgjengelig"
            sub="Ingen coaching-tjenester er aktive i øyeblikket. Kontakt support@akgolf.no."
          />
        </Kort>
      </V2Shell>
    );
  }

  return (
    <V2Shell bredde="kolonne" aktiv="oversikt" nav={FORELDER_NAV} mer={FORELDER_MER} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/forelder/bookinger">Bookinger</TilbakeLenke>
      <BookingNyV2 data={{ ...resultat.data, merkelapp: "Foreldreportal" }} />
    </V2Shell>
  );
}
