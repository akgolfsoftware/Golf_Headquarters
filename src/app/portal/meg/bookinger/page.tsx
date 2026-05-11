import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CancelButton } from "./cancel-button";

export default async function MineBookinger() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

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
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Mine bestillinger
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Booking</em>er
          </h1>
        </div>
        <Link
          href="/booking"
          className="rounded-md border border-input bg-card px-4 py-2 text-sm font-semibold hover:border-border"
        >
          + Ny booking
        </Link>
      </header>

      {bookings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          Du har ingen bookinger ennå.{" "}
          <Link href="/booking" className="text-primary underline">
            Book din første økt
          </Link>
          .
        </div>
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
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {booking.priceOre / 100} kr
          </span>
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
