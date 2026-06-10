import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  CtaLime,
  CtaOutlineLys,
  Em,
  HeroEm,
  MarketingHero,
} from "@/components/marketing/marketing-sections";

export const metadata: Metadata = {
  title: "Coachene våre — AK Golf Academy",
  description:
    "Møt coachene i AK Golf Academy — Anders Kristiansen og Markus Røinås Pedersen.",
};

type CoachKort = {
  slug: string;
  navn: string;
  tittel: string;
  bio: string;
  initialer: string;
  foto: string | null;
};

const FALLBACK_COACHER: CoachKort[] = [
  {
    slug: "anders",
    navn: "Anders Kristiansen",
    tittel: "Head Coach · PGA Pro",
    bio: "Bygger Academy rundt målbar fremgang. Mer enn et tiår med spillere på alle nivåer — fra første time til turneringsspill.",
    initialer: "AK",
    foto: null,
  },
  {
    slug: "markus",
    navn: "Markus Røinås Pedersen",
    tittel: "Assistent",
    bio: "Jobber tett med juniorprogrammet og spillere som vil ta neste steg. Sterk på korte slag og putting.",
    initialer: "MR",
    foto: null,
  },
];

function utledSlug(navn: string): string {
  const first = navn.split(" ")[0]?.toLowerCase() ?? "";
  return first
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z]/g, "");
}

export default async function CoacherSide() {
  // Kuratert liste er fasit for HVEM som vises (Anders først, så Markus) —
  // Anders ligger som ADMIN i DB, derfor hentes både COACH og ADMIN.
  // DB-treff beriker kun kortet med profilbilde; andre DB-brukere vises aldri.
  const dbCoacher = await prisma.user.findMany({
    where: { role: { in: ["COACH", "ADMIN"] } },
    select: { id: true, name: true, avatarUrl: true },
  });

  const coacher: CoachKort[] = FALLBACK_COACHER.map((f) => {
    const db = dbCoacher.find(
      (u) => u.name === f.navn || utledSlug(u.name) === f.slug,
    );
    return db?.avatarUrl ? { ...f, foto: db.avatarUrl } : f;
  });

  return (
    <div className="bg-background text-foreground">
      {/* ========== HERO · full-bleed foto + forest-scrim ========== */}
      <MarketingHero
        foto="/images/akademy/coach-observerer.jpg"
        eyebrow="Coachene · AK Golf Academy"
        tittel={
          <>
            Møt <HeroEm>coachene</HeroEm>.
          </>
        }
        ingress="To trenere med komplementære styrker — felles plattform, samme forventning til kvalitet og oppfølging."
        primaer={{ href: "/booking", label: "Book tid med en coach" }}
        sekundaer={{ href: "/coaching", label: "Se coaching-pakkene" }}
      />

      {/* ========== COACH-KORT (fasit: .coach — foto, rolle-tag, info) ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {coacher.map((c) => (
              <CoachCard key={c.slug} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== CLOSING CTA (forsidens closing-mønster) ========== */}
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
            Coaching · 2026-sesongen
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Tren med <Em dark>oss</Em>.
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Book en økt med Anders eller Markus — eller ta kontakt hvis du er
            usikker på hvor du bør starte.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLime href="/booking" withArrow>
              Book en økt
            </CtaLime>
            <CtaOutlineLys href="/kontakt">Kontakt oss</CtaOutlineLys>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Coach-kort (fasit: .coach / .coach-photo / .coach-info) ---------- */

function CoachCard({ c }: { c: CoachKort }) {
  const rolleKort = c.tittel.split("·")[0]?.trim() ?? c.tittel;
  return (
    <Link
      href={`/coacher/${c.slug}`}
      className="group flex flex-col overflow-hidden rounded-[20px] border border-border bg-card transition hover:border-primary hover:shadow-[0_4px_14px_rgba(10,31,23,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {c.foto ? (
          <Image
            src={c.foto}
            alt={c.navn}
            fill
            sizes="(max-width: 640px) 100vw, 440px"
            className="object-cover"
          />
        ) : (
          /* Brandet fallback når profilbilde mangler i DB */
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(168 72% 11%) 100%)",
            }}
          >
            <span className="font-display text-[64px] font-bold tracking-[-0.02em] text-accent">
              {c.initialer}
            </span>
          </div>
        )}
        {/* Bunn-scrim + rolle-tag (fasit: .coach-photo::after + .tag) */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 50%, hsl(var(--foreground) / 0.6) 100%)",
          }}
        />
        <span className="absolute bottom-4 left-4 inline-flex items-center rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-accent-foreground">
          {rolleKort}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="font-display text-xl font-bold tracking-[-0.015em]">
          {c.navn}
        </h2>
        <span className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {c.tittel}
        </span>
        <p className="mt-3 text-sm leading-[1.55] text-muted-foreground">
          {c.bio}
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-3">
          Les mer
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
