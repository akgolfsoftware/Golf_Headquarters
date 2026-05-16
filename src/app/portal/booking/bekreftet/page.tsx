import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, CalendarPlus, ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ bookingId?: string }>;
};

function googleKalenderUrl(booking: {
  startAt: Date;
  endAt: Date;
  serviceType: { name: string };
  location: { name: string };
}): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `AK Golf — ${booking.serviceType.name}`,
    dates: `${fmt(booking.startAt)}/${fmt(booking.endAt)}`,
    location: booking.location.name,
    details: "Booking via AK Golf HQ",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function BekreftetPage({ searchParams }: Props) {
  const { bookingId } = await searchParams;

  if (!bookingId) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: {
        select: {
          id: true,
          name: true,
          durationMin: true,
          coachUserId: true,
        },
      },
      location: { select: { name: true } },
    },
  });

  if (!booking || booking.userId !== user.id) notFound();

  const coach = booking.serviceType.coachUserId
    ? await prisma.user.findUnique({
        where: { id: booking.serviceType.coachUserId },
        select: { name: true },
      })
    : null;

  const dato = booking.startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const klokkeslett = booking.startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const kalenderUrl = googleKalenderUrl(booking);

  return (
    <div className="mx-auto max-w-xl space-y-8 py-8">
      {/* Tilbake-lenke */}
      <Link
        href="/portal/meg/bookinger"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.75} />
        Mine bookinger
      </Link>

      {/* Hero-seksjon */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-8 py-12 text-center">
        <CheckCircle
          className="h-12 w-12 text-primary"
          strokeWidth={1.5}
        />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            <em className="font-normal italic text-primary">Økt bekreftet</em>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bookingen er registrert og trukket fra din månedssaldo.
          </p>
        </div>
      </div>

      {/* Detalj-kort */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Detaljer
        </h2>
        <dl className="mt-4 space-y-4 text-sm">
          <Rad label="Tjeneste" value={booking.serviceType.name} />
          {coach && <Rad label="Coach" value={coach.name} />}
          <Rad label="Dato" value={dato} />
          <Rad
            label="Klokkeslett"
            value={`${klokkeslett} (${booking.serviceType.durationMin} min)`}
          />
          <Rad label="Sted" value={booking.location.name} />
          <Rad label="Kostnad" value="1 credit" />
        </dl>
      </section>

      {/* Handlinger */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={kalenderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-input bg-card px-4 py-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
        >
          <CalendarPlus className="h-4 w-4" strokeWidth={1.75} />
          Legg til i Google Kalender
        </a>
        <Link
          href="/portal"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Tilbake til portalen
        </Link>
      </div>
    </div>
  );
}

function Rad({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/40 pb-4 last:border-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
