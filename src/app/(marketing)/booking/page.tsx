import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Book økt — AK Golf",
  description: "Book Pro-time, Trackman-analyse eller gruppe-økt online.",
};

function formaterPris(ore: number): string {
  if (ore === 0) return "Gratis";
  return `${ore / 100} kr`;
}

export default async function BookingLanding() {
  const services = await prisma.serviceType.findMany({
    where: { active: true, priceOre: { gt: 0 } },
    orderBy: { priceOre: "asc" },
  });

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Booking
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">Book</em> en økt
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Velg tjeneste under, finn ledig tid, og betal trygt via Stripe.
            Avbestilling senest 24 timer før gir full refusjon.
          </p>
        </header>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.id}
              href={`/booking/${s.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <h2 className="font-display text-xl font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary">
                {s.name}
              </h2>
              {s.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {s.description}
                </p>
              )}
              <div className="mt-auto flex items-end justify-between pt-6">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Pris
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
                    {formaterPris(s.priceOre)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Varighet
                  </div>
                  <div className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
                    {s.durationMin} min
                  </div>
                </div>
              </div>
              <span className="mt-6 inline-block text-sm font-semibold text-primary">
                Velg tid →
              </span>
            </Link>
          ))}
        </section>

        {services.length === 0 && (
          <div className="mt-12 rounded-lg border border-dashed border-border bg-muted/40 p-12 text-center text-sm text-muted-foreground">
            Ingen tjenester er tilgjengelig akkurat nå.
            <br />
            <Link href="/kontakt" className="mt-2 inline-block text-primary underline">
              Ta kontakt
            </Link>
          </div>
        )}

        <section className="mt-16 rounded-2xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Hvordan det fungerer
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            <li>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                Steg 1
              </span>
              <h3 className="mt-1 font-display text-base font-semibold">
                Velg tjeneste
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Pro-time, Trackman-analyse eller gruppe-økt — velg det som
                passer.
              </p>
            </li>
            <li>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                Steg 2
              </span>
              <h3 className="mt-1 font-display text-base font-semibold">
                Velg tid
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Se hva som er ledig hos coachene og book direkte.
              </p>
            </li>
            <li>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                Steg 3
              </span>
              <h3 className="mt-1 font-display text-base font-semibold">
                Betal trygt
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Stripe-betaling. Bekreftelse på e-post umiddelbart.
              </p>
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
