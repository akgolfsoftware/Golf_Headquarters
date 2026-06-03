/**
 * Forside — Marketing-landingssiden for akgolf.no (full-bredde, ingen app-sidebar).
 *
 * Presentasjonell og props-drevet. Portet pixel-for-pixel fra v10-fasiten
 * (public/design-handover/_screens/mk-forside.png). Seksjonsrekkefølge:
 *   1. Sticky nav (ak-logo + lenker + Logg inn + grønn "Book tid")
 *   2. Lys hero (eyebrow-pill + display-headline + lime CTA-er)
 *   3. Full-bredde hero-foto (rundede hjørner)
 *   4. KPI-stripe (4 tall, mono)
 *   5. "Velg en time" — 3 booking-kort (midten "MEST POPULÆR")
 *   6. "Tre veier til neste nivå" — 3 medlemskaps-kort med ikon
 *   7. PlayerHQ-pitch — lys grå split-kort med foto høyre
 *   8. "To anlegg, hele året" — 2 anleggs-kort med forest-foto-header + lime-flagg
 *   9. Partner-stripe (SAMARBEID OG PARTNERE)
 *  10. Closing CTA — forest-grønt kort med dekor-sirkel
 *  11. Footer — forest-grønn, 3 lenkekolonner + kontakt + bunnlinje
 *
 * Demo-data er hardkodet i forsideDemo (matcher fasiten). Ingen Prisma/DB/auth.
 */

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  Clock,
  Flag,
  GraduationCap,
  LineChart,
  Mail,
  MapPin,
  Send,
  Sparkles,
  Target,
  Trees,
  Users,
  type LucideIcon,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────────────────
//  Typer
// ────────────────────────────────────────────────────────────────────────────

type NavLink = { label: string; href: string };

type BookingCard = {
  audience: string;
  title: string;
  coach: string;
  blurb: string;
  duration: string;
  next: string;
  price: string;
  href: string;
  featured?: boolean;
};

type PlanCard = {
  icon: "target" | "line-chart" | "graduation-cap";
  eyebrow: string;
  title: string;
  blurb: string;
  price: string;
  priceUnit: string;
  href: string;
  featured?: boolean;
};

type FacilityCard = {
  meta: string;
  metaIcon: "indoor" | "outdoor";
  title: string;
  blurb: string;
  linkLabel: string;
  href: string;
  external?: boolean;
};

type Partner = { label: string };

type FooterColumn = { title: string; links: NavLink[] };

export type ForsideData = {
  nav: {
    links: NavLink[];
    loginHref: string;
    cta: { label: string; href: string };
  };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    body: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
    image: { src: string; alt: string };
  };
  kpis: { value: string; plus?: boolean; label: string }[];
  booking: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    body: string;
    cards: BookingCard[];
  };
  plans: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    body: string;
    cards: PlanCard[];
  };
  playerhq: {
    badges: { label: string; tone: "included" | "muted" }[];
    titleLeadA: string;
    titleAccent: string;
    titleLeadB: string;
    body: string;
    link: { label: string; href: string };
    image: { src: string; alt: string };
  };
  facilities: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    body: string;
    cards: FacilityCard[];
  };
  partners: { eyebrow: string; items: Partner[] };
  closing: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    body: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
  footer: {
    tagline: string;
    columns: FooterColumn[];
    email: { value: string; href: string; note: string };
    location: { value: string; href: string; note: string };
    legal: string;
    meta: NavLink[];
  };
};

// ────────────────────────────────────────────────────────────────────────────
//  Ikon-oppslag
// ────────────────────────────────────────────────────────────────────────────

const PLAN_ICON: Record<PlanCard["icon"], LucideIcon> = {
  target: Target,
  "line-chart": LineChart,
  "graduation-cap": GraduationCap,
};

// ────────────────────────────────────────────────────────────────────────────
//  Små byggeklosser
// ────────────────────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  );
}

function SectionHeading({
  lead,
  accent,
  body,
}: {
  lead: string;
  accent: string;
  body: string;
}) {
  return (
    <>
      <h2 className="font-display mt-5 max-w-[20ch] text-balance text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
        {lead}{" "}
        <em className="font-normal italic text-primary">{accent}</em>
      </h2>
      <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-muted-foreground">
        {body}
      </p>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Nav
// ────────────────────────────────────────────────────────────────────────────

function Nav({ data }: { data: ForsideData["nav"] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-6 px-6">
        <Link href="/" aria-label="AK Golf — hjem" className="inline-flex shrink-0">
          <Image
            src="/logos/ak-golf-logo-primary-on-light.svg"
            alt="AK Golf"
            width={52}
            height={Math.round(52 * (470 / 538))}
            priority
          />
        </Link>

        <nav className="ml-6 hidden items-center gap-7 md:flex">
          {data.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium tracking-[-0.005em] text-foreground transition-opacity hover:opacity-60 focus-visible:underline focus-visible:outline-none"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link
            href={data.loginHref}
            className="hidden text-sm font-medium text-foreground transition-opacity hover:opacity-60 focus-visible:underline focus-visible:outline-none sm:inline"
          >
            Logg inn
          </Link>
          <Link
            href={data.cta.href}
            className="inline-flex h-[42px] items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-5 font-display text-sm font-bold tracking-[-0.005em] text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {data.cta.label}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Hero
// ────────────────────────────────────────────────────────────────────────────

function Hero({ data }: { data: ForsideData["hero"] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-12 pt-14 sm:pt-20">
      <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4 text-sm font-medium tracking-[-0.005em] text-muted-foreground">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent">
          <Sparkles className="h-4 w-4 text-accent-foreground" strokeWidth={2} aria-hidden />
        </span>
        {data.eyebrow}
      </span>

      <h1 className="font-display mt-6 max-w-[16ch] text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-foreground">
        {data.titleLead}{" "}
        <em className="font-normal italic text-primary">{data.titleAccent}</em>
      </h1>

      <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-muted-foreground">
        {data.body}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={data.primary.href}
          className="inline-flex h-[52px] items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-display text-base font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-0.5 hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {data.primary.label}
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </Link>
        <Link
          href={data.secondary.href}
          className="inline-flex h-[52px] items-center rounded-xl px-6 font-display text-base font-bold tracking-[-0.005em] text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))] transition hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {data.secondary.label}
        </Link>
      </div>

      <div className="relative mt-12 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-secondary sm:aspect-[21/9]">
        <Image
          src={data.image.src}
          alt={data.image.alt}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
        />
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  KPI-stripe
// ────────────────────────────────────────────────────────────────────────────

function KpiStrip({ data }: { data: ForsideData["kpis"] }) {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data.map((k) => (
          <div
            key={k.label}
            className="rounded-3xl border border-border bg-card px-6 py-6"
          >
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {k.label}
            </div>
            <div className="mt-3 font-mono text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-none tracking-[-0.025em] text-foreground [font-feature-settings:'tnum','zero']">
              {k.value}
              {k.plus && <span className="font-normal text-muted-foreground">+</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Booking-seksjon
// ────────────────────────────────────────────────────────────────────────────

function BookingSection({ data }: { data: ForsideData["booking"] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <Eyebrow>
        <Send className="h-3 w-3" strokeWidth={2} aria-hidden />
        {data.eyebrow}
      </Eyebrow>
      <SectionHeading lead={data.titleLead} accent={data.titleAccent} body={data.body} />

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {data.cards.map((c) => (
          <div
            key={c.title}
            className={`relative flex flex-col rounded-3xl border p-7 transition ${
              c.featured
                ? "border-primary bg-gradient-to-b from-card to-primary/[0.04] shadow-[0_8px_24px_rgba(10,31,23,0.10)]"
                : "border-border bg-card hover:border-primary hover:shadow-[0_4px_14px_rgba(10,31,23,0.08)]"
            }`}
          >
            {c.featured && (
              <span className="absolute -top-2.5 left-6 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)]">
                Mest populær
              </span>
            )}
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {c.audience}
            </span>
            <h3 className="font-display mt-2 text-2xl font-bold leading-[1.1] tracking-[-0.015em] text-foreground">
              {c.title}
            </h3>
            <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              {c.coach}
            </span>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.blurb}</p>

            <div className="mt-auto pt-5">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                {c.duration}
              </span>
              <span className="mt-2 flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1.5 font-mono text-[11px] text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                {c.next}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
              <span className="font-mono text-base font-semibold tracking-[-0.01em] text-foreground">
                {c.price}
              </span>
              <Link
                href={c.href}
                className="inline-flex items-center gap-1 font-display text-sm font-semibold text-primary transition hover:gap-1.5 focus-visible:underline focus-visible:outline-none"
              >
                Book
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Tjenester / medlemskap
// ────────────────────────────────────────────────────────────────────────────

function PlansSection({ data }: { data: ForsideData["plans"] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-24">
      <Eyebrow>
        <Target className="h-3 w-3" strokeWidth={2} aria-hidden />
        {data.eyebrow}
      </Eyebrow>
      <SectionHeading lead={data.titleLead} accent={data.titleAccent} body={data.body} />

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {data.cards.map((c) => {
          const Icon = PLAN_ICON[c.icon];
          return (
            <div
              key={c.title}
              className="relative flex flex-col rounded-3xl border border-border bg-card p-7"
            >
              {c.featured && (
                <span className="absolute -top-2.5 left-6 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)]">
                  Mest populær
                </span>
              )}
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Icon className="h-5 w-5 text-foreground" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {c.eyebrow}
              </span>
              <h3 className="font-display mt-2 text-[1.75rem] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
                {c.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {c.blurb}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {c.price}
                  <span className="font-normal text-muted-foreground"> {c.priceUnit}</span>
                </span>
                <Link
                  href={c.href}
                  className="inline-flex items-center gap-1 font-display text-sm font-semibold text-primary transition hover:gap-1.5 focus-visible:underline focus-visible:outline-none"
                >
                  Les mer
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  PlayerHQ-pitch
// ────────────────────────────────────────────────────────────────────────────

function PlayerHqSection({ data }: { data: ForsideData["playerhq"] }) {
  return (
    <section
      className="mx-auto max-w-7xl px-6 pb-20 sm:pb-24"
      // Lås seksjonen til lyst tema-palett uansett .dark-kontekst — fasiten
      // viser alltid lyst sand-kort med mørk tekst. Verdiene speiler
      // globals.css :root (samme design-tokens, kun låst til lys variant).
      style={
        {
          "--secondary": "45 18% 94%",
          "--foreground": "157 53% 8%",
          "--muted-foreground": "60 4% 37%",
          "--primary": "159 100% 17%",
          "--success": "154 64% 30%",
        } as React.CSSProperties
      }
    >
      <div className="grid items-stretch gap-8 overflow-hidden rounded-3xl bg-secondary md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <div className="flex flex-wrap items-center gap-3">
            {data.badges.map((b) =>
              b.tone === "included" ? (
                <span
                  key={b.label}
                  className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-success"
                >
                  {b.label}
                </span>
              ) : (
                <span
                  key={b.label}
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {b.label}
                </span>
              ),
            )}
          </div>

          <h2 className="font-display mt-4 text-balance text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
            {data.titleLeadA}{" "}
            <em className="font-normal italic text-primary">{data.titleAccent}</em>{" "}
            {data.titleLeadB}
          </h2>
          <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-muted-foreground">
            {data.body}
          </p>
          <Link
            href={data.link.href}
            className="mt-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary transition hover:gap-2 focus-visible:underline focus-visible:outline-none"
          >
            {data.link.label}
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        </div>

        <div className="relative min-h-[260px] md:min-h-[400px]">
          <Image
            src={data.image.src}
            alt={data.image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Anlegg
// ────────────────────────────────────────────────────────────────────────────

function FacilitiesSection({ data }: { data: ForsideData["facilities"] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-24">
      <Eyebrow>
        <MapPin className="h-3 w-3" strokeWidth={2} aria-hidden />
        {data.eyebrow}
      </Eyebrow>
      <SectionHeading lead={data.titleLead} accent={data.titleAccent} body={data.body} />

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {data.cards.map((c) => {
          const MetaIcon = c.metaIcon === "indoor" ? Building2 : Trees;
          return (
            <div
              key={c.title}
              className="overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="flex h-28 items-center justify-center bg-primary">
                <Flag className="h-10 w-10 text-accent" strokeWidth={1.5} aria-hidden />
              </div>
              <div className="p-7">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  <MetaIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                  {c.meta}
                </span>
                <h3 className="font-display mt-3 text-[1.4rem] font-bold tracking-[-0.015em] text-foreground">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {c.blurb}
                </p>
                {c.external ? (
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary transition hover:gap-2 focus-visible:underline focus-visible:outline-none"
                  >
                    {c.linkLabel}
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </a>
                ) : (
                  <Link
                    href={c.href}
                    className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary transition hover:gap-2 focus-visible:underline focus-visible:outline-none"
                  >
                    {c.linkLabel}
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Partner-stripe
// ────────────────────────────────────────────────────────────────────────────

function PartnersSection({ data }: { data: ForsideData["partners"] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-24">
      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card px-7 py-5 lg:flex-row lg:items-center">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {data.eyebrow}
        </span>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3 lg:ml-auto">
          {data.items.map((p) => (
            <span
              key={p.label}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Closing CTA
// ────────────────────────────────────────────────────────────────────────────

function ClosingSection({ data }: { data: ForsideData["closing"] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#08322a] px-8 py-16 text-white sm:px-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-accent/15"
        />
        <div className="relative">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            {data.eyebrow}
          </span>
          <h2 className="font-display mt-4 max-w-[20ch] text-balance text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.025em] text-accent">
            {data.titleLead}{" "}
            <em className="font-normal italic">{data.titleAccent}</em>
            {data.titleTail}
          </h2>
          <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-white/85">
            {data.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={data.primary.href}
              className="inline-flex h-[52px] items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-display text-base font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-0.5 hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <CalendarDays className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              {data.primary.label}
            </Link>
            <Link
              href={data.secondary.href}
              className="inline-flex h-[52px] items-center rounded-full px-6 font-display text-base font-bold tracking-[-0.005em] text-white shadow-[inset_0_0_0_1px_rgba(245,244,238,0.45)] transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {data.secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Footer
// ────────────────────────────────────────────────────────────────────────────

function Footer({ data }: { data: ForsideData["footer"] }) {
  return (
    <footer className="bg-primary text-white">
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(209,248,67,0.10), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" aria-label="AK Golf — hjem" className="inline-flex">
                <Image
                  src="/logos/ak-golf-logo-white-on-dark.svg"
                  alt="AK Golf"
                  width={72}
                  height={Math.round(72 * (470 / 538))}
                  priority
                />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
                {data.tagline}
              </p>
              <div className="mt-6 flex items-center gap-2">
                <a
                  href="https://instagram.com/akgolfacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-accent hover:text-accent-foreground"
                >
                  <Send className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </a>
                <a
                  href={data.email.href}
                  aria-label="E-post"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-accent hover:text-accent-foreground"
                >
                  <Mail className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </a>
              </div>
            </div>

            {data.columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-white/80 transition hover:text-white focus-visible:underline focus-visible:outline-none"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid gap-6 border-b border-white/10 py-10 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Mail className="h-4 w-4 text-accent" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                  E-post
                </div>
                <a
                  href={data.email.href}
                  className="font-display mt-1 block text-base font-medium text-white hover:text-accent"
                >
                  {data.email.value}
                </a>
                <div className="font-mono mt-1 text-[10px] tracking-[0.06em] text-white/50">
                  {data.email.note}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <MapPin className="h-4 w-4 text-accent" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                  Anlegg
                </div>
                <Link
                  href={data.location.href}
                  className="font-display mt-1 block text-base font-medium text-white hover:text-accent"
                >
                  {data.location.value}
                </Link>
                <div className="font-mono mt-1 text-[10px] tracking-[0.06em] text-white/50">
                  {data.location.note}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-8 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <span>{data.legal}</span>
            <div className="flex gap-6">
              {data.meta.map((m) => (
                <Link
                  key={m.label}
                  href={m.href}
                  className="hover:text-accent focus-visible:underline focus-visible:outline-none"
                >
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Hovedkomponent
// ────────────────────────────────────────────────────────────────────────────

export function Forside({ data = forsideDemo }: { data?: ForsideData }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav data={data.nav} />
      <main>
        <Hero data={data.hero} />
        <KpiStrip data={data.kpis} />
        <BookingSection data={data.booking} />
        <PlansSection data={data.plans} />
        <PlayerHqSection data={data.playerhq} />
        <FacilitiesSection data={data.facilities} />
        <PartnersSection data={data.partners} />
        <ClosingSection data={data.closing} />
      </main>
      <Footer data={data.footer} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Demo-data — matcher v10-fasiten (mk-forside.png)
// ────────────────────────────────────────────────────────────────────────────

export const forsideDemo: ForsideData = {
  nav: {
    links: [
      { label: "Coaching", href: "/coaching" },
      { label: "Slik trener vi", href: "/treningsfilosofi" },
      { label: "PlayerHQ", href: "/playerhq" },
      { label: "Anlegg", href: "/anlegg" },
      { label: "Om oss", href: "/om-oss" },
    ],
    loginHref: "/auth/login",
    cta: { label: "Book tid", href: "/booking" },
  },
  hero: {
    eyebrow: "Ny sesong · Plasser åpne fra 1. mai",
    titleLead: "Bli en bedre golfspiller.",
    titleAccent: "Sammen.",
    body: "Personlig coaching, periodiserte treningsplaner og målbar fremgang — for spillere som vil mer enn å bare slå baller.",
    primary: { label: "Book gratis kartleggings-økt", href: "/booking" },
    secondary: { label: "Se tjenestene", href: "/coaching" },
    image: {
      src: "/images/akademy/utslag-fairway.jpg",
      alt: "To golfere på fairway — én observerer mens den andre slår utslag",
    },
  },
  kpis: [
    { value: "38", label: "Aktive spillere" },
    { value: "12", label: "År erfaring" },
    { value: "4", label: "Treningsanlegg" },
    { value: "2 200", plus: true, label: "Timer coaching i 2025" },
  ],
  booking: {
    eyebrow: "Book direkte",
    titleLead: "Velg en time —",
    titleAccent: "få ledig allerede denne uka",
    body: "Hopp rett til kalenderen. Velg tid, betal og du er booket. Ingen abonnement, ingen binding.",
    cards: [
      {
        audience: "For nybegynnere",
        title: "Flex 20 min — Markus",
        coach: "Med Markus Røinås Pedersen",
        blurb: "Kort fokus-økt med Markus. Ett tema, raskt inn og ut.",
        duration: "20 min",
        next: "Neste ledig: tir 2. juni · 12:00",
        price: "300 kr",
        href: "/booking",
      },
      {
        audience: "Standardvalg",
        title: "Performance — Anders",
        coach: "Med Anders Kristiansen",
        blurb: "2 coaching-økter à 20 min per måned med Anders. Trackman + analyse + plan.",
        duration: "40 min",
        next: "Neste ledig: man 1. juni · 12:00",
        price: "1 300 kr",
        href: "/booking",
        featured: true,
      },
      {
        audience: "For ambisiøse",
        title: "Performance Pro — Anders",
        coach: "Med Anders Kristiansen",
        blurb:
          "4 coaching-økter à 20 min per måned med Anders. Trackman + video + dispersjon + skriftlig plan.",
        duration: "80 min",
        next: "Neste ledig: man 1. juni · 12:00",
        price: "2 300 kr",
        href: "/booking",
      },
    ],
  },
  plans: {
    eyebrow: "Tjenester",
    titleLead: "Tre veier til",
    titleAccent: "neste nivå",
    body: "Velg det formatet som passer deg — alt henger sammen via samme app, samme plan, og samme coach.",
    cards: [
      {
        icon: "target",
        eyebrow: "Performance",
        title: "2 økter per måned",
        blurb:
          "To 20-minutters treningsøkter med Anders hver måned. PlayerHQ inkludert. Perfekt for jevn oppfølging og gradvis fremgang.",
        price: "1 200 kr",
        priceUnit: "/ mnd",
        href: "/coaching",
      },
      {
        icon: "line-chart",
        eyebrow: "Performance Pro",
        title: "4 økter per måned",
        blurb:
          "Fire 20-minutters økter per måned. PlayerHQ inkludert. For spillere med høye mål — klubb, elite, turnering.",
        price: "2 220 kr",
        priceUnit: "/ mnd",
        href: "/coaching",
        featured: true,
      },
      {
        icon: "graduation-cap",
        eyebrow: "Drop-in",
        title: "Flex timer",
        blurb:
          "Ikke klar for abonnement? Book en enkelttime når det passer deg. Full tilgang til Trackman og analyse.",
        price: "300 kr",
        priceUnit: "/ 20 min",
        href: "/booking",
      },
    ],
  },
  playerhq: {
    badges: [
      { label: "Inkludert", tone: "included" },
      { label: "Beta", tone: "muted" },
    ],
    titleLeadA: "PlayerHQ —",
    titleAccent: "spillerportalen",
    titleLeadB: "du får på kjøpet",
    body: "Treningsplaner, statistikk, runde-registrering og AI-coach i én app. Gratis for alle Academy-kunder. Ikke-kunder kan prøve gratis i beta-perioden — første betaling 1. juni 2026.",
    link: { label: "Se hva PlayerHQ inneholder", href: "/playerhq" },
    image: {
      src: "/images/akademy/putting-data.jpg",
      alt: "To golfere på greenen — én putter mens coachen leser linjen med treningshjelpemidler",
    },
  },
  facilities: {
    eyebrow: "Anlegg og partnere",
    titleLead: "To anlegg,",
    titleAccent: "hele året",
    body: "Innendørs på Mulligan Indoor Golf i Fredrikstad og Sarpsborg med TrackMan, og utendørs på Gamle Fredrikstad Golfklubb gjennom sesong.",
    cards: [
      {
        meta: "Innendørs · Fredrikstad & Sarpsborg",
        metaIcon: "indoor",
        title: "Mulligan Indoor Golf Simulators",
        blurb:
          "Fire TrackMan 4-simulatorer i Fredrikstad og to TrackMan iO i Sarpsborg. Åpent 07–00 alle dager.",
        linkLabel: "Se mulligangolf.no",
        href: "https://mulligangolf.no",
        external: true,
      },
      {
        meta: "Utendørs · Fredrikstad",
        metaIcon: "outdoor",
        title: "Gamle Fredrikstad Golfklubb",
        blurb:
          "18-hulls bane, range og kort-spillsområde. Hjemmebanen for AK Golf Academy fra mai til oktober.",
        linkLabel: "Les mer",
        href: "/anlegg",
      },
    ],
  },
  partners: {
    eyebrow: "Samarbeid og partnere",
    items: [
      { label: "WANG Toppidrett Fredrikstad" },
      { label: "Mulligan Indoor Golf" },
      { label: "Gamle Fredrikstad Golfklubb" },
    ],
  },
  closing: {
    eyebrow: "Neste sesong",
    titleLead: "Klar for",
    titleAccent: "neste steg",
    titleTail: "?",
    body: "Vi har plass til 20 nye spillere i 2026-sesongen. Book en gratis 30-minutters kartleggings-økt så finner vi ut om vi er rett match.",
    primary: { label: "Book kartleggings-økt", href: "/booking" },
    secondary: { label: "Se priser", href: "/priser" },
  },
  footer: {
    tagline:
      "Prestasjonsgolf-coaching for ambisiøse spillere. Bygd på data, drevet av relasjon.",
    columns: [
      {
        title: "Academy",
        links: [
          { label: "Coaching", href: "/coaching" },
          { label: "Slik trener vi", href: "/treningsfilosofi" },
          { label: "Book tid", href: "/booking" },
          { label: "PlayerHQ", href: "/playerhq" },
          { label: "Turneringer", href: "/turneringer" },
          { label: "Junior", href: "/junior" },
          { label: "Priser", href: "/priser" },
        ],
      },
      {
        title: "Selskap",
        links: [
          { label: "Om oss", href: "/om-oss" },
          { label: "Anlegg", href: "/anlegg" },
          { label: "Coacher", href: "/coacher" },
          { label: "Suksesshistorier", href: "/suksess" },
          { label: "Cases", href: "/cases" },
          { label: "Blogg", href: "/blogg" },
          { label: "Jobb hos oss", href: "/jobb" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "FAQ", href: "/faq" },
          { label: "Kontakt", href: "/kontakt" },
          { label: "Support", href: "mailto:support@akgolf.no" },
        ],
      },
    ],
    email: {
      value: "post@akgolf.no",
      href: "mailto:post@akgolf.no",
      note: "SVAR INNEN 1 VIRKEDAG",
    },
    location: {
      value: "Gamle Fredrikstad GK · Mulligan Indoor",
      href: "/anlegg",
      note: "KLIKK FOR ÅPNINGSTIDER",
    },
    legal: "© 2026 AK Golf Group AS · Org.nr 927 248 581",
    meta: [
      { label: "Personvern", href: "/personvern" },
      { label: "Vilkår", href: "/vilkar" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
};
