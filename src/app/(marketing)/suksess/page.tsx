import type { Metadata } from "next";
import { TrendingDown, Quote } from "lucide-react";
import {
  CtaLime,
  CtaOutlineLys,
  Em,
  HeroEm,
  MarketingHero,
  SectionEyebrow,
  SectionH2,
} from "@/components/marketing/marketing-sections";

export const metadata: Metadata = {
  title: "Suksesshistorier · AK Golf Academy",
  description:
    "Reelle resultater fra spillere som har trent hos AK Golf Academy, fra førsteslag til turneringsspill.",
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
      "Jeg trodde aldri jeg skulle komme under 20. Med struktur og oppfølging mellom timene falt det på plass. Coachingen ga meg ikke bare bedre slag, den ga meg en plan jeg faktisk kunne følge.",
    initialer: "LH",
  },
  {
    navn: "Emma S.",
    rolle: "Junior, 16 år",
    hcpFra: 18,
    hcpTil: 6,
    periode: "2 sesonger",
    sitat:
      "Anders behandlet meg som en utøver fra dag én. Treningsplanene var ikke generiske, de var bygd rundt det jeg trengte. Nå spiller jeg NM og trives med presset.",
    initialer: "ES",
  },
  {
    navn: "Geir T.",
    rolle: "Mosjonist, 62 år",
    hcpFra: 22,
    hcpTil: 14,
    periode: "9 måneder",
    sitat:
      "Jeg ville bare slå bedre med jernene mine før pensjonsturneringene. Det jeg fikk var hele spillet løftet: putting, nærspill, og en mental ro jeg aldri har hatt på banen.",
    initialer: "GT",
  },
];

export default function SuksessSide() {
  return (
    <div className="bg-background text-foreground">
      {/* ========== HERO · full-bleed foto + forest-scrim ========== */}
      <MarketingHero
        foto="/images/akademy/putting-data.jpg"
        eyebrow="Suksesshistorier · AK Golf Academy"
        tittel={
          <>
            Spillere som har <HeroEm>tatt steget</HeroEm>.
          </>
        }
        ingress="Tre eksempler på hva personlig coaching kan gjøre når plan, struktur og tett oppfølging går hånd i hånd."
        primaer={{ href: "/coaching", label: "Les om coaching" }}
        sekundaer={{ href: "/kontakt", label: "Snakk med oss" }}
      />

      {/* ========== CASES ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Resultater · Ekte spillere</SectionEyebrow>
          <SectionH2>
            Fremgang som <Em>kan måles</Em>.
          </SectionH2>

          <div className="mt-12 max-w-5xl space-y-4">
            {CASES.map((c) => (
              <article
                key={c.navn}
                className="grid gap-8 rounded-[20px] border border-border bg-card p-8 md:p-12 lg:grid-cols-[1fr_2fr]"
              >
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-full font-display text-2xl font-bold tracking-[-0.02em] text-accent"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(168 72% 11%) 100%)",
                    }}
                  >
                    {c.initialer}
                  </div>
                  <h3 className="mt-4 font-display text-[22px] font-bold leading-[1.1] tracking-[-0.015em]">
                    {c.navn}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.rolle}
                  </p>

                  <div className="mt-6 w-full rounded-[14px] border border-border bg-background p-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      HCP-utvikling
                    </p>
                    <p className="mt-2 flex items-baseline justify-center gap-4 font-mono text-xl font-semibold tabular-nums text-foreground lg:justify-start">
                      <span>{c.hcpFra}</span>
                      <TrendingDown
                        className="h-4 w-4 text-primary"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span className="text-primary">{c.hcpTil}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.periode}
                    </p>
                  </div>
                </div>

                <blockquote className="relative self-center">
                  <Quote
                    className="absolute -top-2 -left-2 h-8 w-8 text-primary/20"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <p className="pl-6 font-display text-[clamp(18px,2vw,22px)] font-normal italic leading-[1.5] text-foreground">
                    «{c.sitat}»
                  </p>
                </blockquote>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CLOSING CTA ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-16 text-center text-white sm:px-12 lg:px-16 lg:py-20"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(168 72% 11%) 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute -top-[120px] left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent opacity-[0.12] blur-[4px]"
          />
          <span className="relative z-10 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Begrenset antall plasser
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Vil du være neste <Em dark>suksesshistorie</Em>?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Vi tar imot et begrenset antall nye spillere hver sesong.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLime href="/coaching" withArrow>
              Les om coaching
            </CtaLime>
            <CtaOutlineLys href="/kontakt">Snakk med oss</CtaOutlineLys>
          </div>
        </div>
      </section>
    </div>
  );
}
