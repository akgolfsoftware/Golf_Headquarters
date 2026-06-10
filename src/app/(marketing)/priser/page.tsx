import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
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
  title: "Priser — AK Golf Academy",
  description:
    "Flex drop-in 0 kr/mnd, Performance 1 200 kr/mnd, Performance Pro 2 220 kr/mnd. PlayerHQ-appen er gratis med coaching — ellers 300 kr/mnd. Ingen binding.",
};

/* Tjenester — samme priser og kort-anatomi som forsiden */
const TJENESTER = [
  {
    eb: "Drop-in",
    title: "Flex",
    price: "0",
    featured: false,
    items: [
      "Book enkelttimer ved behov",
      "20 min med Markus · 300 kr",
      "50 min med Anders · 1 300 kr",
      "Tilgang til Mulligan + GFGK",
    ],
    cta: "Book drop-in",
    href: "/booking",
  },
  {
    eb: "Anbefalt · 80 % velger denne",
    title: "Performance",
    price: "1 200",
    featured: true,
    items: [
      "4 timer 1:1 coaching pr. mnd",
      "Periodisert treningsplan",
      "Månedlig SG-rapport",
      "PlayerHQ-app inkludert",
      "Fri tilgang til alle anlegg",
    ],
    cta: "Start Performance",
    href: "/coaching",
  },
  {
    eb: "For ambisjon · Korn Ferry-spor",
    title: "Performance Pro",
    price: "2 220",
    featured: false,
    items: [
      "Ubegrenset 1:1 med Anders",
      "Full SG-analyse pr. runde",
      "Fysisk-program integrert i planen",
      "Turneringspriming + bane-prep",
      "Hjemmebase Mulligan Sarpsborg",
    ],
    cta: "Søk opptak",
    href: "/kontakt",
  },
] as const;

/* App-tilgang — gratis via coaching, ellers 300 kr/mnd. Ingen nivåer. */
const APP_GRATIS = [
  "Inkludert i Performance og Performance Pro",
  "Gratis i én måneds prøveperiode",
  "Gratis for spillere i grupper gjennom AK Golf",
];

const APP_BETALT = [
  "Full tilgang til PlayerHQ-portalen",
  "Treningslogg og øktregistrering",
  "Runderegistrering og historikk",
  "SG-statistikk og dybdeanalyser",
  "Treningsplan og kalender",
];

const FAQ_PRISER = [
  {
    q: "Kan jeg oppgradere når som helst?",
    a: "Ja. Du kan legge til en coaching-pakke eller endre abonnementet når det passer deg — endringen trer i kraft umiddelbart.",
  },
  {
    q: "Er det binding?",
    a: "Nei. Alt er månedlig og kan sies opp uten varsel. Du beholder tilgangen ut inneværende måned.",
  },
  {
    q: "Hva skjer med dataene mine hvis jeg sier opp?",
    a: "All historikk, runder og statistikk bevares. Du kan når som helst komme tilbake — alt ligger der du slapp.",
  },
];

export default function PriserSide() {
  return (
    <div className="bg-background text-foreground">
      {/* ========== HERO · full-bleed foto + forest-scrim ========== */}
      <MarketingHero
        foto="/images/akademy/walking-bag.jpg"
        eyebrow="Priser · Ingen binding"
        tittel={
          <>
            Enkelt og <HeroEm>ærlig</HeroEm> prising.
          </>
        }
        ingress="Start gratis — oppgrader når du er klar. Ingen skjulte avgifter, ingen binding."
        primaer={{ href: "#pakker", label: "Se pakkene" }}
        sekundaer={{ href: "/kontakt", label: "Snakk med oss" }}
      />

      {/* ========== TJENESTER · samme kort som forsiden ========== */}
      <section id="pakker" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Coaching · Månedlig</SectionEyebrow>
          <SectionH2>
            Tre veier til <Em>neste nivå</Em>.
          </SectionH2>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {TJENESTER.map((t) => (
              <TjenesteCard key={t.title} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== PLAYERHQ-PRIS · gratis via coaching / 300 kr ========== */}
      <section id="app" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>PlayerHQ · App-tilgang</SectionEyebrow>
          <SectionH2>
            Gratis med coaching. <Em>300 kr uten</Em>.
          </SectionH2>
          <p className="mt-4 max-w-[56ch] text-[16px] leading-[1.6] text-muted-foreground">
            PlayerHQ er inkludert i alle coaching-pakker, i én måneds
            prøveperiode og for spillere i grupper gjennom AK Golf. Alle andre
            betaler 300 kr i måneden — uten binding.
          </p>

          <div className="mt-12 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            <TjenesteCard
              eb="Anbefalt · Gratis via coaching"
              title="PlayerHQ — inkludert"
              price="0"
              items={APP_GRATIS}
              cta="Se coaching-pakkene"
              href="/coaching"
              featured
            />
            <TjenesteCard
              eb="Uten coaching · Ingen binding"
              title="PlayerHQ"
              price="300"
              items={APP_BETALT}
              cta="Opprett konto"
              href="/auth/signup"
              featured={false}
            />
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Spørsmål og svar</SectionEyebrow>
          <SectionH2>
            Ofte stilte <Em>spørsmål</Em>.
          </SectionH2>

          <div className="mt-12 max-w-3xl divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-card">
            {FAQ_PRISER.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
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
            Kom i gang
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Klar til å ta <Em dark>neste steg</Em>?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Opprett en gratis konto i dag — ingen kredittkort nødvendig.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLime href="/auth/signup" withArrow>
              Opprett gratis konto
            </CtaLime>
            <CtaOutlineLys href="/kontakt">Snakk med oss</CtaOutlineLys>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Tjeneste-kort (forsidens anatomi, featured = mørk) ---------- */

function TjenesteCard({
  eb,
  title,
  price,
  items,
  cta,
  href,
  featured,
}: {
  eb: string;
  title: string;
  price: string;
  items: readonly string[];
  cta: string;
  href: string;
  featured: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-[20px] border p-8 ${
        featured
          ? "dark border-transparent bg-background"
          : "border-border bg-card"
      }`}
    >
      <span
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${
          featured ? "text-accent" : "text-muted-foreground"
        }`}
      >
        {eb}
      </span>
      <h4
        className={`mt-3 font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em] ${
          featured ? "text-white" : "text-foreground"
        }`}
      >
        {title}
      </h4>
      <div
        className={`mt-6 flex items-baseline gap-1.5 border-t pt-5 ${
          featured ? "border-white/15" : "border-border"
        }`}
      >
        <span
          className={`font-mono text-4xl font-semibold leading-none tracking-[-0.025em] tabular-nums ${
            featured ? "text-white" : "text-foreground"
          }`}
        >
          {price}
        </span>
        <small
          className={`font-mono text-xs ${featured ? "text-white/70" : "text-muted-foreground"}`}
        >
          kr / mnd
        </small>
      </div>
      <ul className="mt-6 flex flex-col gap-2.5">
        {items.map((item) => (
          <li
            key={item}
            className={`flex items-start gap-2.5 text-sm leading-[1.45] ${
              featured ? "text-white/90" : "text-foreground"
            }`}
          >
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-accent" : "text-primary"}`}
              strokeWidth={1.5}
            />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-7 inline-flex h-11 items-center justify-center gap-1.5 font-display text-sm font-semibold tracking-[-0.005em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          featured
            ? "rounded-full bg-accent [--primary:164_100%_17.3%] text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] hover:brightness-105"
            : "rounded-xl text-primary ring-1 ring-inset ring-primary hover:bg-primary/5"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="px-8 py-6">
      <h3 className="font-display text-lg font-semibold tracking-[-0.015em]">
        {q}
      </h3>
      <p className="mt-2 text-sm leading-[1.55] text-muted-foreground">{a}</p>
    </div>
  );
}
