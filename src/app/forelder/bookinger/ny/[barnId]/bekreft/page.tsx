/**
 * Foreldreportal · Bekreft booking for barnet (STEG 9.8). Speiler
 * /portal/booking/ny/bekreft via samme byggBookingBekreftData-loader —
 * eneste forskjell er eier (barnet) og hvor «Bekreft booking» sender
 * spilleren videre (bekreftetBase). barnId sendes med i dataen slik at
 * BookingNyBekreftV2 gir det videre til opprettBooking-actionene, som
 * verifiserer forelder→barn-koblingen på nytt før noe skrives.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnHvisTilhoerer } from "@/lib/forelder";
import { byggBookingBekreftData } from "@/lib/portal-booking/bekreft-data";
import { V2Shell, FORELDER_NAV, FORELDER_MER } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { BookingNyBekreftV2 } from "@/components/portal/v2/BookingNyBekreftV2";

type Props = {
  params: Promise<{ barnId: string }>;
  searchParams: Promise<{ service?: string; start?: string; coach?: string; betaling?: string }>;
};

export default async function ForelderBekreftBookingPage({ params, searchParams }: Props) {
  const { barnId } = await params;
  const { service: serviceSlug, start, coach: coachId, betaling } = await searchParams;

  if (!serviceSlug || !start || !coachId) notFound();

  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnHvisTilhoerer(user.id, barnId);
  if (!barn) notFound();

  const wizardBase = `/forelder/bookinger/ny/${barnId}`;
  const resultat = await byggBookingBekreftData({
    eierId: barn.id,
    barnId,
    wizardBase,
    bekreftetBase: "/forelder/bookinger/bekreftet",
    serviceSlug,
    start,
    coachId,
    betaling,
  });

  if (resultat.status === "krever_credits_redirect") redirect(wizardBase);
  if (resultat.status === "ikke_funnet") notFound();

  return (
    <V2Shell bredde="kolonne" aktiv="oversikt" nav={FORELDER_NAV} mer={FORELDER_MER} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href={resultat.data.backHref}>Velg annen tid</TilbakeLenke>
      <BookingNyBekreftV2 data={{ ...resultat.data, merkelapp: "Foreldreportal" }} />
    </V2Shell>
  );
}
