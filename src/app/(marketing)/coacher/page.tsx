import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
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
    tittel: "Head Coach · CEO",
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
  // Hentes som dokumentasjon — vi viser kuraterte kort uavhengig av om
  // databasen er fylt ut. Coacher i DB brukes hvis tilgjengelig.
  const dbCoacher = await prisma.user.findMany({
    where: { role: "COACH" },
    select: { id: true, name: true, avatarUrl: true },
  });

  const coacher: CoachKort[] =
    dbCoacher.length > 0
      ? dbCoacher.map((u) => {
          const fallback = FALLBACK_COACHER.find(
            (f) => utledSlug(u.name) === f.slug,
          );
          return {
            slug: utledSlug(u.name),
            navn: u.name,
            tittel: fallback?.tittel ?? "Coach",
            bio: fallback?.bio ?? "Coach i AK Golf Academy.",
            initialer: u.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n.charAt(0).toUpperCase())
              .join(""),
            foto: u.avatarUrl,
          };
        })
      : FALLBACK_COACHER;

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
