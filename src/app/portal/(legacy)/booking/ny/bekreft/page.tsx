import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Coins, Shield } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { BekreftForm } from "./bekreft-form";

type Props = {
  searchParams: Promise<{ service?: string; start?: string; coach?: string }>;
};

export default async function BekreftCreditBookingPage({
  searchParams,
}: Props) {
  const { service: serviceSlug, start, coach: coachId } = await searchParams;

  if (!serviceSlug || !start || !coachId) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  if (
    !subscription ||
    !kanBrukeCredits(subscription) ||
    subscription.monthlyCredits === 0
  ) {
    redirect("/coaching");
  }
  if (subscription.creditsRemaining <= 0) {
    redirect("/portal/booking/ny");
  }

  const service = await prisma.serviceType.findUnique({
    where: { slug: serviceSlug },
  });
  if (!service || !service.active) notFound();

  const startAt = new Date(start);
  if (isNaN(startAt.getTime())) notFound();

  const coachUser = await prisma.user.findUnique({
    where: { id: coachId },
    select: { id: true, name: true },
  });
  if (!coachUser) notFound();

  // Sjekk slot fortsatt ledig — vis feilmelding hvis ikke
  const ledig = await isSlotStillAvailable(service.id, startAt, coachId);

  const dato = startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const klokkeslett = startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const datoTid = `${dato.charAt(0).toUpperCase()}${dato.slice(1)} · ${klokkeslett}`;

  const saldoEtter = subscription.creditsRemaining - 1;

  const summary = [
    { label: "Økt-type", value: service.name },
    { label: "Coach", value: coachUser.name ?? "Coach" },
    { label: "Dato/tid", value: datoTid },
    { label: "Varighet", value: `${service.durationMin} min` },
    { label: "Kostnad", value: "1 av månedens timer" },
  ];

  return (
    <div className="mx-auto max-w-[480px] space-y-3 px-4 pb-24 pt-6">
      {/* Tilbake-lenke */}
      <Link
        href={`/portal/booking/ny?service=${serviceSlug}&dato=${
          startAt.toISOString().split("T")[0]
        }`}
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        Velg annen tid
      </Link>

      {/* Editorial header */}
      <h1 className="font-display text-[24px] font-bold leading-[1.05] -tracking-[0.02em] text-foreground">
        Bekreft{" "}
        <em className="font-medium italic text-primary">booking</em>
      </h1>

      {!ledig && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          Tiden ble dessverre booket av noen andre. Gå tilbake og velg en annen
          tid.
        </div>
      )}

      {/* Oppsummering */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(10,31,23,0.05)]">
        <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Oppsummering
        </div>
        <dl className="mt-3 divide-y divide-border/60">
          {summary.map((row) => (
            <div key={row.label} className="flex items-center gap-3 py-3">
              <dt className="w-20 shrink-0 font-mono text-[10px] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="text-[13.5px] font-semibold text-foreground">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Betaling → credit-saldo (denne flyten bruker forhåndsbetalte timer) */}
      <section className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-4 shadow-[0_1px_2px_rgba(10,31,23,0.05)]">
        <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Betaling
        </div>
        <div className="mt-2.5 flex items-center gap-2.5 rounded-[14px] bg-card px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-accent">
            <Coins className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-[13.5px] text-foreground">
            Trekkes fra forhåndsbetalte timer
          </span>
          <span className="ml-auto font-mono text-[11px] font-bold tabular-nums text-muted-foreground">
            {subscription.creditsRemaining} → {saldoEtter}
          </span>
        </div>
      </section>

      {/* Notater + bekreft-knapper */}
      {ledig && (
        <BekreftForm
          serviceTypeId={service.id}
          coachId={coachId}
          start={startAt.toISOString()}
          backHref={`/portal/booking/ny?service=${serviceSlug}&dato=${
            startAt.toISOString().split("T")[0]
          }`}
        />
      )}

      <p className="flex items-center justify-center gap-1.5 pt-1 text-center font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
        <Shield className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        Gratis avbestilling inntil 24 timer før
      </p>
    </div>
  );
}
