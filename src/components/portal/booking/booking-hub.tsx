/**
 * BookingHub — mobil-first booking-landingsside for PlayerHQ (/portal/booking).
 *
 * Port av [historisk fasit, fjernet 2026-07-03] _screens/pl-booking.png + components-booking-flow.html
 * + components-credit-indicator.html (HUB-en, ikke wizard-stegene).
 *
 * Seksjoner (vertikal stack, tap-vennlig — mobil-først 430px):
 *   1. Hero       — eyebrow + "Book *neste økt*" + primær lime-CTA → booking-wizard
 *   2. Credits    — CreditMeter med saldo, eller pay-as-you-go tom-tilstand (Variant 4)
 *   3. Kommende   — liste over bookinger, eller tom-tilstand
 *   4. Coacher    — "Book direkte med coach" (skjules om ingen)
 *
 * Rent presentasjonell og props-drevet — INGEN Prisma/DB/auth-import.
 * Bruker DS-tokens + athletic-primitiver. Ingen hardkodet hex, ingen emoji
 * (kun lucide-ikoner). Tall sendes inn via props — aldri hardkodet i UI.
 */

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CalendarPlus,
  MapPin,
  TicketX,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticBadge } from "@/components/athletic";

// ── Props-typer ───────────────────────────────────────────────────
// NB: Strukturelt kompatible med src/lib/portal-booking/hub-data.ts slik at
// både den ekte /portal/booking-ruten og preview-ruten kan dele komponenten.
// Komponenten er likevel selvstendig presentasjonell — den importerer ikke
// hub-data, og formaterer credits/datoer/tier selv.

export interface HubCredits {
  /** Tier-etikett, f.eks. "GRATIS" / "PRO" / "PERFORMANCE". */
  tier: string;
  /** Antall credits månedspakken gir (0 for GRATIS). */
  monthlyCredits: number;
  /** Saldo for inneværende periode. */
  creditsRemaining: number;
  /** Når saldoen fornyes — ISO-streng eller null. */
  renewsAtIso: string | null;
  /** True hvis spilleren kan booke med credits. Free = false. */
  canUseCredits: boolean;
}

export interface HubBooking {
  id: string;
  /** Tjeneste-/økt-navn, f.eks. "Privattime". */
  serviceName: string;
  /** Lokasjon/fasilitet. */
  locationName: string;
  /** Coach-navn, eller null. */
  coachName: string | null;
  /** Starttidspunkt — ISO-streng. */
  startIso: string;
  /** Varighet i minutter. */
  durationMin: number;
  /** Trukket fra credits. */
  fromCredits: boolean;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

export interface HubCoach {
  id: string;
  name: string;
  /** Initialer til avatar, f.eks. "MV". */
  initials: string;
  /** Antall tilgjengelige tjenester. */
  serviceCount: number;
  /** Laveste pris, ferdig formatert (f.eks. "450 kr"), eller null. */
  fromPrice: string | null;
}

export interface BookingHubProps {
  credits: HubCredits;
  upcoming: HubBooking[];
  /** Siste 10 fullførte eller avbestilte bookinger. */
  past: HubBooking[];
  coaches: HubCoach[];
  /** Wizard-rute for ny booking. Default: /portal/booking/ny. */
  bookHref?: string;
  /** Rute til full bookingoversikt. Default: /portal/meg/bookinger. */
  allBookingsHref?: string;
  /** Rute til oppgradering. Default: /portal/meg/abonnement. */
  upgradeHref?: string;
}

// Pen tier-etikett til badge (DB-enum → Title Case).
// NB: ELITE er et dødt enum — skal aldri vises i UI (CLAUDE.md låst beslutning).
function tierLabel(tier: string): string {
  const t = tier.toUpperCase();
  if (t === "PRO") return "Pro";
  if (t === "PERFORMANCE") return "Performance";
  return "Pro";
}

function formatRenews(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

function formatBookingTime(iso: string): { day: string; time: string } {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("nb-NO", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    time: d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }),
  };
}

const DEFAULT_BOOK_HREF = "/portal/booking/ny";
const DEFAULT_ALL_HREF = "/portal/meg/bookinger";
const DEFAULT_UPGRADE_HREF = "/portal/meg/abonnement";

// ── Eyebrow ───────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </div>
  );
}

// ── Credit-meter (visuell bar — segment per credit, maks 12) ─────────
// Farge-logikk per design-spec (components-credit-indicator.html):
//   ≥ 50 % saldo → primary (forest green)
//   0 < saldo < 50 % → warning (okker)
//   0 saldo → destructive (rød)
// Siste aktive segment alltid accent (forsterker «én igjen»),
// unntatt ved 0 saldo (da er alle segmenter destructive).
function CreditMeter({ remaining, total }: { remaining: number; total: number }) {
  if (total <= 0 || total > 12) return null;

  const pct = remaining / total;
  const segmentColor =
    remaining === 0
      ? "bg-destructive"
      : pct < 0.5
        ? "bg-warning"
        : "bg-primary";
  const lastSegmentColor = remaining === 0 ? "bg-destructive" : "bg-accent";

  return (
    <span className="inline-flex shrink-0 gap-[3px]" aria-hidden>
      {Array.from({ length: total }).map((_, i) => {
        const on = i < remaining;
        const isLast = on && i === remaining - 1;
        return (
          <span
            key={i}
            className={cn(
              "h-1.5 w-[18px] rounded-full",
              on ? (isLast ? lastSegmentColor : segmentColor) : "bg-foreground/[0.08]",
            )}
          />
        );
      })}
    </span>
  );
}

// ── 2. Mine credits ──────────────────────────────────────────────
function CreditsCard({
  credits,
  upgradeHref,
}: {
  credits: HubCredits;
  upgradeHref: string;
}) {
  // Free / ingen credit-pakke → pay-as-you-go (credit-indicator Variant 4).
  if (!credits.canUseCredits) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-warning/[0.12] text-warning">
            <TicketX className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em] text-foreground">
              Ingen credits — du betaler per booking
            </h3>
            <p className="mt-1 font-mono text-[11px] leading-[1.5] tracking-[0.02em] text-muted-foreground">
              Free · betal med Vipps eller kort i bekreftelsessteget. Pro gir
              forhåndsbetalte coaching-timer hver måned.
            </p>
            <Link
              href={upgradeHref}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              Oppgrader til Pro
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const brukt = Math.max(0, credits.monthlyCredits - credits.creditsRemaining);
  const renews = formatRenews(credits.renewsAtIso);

  // Farge-logikk for hero-tall: matche CreditMeter-segmentfarger
  const pct = credits.monthlyCredits > 0 ? credits.creditsRemaining / credits.monthlyCredits : 1;
  const heroNumberColor =
    credits.creditsRemaining === 0
      ? "text-destructive"
      : pct < 0.5
        ? "text-warning"
        : "text-foreground";

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>Mine credits</Eyebrow>
        <AthleticBadge variant="primary">{tierLabel(credits.tier)}</AthleticBadge>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono text-[40px] font-bold leading-none tracking-[-0.02em] tabular-nums",
            heroNumberColor,
          )}
        >
          {credits.creditsRemaining}
        </span>
        <span className="font-mono text-[15px] font-semibold tabular-nums text-muted-foreground">
          / {credits.monthlyCredits} igjen
        </span>
      </div>

      <div className="mt-3">
        <CreditMeter
          remaining={credits.creditsRemaining}
          total={credits.monthlyCredits}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        <span>{brukt} brukt denne perioden</span>
        {renews && <span>Fornyer · {renews}</span>}
      </div>
    </section>
  );
}

// ── 3. Kommende bookinger ────────────────────────────────────────
function UpcomingCard({
  upcoming,
  allBookingsHref,
}: {
  upcoming: HubBooking[];
  allBookingsHref: string;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
          Kommende bookinger
        </h2>
        <Link
          href={allBookingsHref}
          className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Se alle
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-center">
          <CalendarClock
            className="mx-auto h-7 w-7 text-muted-foreground/40"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="mt-3 font-sans text-[13.5px] text-muted-foreground">
            Du har ingen kommende økter. Book din neste time over.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {upcoming.map((b, i) => {
            const { day, time } = formatBookingTime(b.startIso);
            return (
              <li key={b.id} className={i > 0 ? "border-t border-border" : ""}>
              <Link
                href={`/portal/booking/${b.id}`}
                className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <div className="flex w-[52px] shrink-0 flex-col items-center rounded-xl bg-secondary py-2">
                  <span className="font-mono text-[14px] font-bold leading-none tabular-nums text-foreground">
                    {time}
                  </span>
                  <span className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    {b.durationMin} m
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-[14.5px] font-semibold -tracking-[0.005em] text-foreground">
                      {b.serviceName}
                    </span>
                    {b.status === "PENDING" && (
                      <AthleticBadge variant="warn">Avventer</AthleticBadge>
                    )}
                    {b.fromCredits && b.status === "CONFIRMED" && (
                      <AthleticBadge variant="lime">Credit</AthleticBadge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10.5px] tracking-[0.02em] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                      {day}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                      {b.locationName}
                    </span>
                    {b.coachName && (
                      <span className="inline-flex items-center gap-1">
                        <UserIcon className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                        {b.coachName}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ── 4. Book direkte med coach ────────────────────────────────────
function CoachesCard({
  coaches,
  bookHref,
}: {
  coaches: HubCoach[];
  bookHref: string;
}) {
  if (coaches.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
          Book direkte med coach
        </h2>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {coaches.length}{" "}
          {coaches.length === 1 ? "coach" : "coacher"}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {coaches.map((c) => (
          <Link
            key={c.id}
            href={bookHref}
            className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary font-display text-[16px] font-semibold text-primary-foreground">
              {c.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
                {c.name}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 font-mono text-[10.5px] tracking-[0.02em] text-muted-foreground">
                <span>
                  {c.serviceCount}{" "}
                  {c.serviceCount === 1 ? "tjeneste" : "tjenester"}
                </span>
                {c.fromPrice && <span>fra {c.fromPrice}</span>}
              </div>
            </div>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── 5. Historiske bookinger ──────────────────────────────────────
function PastBookingsCard({ past }: { past: HubBooking[] }) {
  if (past.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
          Historikk
        </h2>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {past.length} {past.length === 1 ? "økt" : "økter"}
        </span>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-border bg-card">
        {past.map((b, i) => {
          const { day, time } = formatBookingTime(b.startIso);
          const cancelled = b.status === "CANCELLED";
          return (
            <li key={b.id} className={i > 0 ? "border-t border-border" : ""}>
              <Link
                href={`/portal/booking/${b.id}`}
                className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <div
                  className={cn(
                    "flex w-[52px] shrink-0 flex-col items-center rounded-xl py-2",
                    cancelled ? "bg-destructive/10" : "bg-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[14px] font-bold leading-none tabular-nums",
                      cancelled ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {time}
                  </span>
                  <span className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    {b.durationMin} m
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate font-display text-[14.5px] font-semibold -tracking-[0.005em]",
                        cancelled
                          ? "text-muted-foreground line-through"
                          : "text-foreground",
                      )}
                    >
                      {b.serviceName}
                    </span>
                    {cancelled ? (
                      <AthleticBadge variant="warn">Avbestilt</AthleticBadge>
                    ) : (
                      <AthleticBadge variant="ok">Gjennomført</AthleticBadge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10.5px] tracking-[0.02em] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                      {day}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                      {b.locationName}
                    </span>
                    {b.coachName && (
                      <span className="inline-flex items-center gap-1">
                        <UserIcon className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                        {b.coachName}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ── Hovedkomponent ───────────────────────────────────────────────
export function BookingHub({
  credits,
  upcoming,
  past,
  coaches,
  bookHref = DEFAULT_BOOK_HREF,
  allBookingsHref = DEFAULT_ALL_HREF,
  upgradeHref = DEFAULT_UPGRADE_HREF,
}: BookingHubProps) {
  const ctaLabel = credits.canUseCredits ? "Book med credit" : "Book ny økt";

  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-4 py-6">
      {/* 1. HERO */}
      <section>
        <Eyebrow>
          <span className="h-1.5 w-1.5 rounded-full bg-primary ring-[3px] ring-accent/70" />
          PLAYERHQ · BOOKING
        </Eyebrow>
        <h1 className="mt-2 font-display text-[32px] font-semibold leading-[1.05] -tracking-[0.02em] text-foreground">
          Book{" "}
          <em className="font-normal italic text-muted-foreground">neste økt</em>
        </h1>
        <p className="mt-2 font-sans text-[14.5px] leading-[1.5] text-muted-foreground">
          Privattime, gruppe, test eller TrackMan — velg coach og tid på ett sted.
        </p>

        <Link
          href={bookHref}
          className="mt-4 flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-accent font-sans text-[15px] font-semibold -tracking-[0.01em] text-primary shadow-[0_6px_18px_-6px_hsl(var(--accent)/0.5)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CalendarPlus className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          {ctaLabel}
        </Link>
      </section>

      {/* 2. MINE CREDITS */}
      <CreditsCard credits={credits} upgradeHref={upgradeHref} />

      {/* 3. KOMMENDE BOOKINGER */}
      <UpcomingCard upcoming={upcoming} allBookingsHref={allBookingsHref} />

      {/* 4. BOOK DIREKTE MED COACH */}
      <CoachesCard coaches={coaches} bookHref={bookHref} />

      {/* 5. HISTORIKK */}
      <PastBookingsCard past={past} />
    </div>
  );
}
