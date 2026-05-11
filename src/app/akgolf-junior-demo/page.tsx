/**
 * Marketing demo — Junior-program landingsside (akgolf.no/junior)
 * Hero, målgruppe, 4-trinns program, foreldre-info, BankID, pris, testimonials, FAQ.
 */
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Trophy,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Quote,
} from "lucide-react";
import { MarketingNav, MarketingFooter } from "../_marketing-demo/chrome";

type Trinn = {
  number: string;
  name: string;
  age: string;
  description: string;
  focus: string[];
  color: string;
};

const TRINN: Trinn[] = [
  {
    number: "01",
    name: "Begynner",
    age: "8–10 år",
    description:
      "Glede, motorikk og grunnleggende ferdigheter. Ingen turneringer — kun lek og læring.",
    focus: ["Putting og chip", "Kort sving", "Glede på banen", "Sosialt med jevnaldrende"],
    color: "var(--color-pyr-tek)",
  },
  {
    number: "02",
    name: "Utvikling",
    age: "10–13 år",
    description:
      "Strukturert teknikk-arbeid, første turneringer og introduksjon til mental rutine.",
    focus: ["Full sving", "9-hulls runder", "Klubbturneringer", "Treningsrutine"],
    color: "var(--color-pyr-slag)",
  },
  {
    number: "03",
    name: "Talent",
    age: "13–16 år",
    description:
      "Periodisert trening, TrackMan-analyser, regionale turneringer og videoanalyse.",
    focus: [
      "Strokes Gained",
      "Regionale turneringer",
      "Mental trening",
      "Treningsdagbok",
    ],
    color: "var(--color-pyr-fys)",
  },
  {
    number: "04",
    name: "Elite",
    age: "16–18 år",
    description:
      "WANG Toppidrett-spor, NM-spill og forberedelse til college eller proff-karriere.",
    focus: [
      "Individuell coach",
      "NM Junior + Nordic",
      "Fysisk trening med ekstern PT",
      "College-veiledning",
    ],
    color: "var(--color-pyr-spill)",
  },
];

const TESTIMONIALS = [
  {
    parent: "Linda Roinås",
    child: "mor til Markus (17)",
    text: "Markus har funnet seg selv her. Det er ikke bare golf — det er måten Anders og Sara snakker med ungene på. De blir sett, både på og utenfor banen.",
  },
  {
    parent: "Bjørn Solberg",
    child: "far til Emma (14)",
    text: "Emma startet uten erfaring. To år senere spiller hun NM. Det viktigste er at hun fortsatt elsker å gå på trening — uten det ville ingenting kommet.",
  },
];

const FAQ = [
  {
    q: "Hva koster junior-programmet?",
    a: "Trinn 1–3 koster 2 100 kr per måned (rabattert PRO-medlemskap for U18). Trinn 4 Elite har individuell prisstruktur — vi tar en samtale med foreldrene først.",
  },
  {
    q: "Trenger barnet mitt erfaring fra før?",
    a: "Nei. Mange av våre beste juniorer startet uten å ha rørt en kølle. Trinn 1 er designet for å introdusere golf på en lekende måte.",
  },
  {
    q: "Hvor mange ganger i uka trenes det?",
    a: "Trinn 1: 1 økt. Trinn 2: 1–2 økter. Trinn 3: 2–3 økter. Trinn 4: 3–5 økter, individuelt tilpasset.",
  },
  {
    q: "Hvor foregår treningen?",
    a: "GFGK Bossum (utendørs sesong), Mulligan Indoor Borre (helårs simulator). Junior-grupper rullerer mellom anleggene.",
  },
  {
    q: "Hvordan fungerer BankID-samtykke?",
    a: "Vi følger NGFs regelverk for mindreårige. Foreldre signerer alle samtykker digitalt via BankID — for bilde-bruk, helse, reise og turneringspåmelding.",
  },
  {
    q: "Kan vi prøve én økt først?",
    a: "Ja. Vi tilbyr en gratis intro-økt for alle nye juniorer. Etter den setter vi oss ned med foreldrene og vurderer hvilket trinn som passer.",
  },
];

export default function JuniorDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav active="Tjenester" />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                AK Golf · Junior
              </span>
              <h1 className="mt-6 font-display text-[48px] font-semibold leading-[1.02] tracking-tight md:text-[72px]">
                <em className="font-display font-normal italic [font-family:var(--font-instrument-serif),serif]">
                  Vi bygger golfspillere
                </em>{" "}
                — fra første swing til NM
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-muted-foreground">
                Et helhetlig program for spillere mellom 8 og 18 år. Vi tar
                glede, struktur og målsetting på like stort alvor — på Bossum og
                Mulligan, helåret rundt.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Book gratis intro-økt
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
                <Link
                  href="#trinn"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Se programmet
                </Link>
              </div>
            </div>

            {/* Hero stats */}
            <div className="grid grid-cols-2 gap-4">
              <HeroStat
                Icon={Users}
                value="64"
                label="Aktive juniorer denne sesongen"
              />
              <HeroStat
                Icon={Trophy}
                value="14"
                label="NM-deltakelser i 2025"
              />
              <HeroStat
                Icon={TrendingUp}
                value="−4,2"
                label="HCP-snitt på 12 mnd"
              />
              <HeroStat Icon={ShieldCheck} value="3" label="PGA-coacher" />
            </div>
          </div>
        </div>
      </section>

      {/* Målgruppe */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                For hvem
              </span>
              <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] tracking-tight md:text-[44px]">
                Spillere mellom{" "}
                <em className="font-display font-normal italic [font-family:var(--font-instrument-serif),serif]">
                  8 og 18 år
                </em>
              </h2>
              <p className="mt-5 text-[16px] leading-[1.65] text-muted-foreground">
                Vi tar imot helt nye spillere så vel som etablerte talenter. Det
                som betyr noe, er at barnet selv har lyst — vi tilpasser
                ambisjonsnivået sammen med foreldrene.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                "Aldersinndelte grupper for trygg progresjon",
                "Helårsprogram — inne i vinter, ute fra påske",
                "Maks 6 spillere per coach i ordinære grupper",
                "Egen plan for hver spiller fra trinn 2",
                "Foreldre-portal med ukentlige oppdateringer",
                "Inkluderer turneringspåmelding og reisetilrettelegging",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5"
                >
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    strokeWidth={1.75}
                  />
                  <span className="text-[15px] leading-[1.5]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4-trinns program */}
      <section id="trinn" className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Programmet
            </span>
            <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] tracking-tight md:text-[44px]">
              Fire trinn fra første swing til NM-spill
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground">
              Hvert trinn har egne mål, treningsstruktur og pris. Vi flytter
              ikke spillere oppover automatisk — det skjer kun når både barn og
              coach mener det er riktig.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TRINN.map((t) => (
              <div
                key={t.number}
                className="flex flex-col rounded-2xl border border-border bg-background p-8"
              >
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-mono font-semibold"
                  style={{ background: t.color, color: "#0A1F17" }}
                >
                  {t.number}
                </div>
                <h3 className="font-display text-[22px] font-semibold tracking-tight">
                  {t.name}
                </h3>
                <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {t.age}
                </p>
                <p className="mt-4 text-[14px] leading-[1.6] text-muted-foreground">
                  {t.description}
                </p>
                <ul className="mt-6 space-y-2 border-t border-border pt-5">
                  {t.focus.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13px] leading-[1.4]"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                        strokeWidth={1.75}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Foreldre + BankID */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-10">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Foreldre-info
              </span>
              <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.15] tracking-tight">
                Vi tar foreldrerollen på alvor
              </h2>
              <p className="mt-4 text-[15px] leading-[1.6] text-muted-foreground">
                Du får ukentlige oppdateringer i foreldre-portalen, kvartalsvis
                utviklingssamtale med coach, og direkte tilgang til hovedcoach
                på SMS for raske spørsmål. Vi gjør det enklere å være
                golf-forelder, ikke vanskeligere.
              </p>
              <ul className="mt-6 space-y-3 text-[14px]">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 text-primary"
                    strokeWidth={1.75}
                  />
                  <span>Ukentlig statusrapport per e-post</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 text-primary"
                    strokeWidth={1.75}
                  />
                  <span>Kvartalsvis utviklingssamtale (30 min)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 text-primary"
                    strokeWidth={1.75}
                  />
                  <span>Felles foreldre-Slack for hver gruppe</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 text-primary"
                    strokeWidth={1.75}
                  />
                  <span>Reise- og turneringskoordinering</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="mt-5 font-display text-[28px] font-semibold leading-[1.15] tracking-tight">
                BankID-samtykke for trygghet
              </h2>
              <p className="mt-4 text-[15px] leading-[1.6] text-muted-foreground">
                Alle samtykker for mindreårige håndteres digitalt via BankID.
                Det betyr ingen papirer på trening og ingen tvil om hva som er
                signert.
              </p>
              <div className="mt-6 space-y-3">
                <SamtykkeRow label="Bildebruk i markedsføring" />
                <SamtykkeRow label="Helsedata til personlig plan" />
                <SamtykkeRow label="Reise med coach på turnering" />
                <SamtykkeRow label="Turneringspåmelding via NGF" />
              </div>
              <p className="mt-5 text-[12px] leading-[1.5] text-muted-foreground">
                Du kan når som helst trekke samtykker tilbake i
                foreldre-portalen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pris */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Pris
              </span>
              <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] tracking-tight md:text-[44px]">
                Rabattert PRO for{" "}
                <em className="font-display font-normal italic [font-family:var(--font-instrument-serif),serif]">
                  U18
                </em>
              </h2>
              <p className="mt-4 text-[15px] leading-[1.6] text-muted-foreground">
                Junior-medlemskap er rabattert mot ordinær PRO. Du betaler
                månedlig eller årlig — årlig sparer du 600 kr.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PriceCard
                title="Junior PRO · månedlig"
                price="2 100 kr"
                period="per måned"
                features={[
                  "Inkluderer trinn 1–3",
                  "Ingen binding",
                  "Avsluttes når som helst",
                  "Trinn 4 Elite — egen pris",
                ]}
              />
              <PriceCard
                title="Junior PRO · årlig"
                price="21 000 kr"
                period="per år"
                badge="Spar 6 000 kr"
                highlight
                features={[
                  "Tilsvarer 1 750 kr/mnd",
                  "All trening inkludert",
                  "Prioritet på turneringsplasser",
                  "Trinn 4 Elite — egen pris",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Foreldre forteller
            </span>
            <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] tracking-tight md:text-[40px]">
              Hva foreldrene sier
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.parent}
                className="rounded-2xl border border-border bg-card p-10"
              >
                <Quote
                  className="h-7 w-7 text-primary opacity-60"
                  strokeWidth={1.5}
                />
                <p className="mt-4 font-display text-[20px] leading-[1.4] italic [font-family:var(--font-instrument-serif),serif]">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-6 border-t border-border pt-5">
                  <div className="text-[14px] font-semibold">{t.parent}</div>
                  <div className="text-[12px] text-muted-foreground">
                    {t.child}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            FAQ
          </span>
          <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] tracking-tight md:text-[40px]">
            Spørsmål foreldre ofte har
          </h2>
          <div className="mt-10 divide-y divide-border border-t border-border">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer items-center justify-between text-[16px] font-semibold">
                  {f.q}
                  <PlusCircle
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                    strokeWidth={1.5}
                  />
                </summary>
                <p className="mt-3 text-[15px] leading-[1.65] text-muted-foreground">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function HeroStat({
  Icon,
  value,
  label,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
      <div className="mt-3 font-display font-mono text-[28px] font-semibold tabular-nums leading-none tracking-tight">
        {value}
      </div>
      <div className="mt-2 text-[12px] leading-[1.4] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function SamtykkeRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-2.5 text-[13px]">
      <span>{label}</span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        BankID
      </span>
    </div>
  );
}

function PriceCard({
  title,
  price,
  period,
  features,
  badge,
  highlight = false,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-8 ${
        highlight
          ? "border-2 border-primary bg-background"
          : "border border-border bg-background"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-foreground">
          {badge}
        </span>
      )}
      <h3 className="font-display text-[18px] font-semibold tracking-tight">
        {title}
      </h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display font-mono text-[36px] font-semibold tabular-nums leading-none tracking-tight">
          {price}
        </span>
        <span className="text-[13px] text-muted-foreground">{period}</span>
      </div>
      <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-[13px] leading-[1.5]"
          >
            <CheckCircle2
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
              strokeWidth={1.75}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
