/**
 * Book time, steg 3: bekreft (/portal/booking/ny/bekreft) — Precision Athletics PH-23
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-23.jsx).
 *
 * Samme guards, queries og ledig-sjekk (isSlotStillAvailable) som før i byggBookingBekreftData.
 * URL-kontrakten ?service=&start=&coach=&betaling= er uendret. Klipp trekkes atomisk av
 * createCreditBooking; kort går via Stripe Checkout, og webhooken bekrefter.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { byggBookingBekreftData } from "@/lib/portal-booking/bekreft-data";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { prisma } from "@/lib/prisma";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Bekreft } from "@/components/portal/precision/PH23Booking";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bekreft booking · PlayerHQ" };

type Props = {
  searchParams: Promise<{ service?: string; start?: string; coach?: string; betaling?: string }>;
};

export default async function BekreftCreditBookingPage({ searchParams }: Props) {
  const { service: serviceSlug, start, coach: coachId, betaling } = await searchParams;
  if (!serviceSlug || !start || !coachId) notFound();

  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });

  const resultat = await byggBookingBekreftData({
    eierId: user.id,
    wizardBase: "/portal/booking/ny",
    bekreftetBase: "/portal/booking/bekreftet",
    serviceSlug,
    start,
    coachId,
    betaling,
  });

  if (resultat.status === "krever_credits_redirect") redirect("/portal/booking/ny");
  if (resultat.status === "ikke_funnet") notFound();

  const [uleste, abo] = await Promise.all([
    hentUleste(user.id),
    prisma.subscription.findUnique({ where: { userId_kind: { userId: user.id, kind: "COACHING" } }, select: { monthlyCredits: true, creditsRemaining: true } }),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH23Bekreft
        data={resultat.data}
        klipp={{ total: abo?.monthlyCredits ?? 0, igjen: abo?.creditsRemaining ?? 0, pakke: pakkeNavn(abo?.monthlyCredits ?? 0), fornyesTekst: null }}
      />
    </PlayerHQSkall>
  );
}
