import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { BekreftForm } from "./bekreft-form";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string; coach?: string }>;
};

export default async function BekreftPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { start, coach } = await searchParams;

  if (!start || !coach) notFound();

  const service = await prisma.serviceType.findUnique({ where: { slug } });
  if (!service) notFound();

  const startAt = new Date(start);
  if (isNaN(startAt.getTime())) notFound();

  const coachUser = await prisma.user.findUnique({
    where: { id: coach },
    select: { id: true, name: true },
  });

  const innloggedBruker = await getCurrentUser();

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
    <div className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/booking/${slug}`}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          ← Velg annen tid
        </Link>
        <header className="mt-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Bekreft
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            <em className="font-normal italic text-primary">Bekreft</em>{" "}
            bestilling
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Sjekk detaljene under og fullfør betaling via Stripe.
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <dl className="grid gap-4 text-sm">
            <Rad label="Tjeneste" value={service.name} />
            <Rad label="Dato" value={dato} />
            <Rad label="Klokkeslett" value={`${klokkeslett} (${service.durationMin} min)`} />
            {coachUser && <Rad label="Coach" value={coachUser.name ?? "—"} />}
            <Rad label="Pris" value={new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(service.priceOre / 100)} bold />
          </dl>
        </section>

        <section className="mt-8">
          <BekreftForm
            slug={slug}
            start={start}
            coachId={coach}
            innloggetEpost={innloggedBruker?.email ?? null}
            innloggetNavn={innloggedBruker?.name ?? null}
            priceOre={service.priceOre}
          />
        </section>

        <div className="mt-6 text-xs text-muted-foreground">
          Tiden er holdt for deg i 15 minutter. Du betaler trygt via Stripe.
          Avbestilling senest 24 timer før gir full refusjon.
        </div>
      </div>
    </div>
  );
}

function Rad({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 pb-2 last:border-b-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className={bold ? "font-display text-xl font-semibold tabular-nums" : "text-foreground"}>
        {value}
      </dd>
    </div>
  );
}
