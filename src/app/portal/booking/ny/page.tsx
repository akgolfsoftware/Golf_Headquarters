/**
 * Booking (/portal/booking/ny) — Precision Athletics PH-23 (Claude Design 7d7c2994).
 * Samme adressestyrte steg (?service=&dato=&betaling=) og samme server-logikk som før
 * (guards, queries, getAvailableSlots); kun visningen er ny (PH23Ny).
 * Forelder-veiviseren deler `byggBookingNyData`, men har egen visning.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { byggBookingNyData } from "@/lib/portal-booking/ny-wizard-data";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { osloDager } from "@/lib/portal-booking/ph23-visning";
import { PH23Skall } from "@/components/portal/precision/PH23Skall";
import { PH23IngenTjenester, PH23Ny } from "@/components/portal/precision/PH23Booking";

type Props = {
  searchParams: Promise<{ dato?: string; service?: string; betaling?: string }>;
};

export default async function NyBookingPage({ searchParams }: Props) {
  const { dato, service, betaling } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });

  const resultat = await byggBookingNyData({
    eierId: user.id,
    eierTier: user.tier,
    wizardBase: "/portal/booking/ny",
    dato,
    service,
    betaling,
  });

  if (resultat.ingenTjenester) {
    return <PH23Skall userId={user.id}><PH23IngenTjenester /></PH23Skall>;
  }

  const d = resultat.data;
  return (
    <PH23Skall userId={user.id}>
      <PH23Ny
        data={d}
        dager={osloDager(14)}
        klipp={{ pakke: pakkeNavn(d.monthlyCredits), igjen: d.creditsRemaining, total: d.monthlyCredits, fornyes: d.fornyerLabel }}
      />
    </PH23Skall>
  );
}
