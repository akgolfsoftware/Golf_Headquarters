import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Trophy, Users, Zap } from "lucide-react";
import { PulseDot } from "@/components/athletic/pulse-dot";

export const metadata: Metadata = {
  title: "Junior · AK Golf Academy",
  description:
    "Golf for unge talenter. AK Golf Academy tilbyr strukturert juniortrening for U10, U14, U18 og Talent-gruppen.",
};

type Aldersgruppe = {
  gruppe: string;
  alder: string;
  krav: string;
  frekvens: string;
  sesong: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const GRUPPER: Aldersgruppe[] = [
  {
    gruppe: "U10",
    alder: "Under 10 år",
    krav: "Ingen krav, nybegynnere hjertelig velkomne",
    frekvens: "1 gang per uke",
    sesong: "Mai–september (utendørs)",
    Icon: Star,
  },
  {
    gruppe: "U14",
    alder: "Under 14 år",
    krav: "Grunnleggende golferfaring, eget sett med køller",
    frekvens: "2 ganger per uke",
    sesong: "Helårs, innendørs Mulligan om vinteren",
    Icon: Users,
  },
  {
    gruppe: "U18",
    alder: "Under 18 år",
    krav: "Handicap under 36, minimum 1 sesong med erfaring",
    frekvens: "2–3 ganger per uke",
    sesong: "Helårs med periodisert treningsplan",
    Icon: Trophy,
  },
  {
    gruppe: "Talent",
    alder: "14–18 år · Elitesatsing",
    krav: "Handicap under 10 og anbefaling fra coach",
    frekvens: "3–5 ganger per uke + turneringer",
    sesong: "Helårs med WANG Toppidrett Fredrikstad",
    Icon: Zap,
  },
];

export default function JuniorSide() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero entry-animasjon (samme som forsiden) — stagger + reduced motion */}
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
        <div aria-hidden className="absolute inset-0 z-0">
          <Image
            src="/images/akademy/utslag-fairway.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--foreground) / 0.78) 0%, hsl(var(--foreground) / 0.55) 35%, hsl(var(--foreground) / 0.10) 70%, transparent 100%), linear-gradient(180deg, hsl(var(--foreground) / 0.30) 0%, transparent 30%, transparent 70%, hsl(var(--foreground) / 0.45) 100%)",
            }}
          />
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--foreground) / 0.78) 0%, hsl(var(--foreground) / 0.55) 30%, hsl(var(--foreground) / 0.40) 70%, hsl(var(--foreground) / 0.55) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-8">
          <div className="flex max-w-[720px] flex-col justify-center pb-16 pt-12 lg:min-h-[520px] lg:py-16">
            <span className="mkt-hero-in inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              <PulseDot size="md" />
              Junior · AK Golf Academy
            </span>

            <h1
              className="mkt-hero-in mt-5 max-w-[14ch] text-balance font-display text-[clamp(44px,6vw,80px)] font-semibold leading-[0.98] tracking-[-0.03em] text-secondary"
              style={{ animationDelay: "80ms" }}
            >
              Golf for{" "}
              <em className="mkt-hero-em font-normal italic text-accent">
                unge talenter
              </em>
              .
            </h1>

            <p
              className="mkt-hero-in mt-6 max-w-[48ch] text-[17px] leading-[1.55] text-secondary/85"
              style={{ animationDelay: "200ms" }}
            >
              Vi tror på systematisk utvikling fra tidlig alder. AK Golf Academy
              tilbyr strukturert juniortrening tilpasset hvert utviklingstrinn,
              fra de aller yngste til elitesatsing med WANG Toppidrett
              Fredrikstad.
            </p>

            <div
              className="mkt-hero-in mt-8 flex flex-wrap gap-3"
              style={{ animationDelay: "320ms" }}
            >
              <a
                href="#pamelding"
                className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Meld på junior
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </a>
              <Link
                href="/kontakt"
                className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-xl px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-secondary ring-1 ring-inset ring-secondary/45 transition hover:bg-secondary/10 hover:ring-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Spør oss
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 02 ALDERSGRUPPER · program-kort ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Aldersgrupper</SectionEyebrow>
          <SectionH2>
            Fire veier inn i <Em>programmet</Em>.
          </SectionH2>
          <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.6] text-muted-foreground">
            Alle grupper trener etter AK Golf-pyramiden og følges opp gjennom
            PlayerHQ slik at foreldre alltid har oversikt over progresjon.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {GRUPPER.map((g) => (
              <GruppeKort key={g.gruppe} gruppe={g} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== 03 SESONGPLAN ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Sesongplan</SectionEyebrow>
          <SectionH2>
            Hele <Em>året</Em> i gang.
          </SectionH2>

          <div className="mt-12 overflow-x-auto rounded-[20px] border border-border bg-card">
            <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Periode
                  </th>
                  <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Fokus
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Sted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <Sesongrad periode="Januar–april" fokus="Innendørs teknikk og fysikk" sted="Mulligan Fredrikstad / Sarpsborg" />
                <Sesongrad periode="Mai–juni" fokus="Overgang utendørs, kortspill" sted="GFGK (Torsnesveien)" />
                <Sesongrad periode="Juli–august" fokus="Turneringer og runde-spilling" sted="Baner i regionen" />
                <Sesongrad periode="September–oktober" fokus="Avslutning sesong, evaluering" sted="GFGK (Torsnesveien)" />
                <Sesongrad periode="November–desember" fokus="Styrke, kondisjon, individuelle mål" sted="Mulligan Fredrikstad / Sarpsborg" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========== 04 PÅMELDING · closing-gradient ========== */}
      <section id="pamelding" className="scroll-mt-20 pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <SectionEyebrow>Påmelding</SectionEyebrow>
              <SectionH2>
                Klar for å <Em>starte</Em>?
              </SectionH2>
              <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.6] text-muted-foreground">
                Fyll ut skjemaet så tar vi kontakt innen 1 virkedag. Vi finner
                riktig gruppe basert på alder og erfaring, og informerer om
                oppstart og pris.
              </p>
              <div className="mt-8 space-y-4 text-[14px] text-muted-foreground">
                <InfoRad label="Sesongstart" verdi="1. mai (utendørs)" />
                <InfoRad label="Vinterstudio" verdi="1. november (innendørs)" />
                <InfoRad label="Påmeldingsfrist" verdi="Løpende, plass til det er fullt" />
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-3xl p-8 text-white md:p-12"
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
                Svar innen 1 virkedag
              </span>
              <h3 className="relative z-10 mt-4 font-display text-[clamp(28px,3vw,36px)] font-bold leading-[1.05] tracking-[-0.025em]">
                Meld interesse på <Em dark>e-post</Em>.
              </h3>
              <p className="relative z-10 mt-4 max-w-[48ch] text-[16px] leading-[1.55] text-white/85">
                Send oss en e-post med navn på junior, alder og kontaktinfo,
                så tar vi kontakt innen 1 virkedag.
              </p>
              <a
                href="mailto:post@akgolf.no?subject=Junior-p%C3%A5melding&body=Hei!%0A%0ANavn%20p%C3%A5%20junior%3A%20%0AAlder%3A%20%0AE-post%20foresatte%3A%20%0ATelefon%3A%20%0A%0AHilsen"
                className="relative z-10 mt-8 inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Send e-post til post@akgolf.no
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Seksjonsbyggesteiner (samme anatomi som forsiden) ---------- */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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

function GruppeKort({ gruppe: g }: { gruppe: Aldersgruppe }) {
  return (
    <article className="flex flex-col rounded-[20px] border border-border bg-card p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            {g.alder}
          </span>
          <h3 className="mt-3 font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em]">
            {g.gruppe}
          </h3>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary text-primary">
          <g.Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5">
        <GruppeRad label="Krav" verdi={g.krav} />
        <GruppeRad label="Treningsfrekvens" verdi={g.frekvens} />
        <GruppeRad label="Sesong" verdi={g.sesong} />
      </div>

      <div className="mt-auto pt-8">
        <a
          href="#pamelding"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-4"
        >
          Meld på til {g.gruppe}
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </a>
      </div>
    </article>
  );
}

function GruppeRad({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm leading-[1.45] text-foreground">{verdi}</span>
    </div>
  );
}

function Sesongrad({
  periode,
  fokus,
  sted,
}: {
  periode: string;
  fokus: string;
  sted: string;
}) {
  return (
    <tr>
      <td className="px-6 py-4 font-mono text-[13px] font-medium tabular-nums text-foreground">
        {periode}
      </td>
      <td className="px-6 py-4 text-[14px] text-muted-foreground">{fokus}</td>
      <td className="px-6 py-4 text-right text-[13px] text-muted-foreground">
        {sted}
      </td>
    </tr>
  );
}

function InfoRad({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="text-[14px] text-foreground">{verdi}</span>
    </div>
  );
}
