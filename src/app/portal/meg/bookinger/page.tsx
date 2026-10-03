/**
 * PH23MineTimer — mine bookinger i PlayerHQSkall.
 * Samme bookinger, byttefeil og vei til ny booking.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { StatusPille } from "@/components/precision/pa";
import { BookingerTabs } from "./bookinger-tabs";

const BYTT_FEIL_TEKST: Record<string, string> = {
  "24t": "Kunne ikke bytte tid — det er under 24 timer til start, og bytting er da stengt.",
  cancelled: "Denne bookingen er kansellert og kan ikke lenger byttes.",
};

export default async function MineBookinger({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN", allow: ["PLAYER", "COACH", "ADMIN"] });
  const { error } = await searchParams;
  const feilTekst = error ? BYTT_FEIL_TEKST[error] : undefined;
  const nyBookingHref = "/portal/booking/ny";

  const [bookings, ulest] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        serviceType: { select: { name: true, durationMin: true } },
        location: { select: { name: true } },
      },
      orderBy: { startAt: "desc" },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  const idag = new Date();
  const kommende = bookings.filter(
    (b) => b.startAt >= idag && (b.status === "CONFIRMED" || b.status === "PENDING"),
  );
  const historikk = bookings.filter((b) => b.startAt < idag || b.status === "CANCELLED");

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side ph23t">
        <header>
          <div>
            <p>Meg · Bookinger</p>
            <h1>Dine timer</h1>
          </div>
          <StatusPille tone={kommende.length > 0 ? "neutral" : "ok"}>
            {kommende.length > 0 ? `${kommende.length} kommende` : "Ingen planlagt"}
          </StatusPille>
        </header>
        {feilTekst && <p className="ph23t-feil" role="alert">Kunne ikke bytte. {feilTekst}</p>}
        <Link href={nyBookingHref} className="pa-btn pa-btn--primary pa-btn--full">Ny booking</Link>
        <section className="pa-card ph23t-kort">
          <BookingerTabs kommende={kommende} historikk={historikk} nyBookingHref={nyBookingHref} />
        </section>
      </div>
    </PlayerHQSkall>
  );
}
