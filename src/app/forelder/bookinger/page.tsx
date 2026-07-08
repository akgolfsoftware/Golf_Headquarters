/**
 * Foreldreportal · /forelder/bookinger — mobil-first (430px).
 *
 * Hybrid design: editorial H1 + mini week grid + kommende bookinger som cards.
 * Lese-først innsyn i barnas bookede timer. Ingen handling på vegne av barnet.
 *
 * Ekte data: prisma.parentRelation → barn → prisma.booking (serviceType,
 * location, coach). Tall og rader fra DB — aldri hardkodet. Tom DB → tomtilstand.
 * DS-tokens + athletic-primitiver. Ingen hex, ingen emoji (kun lucide).
 */

import { Eyebrow } from "@/components/athletic/golfdata";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const NB_MND_LANG = new Intl.DateTimeFormat("nb-NO", { month: "long", year: "numeric" });
const NB_MND_KORT = new Intl.DateTimeFormat("nb-NO", { month: "short" });
const NB_TID = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" });

const UKEDAGER_KORT = ["ma", "ti", "on", "to", "fr", "lø", "sø"];

function statusPille(s: BookingStatus): { tekst: string; klasse: string } {
  if (s === "CONFIRMED") return { tekst: "Bekreftet", klasse: "bg-success/10 text-success" };
  if (s === "COMPLETED") return { tekst: "Fullført", klasse: "bg-secondary text-muted-foreground" };
  if (s === "CANCELLED") return { tekst: "Avlyst", klasse: "bg-destructive/10 text-destructive" };
  return { tekst: "Planlagt", klasse: "bg-secondary text-muted-foreground" };
}

type BookingRadData = {
  id: string;
  startAt: Date;
  serviceName: string;
  durationMin: number;
  locationName: string;
  coachName: string | null;
  childName: string;
  status: BookingStatus;
};

export default async function ForelderBookinger() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);
  const fornavnPerBarn = new Map(
    barn.map((b) => [b.child.id, b.child.name.split(" ")[0] ?? b.child.name]),
  );

  if (childIds.length === 0) {
    return (
      <div className="mx-auto max-w-[480px] space-y-4 px-4 pb-24 pt-6">
        <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-foreground">
          Bookinger &amp;{" "}
          <em className="italic font-medium text-primary not-italic">øktplan</em>
        </h1>
        <IngenBarn />
      </div>
    );
  }

  const now = new Date();

  const [kommendeRad, tidligereRad] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId: { in: childIds },
        startAt: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { startAt: "asc" },
      take: 30,
      include: {
        serviceType: { select: { name: true, durationMin: true } },
        location: { select: { name: true } },
        coach: { select: { name: true } },
      },
    }),
    prisma.booking.findMany({
      where: {
        userId: { in: childIds },
        OR: [
          { startAt: { lt: now } },
          { status: { in: ["COMPLETED", "CANCELLED"] } },
        ],
      },
      orderBy: { startAt: "desc" },
      take: 20,
      include: {
        serviceType: { select: { name: true, durationMin: true } },
        location: { select: { name: true } },
        coach: { select: { name: true } },
      },
    }),
  ]);

  const tilRad = (b: (typeof kommendeRad)[number]): BookingRadData => ({
    id: b.id,
    startAt: b.startAt,
    serviceName: b.serviceType.name,
    durationMin: b.serviceType.durationMin,
    locationName: b.location.name,
    coachName: b.coach?.name ?? null,
    childName: b.userId ? (fornavnPerBarn.get(b.userId) ?? "—") : "—",
    status: b.status,
  });

  const kommende = kommendeRad.map(tilRad);
  const tidligere = tidligereRad.map(tilRad);

  // Current week (Monday–Sunday)
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const bookingDays = new Set<number>(
    kommende
      .filter((b) => b.startAt >= weekStart && b.startAt < weekEnd)
      .map((b) => b.startAt.getDate()),
  );

  const mndLabel = NB_MND_LANG.format(now);
  const mndCapitalized = mndLabel.charAt(0).toUpperCase() + mndLabel.slice(1);

  return (
    <div className="mx-auto max-w-[480px] space-y-4 px-4 pb-24 pt-6">
      {/* Editorial H1 */}
      <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-foreground">
        Bookinger &amp;{" "}
        <em className="not-italic italic font-medium text-primary">øktplan</em>
      </h1>

      {/* Mini week grid card */}
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
        {/* Month header */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-[14px] font-bold text-foreground">
            {mndCapitalized}
          </span>
          <div className="flex items-center gap-1">
            <div className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground">
              <ChevronLeft className="h-3 w-3" strokeWidth={2} aria-hidden />
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground">
              <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden />
            </div>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {UKEDAGER_KORT.map((dag) => (
            <div
              key={dag}
              className="flex items-center justify-center font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
            >
              {dag}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const isToday =
              d.getDate() === now.getDate() &&
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear();
            const hasBooking = bookingDays.has(d.getDate());

            let cellClass =
              "relative flex aspect-square flex-col items-center justify-center rounded border font-mono text-[12px] font-bold";

            if (isToday) {
              cellClass += " bg-primary text-accent border-primary";
            } else {
              cellClass += " border-border text-foreground";
            }

            return (
              <div key={d.toISOString()} className={cellClass}>
                {d.getDate()}
                {hasBooking && (
                  <span
                    className={`absolute bottom-[3px] h-[4px] w-[4px] rounded-full ${
                      isToday ? "bg-accent" : "bg-primary"
                    }`}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-[6px] w-[6px] rounded-full bg-primary" aria-hidden />
            <span className="font-mono text-[9px] text-muted-foreground">Økt/coaching</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-[6px] w-[6px] rounded-full bg-accent" aria-hidden />
            <span className="font-mono text-[9px] text-muted-foreground">Turnering</span>
          </div>
        </div>
      </div>

      {/* Kommende bookinger */}
      <div className="font-mono text-[9.5px] font-bold tracking-[0.10em] uppercase text-muted-foreground mt-2">
        Kommende bookinger
      </div>

      {kommende.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center">
          <CalendarDays
            className="h-6 w-6 text-muted-foreground/40"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="mt-2.5 text-[13px] text-muted-foreground">
            Ingen kommende bookinger. Spilleren booker selv fra sin profil.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {kommende.map((b) => (
            <BookingCard key={b.id} b={b} visBarn={barn.length > 1} />
          ))}
        </div>
      )}

      {/* Tidligere bookinger */}
      {tidligere.length > 0 && (
        <>
          <div className="font-mono text-[9.5px] font-bold tracking-[0.10em] uppercase text-muted-foreground mt-4">
            Tidligere bookinger
          </div>
          <div className="space-y-2">
            {tidligere.map((b) => (
              <BookingCard key={b.id} b={b} visBarn={barn.length > 1} dempet />
            ))}
          </div>
        </>
      )}

      {/* Lesemodus-notis */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-card p-4 mt-2">
        <CalendarDays
          className="h-4 w-4 shrink-0 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Foreldre-portalen er kun for innsyn. Booking og avbestilling gjøres av
          spilleren selv fra sin profil.
        </p>
      </div>
    </div>
  );
}

// ── Booking card ───────────────────────────────────────────────────
function BookingCard({
  b,
  visBarn,
  dempet,
}: {
  b: BookingRadData;
  visBarn: boolean;
  dempet?: boolean;
}) {
  const p = statusPille(b.status);
  const dag = b.startAt.getDate();
  const mnd = NB_MND_KORT.format(b.startAt).replace(".", "").toLowerCase();
  const tid = NB_TID.format(b.startAt);

  const isConfirmed = b.status === "CONFIRMED";

  const dateBgClass = isConfirmed
    ? "bg-primary"
    : "bg-secondary";
  const dayTextClass = isConfirmed ? "text-accent" : "text-muted-foreground";
  const mndTextClass = isConfirmed ? "text-accent/70" : "text-muted-foreground";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3.5 ${dempet ? "opacity-60" : ""}`}
    >
      {/* Date box */}
      <div
        className={`flex h-[42px] w-[42px] shrink-0 flex-col items-center justify-center rounded-lg ${dateBgClass}`}
      >
        <span className={`font-mono text-[14px] font-bold leading-none ${dayTextClass}`}>
          {dag}
        </span>
        <span className={`font-mono text-[8px] font-semibold uppercase leading-none mt-0.5 ${mndTextClass}`}>
          {mnd}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-bold tracking-[-0.005em] text-foreground">
          {b.serviceName}
        </div>
        <div className="mt-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
          {b.locationName} · {tid}
          {visBarn && ` · ${b.childName}`}
          {b.coachName && ` · ${b.coachName.split(" ")[0]}`}
        </div>
      </div>

      {/* Status pill */}
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] ${p.klasse}`}
      >
        {p.tekst}
      </span>
    </div>
  );
}

// ── Ingen barn koblet ─────────────────────────────────────────────
function IngenBarn() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <CalendarDays className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-4 font-display text-[16px] font-semibold -tracking-[0.01em] text-foreground">
        Ingen barn koblet til kontoen din
      </p>
      <p className="mt-1.5 font-sans text-[13.5px] leading-[1.5] text-muted-foreground">
        Be spilleren sende en invitasjon, eller kontakt coachen din.
      </p>
      <Eyebrow as="span" className="mt-5 inline-block text-muted-foreground/70">
        Lesemodus
      </Eyebrow>
    </div>
  );
}
