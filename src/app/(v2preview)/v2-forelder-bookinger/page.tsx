/**
 * v2-forhåndsvisning — Foreldreportal · Bookinger (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver forelder-layouten — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav med FORELDER_NAV), ForelderBookingerV2
 * rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/forelder/bookinger/page.tsx): kun PARENT slippes inn, barna hentes
 * via hentBarnForForelder, og bookingene splittes i kommende (PENDING/CONFIRMED,
 * frem i tid) + tidligere (passert ELLER COMPLETED/CANCELLED). Ingen fabrikerte
 * tall — tomt datasett gir ærlig tom-tilstand.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, ukenummer } from "@/lib/uke-helpers";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import {
  ForelderBookingerV2,
  type ForelderBookingerData,
  type ForelderBookingRad,
} from "@/components/portal/v2/ForelderBookingerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookinger · Foreldreportal (v2)" };

export default async function V2ForelderBookingerPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);
  const fornavnPerBarn = new Map(
    barn.map((b) => [b.child.id, b.child.name.split(" ")[0] ?? b.child.name]),
  );

  const now = new Date();

  let kommende: ForelderBookingRad[] = [];
  let tidligere: ForelderBookingRad[] = [];

  if (childIds.length > 0) {
    const [kommendeRad, tidligereRad] = await Promise.all([
      prisma.booking.findMany({
        where: {
          userId: { in: childIds },
          startAt: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        orderBy: { startAt: "asc" },
        take: 30,
        include: {
          serviceType: { select: { name: true, durationMin: true } },
          location: { select: { name: true } },
          coach: { select: { name: true } },
        },
      }),
      prisma.booking.findMany({
        where: {
          userId: { in: childIds },
          OR: [
            { startAt: { lt: now } },
            { status: { in: ["COMPLETED", "CANCELLED"] } },
          ],
        },
        orderBy: { startAt: "desc" },
        take: 20,
        include: {
          serviceType: { select: { name: true, durationMin: true } },
          location: { select: { name: true } },
          coach: { select: { name: true } },
        },
      }),
    ]);

    const tilRad = (
      b: (typeof kommendeRad)[number],
    ): ForelderBookingRad => ({
      id: b.id,
      startAt: b.startAt,
      serviceName: b.serviceType.name,
      durationMin: b.serviceType.durationMin,
      locationName: b.location.name,
      coachName: b.coach?.name ?? null,
      childName: b.userId ? (fornavnPerBarn.get(b.userId) ?? "—") : "—",
      status: b.status,
    });

    kommende = kommendeRad.map(tilRad);
    tidligere = tidligereRad.map(tilRad);
  }

  // Kommende bookinger innenfor inneværende uke (mandag–søndag).
  const ukeStart = startOfWeek(now);
  const ukeSlutt = endOfWeek(now);
  const denneUka = kommende.filter(
    (b) => b.startAt >= ukeStart && b.startAt <= ukeSlutt,
  ).length;

  const data: ForelderBookingerData = {
    antallBarn: childIds.length,
    visBarn: barn.length > 1,
    ukenummer: ukenummer(now),
    denneUka,
    kommende,
    tidligere,
  };

  return (
    <V2Shell
      aktiv="oversikt"
      nav={FORELDER_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderBookingerV2 data={data} />
    </V2Shell>
  );
}
