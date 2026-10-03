/**
 * PH23BookingHub — bookingsoversikt i PlayerHQSkall.
 * Timer, kommende bookinger og første ledige luke. Selve bookingen skjer på /portal/booking/ny.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { getBookingHubData } from "@/lib/portal-booking/hub-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { BookingHubV2 } from "@/components/portal/v2/BookingHubV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AK Golf" };

type Props = { searchParams: Promise<{ betalt?: string; avbrutt?: string }> };

export default async function BookingHubPage({ searchParams }: Props) {
  const { betalt, avbrutt } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PARENT") redirect("/forelder");

  const [hub, ulest] = await Promise.all([
    getBookingHubData(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <BookingHubV2
          data={{
            credits: hub.credits,
            upcoming: hub.upcoming,
            coaches: hub.coaches,
            forsteLedige: hub.forsteLedige,
            melding: betalt === "1" ? "betalt" : avbrutt === "1" ? "avbrutt" : null,
          }}
        />
      </div>
    </PlayerHQSkall>
  );
}
