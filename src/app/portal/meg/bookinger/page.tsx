/**
 * PlayerHQ · Mine bookinger — B-pakke (v2 tokens + én primær CTA).
 */
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { BookingerTabs } from "./bookinger-tabs";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, CTAPill, Kort, StatusPill } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";

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
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Caps>Meg · Bookinger</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="timer">Dine</Tittel>
            </div>
          </div>
          <StatusPill tone={kommende.length > 0 ? "info" : "up"}>
            {kommende.length > 0 ? `${kommende.length} kommende` : "Ingen planlagt"}
          </StatusPill>
        </div>

        <Link href={nyBookingHref} style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon="calendar-plus" full>
            Ny booking
          </CTAPill>
        </Link>

        <Kort>
          <BookingerTabs
            kommende={kommende}
            historikk={historikk}
            nyBookingHref={nyBookingHref}
          />
        </Kort>
      </div>
    </V2Shell>
  );
}
