/**
 * v2-forhåndsvisning — PlayerHQ Booking (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), BookingV2 rendrer innholds-stacken.
 *
 * Auth + kjernedata gjenbrukt fra den ekte booking-hub-siden
 * (getBookingHubData → coacher + abonnement). I tillegg hentes aktive
 * tjenester (ServiceType), lokasjoner og et EKTE slot-vindu for
 * default-tjenesten via availability-engine — samme kilde som /ny-wizarden.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getBookingHubData } from "@/lib/portal-booking/hub-data";
import { beregnSlotVindu } from "@/lib/portal-booking/slot-vindu";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { BookingV2, type BookingTjeneste, type BookingV2Data } from "@/components/portal/v2/BookingV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book økt · AK Golf (v2)" };

/** Speiler credit-booking.ts: trackman → Mulligan, ellers Gamle Fredrikstad GK. */
function resolverSted(slug: string, lokasjoner: { name: string }[]): string | null {
  const navn = slug.includes("trackman") ? "Mulligan Indoor Golf" : "Gamle Fredrikstad GK";
  const treff = lokasjoner.find((l) => l.name.toLowerCase().includes(navn.toLowerCase()));
  return treff?.name ?? lokasjoner[0]?.name ?? null;
}

export default async function V2BookingPreviewPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PARENT") redirect("/forelder");

  const [hub, services, lokasjoner] = await Promise.all([
    getBookingHubData(user.id),
    prisma.serviceType.findMany({ where: { active: true }, orderBy: { durationMin: "asc" } }),
    prisma.location.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  const tjenester: BookingTjeneste[] = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    navn: s.name,
    varighetMin: s.durationMin,
    prisOre: s.priceOre,
    beskrivelse: s.description,
    stedNavn: resolverSted(s.slug, lokasjoner),
    betalesMedCredit: s.priceOre === 0,
  }));

  // Ekte slot-vindu for default-tjenesten (tjenester[0]). Tom hvis ingen tjenester.
  const vindu = tjenester[0]
    ? await beregnSlotVindu(tjenester[0].id)
    : { tjenesteId: "", dager: [] };

  const data: BookingV2Data = {
    tjenester,
    coacher: hub.coaches.map((c) => ({
      id: c.id,
      navn: c.name,
      initialer: c.initials,
      antallTjenester: c.serviceCount,
      fraPris: c.fromPrice,
    })),
    credits: {
      tier: hub.credits.tier,
      monthlyCredits: hub.credits.monthlyCredits,
      creditsRemaining: hub.credits.creditsRemaining,
      canUseCredits: hub.credits.canUseCredits,
    },
    vindu,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name}>
      <BookingV2 data={data} />
    </V2Shell>
  );
}
