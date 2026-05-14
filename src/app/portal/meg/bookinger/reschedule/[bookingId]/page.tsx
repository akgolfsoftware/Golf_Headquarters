import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { getAvailableSlots } from "@/lib/booking/availability";
import { RescheduleDatoVelger } from "./reschedule-dato-velger";
import { RescheduleSlotPicker } from "./reschedule-slot-picker";

type Props = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ dato?: string }>;
};

export default async function ReschedulePage({ params, searchParams }: Props) {
  const { bookingId } = await params;
  const { dato: datoParam } = await searchParams;
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: {
        select: {
          id: true,
          slug: true,
          name: true,
          durationMin: true,
        },
      },
      location: { select: { name: true } },
    },
  });
  if (!booking) notFound();

  // Tilgang: egen booking eller staff
  const erStaff = user.role === "ADMIN" || user.role === "COACH";
  if (booking.userId !== user.id && !erStaff) notFound();

  // 24t-regel for spillere
  const tidTilStart = booking.startAt.getTime() - Date.now();
  if (!erStaff && tidTilStart <= 24 * 60 * 60 * 1000) {
    redirect("/portal/meg/bookinger?error=24t");
  }

  if (booking.status === "CANCELLED") {
    redirect("/portal/meg/bookinger?error=cancelled");
  }

  // Default dato: i morgen
  const valgtDato = parseDatoQuery(datoParam) ?? startOfDay(addDays(new Date(), 1));
  const slots = await getAvailableSlots(booking.serviceType.id, valgtDato);

  const naa = booking.startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const naaTid = booking.startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <Link
        href="/portal/meg/bookinger"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Tilbake til bookinger
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Bytt tid"
        titleLead="Bytt tid på"
        titleItalic={booking.serviceType.name}
        sub={`Nåværende: ${naa} kl ${naaTid}. Velg ny dato og tid under.`}
      />

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          1. Velg ny dato
        </h2>
        <div className="mt-4">
          <RescheduleDatoVelger
            valgtDato={valgtDato}
            bookingId={booking.id}
            dager={14}
          />
        </div>
      </section>

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          2. Velg tid
        </h2>
        <div className="mt-4">
          {slots.length === 0 ? (
            <div className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Ingen ledige tider på valgt dato. Prøv en annen dag.
            </div>
          ) : (
            <RescheduleSlotPicker
              bookingId={booking.id}
              slots={slots.map((s) => ({
                start: s.start.toISOString(),
                coachId: s.coachId,
                coachName: s.coachName,
              }))}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function parseDatoQuery(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return startOfDay(d);
}
