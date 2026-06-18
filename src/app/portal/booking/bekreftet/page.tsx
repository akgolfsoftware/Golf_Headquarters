import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, CalendarPlus } from "lucide-react";
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

// Avled initialer fra ekte navn (samme mønster som resten av appen).
function initialer(navn: string | null): string {
  if (!navn) return "AK";
  const deler = navn.trim().split(/\s+/);
  const first = deler[0]?.[0] ?? "";
  const last = deler.length > 1 ? (deler[deler.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "AK";
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
  });
  const klokkeslett = booking.startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const linje = `${booking.serviceType.name} · ${dato} · ${klokkeslett}`;

  const kalenderUrl = googleKalenderUrl(booking);

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-10 text-center">
      {/* Sentrert sjekk-sirkel */}
      <div className="mx-auto mb-[18px] grid h-16 w-16 place-items-center rounded-full bg-primary/10">
        <Check className="h-7 w-7 text-primary" strokeWidth={1.8} aria-hidden />
      </div>

      {/* Editorial header */}
      <h1 className="font-display text-[24px] font-bold leading-[1.05] -tracking-[0.03em] text-foreground">
        Forespørsel{" "}
        <em className="font-medium italic text-primary">sendt!</em>
      </h1>
      <p className="mx-auto mt-2 max-w-[18rem] font-sans text-[13.5px] leading-[1.55] text-muted-foreground">
        {linje}
      </p>

      {/* Coach-kort */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4 text-left shadow-[0_1px_2px_rgba(10,31,23,0.05)]">
        <div className="flex items-center gap-2.5">
          <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-primary font-mono text-[12px] font-bold text-accent">
            {initialer(coach?.name ?? null)}
          </span>
          <div className="min-w-0">
            <div className="truncate font-display text-[14px] font-bold text-foreground">
              {coach?.name ?? "AK Golf Academy"}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {booking.location.name} · {booking.serviceType.durationMin} min
            </div>
          </div>
        </div>
      </section>

      {/* Handlinger */}
      <div className="mt-[18px] flex flex-col gap-2 px-1">
        <a
          href={kalenderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-accent"
        >
          <CalendarPlus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Legg i kalender
        </a>
        <Link
          href="/portal/meg/bookinger"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-[1.5px] border-border bg-transparent px-6 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
        >
          Se alle bookinger
        </Link>
      </div>
    </div>
  );
}
