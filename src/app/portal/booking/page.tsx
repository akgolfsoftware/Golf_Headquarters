/**
 * PlayerHQ Booking, oversikt (/portal/booking) — Precision Athletics PH-23
 * (Claude Design 7d7c2994). Data, tilgang og retur fra Stripe er uendret;
 * visningen er PH23Hub. Selve bookingen skjer på /portal/booking/ny.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { datoKort } from "@/lib/portal-booking/ph23-visning";
import { getBookingHubData } from "@/lib/portal-booking/hub-data";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { PH23Skall } from "@/components/portal/precision/PH23Skall";
import { PH23Hub } from "@/components/portal/precision/PH23Booking";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AK Golf" };

type Props = { searchParams: Promise<{ betalt?: string; avbrutt?: string }> };

export default async function BookingHubPage({ searchParams }: Props) {
  const { betalt, avbrutt } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PARENT") redirect("/forelder");

  const hub = await getBookingHubData(user.id);

  const fornyes = hub.credits.renewsAtIso ? datoKort(hub.credits.renewsAtIso) : null;

  return (
    <PH23Skall userId={user.id}>
      <PH23Hub
        klipp={{
          pakke: pakkeNavn(hub.credits.monthlyCredits),
          igjen: hub.credits.creditsRemaining,
          total: hub.credits.monthlyCredits,
          fornyes,
        }}
        credits={hub.credits}
        upcoming={hub.upcoming}
        forsteLedige={hub.forsteLedige}
        melding={betalt === "1" ? "betalt" : avbrutt === "1" ? "avbrutt" : null}
      />
    </PH23Skall>
  );
}
