/**
 * /admin/bookinger — pixel-perfekt PR5.
 *
 * Filter-strip + stat-strip + sortable liste over alle bookinger.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { BookingerView, type BookingRow } from "@/components/admin-bookinger-v2/bookinger-view";

export const dynamic = "force-dynamic";

const DEMO_BOOKINGER: BookingRow[] = (() => {
  const idag = new Date();
  return [
    { id: "d1", startTime: new Date(idag.getTime() + 86400000 * 1).toISOString(), spillerNavn: "Markus R-P", type: "Privattime 60 min", coachNavn: "Anders K", status: "CONFIRMED", prisOre: 95000, betalt: true },
    { id: "d2", startTime: new Date(idag.getTime() + 86400000 * 2).toISOString(), spillerNavn: "Thea L", type: "TrackMan-økt", coachNavn: "Anders K", status: "PENDING", prisOre: 75000, betalt: false },
    { id: "d3", startTime: new Date(idag.getTime() + 86400000 * 3).toISOString(), spillerNavn: "Oliver K", type: "Banespill 9 hull", coachNavn: "Anders K", status: "CONFIRMED", prisOre: 110000, betalt: true },
    { id: "d4", startTime: new Date(idag.getTime() - 86400000 * 1).toISOString(), spillerNavn: "Emma S", type: "Privattime 60 min", coachNavn: "Anders K", status: "CANCELLED", prisOre: 95000, betalt: true },
    { id: "d5", startTime: new Date(idag.getTime() + 86400000 * 5).toISOString(), spillerNavn: "Noah B", type: "Junior-gruppe", coachNavn: "Anders K", status: "CONFIRMED", prisOre: 45000, betalt: true },
    { id: "d6", startTime: new Date(idag.getTime() + 86400000 * 0.5).toISOString(), spillerNavn: "Sofia H", type: "FYS-økt", coachNavn: "Anders K", status: "PENDING", prisOre: 65000, betalt: false },
    { id: "d7", startTime: new Date(idag.getTime() + 86400000 * 4).toISOString(), spillerNavn: "Lucas A", type: "Privattime 60 min", coachNavn: "Anders K", status: "CANCELLED", prisOre: 95000, betalt: false },
    { id: "d8", startTime: new Date(idag.getTime() + 86400000 * 7).toISOString(), spillerNavn: "Iben M", type: "TrackMan-økt", coachNavn: "Anders K", status: "CONFIRMED", prisOre: 75000, betalt: true },
  ];
})();

export default async function BookingerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const fra = new Date();
  fra.setDate(fra.getDate() - 90);
  const til = new Date();
  til.setDate(til.getDate() + 60);

  const dbBookinger = await prisma.booking.findMany({
    where: { startAt: { gte: fra, lt: til } },
    include: {
      user: { select: { name: true } },
      serviceType: { select: { name: true } },
      payments: { select: { status: true } },
    },
    orderBy: { startAt: "desc" },
    take: 200,
  });

  const bookinger: BookingRow[] = dbBookinger.map((b) => {
    const betalt = b.payments.some((p) => p.status === "SUCCEEDED");
    const mappedStatus: BookingRow["status"] =
      b.status === "COMPLETED" ? "CONFIRMED" : (b.status as BookingRow["status"]);
    return {
      id: b.id,
      startTime: b.startAt.toISOString(),
      spillerNavn: b.user?.name ?? b.guestName ?? "Gjest",
      type: b.serviceType?.name ?? "Ukjent",
      coachNavn: "Anders K",
      status: mappedStatus,
      prisOre: b.priceOre,
      betalt: betalt || b.priceOre === 0,
    };
  });

  const visBookinger = bookinger.length > 0 ? bookinger : DEMO_BOOKINGER;
  const coachListe = [{ id: "anders", navn: "Anders K" }];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Gjennomføre · Bookinger"
        titleLead="Alle"
        titleItalic="bookinger"
        sub={`${visBookinger.length} bookinger siste 90 dager + 60 dager frem`}
      />
      <BookingerView bookinger={visBookinger} coachListe={coachListe} />
    </div>
  );
}
