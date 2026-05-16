import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Check, Clock, Lock } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { getAvailableSlots } from "@/lib/booking/availability";
import { DatoVelger } from "./_components/dato-velger";
import { SlotGrid } from "./_components/slot-grid";

type Props = {
  searchParams: Promise<{ dato?: string; service?: string }>;
};

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

  if (services.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Ingen 20-min coaching-tjenester er aktive i øyeblikket. Kontakt
        support@akgolf.no.
      </div>
    );
  }

  // Default-valg: første tjeneste hvis ingen valgt
  const valgtService =
    services.find((s) => s.slug === serviceParam) ?? services[0];

  // Default dato: i dag (eller fra query)
  const valgtDato = parseDatoQuery(datoParam) ?? startOfDay(new Date());

  const slots = await getAvailableSlots(valgtService.id, valgtDato);

  // Bestem aktivt steg basert på query-params: service valgt → steg 2, dato valgt → steg 3
  const aktivtSteg = !serviceParam ? 1 : !datoParam ? 2 : 3;
  const isFree = user.tier === "GRATIS";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Book ny time"
        titleLead="Bruk"
        titleItalic="månedens"
        titleTrail="coaching-timer"
        sub={`${subscription.creditsRemaining} av ${subscription.monthlyCredits} timer igjen denne måneden. Resettes ved neste fakturering.`}
      />

      <StegIndikator
        aktivt={aktivtSteg}
        steg={[
          { nr: 1, label: "Tjeneste", ferdig: !!serviceParam },
          { nr: 2, label: "Tid", ferdig: !!datoParam && aktivtSteg === 3 },
          { nr: 3, label: "Bekreft", ferdig: false },
        ]}
      />

      {isFree && (
        <div className="flex items-start gap-4 rounded-md border border-accent/40 bg-accent/10 p-4">
          <Lock
            className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground"
            strokeWidth={1.75}
          />
          <div className="text-sm text-foreground">
            <span className="font-semibold">Free-konto:</span> Booking krever Pro
            eller aktivt coaching-abonnement.{" "}
            <Link
              href="/portal/meg/abonnement"
              className="text-primary hover:underline"
            >
              Oppgrader →
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
              Saldo
            </span>
            <span className="font-display text-lg font-semibold tabular-nums">
              {subscription.creditsRemaining} / {subscription.monthlyCredits}
            </span>
          </div>
          {subscription.currentPeriodEnd && (
            <span className="text-xs text-muted-foreground">
              Neste reset:{" "}
              {subscription.currentPeriodEnd.toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "long",
              })}
            </span>
          )}
        </div>
      </div>

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          1. Velg tjeneste
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((s) => {
            const active = s.id === valgtService.id;
            return (
              <Link
                key={s.id}
                href={`/portal/booking/ny?service=${s.slug}${
                  datoParam ? `&dato=${datoParam}` : ""
                }`}
                className={`rounded-md border p-4 transition-colors ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-base font-semibold tracking-tight">
                      {s.name}
                    </h3>
                    {s.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      <Clock className="h-3 w-3" strokeWidth={1.75} />
                      {s.durationMin} min
                    </span>
                    {s.priceOre > 0 && (
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {s.priceOre / 100} kr
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          2. Velg dato
        </h2>
        <div className="mt-4">
          <DatoVelger
            valgtDato={valgtDato}
            serviceSlug={valgtService.slug}
            dager={14}
          />
        </div>
      </section>

      {aktivtSteg === 3 && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Oppsummering — bekreft før booking
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Tjeneste
              </dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {valgtService.name}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Varighet
              </dt>
              <dd className="mt-0.5 font-mono tabular-nums text-foreground">
                {valgtService.durationMin} min
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Dato
              </dt>
              <dd className="mt-0.5 font-mono tabular-nums text-foreground">
                {valgtDato.toLocaleDateString("nb-NO", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Kostnad
              </dt>
              <dd className="mt-0.5 font-mono tabular-nums text-foreground">
                1 credit
              </dd>
            </div>
          </dl>
        </section>
      )}

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          3. Velg tid
        </h2>
        <div className="mt-4">
          {slots.length === 0 ? (
            <div className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              <CalendarDays className="mx-auto h-5 w-5" strokeWidth={1.75} />
              <p className="mt-2">
                Ingen ledige tider for denne datoen. Prøv en annen dag.
              </p>
            </div>
          ) : (
            <SlotGrid
              slots={slots}
              serviceSlug={valgtService.slug}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function BruktOppView({ resetAt }: { resetAt: Date | null }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Book ny time"
        titleLead="Du har brukt"
        titleItalic="opp"
        titleTrail="månedens timer"
        sub="Saldoen resettes ved neste fakturering. Du kan også booke en drop-in time mot betaling."
      />

      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
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
          className="mt-6 inline-block rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground"
        >
          Book drop-in mot betaling →
        </Link>
      </div>
    </div>
  );
}

function StegIndikator({
  aktivt,
  steg,
}: {
  aktivt: number;
  steg: { nr: number; label: string; ferdig: boolean }[];
}) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {steg.map((s, i) => {
        const erAktivt = s.nr === aktivt;
        const erFerdig = s.ferdig;
        return (
          <li key={s.nr} className="flex flex-1 items-center gap-2 sm:gap-4">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold ${
                erFerdig
                  ? "bg-primary text-primary-foreground"
                  : erAktivt
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {erFerdig ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                s.nr
              )}
            </span>
            <span
              className={`hidden text-sm sm:inline ${
                erAktivt
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < steg.length - 1 && (
              <span
                className={`h-px flex-1 ${
                  erFerdig ? "bg-primary" : "bg-border"
                }`}
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
