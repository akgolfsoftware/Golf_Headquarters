/**
 * PlayerHQ Booking — oversikt (/portal/booking). Train-lock
 * `BO-02 Mine bookinger.dc.html` (PX-6, 29.08.2026 — komponenten var
 * allerede TL.*-bygget, stale Paper-referanse i denne kommentaren rettet).
 * V2Shell leverer chrome-en, BookingHubV2 rendrer innholds-stacken.
 *
 * Ombygget 2026-08-04 (Anders' instruks): default-siden skal vise timer/
 * credits-status og kommende bookinger, ikke hoppe rett inn i en veiviser.
 * getBookingHubData (credits + upcoming + coacher) ble hentet her fra før,
 * men kun credits+coacher ble faktisk vist — upcoming/past var hentet og
 * aldri rendret. Bruker nå hele svaret, ingen ny query.
 *
 * Selve bookingen skjer på /portal/booking/ny (BookingNyV2) — den finnes
 * fra før og er credits-bevisst: med timer igjen brukes de, uten (eller med
 * ?betaling=1) betales timen per gang med kort — alt internt i appen.
 * Denne siden dupliserer ikke den logikken.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBookingHubData } from "@/lib/portal-booking/hub-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { BookingHubV2 } from "@/components/portal/v2/BookingHubV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AK Golf" };

type Props = { searchParams: Promise<{ betalt?: string; avbrutt?: string }> };

export default async function BookingHubPage({ searchParams }: Props) {
  const { betalt, avbrutt } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
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
          melding: betalt === "1" ? "betalt" : avbrutt === "1" ? "avbrutt" : null,
        }}
      />
    </V2Shell>
  );
}
