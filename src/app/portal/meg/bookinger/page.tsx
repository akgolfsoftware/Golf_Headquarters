import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { BookingerTabs } from "./bookinger-tabs";

export default async function MineBookinger() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { monthlyCredits: true },
  });
  const erAcademyKunde =
    subscription && subscription.monthlyCredits > 0 ? true : false;
  const nyBookingHref = erAcademyKunde ? "/portal/booking/ny" : "/booking";

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      serviceType: { select: { name: true, durationMin: true } },
      location: { select: { name: true } },
    },
    orderBy: { startAt: "desc" },
  });

  const idag = new Date();
  const kommende = bookings.filter(
    (b) =>
      b.startAt >= idag &&
      (b.status === "CONFIRMED" || b.status === "PENDING"),
  );
  const historikk = bookings.filter(
    (b) => b.startAt < idag || b.status === "CANCELLED",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Bookinger"
        titleLead="Dine"
        titleItalic="timer"
        titleTrail="og kvitteringer"
        sub="Kommende økter, tidligere besøk og avbestillingsmuligheter."
        actions={
          <Link
            href={nyBookingHref}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <CalendarPlus className="h-4 w-4" strokeWidth={1.75} />
            Ny booking
          </Link>
        }
      />

      <BookingerTabs
        kommende={kommende}
        historikk={historikk}
        nyBookingHref={nyBookingHref}
      />
    </div>
  );
}
