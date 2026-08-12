/**
 * PlayerHQ Booking — oversikt (/portal/booking). v2, Paper-fasit
 * playerhq-booking.html. V2Shell leverer chrome-en, BookingHubV2 rendrer
 * innholds-stacken.
 *
 * Ombygget 2026-08-04 (Anders' instruks): default-siden skal vise timer/
 * credits-status og kommende bookinger, ikke hoppe rett inn i en veiviser.
 * getBookingHubData (credits + upcoming + coacher) ble hentet her fra før,
 * men kun credits+coacher ble faktisk vist — upcoming/past var hentet og
 * aldri rendret. Bruker nå hele svaret, ingen ny query.
 *
 * Selve bookingen skjer på /portal/booking/ny (BookingNyV2) — den finnes
 * fra før, er credits-bevisst (redirecter GRATIS-brukere til /coaching,
 * håndterer brukt-opp-tilstand med drop-in-betaling via /booking). Denne
 * siden dupliserer ikke den logikken.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBookingHubData } from "@/lib/portal-booking/hub-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { BookingHubV2 } from "@/components/portal/v2/BookingHubV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AK Golf" };

export default async function BookingHubPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PARENT") redirect("/forelder");

  const hub = await getBookingHubData(user.id);

  return (
    <V2Shell aktiv="plan" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name}>
      <BookingHubV2
        data={{
          credits: hub.credits,
          upcoming: hub.upcoming,
          coaches: hub.coaches,
          forsteLedige: hub.forsteLedige,
        }}
      />
    </V2Shell>
  );
}
