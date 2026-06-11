import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/booking/availability";
import { SlotPicker } from "./slot-picker";

const BOOKING_ACTIVE = process.env.BOOKING_ACTIVE === "true";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dato?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.serviceType.findUnique({ where: { slug } });
  if (!service) return { title: "Booking — AK Golf" };
  return {
    title: `Book ${service.name} — AK Golf`,
    description: service.description ?? undefined,
  };
}

function formaterPris(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function ServiceBookingPage({ params, searchParams }: Props) {
  if (!BOOKING_ACTIVE) redirect("/booking");

  const { slug } = await params;
  const { dato } = await searchParams;

  const service = await prisma.serviceType.findUnique({ where: { slug } });
  if (!service || !service.active) notFound();

  const valgtDato = dato ? new Date(dato) : new Date();
  valgtDato.setHours(0, 0, 0, 0);
  // Default til i morgen hvis ingen dato valgt
  if (!dato) {
    valgtDato.setDate(valgtDato.getDate() + 1);
  }

  const alleSlots = await getAvailableSlots(service.id, valgtDato);
  // Filtrer på service sin coach — Markus-tjenester skal ikke vise Anders' tider.
  const slots = service.coachUserId
    ? alleSlots.filter((s) => s.coachId === service.coachUserId)
    : alleSlots;

  // 7 dager fremover som dato-velger
  const idag = new Date();
  idag.setHours(0, 0, 0, 0);
  const dager = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(idag);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/booking"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          ← Alle tjenester
        </Link>
        <header className="mt-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Booking
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            <em className="font-normal italic text-primary">{service.name}</em>
          </h1>
          {service.description && (
            <p className="mt-4 text-base text-muted-foreground">
              {service.description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Pris
              </div>
              <div className="mt-0.5 font-display text-xl font-semibold tabular-nums">
                {formaterPris(service.priceOre)}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Varighet
              </div>
              <div className="mt-0.5 font-mono text-base tabular-nums">
                {service.durationMin} min
              </div>
            </div>
          </div>
        </header>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Velg dag
          </h2>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {dager.map((d) => {
              const isoDate = toDateInput(d);
              const erValgt = isoDate === toDateInput(valgtDato);
              const dagsnavn = d.toLocaleDateString("nb-NO", { weekday: "short" });
              const datotekst = d.toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "short",
              });
              return (
                <Link
                  key={isoDate}
                  href={`/booking/${slug}?dato=${isoDate}`}
                  className={`flex flex-col rounded-lg border px-4 py-4 text-center text-sm transition-colors ${
                    erValgt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em]">
                    {dagsnavn}
                  </span>
                  <span className="mt-1 font-semibold">{datotekst}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Ledige tider{" "}
            <span className="font-mono text-sm font-normal text-muted-foreground">
              {valgtDato.toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </h2>
          {slots.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
              Ingen ledige tider denne dagen. Prøv en annen dag.
            </div>
          ) : (
            <SlotPicker slug={slug} slots={slots.map((s) => ({
              start: s.start.toISOString(),
              end: s.end.toISOString(),
              coachId: s.coachId,
              coachName: s.coachName,
            }))} />
          )}
        </section>
      </div>
    </div>
  );
}
