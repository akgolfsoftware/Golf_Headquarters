import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Suksesshistorier — AK Golf Academy",
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
    venue: r.location ?? "—",
    format: formaterFormat(r.format),
    tag: r.status === "IN_PROGRESS" ? "Pågår" : "Kommende",
    tagTone: r.status === "IN_PROGRESS" ? "apent" : "kommende",
  }));
}

export default async function CasesSide() {
  const tournaments = await hentKommendeTurneringer();

  return (
    <div className="bg-background text-foreground">
      {/* Hero — forest gradient */}
      <section
        className="px-4 sm:px-6"
        style={{
          background:
            "linear-gradient(160deg, hsl(var(--primary)) 0%, #0a1f17 60%)",
        }}
      >
        <div className="mx-auto max-w-7xl pt-16 pb-14 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20">
          <span className="block font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-accent">
            Resultater vi er stolte av
          </span>
          <h1 className="mt-4 max-w-[14ch] font-display text-4xl font-bold leading-[1.0] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
            Cases &amp;{" "}
            <em className="font-display font-medium italic text-accent">
              turneringer
            </em>
          </h1>
          <p className="mt-4 max-w-[52ch] text-[17px] leading-[1.55] text-white/70">
            Dokumenterte resultater fra spillere i AK Golf-programmet — fra HCP
            12 til nasjonal elite.
          </p>
        </div>
      </section>

      {/* Cases-grid + turneringer */}
      <section className="bg-card px-4 sm:px-6 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CASES.map((c) => (
              <CaseKort key={c.slug} case_={c} />
            ))}
          </div>

          {/* Turnerings-tidslinje */}
          <div className="mt-10 rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-7">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
              Kommende turneringer{" "}
              <em className="font-display font-medium italic text-primary">
                2026
              </em>
            </h2>
            <div className="mt-5 flex flex-col gap-2.5">
              {tournaments.length === 0 ? (
                <p className="rounded-[14px] border border-dashed border-border bg-background px-3.5 py-6 text-center text-[13px] text-muted-foreground">
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
                  className="flex items-center gap-3.5 rounded-[14px] border border-border bg-background px-3.5 py-3"
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
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="relative overflow-hidden rounded-[28px] bg-primary px-6 py-10 text-primary-foreground sm:px-8 sm:py-16 md:px-16 md:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
              style={{ background: "rgba(209,248,67,0.18)" }}
            />
            <div className="relative max-w-2xl">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-accent">
                Din tur
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
                Klar for{" "}
                <em className="font-display font-medium italic text-accent">
                  din
                </em>{" "}
                suksesshistorie?
              </h2>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.6] text-white/90 md:text-[18px]">
                Start med en gratis kartleggings-økt. Vi finner ut hva som
                stopper deg, og legger en plan for å komme videre.
              </p>
              <Link
                href="/booking"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.04em] text-accent-foreground transition-opacity hover:opacity-90"
              >
                Book gratis kartleggings-økt
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CaseKort({ case_: c }: { case_: Case }) {
  const forbedring = (c.handicap_fra - c.handicap_til).toFixed(1);

  return (
    <article className="flex flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-sm transition-all hover:-translate-y-[3px] hover:shadow-lg">
      {/* Statistikk-topp — forest banner */}
      <div
        className="relative h-[120px]"
        style={{
          background:
            "linear-gradient(150deg, hsl(var(--primary)), #0a1f17)",
        }}
      >
        <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-[3px] font-mono text-[9px] font-bold text-accent-foreground">
          {c.badge}
        </span>
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
          <TrendingDown className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="absolute bottom-3 right-3 font-mono text-[32px] font-bold leading-none tabular-nums text-white/15">
          -{forbedring}
        </div>
      </div>

      {/* Innhold */}
      <div className="flex flex-1 flex-col p-[18px]">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          <span>{c.navn}</span>
          <span>· {c.alder} år</span>
          <span className="rounded-full bg-secondary px-2.5 py-[3px] tracking-[0.1em]">
            {c.tid}
          </span>
        </div>

        <blockquote className="mt-2 border-l-2 border-primary pl-3 text-[13.5px] italic leading-[1.5] text-muted-foreground">
          «{c.sitat}»
        </blockquote>

        <div className="mt-auto flex items-center gap-2 pt-4">
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
