import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PendingRefresh } from "./pending-refresh";

export const metadata: Metadata = {
  title: "Bekreftet — AK Golf",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ bookingId: string }>;
};

export default async function Kvittering({ params }: Props) {
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: true,
      location: true,
    },
  });

  if (!booking) notFound();

  const dato = booking.startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });
  const tid = booking.startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });

  const bekreftet = booking.status === "CONFIRMED";

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          {bekreftet ? (
            <>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Bekreftet
              </span>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                <em className="font-normal italic text-primary">Takk</em> for bestillingen
              </h1>
              <p className="mt-4 text-base text-muted-foreground">
                Vi har sendt bekreftelse til{" "}
                <strong className="text-foreground">
                  {booking.guestEmail ?? "din e-post"}
                </strong>
                . Vi gleder oss til å se deg!
              </p>
            </>
          ) : (
            <>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Behandler
              </span>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Behandler bestillingen…
              </h1>
              <p className="mt-4 text-base text-muted-foreground">
                Betalingen ser ut til å gå gjennom. Siden oppdaterer seg
                automatisk.
              </p>
              <div className="mt-4">
                <PendingRefresh />
              </div>
            </>
          )}
        </div>

        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Detaljer</h2>
          <dl className="mt-4 grid gap-4 text-sm">
            <Rad label="Bestilling" value={`#${booking.id.slice(-8)}`} />
            <Rad label="Tjeneste" value={booking.serviceType.name} />
            <Rad label="Dato" value={dato} />
            <Rad
              label="Klokkeslett"
              value={`${tid} (${booking.serviceType.durationMin} min)`}
            />
            <Rad label="Sted" value={booking.location.name} />
            <Rad label="Pris" value={new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(booking.priceOre / 100)} bold />
          </dl>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/portal/meg/bookinger"
            className="rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Mine bestillinger
          </Link>
          <Link
            href="/booking"
            className="rounded-full border border-input bg-card px-6 py-4 text-sm font-semibold hover:border-border"
          >
            Book en til
          </Link>
        </div>
      </div>
    </div>
  );
}

function Rad({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 pb-2 last:border-b-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className={bold ? "font-display text-xl font-semibold tabular-nums" : "text-foreground"}>
        {value}
      </dd>
    </div>
  );
}
