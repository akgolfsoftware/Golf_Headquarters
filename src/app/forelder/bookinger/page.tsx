// Foreldreportal — Bookinger. Kommende + historikk for alle koblede barn.
// Mock-data i versjon 1 — kobles til Prisma booking-modell i neste sprint.

import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ForelderHero } from "@/components/forelder/forelder-hero";

export const dynamic = "force-dynamic";

type MockBooking = {
  id: string;
  barn: string;
  coach: string;
  type: string;
  dato: string;
  klokkeslett: string;
  lokasjon: string;
  status: "kommende" | "fullfort" | "avlyst";
};

const MOCK_BOOKINGER: MockBooking[] = [
  {
    id: "b1",
    barn: "Markus Kristiansen",
    coach: "Markus R.P.",
    type: "Performance-økt",
    dato: "28. mai 2026",
    klokkeslett: "15:00 – 16:00",
    lokasjon: "Performance Studio, GFGK",
    status: "kommende",
  },
  {
    id: "b2",
    barn: "Markus Kristiansen",
    coach: "Markus R.P.",
    type: "Putting-lab",
    dato: "21. mai 2026",
    klokkeslett: "14:00 – 14:45",
    lokasjon: "Mulligan Indoor, Fredrikstad",
    status: "fullfort",
  },
  {
    id: "b3",
    barn: "Markus Kristiansen",
    coach: "Markus R.P.",
    type: "Driver-økt",
    dato: "14. mai 2026",
    klokkeslett: "10:00 – 11:00",
    lokasjon: "Driving Range, GFGK",
    status: "fullfort",
  },
  {
    id: "b4",
    barn: "Markus Kristiansen",
    coach: "Markus R.P.",
    type: "Kort spill",
    dato: "7. mai 2026",
    klokkeslett: "16:00 – 17:00",
    lokasjon: "Short Game Area, GFGK",
    status: "avlyst",
  },
];

const kommende = MOCK_BOOKINGER.filter((b) => b.status === "kommende");
const historikk = MOCK_BOOKINGER.filter((b) => b.status !== "kommende");

function StatusBadge({ status }: { status: MockBooking["status"] }) {
  if (status === "kommende") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
        <Circle className="h-2 w-2 fill-primary" strokeWidth={0} aria-hidden />
        Kommende
      </span>
    );
  }
  if (status === "fullfort") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} aria-hidden />
        Fullfort
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
      Avlyst
    </span>
  );
}

function BookingCard({ booking }: { booking: MockBooking }) {
  return (
    <li className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {booking.barn}
          </div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            {booking.type}
          </h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{booking.dato}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{booking.klokkeslett}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{booking.coach}</span>
        </div>
        <div className="flex items-center gap-2 col-span-full text-muted-foreground sm:col-span-3">
          <MapPin className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{booking.lokasjon}</span>
        </div>
      </dl>
    </li>
  );
}

export default async function ForelderBookinger() {
  await requirePortalUser({ allow: ["PARENT"] });

  return (
    <div className="space-y-8">
      <ForelderHero
        eyebrow="Foreldreportal · Bookinger"
        titleLead="Kommende"
        titleItalic="og historikk"
        sub="Alle bookte timer for barna dine — kommende og tidligere."
      />

      {/* Kommende */}
      <section aria-labelledby="kommende-overskrift">
        <h2
          id="kommende-overskrift"
          className="mb-4 font-display text-xl font-semibold tracking-tight"
        >
          Kommende{" "}
          <em className="font-normal italic text-muted-foreground">
            · {kommende.length}
          </em>
        </h2>
        {kommende.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-8 text-sm text-muted-foreground">
            Ingen kommende timer registrert.
          </div>
        ) : (
          <ul className="space-y-4">
            {kommende.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </ul>
        )}
      </section>

      {/* Historikk */}
      <section aria-labelledby="historikk-overskrift">
        <h2
          id="historikk-overskrift"
          className="mb-4 font-display text-xl font-semibold tracking-tight"
        >
          Historikk{" "}
          <em className="font-normal italic text-muted-foreground">
            · {historikk.length}
          </em>
        </h2>
        {historikk.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-8 text-sm text-muted-foreground">
            Ingen tidligere timer.
          </div>
        ) : (
          <ul className="space-y-4">
            {historikk.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
