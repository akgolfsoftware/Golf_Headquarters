import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CancelButton } from "./cancel-button";

type Props = {
  searchParams: Promise<{ ny?: string }>;
};

export default async function MineBookinger({ searchParams }: Props) {
  const { ny } = await searchParams;
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
  const tidligere = bookings.filter(
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

      {ny === "1" && (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
          Bookingen din er bekreftet. Du finner den under «Kommende» nedenfor.
        </div>
      )}

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          titleItalic="Ingen bookinger"
          titleTrail="ennå"
          sub="Book din første økt med en av våre coacher — du finner tilgjengelige tider under Booking."
          cta={
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Book første økt
            </Link>
          }
        />
      ) : (
        <>
          {kommende.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">
                Kommende ({kommende.length})
              </h2>
              <ul className="space-y-3">
                {kommende.map((b) => (
                  <BookingRad key={b.id} booking={b} kommende />
                ))}
              </ul>
            </section>
          )}

          {tidligere.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">
                Tidligere ({tidligere.length})
              </h2>
              <ul className="space-y-3">
                {tidligere.slice(0, 20).map((b) => (
                  <BookingRad key={b.id} booking={b} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

type BookingRowData = {
  id: string;
  startAt: Date;
  status: string;
  priceOre: number;
  subscriptionId: string | null;
  serviceType: { name: string; durationMin: number };
  location: { name: string };
};

function BookingRad({
  booking,
  kommende,
}: {
  booking: BookingRowData;
  kommende?: boolean;
}) {
  const tidTilStart = booking.startAt.getTime() - Date.now();
  const kanRefunderes = tidTilStart > 24 * 60 * 60 * 1000;
  const kanAvbestille = booking.status !== "CANCELLED" && tidTilStart > 0;

  return (
    <li className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            {booking.serviceType.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.startAt.toLocaleDateString("nb-NO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            kl{" "}
            {booking.startAt.toLocaleTimeString("nb-NO", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {booking.serviceType.durationMin} min
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.location.name}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={booking.status} />
          {booking.subscriptionId ? (
            <span className="rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
              Abonnement
            </span>
          ) : (
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {booking.priceOre / 100} kr
            </span>
          )}
        </div>
      </div>

      {kommende && kanAvbestille && (
        <div className="mt-4 flex items-center gap-3 border-t border-border/50 pt-3">
          <CancelButton bookingId={booking.id} canRefund={kanRefunderes} />
          {!kanRefunderes && (
            <span className="text-xs text-muted-foreground">
              Mindre enn 24 t igjen — ingen refusjon.
            </span>
          )}
        </div>
      )}
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { tekst: string; klasser: string }> = {
    CONFIRMED: { tekst: "Bekreftet", klasser: "bg-primary/10 text-primary" },
    PENDING: { tekst: "Behandler", klasser: "bg-muted text-muted-foreground" },
    CANCELLED: {
      tekst: "Avbestilt",
      klasser: "bg-destructive/10 text-destructive",
    },
    COMPLETED: { tekst: "Gjennomført", klasser: "bg-muted text-foreground" },
  };
  const c = config[status] ?? config.PENDING;
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${c.klasser}`}
    >
      {c.tekst}
    </span>
  );
}
