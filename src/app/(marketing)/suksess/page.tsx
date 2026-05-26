import type { Metadata } from "next";
import Link from "next/link";
import { TrendingDown, ArrowRight, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Suksesshistorier — AK Golf Academy",
  description:
    "Reelle resultater fra spillere som har trent hos AK Golf Academy — fra førsteslag til turneringsspill.",
};

type Case = {
  navn: string;
  rolle: string;
  hcpFra: number;
  hcpTil: number;
  periode: string;
  sitat: string;
  initialer: string;
};

const CASES: Case[] = [
  {
    navn: "Lars H.",
    rolle: "Klubbmedlem, 47 år",
    hcpFra: 28,
    hcpTil: 16,
    periode: "12 måneder",
    sitat:
      "Jeg trodde aldri jeg skulle komme under 20. Med struktur og oppfølging mellom timene falt det på plass. Coachingen ga meg ikke bare bedre slag — den ga meg en plan jeg faktisk kunne følge.",
    initialer: "LH",
  },
  {
    navn: "Emma S.",
    rolle: "Junior, 16 år",
    hcpFra: 18,
    hcpTil: 6,
    periode: "2 sesonger",
    sitat:
      "Anders behandlet meg som en utøver fra dag én. Treningsplanene var ikke generiske — de var bygd rundt det jeg trengte. Nå spiller jeg NM og trives med presset.",
    initialer: "ES",
  },
  {
    navn: "Geir T.",
    rolle: "Mosjonist, 62 år",
    hcpFra: 22,
    hcpTil: 14,
    periode: "9 måneder",
    sitat:
      "Jeg ville bare slå bedre med jernene mine før pensjonsturneringene. Det jeg fikk var hele spillet løftet — putting, korte slag, og en mental ro jeg aldri har hatt på banen.",
    initialer: "GT",
  },
];

export default function SuksessSide() {
  return (
    <div>
      <section className="bg-gradient-to-b from-background to-secondary/40 px-4 sm:px-6 py-12 sm:py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Suksesshistorier
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Spillere som har{" "}
            <em className="font-normal italic text-primary">tatt steget</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Tre eksempler på hva personlig coaching kan gjøre når plan, struktur
            og tett oppfølging går hånd i hånd.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          {CASES.map((c) => (
            <article
              key={c.navn}
              className="grid gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 md:p-12 lg:grid-cols-[1fr_2fr]"
            >
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-2xl font-semibold text-primary">
                  {c.initialer}
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">
                  {c.navn}
                </h2>
                <p className="text-sm text-muted-foreground">{c.rolle}</p>

                <div className="mt-6 w-full rounded-md border border-border bg-background p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    HCP-utvikling
                  </p>
                  <p className="mt-2 flex items-baseline justify-center gap-4 font-mono text-xl text-foreground lg:justify-start">
                    <span>{c.hcpFra}</span>
                    <TrendingDown
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    <span className="text-primary">{c.hcpTil}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.periode}
                  </p>
                </div>
              </div>

              <blockquote className="relative">
                <Quote
                  className="absolute -top-2 -left-2 h-8 w-8 text-primary/20"
                  aria-hidden="true"
                />
                <p className="pl-6 font-display text-xl leading-relaxed text-foreground md:italic">
                  «{c.sitat}»
                </p>
              </blockquote>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-secondary/40 p-12 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Vil du være neste suksesshistorie?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Vi tar imot et begrenset antall nye spillere hver sesong.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/coaching"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Les om coaching
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-6 py-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              Snakk med oss
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
