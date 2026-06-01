/**
 * BookingHub — mobil-first booking-landingsside (/portal/booking), 430px.
 *
 * Port av public/design-handover/playerhq/components-booking-flow.html +
 * components-credit-indicator.html (HUB-en, ikke wizard-stegene).
 *
 * Seksjoner (vertikal stack, tap-vennlig):
 *   1. Hero — "Book *neste økt*" + primær lime-CTA → /portal/booking/ny
 *   2. Mine credits — ekte saldo via CreditMeter, eller pay-as-you-go-tomstate
 *   3. Kommende bookinger — ekte prisma.booking, eller tom-state
 *   4. Book direkte med coach — ekte coach-User med aktive tjenester
 *
 * Rene props (ingen Prisma-import). Tall kommer fra DB — aldri hardkodet.
 * DS-tokens + athletic-primitiver. Ingen hex, ingen emoji (kun lucide).
 */

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CalendarPlus,
  MapPin,
  Plus,
  Sparkles,
  TicketX,
  User as UserIcon,
} from "lucide-react";
import { CreditMeter } from "@/components/portal/abonnement/credit-meter";
import { AthleticBadge } from "@/components/athletic";
import type {
  HubBooking,
  HubCoach,
  HubCredits,
} from "@/lib/portal-booking/hub-data";

const WIZARD_HREF = "/portal/booking/ny";

function tierLabel(credits: HubCredits): string {
  if (credits.monthlyCredits > 0) return "Pro";
  return "Free";
}

function formatRenews(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
  });
}

function formatBookingTime(iso: string): { day: string; time: string } {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("nb-NO", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }),
    time: d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ── Eyebrow ──────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </div>
  );
}

// ── 2. Mine credits ──────────────────────────────────────────────
function CreditsCard({ credits }: { credits: HubCredits }) {
  const renews = formatRenews(credits.renewsAtIso);

  // GRATIS / ingen credit-pakke → pay-as-you-go (credit-indicator Variant 4)
  if (!credits.canUseCredits) {
    return (
      <section className="rounded-2xl border border-warning/30 bg-card p-5">
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
              href="/coaching"
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-primary"
            >
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              Oppgrader til Pro
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const brukt = credits.monthlyCredits - credits.creditsRemaining;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>Mine credits</Eyebrow>
        <AthleticBadge variant="primary">{tierLabel(credits)}</AthleticBadge>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-[40px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
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
          showLabel={false}
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
function UpcomingCard({ upcoming }: { upcoming: HubBooking[] }) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
          Kommende bookinger
        </h2>
        <Link
          href="/portal/meg/bookinger"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary"
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
                  className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-secondary"
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
                        <CalendarClock
                          className="h-3 w-3"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        {day}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                        {b.locationName}
                      </span>
                      {b.coachName && (
                        <span className="inline-flex items-center gap-1">
                          <UserIcon
                            className="h-3 w-3"
                            strokeWidth={1.5}
                            aria-hidden
                          />
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
function CoachesCard({ coaches }: { coaches: HubCoach[] }) {
  if (coaches.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
          Book direkte med coach
        </h2>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {coaches.length} coacher
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {coaches.map((c) => (
          <Link
            key={c.id}
            href={WIZARD_HREF}
            className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
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

// ── Hovedkomponent ───────────────────────────────────────────────
export function BookingHub({
  credits,
  upcoming,
  coaches,
}: {
  credits: HubCredits;
  upcoming: HubBooking[];
  coaches: HubCoach[];
}) {
  const ctaLabel = credits.canUseCredits ? "Book med credit" : "Book ny økt";

  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-4 py-6">
      {/* 1. HERO */}
      <section>
        <Eyebrow>
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{ boxShadow: "0 0 0 3px hsl(var(--accent) / 0.7)" }}
          />
          PLAYERHQ · BOOKING
        </Eyebrow>
        <h1 className="mt-2 font-display text-[32px] font-semibold leading-[1.05] -tracking-[0.02em] text-foreground">
          Book{" "}
          <em className="font-normal italic text-muted-foreground">
            neste økt
          </em>
        </h1>
        <p className="mt-2 font-sans text-[14.5px] leading-[1.5] text-muted-foreground">
          Privattime, gruppe, test eller TrackMan — velg coach og tid på ett
          sted.
        </p>

        <Link
          href={WIZARD_HREF}
          className="mt-4 flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-accent font-sans text-[15px] font-semibold -tracking-[0.01em] text-primary shadow-[0_6px_18px_-6px_hsl(var(--accent)/0.5)] transition-opacity hover:opacity-90"
        >
          <CalendarPlus className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          {ctaLabel}
        </Link>
      </section>

      {/* 2. MINE CREDITS */}
      <CreditsCard credits={credits} />

      {/* 3. KOMMENDE BOOKINGER */}
      <UpcomingCard upcoming={upcoming} />

      {/* 4. BOOK DIREKTE MED COACH */}
      <CoachesCard coaches={coaches} />

      {/* Sekundær handling — full booking-flyt */}
      <Link
        href={WIZARD_HREF}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card px-4 py-4 font-sans text-[13.5px] font-medium text-foreground transition-colors hover:border-foreground/30"
      >
        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
        Start full booking-flyt
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  );
}
