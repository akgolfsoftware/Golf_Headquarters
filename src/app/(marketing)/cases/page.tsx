import type { Metadata } from "next";
import Link from "next/link";
import { TrendingDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  CtaLime,
  CtaOutlineLys,
  Em,
  HeroEm,
  MarketingHero,
  SectionEyebrow,
  SectionH2,
} from "@/components/marketing/marketing-sections";

export const metadata: Metadata = {
  title: "Suksesshistorier · AK Golf Academy",
  description:
    "Les hvordan spillere i AK Golf Academy har senket handicapet sitt med data-drevet coaching.",
};

type Case = {
  slug: string;
  navn: string;
  alder: number;
  handicap_fra: number;
  handicap_til: number;
  tid: string;
  sitat: string;
  badge: string;
};

const CASES: Case[] = [
  {
    slug: "marcus",
    navn: "Marcus R.",
    alder: 17,
    handicap_fra: 12.4,
    handicap_til: 6.1,
    tid: "8 måneder",
    sitat: "SG Hub-analysene forandret måten jeg trener på.",
    badge: "Personlig rekord",
  },
  {
    slug: "sofie",
    navn: "Sofie L.",
    alder: 22,
    handicap_fra: 8.2,
    handicap_til: 3.7,
    tid: "6 måneder",
    sitat: "Endelig data-drevet coaching som faktisk funker.",
    badge: "Data-drevet",
  },
];

type Tournament = {
  day: string;
  mon: string;
  name: string;
  venue: string;
  format: string;
  tag: string;
  tagTone: "kommende" | "apent" | "pamelding";
};

const TAG_TONE: Record<Tournament["tagTone"], string> = {
  kommende: "bg-primary/10 text-primary",
  apent: "bg-info/10 text-info",
  pamelding: "bg-secondary text-muted-foreground",
};

const MND = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES"];

function formaterFormat(format: string | null): string {
  switch ((format ?? "").toUpperCase()) {
    case "STROKE": return "Slagspill";
    case "MATCH": return "Match play";
    case "STABLEFORD": return "Stableford";
    default: return "Turnering";
  }
}

/** Henter kommende turneringer fra DB (samme kilde som /turneringer). */
async function hentKommendeTurneringer(): Promise<Tournament[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const rows = await prisma.tournament.findMany({
    where: {
      startDate: { gte: today, lte: in90 },
      status: { in: ["UPCOMING", "IN_PROGRESS"] },
      mergedIntoId: null,
    },
    orderBy: { startDate: "asc" },
    take: 6,
    select: { id: true, name: true, startDate: true, location: true, format: true, status: true },
  });

  return rows.map((r) => ({
    day: String(r.startDate.getDate()).padStart(2, "0"),
    mon: MND[r.startDate.getMonth()],
    name: r.name,
    venue: r.location ?? "Sted kommer",
    format: formaterFormat(r.format),
    tag: r.status === "IN_PROGRESS" ? "Pågår" : "Kommende",
    tagTone: r.status === "IN_PROGRESS" ? "apent" : "kommende",
  }));
}

export default async function CasesSide() {
  const tournaments = await hentKommendeTurneringer();

  return (
    <div className="bg-background text-foreground">
      {/* ========== HERO · full-bleed foto + forest-scrim ========== */}
      <MarketingHero
        foto="/images/akademy/hull-ovenfra.jpg"
        eyebrow="Resultater vi er stolte av"
        tittel={
          <>
            Cases &amp; <HeroEm>turneringer</HeroEm>.
          </>
        }
        ingress="Dokumenterte resultater fra spillere i AK Golf-programmet, fra HCP 12 til nasjonal elite."
        primaer={{ href: "/booking", label: "Book gratis kartleggings-økt" }}
        sekundaer={{ href: "/turneringer", label: "Se turneringskalenderen" }}
      />

      {/* ========== CASES-GRID ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Spillere · Dokumentert fremgang</SectionEyebrow>
          <SectionH2>
            Historier som <Em>kan måles</Em>.
          </SectionH2>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CASES.map((c) => (
              <CaseKort key={c.slug} case_={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== TURNERINGS-TIDSLINJE ========== */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionEyebrow>Kalender · Neste 90 dager</SectionEyebrow>
          <SectionH2>
            Kommende <Em>turneringer</Em>.
          </SectionH2>

          <div className="mt-12 flex max-w-4xl flex-col gap-2.5">
            {tournaments.length === 0 ? (
              <p className="rounded-[20px] border border-dashed border-border bg-card px-6 py-8 text-center text-sm text-muted-foreground">
                Ingen kommende turneringer akkurat nå. Se hele kalenderen på{" "}
                <Link href="/turneringer" className="font-semibold text-primary">
                  /turneringer
                </Link>
                .
              </p>
            ) : null}
            {tournaments.map((t) => (
              <div
                key={`${t.day}-${t.name}`}
                className="flex items-center gap-4 rounded-[20px] border border-border bg-card px-4 py-3"
              >
                <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary">
                  <span className="font-mono text-[14px] font-bold leading-none text-accent">
                    {t.day}
                  </span>
                  <span className="font-mono text-[8px] text-accent/60">
                    {t.mon}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-foreground">
                    {t.name}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {t.venue} · {t.format}
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-1 font-mono text-[9.5px] font-bold ${TAG_TONE[t.tagTone]}`}
                >
                  {t.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
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
            Din tur
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Klar for <Em dark>din</Em> suksesshistorie?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Start med en gratis kartleggings-økt. Vi finner ut hva som stopper
            deg, og legger en plan for å komme videre.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLime href="/booking" withArrow>
              Book gratis kartleggings-økt
            </CtaLime>
            <CtaOutlineLys href="/kontakt">Snakk med oss</CtaOutlineLys>
          </div>
        </div>
      </section>
    </div>
  );
}

function CaseKort({ case_: c }: { case_: Case }) {
  const forbedring = (c.handicap_fra - c.handicap_til).toFixed(1);

  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-card transition hover:border-primary hover:shadow-[0_4px_14px_rgba(10,31,23,0.08)]">
      {/* Statistikk-topp — forest banner */}
      <div
        className="relative h-[120px]"
        style={{
          background:
            "linear-gradient(150deg, hsl(var(--primary)) 0%, hsl(168 72% 11%) 100%)",
        }}
      >
        <span className="absolute left-4 top-4 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-accent-foreground">
          {c.badge}
        </span>
        <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
          <TrendingDown className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <div className="absolute bottom-3 right-4 font-mono text-[32px] font-bold leading-none tabular-nums text-white/15">
          -{forbedring}
        </div>
      </div>

      {/* Innhold */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <span>{c.navn}</span>
          <span>· {c.alder} år</span>
          <span className="rounded-full bg-secondary px-2.5 py-1 tracking-[0.1em]">
            {c.tid}
          </span>
        </div>

        <blockquote className="mt-4 border-l-2 border-primary pl-4 font-display text-[16px] font-normal italic leading-[1.5] text-muted-foreground">
          «{c.sitat}»
        </blockquote>

        <div className="mt-auto flex items-center gap-2 pt-6">
          <span className="font-mono text-[22px] font-bold tabular-nums text-primary">
            -{forbedring}
          </span>
          <span className="text-[12px] text-muted-foreground">
            HCP-forbedring · {c.handicap_fra} → {c.handicap_til}
          </span>
        </div>
      </div>
    </article>
  );
}
