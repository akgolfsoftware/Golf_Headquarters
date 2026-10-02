/**
 * PlayerHQ Booking, oversikt (/portal/booking) — Precision Athletics PH-23
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-23.jsx).
 * Auth, tilgang og data som før (getBookingHubData); bare visningen er ny.
 * Kommende og tidligere timer, klippekort, første ledige tid og coacher.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBookingHubData } from "@/lib/portal-booking/hub-data";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Hub, type PH23HubProps } from "@/components/portal/precision/PH23Booking";
import { isoDagMnd } from "@/lib/portal-booking/ph23-format";
import { hubRad } from "@/lib/portal-booking/ph23-rader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · PlayerHQ" };

type Props = { searchParams: Promise<{ betalt?: string; avbrutt?: string }> };

export default async function BookingHubPage({ searchParams }: Props) {
  const { betalt, avbrutt } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PARENT") redirect("/forelder");

  const uleste = await hentUleste(user.id);
  let props: PH23HubProps;
  try {
    const hub = await getBookingHubData(user.id);
    const c = hub.credits;
    props = {
      tilstand: "data",
      klipp: {
        total: c.monthlyCredits,
        igjen: c.creditsRemaining,
        pakke: pakkeNavn(c.monthlyCredits),
        fornyesTekst: c.renewsAtIso ? isoDagMnd(c.renewsAtIso) : null,
      },
      kommende: hub.upcoming.map(hubRad),
      tidligere: hub.past.map(hubRad),
      forsteLedige: hub.forsteLedige,
      coaches: hub.coaches,
      melding: betalt === "1" ? "betalt" : avbrutt === "1" ? "avbrutt" : null,
      tomForKlipp: c.monthlyCredits > 0 && c.creditsRemaining <= 0,
    };
  } catch {
    props = { tilstand: "feil", klipp: { total: 0, igjen: 0, pakke: null, fornyesTekst: null }, kommende: [], tidligere: [], forsteLedige: null, coaches: [], melding: null, tomForKlipp: false, feilKode: "FEIL 502 · BOOKING" };
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH23Hub {...props} />
    </PlayerHQSkall>
  );
}
