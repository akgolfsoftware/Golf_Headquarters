/**
 * Foreldreportal · /forelder/bookinger — mobil-first (430px).
 *
 * Lese-først innsyn i barnas bookede timer. Kommende og tidligere bookinger
 * hentes fra prisma.booking for alle koblede barn. Ingen handling på vegne av
 * barnet — booking gjøres av spilleren selv.
 *
 * Ekte data: prisma.parentRelation → barn → prisma.booking (serviceType,
 * location, coach). Tall og rader fra DB — aldri hardkodet. Tom DB → tomtilstand.
 * DS-tokens + athletic-primitiver. Ingen hex, ingen emoji (kun lucide).
 */

import {
  CalendarClock,
  CalendarDays,
  Clock3,
  History,
  MapPin,
  UserRound,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { ForelderHero } from "@/components/forelder/forelder-hero";
import { AthleticEyebrow, KpiCard, KpiStrip } from "@/components/athletic";
import type { BookingStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const NB_UKEDAG = new Intl.DateTimeFormat("nb-NO", { weekday: "short" });
const NB_DAG_MND = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});
const NB_TID = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
});

// Booking-status → pille (matcher faktura/booking-pillemønster i oversikt).
function statusPille(s: BookingStatus): { tekst: string; klasse: string } {
  if (s === "CONFIRMED")
    return { tekst: "Bekreftet", klasse: "bg-success/10 text-success" };
  if (s === "COMPLETED")
    return { tekst: "Fullført", klasse: "bg-secondary text-muted-foreground" };
  if (s === "CANCELLED")
    return { tekst: "Avlyst", klasse: "bg-destructive/10 text-destructive" };
  return { tekst: "Venter", klasse: "bg-warning/10 text-warning" };
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

  // Tomtilstand — ingen barn koblet.
  if (childIds.length === 0) {
    return (
      <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
        <ForelderHero
          eyebrow="Foreldreportal · Bookinger"
          titleLead="Kommende"
          titleItalic="og historikk"
          sub="Alle bookede timer for barna dine."
        />
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
  const neste = kommende[0] ?? null;

  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
      <ForelderHero
        eyebrow="Foreldreportal · Bookinger"
        titleLead="Kommende"
        titleItalic="og historikk"
        sub={
          barn.length === 1
            ? `Alle bookede timer for ${fornavnPerBarn.get(childIds[0])}.`
            : `Alle bookede timer for ${barn.length} barn.`
        }
      />

      {/* KPI */}
      <KpiStrip cols={3} className="gap-3">
        <KpiCard
          label="Kommende"
          value={kommende.length}
          unit="timer"
          size="md"
        />
        <KpiCard
          label="Neste"
          value={neste ? NB_UKEDAG.format(neste.startAt) : "—"}
          unit={neste ? NB_TID.format(neste.startAt) : undefined}
          size="md"
        />
        <KpiCard
          label="Tidligere"
          value={tidligere.length}
          unit="timer"
          size="md"
        />
      </KpiStrip>

      {/* Kommende */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <PanelHead
          icon={CalendarClock}
          label="KOMMENDE"
          antall={kommende.length}
        />
        {kommende.length === 0 ? (
          <TomtPanel
            icon={CalendarClock}
            tekst="Ingen kommende bookinger. Spilleren booker selv fra sin profil."
          />
        ) : (
          <ul className="divide-y divide-border">
            {kommende.map((b) => (
              <Rad key={b.id} b={b} visBarn={barn.length > 1} />
            ))}
          </ul>
        )}
      </section>

      {/* Tidligere */}
      {tidligere.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <PanelHead
            icon={History}
            label="TIDLIGERE"
            antall={tidligere.length}
          />
          <ul className="divide-y divide-border">
            {tidligere.map((b) => (
              <Rad key={b.id} b={b} visBarn={barn.length > 1} dempet />
            ))}
          </ul>
        </section>
      )}

      {/* Lesemodus-notis */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-card p-4">
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

// ── Panel-header (mono-caps + teller) ─────────────────────────────
function PanelHead({
  icon: Icon,
  label,
  antall,
}: {
  icon: typeof CalendarClock;
  label: string;
  antall: number;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <Icon
        className="h-3.5 w-3.5 text-muted-foreground"
        strokeWidth={2}
        aria-hidden
      />
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
        {label}
      </span>
      <span className="ml-auto font-mono text-[10px] font-bold tabular-nums text-muted-foreground">
        {antall}
      </span>
    </div>
  );
}

// ── Booking-rad — data-tett (Bloomberg-tetthet) ───────────────────
function Rad({
  b,
  visBarn,
  dempet,
}: {
  b: BookingRadData;
  visBarn: boolean;
  dempet?: boolean;
}) {
  const p = statusPille(b.status);
  return (
    <li className="grid grid-cols-[44px_1fr_auto] items-center gap-x-3 px-4 py-3">
      <div className={`font-mono leading-none ${dempet ? "opacity-60" : ""}`}>
        <div className="text-base font-extrabold tracking-[-0.02em] text-foreground">
          {NB_UKEDAG.format(b.startAt)}
        </div>
        <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          {NB_DAG_MND.format(b.startAt)}
        </div>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">
          {b.serviceName} · {b.durationMin} min
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10px] font-semibold tracking-[0.02em] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" strokeWidth={2} aria-hidden />
            {NB_TID.format(b.startAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" strokeWidth={2} aria-hidden />
            {b.locationName}
          </span>
          {visBarn && (
            <span className="inline-flex items-center gap-1">
              <UserRound className="h-3 w-3" strokeWidth={2} aria-hidden />
              {b.childName}
            </span>
          )}
          {b.coachName && <span>· {b.coachName.split(" ")[0]}</span>}
        </div>
      </div>
      <span
        className={`rounded-[4px] px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${p.klasse}`}
      >
        {p.tekst}
      </span>
    </li>
  );
}

// ── Tomt panel ────────────────────────────────────────────────────
function TomtPanel({
  icon: Icon,
  tekst,
}: {
  icon: typeof CalendarClock;
  tekst: string;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <Icon
        className="h-6 w-6 text-muted-foreground/40"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="mt-2.5 text-[13px] text-muted-foreground">{tekst}</p>
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
      <AthleticEyebrow className="mt-5 inline-block text-muted-foreground/70">
        Lesemodus
      </AthleticEyebrow>
    </div>
  );
}
