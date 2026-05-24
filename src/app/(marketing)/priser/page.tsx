import Link from "next/link";
import type { Metadata } from "next";
import { Check, CircleDot } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const metadata: Metadata = {
  title: "Priser — AK Golf Academy",
  description:
    "Velg mellom gratis PlayerHQ-tilgang eller PRO-abonnement med ubegrenset coaching. Ingen binding.",
};

type Tier = {
  navn: string;
  pris: string;
  prisEnhet: string;
  beskrivelse: string;
  funksjoner: string[];
  anbefalt: boolean;
  ctaTekst: string;
  ctaHref: string;
};

const TIERS: Tier[] = [
  {
    navn: "GRATIS",
    pris: "0 kr",
    prisEnhet: "/mnd",
    beskrivelse:
      "Kom i gang uten kostnad. Perfekt for spillere som vil teste PlayerHQ og spore runder og statistikk.",
    funksjoner: [
      "Treningslogg og øktregistrering",
      "Runderegistrering og historikk",
      "SG-statistikk og grunnanalyse",
      "1 TrackMan-økt per måned",
      "Tilgang til PlayerHQ-portalen",
    ],
    anbefalt: false,
    ctaTekst: "Kom i gang gratis",
    ctaHref: "/registrer",
  },
  {
    navn: "PRO",
    pris: "300 kr",
    prisEnhet: "/mnd",
    beskrivelse:
      "For spillere som vil ha tett oppfølging, analyse og direkte tilgang til coach. Alt i GRATIS, pluss.",
    funksjoner: [
      "Alt i GRATIS",
      "Ubegrenset TrackMan-tilgang",
      "Personlige coaching-planer",
      "SG Hub — dybdeanalyser",
      "Coach-chat og direkte oppfølging",
      "Periodisert treningsplan",
      "Prioritert booking",
    ],
    anbefalt: true,
    ctaTekst: "Start PRO",
    ctaHref: "/registrer?plan=pro",
  },
];

const FAQ_PRISER = [
  {
    q: "Kan jeg oppgradere når som helst?",
    a: "Ja. Du kan oppgradere fra GRATIS til PRO når det passer deg — endringen trer i kraft umiddelbart og du faktureres for resten av måneden.",
  },
  {
    q: "Er det binding?",
    a: "Nei. PRO-abonnementet er månedlig og kan sies opp uten varsel. Du beholder tilgangen ut inneværende måned.",
  },
  {
    q: "Hva skjer med data ved nedgradering?",
    a: "All historikk, runder og statistikk bevares. Du mister tilgang til PRO-funksjoner, men kan alltid oppgradere igjen for å hente dem frem.",
  },
];

export default function PriserSide() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1">
            <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
            <AthleticEyebrow>Priser</AthleticEyebrow>
          </div>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Enkelt og{" "}
            <em className="font-display font-normal italic text-primary">
              ærlig
            </em>{" "}
            prising
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
            Start gratis — oppgrader når du er klar. Ingen skjulte avgifter,
            ingen binding.
          </p>
        </div>
      </section>

      {/* Tier-kort */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {TIERS.map((tier) => (
            <TierCard key={tier.navn} tier={tier} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <AthleticEyebrow>Spørsmål og svar</AthleticEyebrow>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight">
              Ofte stilte spørsmål om{" "}
              <em className="font-display font-normal italic text-primary">
                priser
              </em>
            </h2>
          </div>

          <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden">
            {FAQ_PRISER.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-5 py-10 sm:px-8 sm:py-16 text-primary-foreground md:px-16 md:py-20 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
            style={{ background: "rgba(209,248,67,0.18)" }}
          />
          <div className="relative max-w-2xl mx-auto">
            <AthleticEyebrow tone="light">Kom i gang</AthleticEyebrow>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Klar til å ta neste steg?
            </h2>
            <p className="mt-6 text-[16px] leading-[1.6] opacity-90">
              Start med GRATIS-kontoen i dag. Ingen kredittkort nødvendig.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-center gap-3 sm:gap-4">
              <Link
                href="/registrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-[15px] font-bold text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition-opacity hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Opprett gratis konto
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-6 text-[15px] font-semibold transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Snakk med oss
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-card p-5 sm:p-8 ${
        tier.anbefalt ? "ring-2 ring-primary border-primary/40" : "border-border"
      }`}
    >
      {tier.anbefalt && (
        <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
          Anbefalt
        </span>
      )}

      <AthleticEyebrow>{tier.navn}</AthleticEyebrow>
      <p className="mt-4 text-4xl font-semibold tabular-nums">
        {tier.pris}
        <span className="text-lg font-normal text-muted-foreground">
          {tier.prisEnhet}
        </span>
      </p>
      <p className="mt-4 text-[14px] leading-[1.6] text-muted-foreground">
        {tier.beskrivelse}
      </p>

      <ul className="mt-6 space-y-3 flex-1">
        {tier.funksjoner.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2} />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={tier.ctaHref}
        className={`mt-8 block rounded-full px-6 py-3 text-center text-sm font-medium transition-opacity hover:opacity-90 ${
          tier.anbefalt
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-background text-foreground hover:bg-secondary"
        }`}
      >
        {tier.ctaTekst}
      </Link>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="px-8 py-6">
      <h3 className="font-display text-lg font-semibold tracking-tight">
        {q}
      </h3>
      <p className="mt-3 text-sm text-muted-foreground">{a}</p>
    </div>
  );
}
