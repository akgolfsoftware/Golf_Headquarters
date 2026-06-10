import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, Trees } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PulseDot } from "@/components/athletic/pulse-dot";

export const metadata: Metadata = {
  title: "Anlegg — AK Golf Academy",
  description:
    "Hovedanleggene våre — Gamle Fredrikstad Golfklubb og Miklagard Golfklubb.",
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const HERO_IMAGES: Record<string, string> = {
  default: "/images/akademy/walking-bag.jpg",
};

// Kun disse anleggene vises i marketing — andre lokasjoner finnes i admin men er ikke
// hovedanlegg for AK Golf Academy
const MARKETING_LOCATIONS = ["Gamle Fredrikstad GK", "Miklagard Golfklubb"];

export default async function AnleggListe() {
  const locations = await prisma.location.findMany({
    where: {
      active: true,
      name: { in: MARKETING_LOCATIONS },
    },
    include: { facilities: { where: { active: true } } },
    orderBy: { name: "asc" },
  });

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
            src="/images/akademy/hull-ovenfra.jpg"
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
              Anlegg · AK Golf Group
            </span>

            <h1
              className="mkt-hero-in mt-5 max-w-[20ch] text-balance font-display text-[clamp(44px,6vw,80px)] font-semibold leading-[0.98] tracking-[-0.03em] text-secondary"
              style={{ animationDelay: "80ms" }}
            >
              Hjemmebaner —{" "}
              <em className="mkt-hero-em font-normal italic text-accent">
                GFGK og Miklagard
              </em>
              .
            </h1>

            <p
              className="mkt-hero-in mt-6 max-w-[48ch] text-[17px] leading-[1.55] text-secondary/85"
              style={{ animationDelay: "200ms" }}
            >
              To tradisjonsrike anlegg på Østlandet — Gamle Fredrikstad
              Golfklubb og Miklagard Golfklubb. Samme coach, samme plan, sømløs
              booking.
            </p>

            <div
              className="mkt-hero-in mt-8 flex flex-wrap gap-3"
              style={{ animationDelay: "320ms" }}
            >
              <Link
                href="/booking"
                className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Book en økt
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-xl px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-secondary ring-1 ring-inset ring-secondary/45 transition hover:bg-secondary/10 hover:ring-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Kontakt oss
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 02 ANLEGG · by-kort m/ lokasjonsrader ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Hovedanlegg · Østlandet</SectionEyebrow>
          <SectionH2>
            Velg ditt <Em>anlegg</Em>.
          </SectionH2>

          {locations.length === 0 ? (
            <div className="mt-12 rounded-[20px] border border-border bg-card p-12 text-center text-muted-foreground">
              Ingen anlegg er publisert ennå. Ta kontakt på{" "}
              <a
                href="mailto:post@akgolf.no"
                className="text-primary underline"
              >
                post@akgolf.no
              </a>
              .
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {locations.map((loc) => {
                const slug = slugify(loc.name);
                return (
                  <Link
                    key={loc.id}
                    href={`/anlegg/${slug}`}
                    className="group overflow-hidden rounded-[20px] border border-border bg-card transition-colors hover:border-primary"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                      <Image
                        src={HERO_IMAGES[slug] ?? "/images/akademy/walking-bag.jpg"}
                        alt={`Bilde fra ${loc.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col gap-3 p-7">
                      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                        <Trees className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Bane · {loc.facilities.length}{" "}
                        {loc.facilities.length === 1
                          ? "fasilitet"
                          : "fasiliteter"}
                      </span>
                      <h3 className="font-display text-[22px] font-bold tracking-[-0.015em]">
                        {loc.name}
                      </h3>
                      <p className="flex items-center gap-2 text-sm leading-[1.55] text-muted-foreground">
                        <MapPin
                          className="h-3.5 w-3.5 shrink-0 text-primary"
                          strokeWidth={1.5}
                        />
                        {loc.address}
                      </p>
                      {loc.facilities.length > 0 && (
                        <div className="mt-1 flex flex-col gap-1.5">
                          {loc.facilities.map((f, i) => (
                            <div
                              key={f.id}
                              className={`flex items-center gap-2 py-2 text-[13px] font-medium ${
                                i === 0 ? "" : "border-t border-border"
                              }`}
                            >
                              {f.isIndoor ? (
                                <Building2
                                  className="h-3.5 w-3.5 shrink-0 text-primary"
                                  strokeWidth={1.5}
                                />
                              ) : (
                                <Trees
                                  className="h-3.5 w-3.5 shrink-0 text-primary"
                                  strokeWidth={1.5}
                                />
                              )}
                              {f.name}
                              <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                                {f.isIndoor ? "Inne" : "Ute"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-4">
                        Se anlegget
                        <ArrowRight
                          className="h-4 w-4 transition-transform"
                          strokeWidth={1.5}
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
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

function Em({ children }: { children: React.ReactNode }) {
  return (
    <em className="font-display font-normal italic text-primary">{children}</em>
  );
}
