import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PulseDot } from "@/components/athletic/pulse-dot";

export const metadata: Metadata = {
  title: "Om oss | AK Golf Academy",
  description:
    "Les om Anders Kristiansen og filosofien bak AK Golf Academy — personlig coaching bygd på Mac O'Grady-metodikk og moderne data-analyse.",
};

/* Manifest — tre prinsipper destillert fra Academy-filosofien */
const MANIFEST = [
  {
    nr: "01",
    title: "Tydelig, ikke magisk",
    text: "Du skal alltid vite hva vi jobber med, hvorfor vi jobber med det, og hvordan du ser at det virker.",
  },
  {
    nr: "02",
    title: "Balansert, ikke tilfeldig",
    text: "AK Golf-pyramiden fordeler treningstiden riktig mellom fysikk, teknikk, slag, spill og turneringserfaring.",
  },
  {
    nr: "03",
    title: "Målbar, ikke synsing",
    text: "PlayerHQ holder plan, runder og statistikk samlet på ett sted — fremgangen er synlig, ikke noe du må tro på.",
  },
] as const;

export default function OmOss() {
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

      {/* ========== HERO · full-bleed foto + forest-scrim ========== */}
      <section className="relative overflow-hidden bg-foreground">
        <div aria-hidden className="absolute inset-0 z-0">
          <Image
            src="/images/akademy/coach-observerer.jpg"
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
              Om oss · AK Golf Academy
            </span>

            <h1
              className="mkt-hero-in mt-5 max-w-[16ch] text-balance font-display text-[clamp(44px,6vw,80px)] font-semibold leading-[0.98] tracking-[-0.03em] text-secondary"
              style={{ animationDelay: "80ms" }}
            >
              Personlig coaching,{" "}
              <em className="mkt-hero-em font-normal italic text-accent">
                bygd på data.
              </em>
            </h1>

            <p
              className="mkt-hero-in mt-6 max-w-[48ch] text-[17px] leading-[1.55] text-secondary/85"
              style={{ animationDelay: "200ms" }}
            >
              AK Golf Academy drives av Anders Kristiansen — golfcoach,
              gründer og CEO i AK Golf Group AS. Tett personlig oppfølging,
              målbar fremgang.
            </p>
          </div>
        </div>
      </section>

      {/* ========== MANIFEST · tre prinsipper ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Manifest · Det vi tror på</SectionEyebrow>
          <SectionH2>
            Tre ting vi <Em>aldri går på akkord med</Em>.
          </SectionH2>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {MANIFEST.map((m) => (
              <div
                key={m.nr}
                className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-8"
              >
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {m.nr}
                </span>
                <h3 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.015em]">
                  {m.title}
                </h3>
                <p className="text-sm leading-[1.55] text-muted-foreground">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HISTORIEN ========== */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Historien</SectionEyebrow>
          <SectionH2>
            Coaching som <Em>kan måles</Em>.
          </SectionH2>

          <div className="mt-10 max-w-[62ch] space-y-6 text-[16px] leading-[1.6] text-foreground">
            <p>
              AK Golf Academy drives av Anders Kristiansen — golfcoach, gründer
              og CEO i AK Golf Group AS. Etter mer enn et tiår med spillere på
              alle nivåer, fra klubbamatører til konkurranseutøvere, har Anders
              bygget en coaching-praksis som kombinerer tett personlig
              oppfølging med målbar fremgang.
            </p>

            <blockquote className="border-l-2 border-accent pl-6 font-display text-[clamp(20px,2.5vw,26px)] font-normal italic leading-[1.45] text-primary">
              «Coaching skal ikke være magi. Det skal være tydelig: hva vi
              jobber med, hvorfor vi jobber med det, og hvordan du ser at det
              virker. Det er det Academy er bygget rundt.»
            </blockquote>

            <p>
              Kjernen er AK Golf-pyramiden — et balansert system som sørger for
              at treningstiden fordeles riktig mellom fysikk, teknikk, slag,
              spill og turneringserfaring. Til daglig støttes coachingen av
              PlayerHQ, spillerportalen som holder plan, runder og statistikk
              samlet på ett sted.
            </p>
          </div>
        </div>
      </section>

      {/* ========== SELSKAPET · hairline-strip ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <SectionEyebrow className="mb-6 block">
          Selskapet · AK Golf Group AS
        </SectionEyebrow>
        <dl className="border-y border-border">
          <Rad label="Org.nummer" value="927 248 581" mono />
          <Rad label="Adresse" value="AK Golf Group AS, Fredrikstad, Norge" />
          <Rad label="E-post" value="post@akgolf.no" mono />
        </dl>
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
            AK Golf Academy · Fredrikstad
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Klar for <Em dark>første time</Em>?
          </h2>
          <div className="relative z-10 mt-8 flex justify-center">
            <Link
              href="/booking"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Book første time
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Seksjonsbyggesteiner (samme anatomi som forsiden) ---------- */

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

function Rad({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-4 last:border-b-0">
      <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "font-mono text-[14px] font-semibold tabular-nums text-foreground"
            : "text-[15px] font-medium text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
