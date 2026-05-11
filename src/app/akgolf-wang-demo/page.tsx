/**
 * AK Golf x WANG Toppidrett Fredrikstad — partnerskap-side.
 * URL: /akgolf-wang-demo
 *
 * Marketing-side som forklarer samarbeidet mellom AK Golf og WANG Toppidrett
 * Fredrikstad — idrettsskole med golf-linje. AK Golf har faglig ansvar.
 */
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  GraduationCap,
  Quote,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import {
  MarketingFooter,
  MarketingNav,
} from "@/app/_marketing-demo/chrome";

type Offering = {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
  meta: string;
};

const OFFERINGS: Offering[] = [
  {
    Icon: CalendarClock,
    title: "Daglige treninger",
    desc: "Mandag, onsdag og fredag kl. 08–10. Strukturert oppvarming, teknisk arbeid og slag-progresjon, ledet av AK Golf-coach.",
    meta: "3 x uke · 6 t total",
  },
  {
    Icon: Target,
    title: "Testing og kartlegging",
    desc: "Trackman-baseline, fysiske tester og taktiske vurderinger. Hver elev får 360-profil og personlig utviklingsplan hvert kvartal.",
    meta: "4 x år · individuell",
  },
  {
    Icon: Trophy,
    title: "Konkurransestøtte",
    desc: "Forberedelse til NM, Race to Costa Daurada og regionale Tour-stevner. Reise, taktikk og psyk gjennomgås i forkant av hver turnering.",
    meta: "12+ turneringer · sesong",
  },
];

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initial: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Strukturen vi får gjennom WANG og AK Golf er det som har løftet meg fra 8 til +1 i handicap på halvannet år. Treningene har faglig dybde, og jeg vet nøyaktig hva jeg jobber med.",
    name: "Markus Roinås Pedersen",
    role: "Elev VG3 · HCP +2,4",
    initial: "M",
  },
  {
    quote:
      "Det at jeg får trent før skolen tre dager i uka, kombinert med tester og oppfølging, gir meg en helt annen progresjon enn jeg hadde fått alene. Coachene følger med på alt jeg gjør.",
    name: "Sofie Aas Berntsen",
    role: "Elev VG2 · HCP 4,1",
    initial: "S",
  },
  {
    quote:
      "Vi har spillere som leverer på nasjonalt nivå nå. Det er fordi AK Golf bringer faglig metodikk og struktur som vi som skole ikke kan bygge selv.",
    name: "Erik Lundberg",
    role: "Rektor · WANG Toppidrett Fredrikstad",
    initial: "E",
  },
];

const STATS = [
  { value: "32", label: "Elever på golf-linja" },
  { value: "3", label: "Treningsdager per uke" },
  { value: "6", label: "År med samarbeid" },
  { value: "+0,8", label: "SG-snitt forbedring per sesong" },
];

export default function AkgolfWangDemo() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:py-32">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Partnerskap siden 2020
            </span>
            <h1 className="mt-6 font-display text-[56px] font-semibold leading-[1.05] tracking-tight md:text-[72px]">
              <em className="font-medium italic text-primary">
                Sammen om talentene
              </em>
              <span className="block text-foreground">
                AK Golf x WANG Toppidrett.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[18px] leading-[1.6] text-muted-foreground">
              WANG Toppidrett Fredrikstad er Norges ledende idrettsskole på
              Østlandet. Vi har faglig ansvar for golf-linja og leverer den
              tekniske, fysiske og taktiske utviklingen som tar elevene videre.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#kontakt"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Bli elev hos WANG
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
              <Link
                href="/akgolf-tjenester-demo"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-6 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Se alle tjenester
              </Link>
            </div>
          </div>

          {/* Stat-grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-background p-8"
              >
                <div className="font-mono text-[36px] font-semibold tabular-nums leading-none -tracking-tight text-foreground">
                  {s.value}
                </div>
                <div className="mt-3 text-[13px] leading-[1.4] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Om samarbeidet — to spalter */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-10">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary">
              <GraduationCap
                className="h-5 w-5 text-foreground"
                strokeWidth={1.5}
              />
            </span>
            <h2 className="mt-6 font-display text-[28px] font-semibold leading-tight tracking-tight">
              WANG Toppidrett Fredrikstad
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-muted-foreground">
              WANG Toppidrett er en privat videregående idrettsskole med
              avdelinger over hele Norge. Avdelingen i Fredrikstad har drevet
              siden 2014 og kombinerer fullverdig studiespesialisering med
              daglig trening på toppnivå.
            </p>
            <ul className="mt-6 space-y-3 text-[14px] text-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                Idrettslinje med 240 elever, ca. 32 på golf-linja
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                Treningstid i skoletid, ikke etter skolen
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                Akkreditert av Olympiatoppen som regional partner
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-10">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </span>
            <h2 className="mt-6 font-display text-[28px] font-semibold leading-tight tracking-tight">
              AK Golf — faglig ansvar
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-muted-foreground">
              AK Golf har faglig ansvar for hele golf-linja. Det betyr at vi
              planlegger, gjennomfører og evaluerer all trening — fra årsplan
              ned til den enkelte øvelsen — og at hver elev har en personlig
              coach.
            </p>
            <ul className="mt-6 space-y-3 text-[14px] text-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                Periodisert årsplan med tester og målbare KPI-er
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                Individuell utviklingsplan med kvartalsvurdering
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                Daglig nærhet — coachene er på treningene selv
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Felles tilbud */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Felles tilbud
            </span>
            <h2 className="mt-3 font-display text-[40px] font-semibold leading-tight tracking-tight md:text-[48px]">
              <em className="font-medium italic">Tre pilarer</em> i utviklingen
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground">
              Trening, testing og turnering — knyttet sammen i én helhetlig
              ramme som drives av AK Golf hver eneste uke.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {OFFERINGS.map(({ Icon, title, desc, meta }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-border bg-background p-8 transition-colors hover:border-foreground/30"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="mt-6 font-display text-[22px] font-semibold leading-snug tracking-tight">
                  {title}
                </h3>
                <p className="mt-3 flex-1 text-[14px] leading-[1.6] text-muted-foreground">
                  {desc}
                </p>
                <span className="mt-6 inline-flex w-fit items-center rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  {meta}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Stemmer fra linja
          </span>
          <h2 className="mt-3 font-display text-[40px] font-semibold leading-tight tracking-tight md:text-[48px]">
            <em className="font-medium italic">Hva elevene</em> sier
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-8"
            >
              <Quote
                className="h-7 w-7 text-primary/40"
                strokeWidth={1.5}
              />
              <blockquote className="mt-4 flex-1 text-[15px] leading-[1.6] text-foreground">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-display text-[15px] font-semibold">
                  {t.initial}
                </span>
                <div>
                  <div className="text-[14px] font-semibold leading-tight">
                    {t.name}
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">
                    {t.role}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="overflow-hidden rounded-2xl bg-primary p-12 md:p-16">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="font-display text-[40px] font-semibold leading-tight tracking-tight text-primary-foreground md:text-[48px]">
                  <em className="font-medium italic">Vil du søke?</em>
                </h2>
                <p className="mt-4 max-w-xl text-[16px] leading-[1.6] text-primary-foreground/90">
                  Søknadsfrist for skoleåret 2026/27 er 1. mars. Vi tar gjerne
                  en uforpliktende prat om elevens nivå og hva linja passer
                  til.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="mailto:akgolfgroup@gmail.com"
                  className="inline-flex items-center justify-between gap-2 rounded-full bg-background px-6 py-4 text-[15px] font-semibold text-foreground transition-opacity hover:opacity-90"
                >
                  akgolfgroup@gmail.com
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
                <Link
                  href="tel:+4790123456"
                  className="inline-flex items-center justify-between gap-2 rounded-full border border-primary-foreground/30 bg-transparent px-6 py-4 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  +47 901 23 456
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
