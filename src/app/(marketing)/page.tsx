import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MapPin, Trees } from "lucide-react";
import { BookingShortcuts } from "@/components/marketing/booking-shortcuts";
import { PulseDot } from "@/components/athletic/pulse-dot";

export const metadata: Metadata = {
  title: "AK Golf Academy | Personlig coaching, bygd på data",
  description:
    "AK Golf Academy tilbyr prestasjonsgolf-coaching for ambisiøse spillere. Booking, treningsplaner og analyse — alt i ett system.",
};

/* Tjenester — månedspriser fra design-fasit (ui_kits/marketing, 04 Tjenester) */
const TJENESTER = [
  {
    eb: "Flex",
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
    eb: "Anbefalt",
    title: "Performance",
    price: "1 200",
    featured: true,
    items: [
      "2 × 20 min per måned",
      "Periodisert treningsplan",
      "Månedlig SG-rapport",
      "PlayerHQ-app inkludert",
      "Fri tilgang til alle anlegg",
    ],
    cta: "Start Performance",
    href: "/coaching",
  },
  {
    eb: "For ambisjon",
    title: "Performance Pro",
    price: "2 220",
    featured: false,
    items: [
      "4 × 20 min per måned",
      "Full SG-analyse pr. runde",
      "Fysisk-program integrert i planen",
      "Turneringspriming + bane-prep",
      "Hjemmebase Mulligan Sarpsborg",
    ],
    cta: "Søk opptak",
    href: "/kontakt",
  },
] as const;

export default function Hjem() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero entry-animasjon (fra fasit marketing.css) — stagger + reduced motion */}
      <style>{`
        @keyframes mktHeroIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes mktHeroEm { to { opacity: 1; } }
        .mkt-hero-in { opacity: 0; transform: translateY(8px); animation: mktHeroIn 600ms cubic-bezier(0.2, 0.7, 0.3, 1) both; }
        .mkt-hero-em { opacity: 0; animation: mktHeroEm 700ms cubic-bezier(0.2, 0.7, 0.3, 1) 480ms forwards; }
        @media (prefers-reduced-motion: reduce) {
          .mkt-hero-in, .mkt-hero-em { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      {/* ========== 01 HERO · full-bleed foto + forest-scrim ========== */}
      <section className="relative overflow-hidden bg-foreground">
        {/* Foto (hero-right) — ligger bak innholdet i full bredde */}
        <div aria-hidden className="absolute inset-0 z-0">
          <Image
            src="/images/akgolf/hero-bunker-shot.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Forest-scrim — brand-tonet: lesbarhet venstre, fade mot høyre (desktop) */}
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--foreground) / 0.78) 0%, hsl(var(--foreground) / 0.55) 35%, hsl(var(--foreground) / 0.10) 70%, transparent 100%), linear-gradient(180deg, hsl(var(--foreground) / 0.30) 0%, transparent 30%, transparent 70%, hsl(var(--foreground) / 0.45) 100%)",
            }}
          />
          {/* Vertikal scrim (mobil, fasit <900px) */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--foreground) / 0.78) 0%, hsl(var(--foreground) / 0.55) 30%, hsl(var(--foreground) / 0.40) 70%, hsl(var(--foreground) / 0.55) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-8">
          <div className="flex max-w-[720px] flex-col justify-center pb-16 pt-12 lg:min-h-[648px] lg:py-16">
            <span className="mkt-hero-in inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              <PulseDot size="md" />
              Ny sesong · Plasser åpne fra 1. mai
            </span>

            <h1
              className="mkt-hero-in mt-5 max-w-[14ch] text-balance font-display text-[clamp(44px,6vw,80px)] font-semibold leading-[0.98] tracking-[-0.03em] text-secondary"
              style={{ animationDelay: "80ms" }}
            >
              Bli en bedre golfspiller.{" "}
              <em className="mkt-hero-em font-normal italic text-accent">
                Sammen.
              </em>
            </h1>

            <p
              className="mkt-hero-in mt-6 max-w-[48ch] text-[17px] leading-[1.55] text-secondary/85"
              style={{ animationDelay: "200ms" }}
            >
              Personlig coaching, periodiserte treningsplaner og målbar
              fremgang — for spillere som vil mer enn å bare slå baller.
            </p>

            <div
              className="mkt-hero-in mt-8 flex flex-wrap gap-3"
              style={{ animationDelay: "320ms" }}
            >
              <Link
                href="/booking"
                className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Book gratis kartleggings-økt
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>
              <a
                href="#tjenester"
                className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-xl px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-secondary ring-1 ring-inset ring-secondary/45 transition hover:bg-secondary/10 hover:ring-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Se tjenestene
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 02 KPI strip · ekte tall ========== */}
      <section className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-2 gap-8 border-t border-border py-16 md:grid-cols-4 md:gap-12">
          <Kpi num="38" lbl="Aktive spillere" />
          <Kpi num="12" lbl="År erfaring" />
          <Kpi num="4" lbl="Treningsanlegg" />
          <Kpi num="2 200" plus lbl="Timer coaching i 2025" />
        </div>
      </section>

      {/* ========== 03 BOOKING direkte · live data fra DB ========== */}
      <BookingShortcuts />

      {/* ========== 04 TJENESTER · månedspriser ========== */}
      <section id="tjenester" className="scroll-mt-20 py-24">
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

      {/* ========== 05 PLAYERHQ pitch ========== */}
      <section id="playerhq" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionEyebrow>Spillerportal</SectionEyebrow>
              <SectionH2>
                PlayerHQ — spillerportalen <Em>du får på kjøpet</Em>.
              </SectionH2>
              <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.6] text-muted-foreground">
                Treningsplanen din, SG-tallene fra hver runde, og
                pyramide-fremgangen — alt i én app. Du logger økter med ett
                trykk; vi gjør tallene synlige neste morgen.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary-foreground">
                  Inkludert i Performance
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-accent-foreground">
                  Beta · iOS + Android
                </span>
              </div>
              <ul className="mt-6 flex flex-col gap-3">
                {[
                  "Daglig økt med målbar drill og fasit",
                  "Strokes Gained-rapport hver mandag",
                  "Treningspyramide oppdatert i sanntid",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[15px] leading-[1.55]"
                  >
                    <Check
                      className="mt-1 h-[18px] w-[18px] shrink-0 text-primary"
                      strokeWidth={1.5}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <Image
                src="/images/akademy/putting-data.jpg"
                alt="Putting med målepinner og data-instrumenter på greenen"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 60%, hsl(var(--foreground) / 0.5) 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== 06 ANLEGG ========== */}
      <section id="anlegg" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Anlegg · Øst</SectionEyebrow>
          <SectionH2>
            Lokasjoner
          </SectionH2>

          <div className="mt-12 max-w-xl">
            <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-7">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <Trees className="h-3.5 w-3.5" strokeWidth={1.5} />
                Bane · Mai – Oktober
              </span>
              <h4 className="font-display text-[22px] font-bold tracking-[-0.015em]">
                GFGK · Gamle Fredrikstad
              </h4>
              <p className="text-sm leading-[1.55] text-muted-foreground">
                18-hulls par 72. Hjemmebanen sommerhalvåret —
                turneringsforberedelser og bane-strategi.
              </p>
              <div className="mt-1 flex flex-col gap-1.5">
                <LocRow sted="Gamle Fredrikstad GK" by="Fredrikstad" first />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 07 PARTNERE ========== */}
      <section
        id="partnere"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 pb-24 md:px-8"
      >
        <SectionEyebrow className="mb-8 block">Partnere · 2025</SectionEyebrow>
        <div className="grid grid-cols-2 gap-3 border-y border-border py-8 md:grid-cols-4">
          <PartnerCell role="Utdanning · idrettsfag">
            <Image
              src="/images/logos/wang.svg"
              alt="WANG Toppidrett"
              width={112}
              height={146}
              className="h-14 w-auto max-w-[160px] object-contain opacity-[0.92]"
            />
          </PartnerCell>
          <PartnerCell role="Klubb · for de store slagene">
            <Image
              src="/images/logos/miklagard-logo.png"
              alt="Miklagard Golf"
              width={400}
              height={194}
              className="h-14 w-auto max-w-[160px] object-contain brightness-0"
            />
          </PartnerCell>
          <PartnerCell role="Klubb · 18-hulls">
            <Image
              src="/images/logos/gfgk-logo.png"
              alt="GFGK · Gamle Fredrikstad"
              width={400}
              height={326}
              className="h-14 w-auto max-w-[160px] object-contain opacity-[0.92]"
            />
          </PartnerCell>
          <PartnerCell role="Anlegg · indoor">
            <span className="font-display text-2xl font-bold leading-[56px] tracking-[-0.01em] text-foreground">
              Mulligan Indoor
            </span>
          </PartnerCell>
        </div>
      </section>

      {/* ========== 08 CLOSING CTA ========== */}
      <section className="mx-auto mt-24 max-w-7xl px-6 pb-24 md:px-8">
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
            2026-sesongen · Opptak åpent
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Klar for <Em dark>neste steg</Em>?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Vi har plass til 20 nye spillere i 2026-sesongen. Start med en
            gratis kartleggings-økt — vi ser hvor du er, snakker om hvor du
            vil, og legger en plan om det er kjemi.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Book gratis kartlegging
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-xl px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-secondary ring-1 ring-inset ring-secondary/45 transition hover:bg-secondary/10 hover:ring-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Snakk med Anders
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Seksjonsbyggesteiner (fasit: .section-eyebrow / .section h2) ---------- */

function SectionEyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground ${className}`}
    >
      {children}
    </span>
  );
}

function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-4 max-w-[22ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
      {children}
    </h2>
  );
}

function Em({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <em
      className={`font-display font-normal italic ${dark ? "text-accent" : "text-primary"}`}
    >
      {children}
    </em>
  );
}

function Kpi({ num, lbl, plus = false }: { num: string; lbl: string; plus?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[clamp(40px,5vw,60px)] font-semibold leading-none tracking-[-0.025em] text-primary tabular-nums">
        {num}
        {plus && <span className="font-normal text-muted-foreground">+</span>}
      </div>
      <div className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {lbl}
      </div>
    </div>
  );
}

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

function LocRow({
  sted,
  by,
  first = false,
}: {
  sted: string;
  by: string;
  first?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 py-2 text-[13px] font-medium ${
        first ? "" : "border-t border-border"
      }`}
    >
      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.5} />
      {sted}
      <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
        {by}
      </span>
    </div>
  );
}

function PartnerCell({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="flex h-16 w-full items-center justify-center">
        {children}
      </div>
      <span className="text-center font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {role}
      </span>
    </div>
  );
}
