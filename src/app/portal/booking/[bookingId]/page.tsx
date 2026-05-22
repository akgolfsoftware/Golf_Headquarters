/**
 * PlayerHQ · Økt-detalj (planlagt booking)
 *
 * Implementert fra Økt-detalj planlagt.html (Bundle 3).
 * Viser detaljer om en planlagt økt med tidslinje, mål og utstyr.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  ChevronLeft,
  MapPin,
  Clock,
  User,
  Calendar,
  Check,
  Target,
  Package,
} from "lucide-react";
import "@/components/booking/booking.css";

type Props = {
  params: Promise<{ bookingId: string }>;
};

// Deterministisk hash for å unngå Math.random i render
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

function formatTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function OktDetalj({ params }: Props) {
  const { bookingId } = await params;
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: true,
      location: true,
    },
  });

  if (!booking || booking.userId !== user.id) notFound();

  const coach =
    booking.serviceType.coachUserId
      ? await prisma.user.findUnique({
          where: { id: booking.serviceType.coachUserId },
          select: { name: true },
        })
      : null;

  const dato = formatDato(booking.startAt);
  const startTid = formatTid(booking.startAt);
  const sluttTid = formatTid(booking.endAt);

  // Deterministisk "status" basert på bookingId (unngår Math.random)
  const h = hashId(bookingId);
  const statusOk = h % 3 !== 0;

  // Generer timeline-punkter
  const TIMELINE: { tid: string; tittel: string; meta: string; varig: string }[] = [
    {
      tid: startTid,
      tittel: "Innsjekk + oppvarming",
      meta: "Kort oppsummering av siste TrackMan-data",
      varig: "5 min",
    },
    {
      tid: formatTid(new Date(booking.startAt.getTime() + 5 * 60_000)),
      tittel: "Teknisk arbeid",
      meta: "Fokus på dagens prioritet",
      varig: `${Math.max(5, booking.serviceType.durationMin - 10)} min`,
    },
    {
      tid: formatTid(new Date(booking.startAt.getTime() + (booking.serviceType.durationMin - 5) * 60_000)),
      tittel: "Gjennomgang + hjemmelekse",
      meta: "Konkret drill + neste steg",
      varig: "5 min",
    },
  ];

  const MAL = [
    "Forbedre kontaktkvalitet på iron-slag",
    "Konsistent ballposisjon gjennom sesongen",
  ];

  const UTSTYR = [
    "Iron-sett (5–9)",
    "Wedges (52°, 58°)",
    "Treningsklær",
  ];

  return (
    <div className="bk-scope">
      {/* ── Topnav ── */}
      <nav className="bk-topnav">
        <Link href="/portal/meg/bookinger" className="bk-back-link">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Mine bookinger
        </Link>
        <span className="bk-brand">AK Golf · PlayerHQ</span>
        <div className="bk-crumbs">
          Mine bookinger / <span className="current">Økt-detalj</span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl space-y-6 p-8 pb-24">
        {/* ── Hero ── */}
        <div className="flex flex-col gap-4">
          <div
            className={`bk-status-badge ${statusOk ? "" : "border-accent bg-accent/10 text-[#4A5418]"}`}
          >
            <span className="bk-dot" />
            {statusOk ? "Planlagt" : "Bekreftet"}
          </div>

          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            {booking.serviceType.name} —{" "}
            <em className="font-serif font-normal italic text-primary">
              {booking.location.name.split(" ")[0]}
            </em>
          </h1>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground tracking-[0.06em]">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" strokeWidth={1.75} />
              <strong className="text-foreground">{dato}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" strokeWidth={1.75} />
              <strong className="text-foreground">
                {startTid}–{sluttTid}
              </strong>
            </span>
            {coach && (
              <span className="flex items-center gap-1.5">
                <User className="h-3 w-3" strokeWidth={1.75} />
                <strong className="text-foreground">{coach.name}</strong>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" strokeWidth={1.75} />
              <strong className="text-foreground">{booking.location.name}</strong>
            </span>
            <span className="bk-pill-tag forest">
              {booking.serviceType.durationMin} min
            </span>
          </div>
        </div>

        {/* ── Mål for økten ── */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Mål for økten
          </h2>
          <div className="space-y-2">
            {MAL.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-border/60 text-muted-foreground">
                  <Target className="h-[11px] w-[11px]" strokeWidth={1.75} />
                </div>
                <div className="flex-1 text-sm text-foreground">{m}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tidslinje ── */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Øktens struktur
          </h2>
          <div className="bk-timeline">
            {TIMELINE.map((t, i) => (
              <div key={i} className="bk-timeline-row">
                <div className="bk-time">{t.tid}</div>
                <div className="bk-tl-dot" />
                <div className="bk-body">
                  <div className="bk-ttl">{t.tittel}</div>
                  <div className="bk-tl-meta">{t.meta}</div>
                </div>
                <div className="font-mono text-[11px] font-bold text-muted-foreground tabular-nums">
                  {t.varig}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Utstyr ── */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Ta med
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {UTSTYR.map((u) => (
              <div
                key={u}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-3"
              >
                <Package
                  className="h-3.5 w-3.5 shrink-0 text-primary"
                  strokeWidth={1.75}
                />
                <span className="text-sm font-medium text-foreground">{u}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Notat fra coach ── */}
        {booking.notes && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">
              Notat
            </h2>
            <p className="border-l-2 border-primary/40 pl-4 font-serif italic text-sm leading-relaxed text-foreground">
              {booking.notes}
            </p>
          </section>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/portal/booking/bekreftet"
            className="bk-btn-lime"
          >
            <Check className="h-4 w-4" strokeWidth={2} />
            Alt er klart
          </Link>
          <Link
            href="/portal/meg/bookinger"
            className="bk-btn-ghost"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            Tilbake
          </Link>
        </div>
      </div>
    </div>
  );
}
