import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleDot, TrendingDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Suksesshistorier — AK Golf Academy",
  description:
    "Les hvordan spillere i AK Golf Academy har senket handicapet sitt med data-drevet coaching.",
};

type Case = {
  slug: string;
  navn: string;
  alder: number;
  handicap_fra: number;
  handicap_til: number;
  tid: string;
  sitat: string;
};

const CASES: Case[] = [
  {
    slug: "marcus",
    navn: "Marcus R.",
    alder: 17,
    handicap_fra: 12.4,
    handicap_til: 6.1,
    tid: "8 måneder",
    sitat: "SG Hub-analysene forandret måten jeg trener på.",
  },
  {
    slug: "sofie",
    navn: "Sofie L.",
    alder: 22,
    handicap_fra: 8.2,
    handicap_til: 3.7,
    tid: "6 måneder",
    sitat: "Endelig data-drevet coaching som faktisk funker.",
  },
];

export default function CasesSide() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-20">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Suksesshistorier
          </span>
          <h1 className="mt-4 max-w-4xl font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Ekte resultater fra{" "}
            <em className="font-display font-normal italic text-primary">
              ekte spillere
            </em>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
            Vi måler fremgang i tall — ikke i følelser. Her er historiene til
            spillere som har fulgt Academy-programmet og sett reelle handicap-endringer.
          </p>
        </div>
      </section>

      {/* Cases-grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
          {CASES.length} historier
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          {CASES.map((c) => (
            <CaseKort key={c.slug} case_={c} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 sm:px-8 sm:py-16 text-primary-foreground md:px-16 md:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
              style={{ background: "rgba(209,248,67,0.18)" }}
            />
            <div className="relative max-w-2xl">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] opacity-80">
                Din tur
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
                Klar for{" "}
                <em className="font-display font-normal italic">
                  din
                </em>{" "}
                suksesshistorie?
              </h2>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.6] opacity-90 md:text-[18px]">
                Start med en gratis kartleggings-økt. Vi finner ut hva som stopper
                deg, og legger en plan for å komme videre.
              </p>
              <Link
                href="/booking"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-4 text-[15px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Book gratis kartleggings-økt
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CaseKort({ case_: c }: { case_: Case }) {
  const forbedring = (c.handicap_fra - c.handicap_til).toFixed(1);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-foreground/30 hover:shadow-sm">
      {/* Statistikk-topp */}
      <div className="relative overflow-hidden bg-primary p-8 text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
          style={{ background: "rgba(209,248,67,0.15)" }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] opacity-70">
              Handicap-reduksjon
            </span>
            <div className="mt-2 font-display text-6xl font-semibold tabular-nums leading-none tracking-tight">
              -{forbedring}
            </div>
            <div className="mt-2 font-mono text-[13px] tabular-nums opacity-80">
              {c.handicap_fra} &rarr; {c.handicap_til} HCP
            </div>
          </div>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <TrendingDown className="h-6 w-6" strokeWidth={1.75} />
          </span>
        </div>
      </div>

      {/* Innhold */}
      <div className="flex flex-1 flex-col gap-4 p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">{c.navn}</span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            {c.alder} år
          </span>
          <span className="rounded-full bg-secondary px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            {c.tid}
          </span>
        </div>

        <blockquote className="border-l-4 border-primary pl-4 text-[15px] italic leading-[1.6] text-foreground">
          &laquo;{c.sitat}&raquo;
        </blockquote>

        <div className="mt-auto pt-4">
          <Link
            href={`/cases/${c.slug}`}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:gap-4"
          >
            Les historien
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </article>
  );
}
