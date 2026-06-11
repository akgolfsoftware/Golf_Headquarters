/**
 * Booking-wizard (/portal/booking/ny) — mobil-first 430px.
 *
 * Port mot public/design-handover/_prompts/SKJERMER-RUNDE-7-BOOKING.md.
 * Beholder eksisterende query-drevet wizard-state og actions:
 *   service → dato → tid → /portal/booking/ny/bekreft (SlotGrid-href).
 *
 * Steg-modell (3 synlige steg + bekreft-oppsummering):
 *   1. Velg tjeneste   2. Velg tid (dato + slot)   3. Bekreft
 *
 * DS-tokens + athletic-primitiver. Ingen hardkodet hex, ingen emoji (kun lucide).
 * Server Component — ekte Prisma. Tall fra DB, aldri hardkodet.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock,
  Coins,
  Lock,
  MapPin,
  Ticket,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CreditMeter } from "@/components/portal/abonnement/credit-meter";
import { getAvailableSlots } from "@/lib/booking/availability";
import { DatoVelger } from "./_components/dato-velger";
import { SlotGrid } from "./_components/slot-grid";

type Props = {
  searchParams: Promise<{ dato?: string; service?: string }>;
};

const WIZARD = "/portal/booking/ny";

// ── Eyebrow (mono-caps, matcher booking-hub) ─────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </div>
  );
}

export default async function NyBookingPage({ searchParams }: Props) {
  const { dato: datoParam, service: serviceParam } = await searchParams;
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  // Ingen aktivt abonnement eller PlayerHQ-only (uten credits) → send til /coaching
  if (
    !subscription ||
    subscription.status !== "ACTIVE" ||
    subscription.monthlyCredits === 0
  ) {
    redirect("/coaching");
  }

  // Brukt opp månedens credits — vis info + drop-in-CTA
  if (subscription.creditsRemaining <= 0) {
    return <BruktOppView resetAt={subscription.currentPeriodEnd} />;
  }

  // Alle aktive coaching-tjenester
  const services = await prisma.serviceType.findMany({
    where: { active: true },
    orderBy: { durationMin: "asc" },
  });

  // Aktive lokasjoner med tilhørende fasiliteter — brukes til å vise
  // lokasjonsnavn i oppsummeringssteget og steg 1-kortene.
  const locations = await prisma.location.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      facilities: {
        where: { active: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, type: true, isIndoor: true },
      },
    },
  });

  if (services.length === 0) {
    return (
      <div className="mx-auto max-w-[480px] px-4 py-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-[13.5px] text-muted-foreground">
          Ingen coaching-tjenester er aktive i øyeblikket. Kontakt
          support@akgolf.no.
        </div>
      </div>
    );
  }

  // Default-valg: første tjeneste hvis ingen valgt
  const valgtService =
    services.find((s) => s.slug === serviceParam) ?? services[0];

  // Default dato: i dag (eller fra query)
  const valgtDato = parseDatoQuery(datoParam) ?? startOfDay(new Date());

  const slots = await getAvailableSlots(valgtService.id, valgtDato);

  // Aktivt steg utledet av query-params: service valgt → steg 2, dato valgt → steg 3.
  const aktivtSteg = !serviceParam ? 1 : !datoParam ? 2 : 3;
  const isFree = user.tier === "GRATIS";

  // Lokasjonsnavn som credit-booking.ts vil bruke for valgt tjeneste
  // (speiler logikken i src/lib/booking/credit-booking.ts linje 83-89).
  const resolvedLocationName = valgtService.slug.includes("trackman")
    ? "Mulligan Indoor Golf"
    : "Gamle Fredrikstad GK";
  const resolvedLocation = locations.find((l) =>
    l.name.toLowerCase().includes(resolvedLocationName.toLowerCase()),
  ) ?? locations[0] ?? null;
  const saldoEtter = subscription.creditsRemaining - 1;
  const sisteCredit = subscription.creditsRemaining === 1;

  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
      {/* HERO */}
      <section>
        <Eyebrow>
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{ boxShadow: "0 0 0 3px hsl(var(--accent) / 0.7)" }}
          />
          PLAYERHQ · BOOK NY TIME
        </Eyebrow>
        <h1 className="mt-2 font-display text-[30px] font-semibold leading-[1.05] -tracking-[0.02em] text-foreground">
          Bruk{" "}
          <em className="font-normal italic text-muted-foreground">månedens</em>{" "}
          timer
        </h1>
        <p className="mt-2 font-sans text-[14px] leading-[1.5] text-muted-foreground">
          {subscription.creditsRemaining} av {subscription.monthlyCredits} timer
          igjen denne måneden. Velg tjeneste og tid på ett sted.
        </p>
      </section>

      {/* STEG-PRIKKER */}
      <StegIndikator
        aktivt={aktivtSteg}
        steg={[
          { nr: 1, label: "Tjeneste", ferdig: !!serviceParam },
          { nr: 2, label: "Tid", ferdig: !!datoParam && aktivtSteg === 3 },
          { nr: 3, label: "Bekreft", ferdig: false },
        ]}
      />

      {/* FREE-GATE */}
      {isFree && (
        <section className="rounded-2xl border border-warning/30 bg-card p-5">
          <div className="flex items-start gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-warning/[0.12] text-warning">
              <Lock className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[15px] font-semibold -tracking-[0.01em] text-foreground">
                Booking krever Pro
              </h3>
              <p className="mt-1 font-sans text-[13px] leading-[1.5] text-muted-foreground">
                Free-konto: oppgrader til Pro eller et aktivt
                coaching-abonnement for å bruke forhåndsbetalte timer.
              </p>
              <Link
                href="/portal/meg/abonnement"
                className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-primary"
              >
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                Oppgrader til Pro
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CREDIT-SALDO */}
      <section className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-5">
        <div className="flex items-center justify-between gap-3">
          <Eyebrow>
            <Coins className="h-3 w-3" strokeWidth={2} aria-hidden />
            Min saldo
          </Eyebrow>
          {subscription.currentPeriodEnd && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Fornyer ·{" "}
              {subscription.currentPeriodEnd.toLocaleDateString("nb-NO", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-[40px] font-bold leading-none -tracking-[0.02em] tabular-nums text-foreground">
            {subscription.creditsRemaining}
          </span>
          <span className="font-mono text-[15px] font-semibold tabular-nums text-muted-foreground">
            / {subscription.monthlyCredits} igjen
          </span>
        </div>
        <div className="mt-3">
          <CreditMeter
            remaining={subscription.creditsRemaining}
            total={subscription.monthlyCredits}
            showLabel={false}
          />
        </div>
      </section>

      {/* STEG 1 — TJENESTE */}
      <section>
        <h2 className="mb-2 font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
          <span className="font-mono text-[13px] font-bold text-muted-foreground">
            1 ·{" "}
          </span>
          Velg tjeneste
        </h2>
        <div className="flex flex-col gap-2.5">
          {services.map((s) => {
            const active = s.id === valgtService.id;
            return (
              <Link
                key={s.id}
                href={`${WIZARD}?service=${s.slug}${
                  datoParam ? `&dato=${datoParam}` : ""
                }`}
                scroll={false}
                aria-pressed={active}
                className={`flex items-start gap-3.5 rounded-2xl border p-4 transition-colors ${
                  active
                    ? "border-primary bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary))]"
                    : "border-border bg-card hover:border-foreground/30"
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                    active
                      ? "border-primary bg-primary text-accent"
                      : "border-input bg-card text-transparent"
                  }`}
                >
                  {active && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
                      {s.name}
                    </h3>
                    <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                      <Clock className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                      {s.durationMin} min
                    </span>
                  </div>
                  {s.description && (
                    <p className="mt-1 font-sans text-[12.5px] leading-[1.45] text-muted-foreground">
                      {s.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold tabular-nums text-foreground">
                      {s.priceOre > 0 ? `${s.priceOre / 100} kr` : "1 credit"}
                    </span>
                    {(() => {
                      const locName = s.slug.includes("trackman")
                        ? "Mulligan Indoor Golf"
                        : "Gamle Fredrikstad GK";
                      const loc = locations.find((l) =>
                        l.name.toLowerCase().includes(locName.toLowerCase()),
                      );
                      return loc ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
                          <MapPin className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                          {loc.name}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CONTEXT-KORT — valgt tjeneste (synlig fra steg 2) */}
      {aktivtSteg >= 2 && (
        <section className="rounded-2xl border border-border bg-secondary/60 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
              <Ticket className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              {valgtService.name}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" strokeWidth={1.75} aria-hidden />
              {valgtService.durationMin} min
            </span>
            <Link
              href={WIZARD}
              scroll={false}
              className="ml-auto font-bold uppercase tracking-[0.08em] text-primary"
            >
              Endre
            </Link>
          </div>
        </section>
      )}

      {/* STEG 2 — TID (dato + slot) */}
      <section>
        <h2 className="mb-3 font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
          <span className="font-mono text-[13px] font-bold text-muted-foreground">
            2 ·{" "}
          </span>
          Velg tid
        </h2>

        <div className="mb-2 flex items-center justify-between">
          <Eyebrow>Velg dag</Eyebrow>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Neste 14 dager
          </span>
        </div>
        <DatoVelger
          valgtDato={valgtDato}
          serviceSlug={valgtService.slug}
          dager={14}
        />

        <div className="mt-5">
          <Eyebrow>
            <CalendarDays className="h-3 w-3" strokeWidth={2} aria-hidden />
            {valgtDato.toLocaleDateString("nb-NO", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Eyebrow>
          <div className="mt-3">
            {slots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-center">
                <CalendarDays
                  className="mx-auto h-7 w-7 text-muted-foreground/40"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <p className="mt-3 font-sans text-[13.5px] text-muted-foreground">
                  Ingen ledige tider denne dagen. Prøv en annen dag over.
                </p>
              </div>
            ) : (
              <SlotGrid slots={slots} serviceSlug={valgtService.slug} />
            )}
          </div>
        </div>
      </section>

      {/* STEG 3 — BEKREFT (oppsummering før slot-trykk fullfører) */}
      {aktivtSteg === 3 && (
        <section>
          <h2 className="mb-3 font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
            <span className="font-mono text-[13px] font-bold text-muted-foreground">
              3 ·{" "}
            </span>
            Bekreft
          </h2>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <SummaryRow label="Tjeneste" value={valgtService.name} />
            <SummaryRow
              label="Varighet"
              value={`${valgtService.durationMin} min`}
              mono
            />
            <SummaryRow
              label="Dato"
              value={valgtDato.toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              mono
            />
            {resolvedLocation !== null && (
              <SummaryRow label="Sted" value={resolvedLocation.name} />
            )}
            <SummaryRow label="Kostnad" value="1 credit" mono last />
          </div>

          {/* Saldo før → etter */}
          <div className="mt-2.5 flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/[0.04] px-4 py-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Saldo etter
            </span>
            <span className="font-mono text-[13px] font-bold tabular-nums text-foreground">
              {subscription.creditsRemaining} / {subscription.monthlyCredits}
              <span className="px-1.5 text-muted-foreground">→</span>
              {saldoEtter} / {subscription.monthlyCredits}
            </span>
          </div>

          {sisteCredit && (
            <div className="mt-2.5 flex items-start gap-2.5 rounded-2xl border-l-[3px] border-warning bg-warning/[0.08] py-3 pl-3 pr-4">
              <Coins
                className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                strokeWidth={2}
                aria-hidden
              />
              <p className="font-sans text-[12.5px] leading-[1.45] text-foreground">
                Dette er den siste crediten din denne måneden.
              </p>
            </div>
          )}

          <p className="mt-3 text-center font-sans text-[12px] leading-[1.5] text-muted-foreground">
            Velg en ledig tid over for å fullføre. Avbestilling er gratis inntil
            24 timer før.
          </p>
        </section>
      )}
    </div>
  );
}

// ── Brukt opp månedens credits ───────────────────────────────────
function BruktOppView({ resetAt }: { resetAt: Date | null }) {
  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
      <section>
        <Eyebrow>
          <span
            className="h-1.5 w-1.5 rounded-full bg-warning"
            style={{ boxShadow: "0 0 0 3px hsl(var(--warning) / 0.25)" }}
          />
          PLAYERHQ · BOOK NY TIME
        </Eyebrow>
        <h1 className="mt-2 font-display text-[30px] font-semibold leading-[1.05] -tracking-[0.02em] text-foreground">
          Du har brukt{" "}
          <em className="font-normal italic text-muted-foreground">opp</em>{" "}
          månedens timer
        </h1>
        <p className="mt-2 font-sans text-[14px] leading-[1.5] text-muted-foreground">
          Saldoen resettes ved neste fakturering. Du kan også booke en drop-in
          time mot betaling.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
          <Ticket className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="mt-4 font-sans text-[13.5px] text-muted-foreground">
          {resetAt
            ? `Neste reset: ${resetAt.toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}`
            : "Du får nye timer ved neste fakturering."}
        </p>
        <Link
          href="/booking"
          className="mt-5 flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-accent font-sans text-[15px] font-semibold -tracking-[0.01em] text-primary shadow-[0_6px_18px_-6px_hsl(var(--accent)/0.5)]"
        >
          Book drop-in mot betaling
        </Link>
      </section>
    </div>
  );
}

// ── Oppsummerings-rad ────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  mono,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
        last ? "" : "border-b border-border"
      }`}
    >
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`text-right text-[14px] font-semibold text-foreground ${
          mono ? "font-mono tabular-nums" : "font-sans -tracking-[0.005em]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Steg-prikker (connected progress) ────────────────────────────
function StegIndikator({
  aktivt,
  steg,
}: {
  aktivt: number;
  steg: { nr: number; label: string; ferdig: boolean }[];
}) {
  return (
    <ol className="flex items-center gap-2">
      {steg.map((s, i) => {
        const erAktivt = s.nr === aktivt;
        const erFerdig = s.ferdig;
        return (
          <li key={s.nr} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold tabular-nums ${
                erFerdig
                  ? "bg-primary text-accent"
                  : erAktivt
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {erFerdig ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              ) : (
                s.nr
              )}
            </span>
            <span
              className={`text-[11.5px] font-medium ${
                erAktivt ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < steg.length - 1 && (
              <span
                className={`h-px flex-1 ${erFerdig ? "bg-primary" : "bg-border"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parseDatoQuery(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return startOfDay(d);
}
