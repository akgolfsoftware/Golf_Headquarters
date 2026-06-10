/**
 * Marketing-seksjonsprimitiver — forsidens designspråk for undersidene.
 * Portet fra src/app/(marketing)/page.tsx (design-fasit: ui_kits/marketing).
 * Forsiden beholder sine lokale kopier — disse brukes av /coaching, /coacher og /priser.
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PulseDot } from "@/components/athletic/pulse-dot";

/* ---------- Seksjonsbyggesteiner (fasit: .section-eyebrow / .section h2) ---------- */

export function SectionEyebrow({
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

export function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-4 max-w-[22ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
      {children}
    </h2>
  );
}

export function Em({
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

/* ---------- CTA-par (fasit: .btn-lime / .hero-btn-outline) ---------- */

const CTA_BASE =
  "inline-flex h-[52px] items-center justify-center gap-1.5 px-6 font-display text-[16px] font-bold tracking-[-0.005em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CtaLime({
  href,
  children,
  withArrow = false,
}: {
  href: string;
  children: React.ReactNode;
  withArrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${CTA_BASE} rounded-full bg-accent text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:ring-offset-2`}
    >
      {children}
      {withArrow && (
        <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
      )}
    </Link>
  );
}

/** Cream-outline CTA for mørke flater (hero + closing). */
export function CtaOutlineLys({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${CTA_BASE} rounded-xl text-secondary ring-1 ring-inset ring-secondary/45 hover:bg-secondary/10 hover:ring-secondary/70`}
    >
      {children}
    </Link>
  );
}

/* ---------- Hero · full-bleed foto + forest-scrim (fasit: .hero) ---------- */

export function HeroEm({ children }: { children: React.ReactNode }) {
  return (
    <em className="mkt-hero-em font-normal italic text-accent">{children}</em>
  );
}

export function MarketingHero({
  foto,
  eyebrow,
  tittel,
  ingress,
  primaer,
  sekundaer,
}: {
  /** Path under /public, f.eks. "/images/akademy/coaching-tripod.jpg" */
  foto: string;
  eyebrow: React.ReactNode;
  tittel: React.ReactNode;
  ingress: React.ReactNode;
  primaer?: { href: string; label: string };
  sekundaer?: { href: string; label: string };
}) {
  return (
    <>
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

      <section className="relative overflow-hidden bg-foreground">
        <div aria-hidden className="absolute inset-0 z-0">
          <Image
            src={foto}
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
          <div className="flex max-w-[720px] flex-col justify-center pb-16 pt-12 lg:min-h-[520px] lg:py-16">
            <span className="mkt-hero-in inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              <PulseDot size="md" />
              {eyebrow}
            </span>

            <h1
              className="mkt-hero-in mt-5 max-w-[14ch] text-balance font-display text-[clamp(44px,6vw,80px)] font-semibold leading-[0.98] tracking-[-0.03em] text-secondary"
              style={{ animationDelay: "80ms" }}
            >
              {tittel}
            </h1>

            <p
              className="mkt-hero-in mt-6 max-w-[48ch] text-[17px] leading-[1.55] text-secondary/85"
              style={{ animationDelay: "200ms" }}
            >
              {ingress}
            </p>

            {(primaer || sekundaer) && (
              <div
                className="mkt-hero-in mt-8 flex flex-wrap gap-3"
                style={{ animationDelay: "320ms" }}
              >
                {primaer && (
                  <CtaLime href={primaer.href} withArrow>
                    {primaer.label}
                  </CtaLime>
                )}
                {sekundaer && (
                  <CtaOutlineLys href={sekundaer.href}>
                    {sekundaer.label}
                  </CtaOutlineLys>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
