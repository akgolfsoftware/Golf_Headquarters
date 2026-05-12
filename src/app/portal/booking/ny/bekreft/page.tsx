import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
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
    subscription.status !== "ACTIVE" ||
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
    year: "numeric",
  });
  const klokkeslett = startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <Link
        href={`/portal/booking/ny?service=${serviceSlug}&dato=${
          startAt.toISOString().split("T")[0]
        }`}
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        ← Velg annen tid
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Bekreft booking"
        titleLead="Sjekk"
        titleItalic="detaljene"
        titleTrail="og bekreft"
        sub={`Dette koster 1 credit. Du har ${subscription.creditsRemaining} credit${
          subscription.creditsRemaining === 1 ? "" : "s"
        } igjen.`}
      />

      {!ledig && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Tiden ble dessverre booket av noen andre. Gå tilbake og velg en
          annen tid.
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Oppsummering
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Rad label="Tjeneste" value={service.name} />
          <Rad label="Coach" value={coachUser.name ?? "Coach"} />
          <Rad label="Dato" value={dato} />
          <Rad label="Klokkeslett" value={klokkeslett} />
          <Rad label="Varighet" value={`${service.durationMin} min`} />
          <Rad label="Kostnad" value="1 credit" />
        </dl>
      </section>

      {ledig && (
        <BekreftForm
          serviceTypeId={service.id}
          coachId={coachId}
          start={startAt.toISOString()}
        />
      )}
    </div>
  );
}

function Rad({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/40 pb-3 last:border-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
