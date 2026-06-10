import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PlayerHQMockup } from "@/components/marketing/playerhq-mockup";
import { PulseDot } from "@/components/athletic/pulse-dot";

export const metadata: Metadata = {
  title: "PlayerHQ — AK Golf Academy",
  description:
    "PlayerHQ er spillerportalen til AK Golf Academy: treningsplaner, runde-registrering, statistikk og AI-coach. Gratis i beta — første betaling 1. juni 2026.",
};

/* Funksjoner — samme innhold som før, presentert som check-punkter (forsidens pitch-mønster) */
const TRENING = [
  {
    tittel: "Dashboard som faktisk hjelper",
    tekst:
      "Personlig hilsen, dagens fokus, neste økt og siste runde. Du ser hvor du står på 10 sekunder.",
  },
  {
    tittel: "Ukeplanen i lomma",
    tekst:
      "Coachen din legger inn øktene — du ser hva som står for tur, kan starte fra mobil og logge ferdig på sekunder.",
  },
  {
    tittel: "Tapper-mode for hver økt",
    tekst:
      "Fullscreen-flyt på iPad eller mobil. Rating per drill, vurdering på slutten, automatisk logging tilbake til planen.",
  },
] as const;

const ANALYSE = [
  {
    tittel: "Strokes Gained ferdig regnet",
    tekst:
      "Registrer runden hull-for-hull. SG-fordeling i OTT/APP/ARG/PUTT viser sterke og svake områder over tid.",
  },
  {
    tittel: "Personlig analyse 24/7",
    tekst:
      "Spør AI-en om hva som helst — den kjenner HCP-en din, planen din og siste runder. Får konkrete råd, ikke generelt blabla.",
  },
  {
    tittel: "Hold deg på planen",
    tekst:
      "Streak-bars siste 14 dager, achievements når du følger gjennom, og varsler når du har gjort det viktige.",
  },
] as const;

export default function PlayerHQ() {
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
            src="/images/akademy/coaching-tripod.jpg"
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
              PlayerHQ · Beta · Gratis frem til 1. juni 2026
            </span>

            <h1
              className="mkt-hero-in mt-5 max-w-[14ch] text-balance font-display text-[clamp(44px,6vw,80px)] font-semibold leading-[0.98] tracking-[-0.03em] text-secondary"
              style={{ animationDelay: "80ms" }}
            >
              <em className="mkt-hero-em font-normal italic text-accent">
                Din
              </em>{" "}
              spillerportal.
            </h1>

            <p
              className="mkt-hero-in mt-6 max-w-[48ch] text-[17px] leading-[1.55] text-secondary/85"
              style={{ animationDelay: "200ms" }}
            >
              Treningsplaner, statistikk, runde-registrering og AI-coach — alt
              samlet i én app. Bygget av AK Golf Academy for å støtte coaching
              mellom øktene.
            </p>

            <div
              className="mkt-hero-in mt-8 flex flex-wrap gap-3"
              style={{ animationDelay: "320ms" }}
            >
              <Link
                href="/auth/signup"
                className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Prøv PlayerHQ gratis
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>
              <a
                href="#funksjoner"
                className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-xl px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-secondary ring-1 ring-inset ring-secondary/45 transition hover:bg-secondary/10 hover:ring-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Se hva du får
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 02 FUNKSJONER · app-mockup ========== */}
      <section id="funksjoner" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Funksjoner</SectionEyebrow>
          <SectionH2>
            <Em>Hva</Em> får du.
          </SectionH2>
          <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.6] text-muted-foreground">
            Hele treningshverdagen i én flate — fra dagens økt til Strokes
            Gained-tallene etter runden.
          </p>

          <div className="mx-auto mt-14 max-w-5xl">
            <PlayerHQMockup />
          </div>
        </div>
      </section>

      {/* ========== 03 TRENING · pitch m/ check-punkter ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionEyebrow>Trening</SectionEyebrow>
              <SectionH2>
                Treningsplanen <Em>i lomma</Em>.
              </SectionH2>
              <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.6] text-muted-foreground">
                Alt du skal gjøre denne uka ligger klart i appen — fra dagens
                fokus til ferdig logget økt.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Hjem", "Treningsplan", "Live-økt"].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <ul className="mt-6 flex flex-col gap-3">
                {TRENING.map((f) => (
                  <li
                    key={f.tittel}
                    className="flex items-start gap-3 text-[15px] leading-[1.55]"
                  >
                    <Check
                      className="mt-1 h-[18px] w-[18px] shrink-0 text-primary"
                      strokeWidth={1.5}
                    />
                    <span>
                      <strong className="font-semibold">{f.tittel}.</strong>{" "}
                      {f.tekst}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <Image
                src="/images/akademy/utslag-fairway.jpg"
                alt="Spiller slår utslag mot fairway under trening"
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

      {/* ========== 04 ANALYSE · pitch m/ check-punkter (speilet) ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionEyebrow>Analyse</SectionEyebrow>
              <SectionH2>
                Tallene som viser <Em>fremgang</Em>.
              </SectionH2>
              <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.6] text-muted-foreground">
                Hver runde og hver økt blir til tall du kan handle på — regnet
                ut for deg.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Runder + SG", "AI-coach", "Mål + streak"].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <ul className="mt-6 flex flex-col gap-3">
                {ANALYSE.map((f) => (
                  <li
                    key={f.tittel}
                    className="flex items-start gap-3 text-[15px] leading-[1.55]"
                  >
                    <Check
                      className="mt-1 h-[18px] w-[18px] shrink-0 text-primary"
                      strokeWidth={1.5}
                    />
                    <span>
                      <strong className="font-semibold">{f.tittel}.</strong>{" "}
                      {f.tekst}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl lg:order-first">
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

      {/* ========== 05 PRIS · gratis via coaching / 300 kr ========== */}
      <section id="pris" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Pris</SectionEyebrow>
          <SectionH2>
            Hvordan <Em>prises</Em> PlayerHQ?
          </SectionH2>

          <div className="mt-14 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            <PrisCard
              eb="Academy-kunde · Inkludert"
              title="Med coaching"
              price="0"
              featured
              items={[
                "Inkludert i Performance og Performance Pro",
                "Inkludert for grupper gjennom AK Golf",
                "Gjelder så lenge avtalen er aktiv",
              ]}
              cta="Se coaching-pakker"
              href="/coaching"
            />
            <PrisCard
              eb="Uten Academy"
              title="Kun appen"
              price="300"
              featured={false}
              items={[
                "1 måned gratis prøveperiode",
                "Gratis under beta — første faktura 1. juni 2026",
                "Du kan avslutte når som helst",
              ]}
              cta="Prøv gratis nå"
              href="/auth/signup"
            />
          </div>

          <p className="mt-8 max-w-[64ch] text-sm leading-[1.55] text-muted-foreground">
            PlayerHQ er i beta — bugs kan forekomme. Academy-kunder beholder
            gratis tilgang også etter beta-perioden.
          </p>
        </div>
      </section>

      {/* ========== 06 CLOSING CTA ========== */}
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
            PlayerHQ · Beta
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            <Em dark>Klar</Em> til å prøve?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Bli Academy-kunde for full coaching-pakke, eller signe opp gratis
            for kun PlayerHQ.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Prøv PlayerHQ gratis
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
            <Link
              href="/coaching"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-xl px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-secondary ring-1 ring-inset ring-secondary/45 transition hover:bg-secondary/10 hover:ring-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Bli Academy-kunde
            </Link>
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

function PrisCard({
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
