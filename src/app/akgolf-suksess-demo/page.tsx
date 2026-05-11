/**
 * Marketing demo — Suksesshistorier (akgolf.no/suksess)
 * Hero, filter, 4 case-kort med foto, sitat, statistikk og CTA.
 */
import Link from "next/link";
import {
  ArrowRight,
  TrendingDown,
  Trophy,
  Clock,
  Target,
  Quote,
} from "lucide-react";
import { MarketingNav, MarketingFooter } from "../_marketing-demo/chrome";

const FILTERS = ["Alle", "Junior", "Voksen", "Senior"] as const;

type Case = {
  slug: string;
  name: string;
  ageGroup: "Junior" | "Voksen" | "Senior";
  tagline: string;
  quote: string;
  description: string;
  stats: { label: string; value: string; subline: string }[];
  imageHue: number;
  coach: string;
  duration: string;
};

const CASES: Case[] = [
  {
    slug: "markus-roinas-pedersen",
    name: "Markus Roinås Pedersen",
    ageGroup: "Junior",
    tagline: "Fra HCP 12 til +2,4 på tre sesonger",
    quote:
      "Det handlet aldri om å slå hardere. Det handlet om å forstå hvilke slag som faktisk teller, og trene dem riktig.",
    description:
      "Markus kom til oss som 14-åring med talent, men uten struktur. Tre år senere er han en av de mest lovende juniorene i regionen og har fast plass på WANG Toppidrett.",
    stats: [
      { label: "HCP", value: "+2,4", subline: "fra 12,0 i 2023" },
      { label: "Sesong", value: "3", subline: "år hos AK Golf" },
      { label: "NM-spill", value: "4", subline: "deltakelser så langt" },
    ],
    imageHue: 159,
    coach: "Anders Kristiansen",
    duration: "Mars 2023 – pågående",
  },
  {
    slug: "emma-solberg",
    name: "Emma Solberg",
    ageGroup: "Junior",
    tagline: "Fra nybegynner til NM-deltaker på to år",
    quote:
      "Jeg trodde aldri jeg skulle spille NM. Nå har jeg vært der to ganger og vet at jeg hører hjemme der.",
    description:
      "Emma hadde aldri rørt en golfkølle før hun begynte i junior-programmet i 2024. To sesonger senere kvalifiserte hun seg til NM Junior — uten å ha gått på golf-skole først.",
    stats: [
      { label: "HCP", value: "9,1", subline: "fra 54 i 2024" },
      { label: "Sesong", value: "2", subline: "år i programmet" },
      { label: "Turneringer", value: "11", subline: "med tellende score" },
    ],
    imageHue: 340,
    coach: "Sara Pedersen",
    duration: "April 2024 – pågående",
  },
  {
    slug: "thomas-haugen",
    name: "Thomas Haugen",
    ageGroup: "Voksen",
    tagline: "Fra HCP 18 til 7,4 på ett år",
    quote:
      "Jeg hadde stått på samme handicap i syv år. Når jeg sluttet å eksperimentere og fulgte planen, kom det fort.",
    description:
      "Thomas, 41 år og far til tre, hadde stagnert på HCP 18 i syv år. Med 4-5 økter i måneden og en strukturert plan, kom han ned 11 slag på ti måneder.",
    stats: [
      { label: "HCP", value: "7,4", subline: "fra 18,0 i 2025" },
      { label: "Slag ned", value: "−10,6", subline: "på 10 måneder" },
      { label: "Økter/mnd", value: "4,5", subline: "snitt over året" },
    ],
    imageHue: 220,
    coach: "Anders Kristiansen",
    duration: "Juni 2025 – pågående",
  },
  {
    slug: "kari-bjerke",
    name: "Kari Bjerke",
    ageGroup: "Senior",
    tagline: "Fra ryggsmerter til klubbmester ved 64",
    quote:
      "Etter operasjonen trodde jeg golf-karrieren var over. Anders bygde opp svingen min fra null — med tålmodighet.",
    description:
      "Kari hadde nylig gjennomgått ryggoperasjon og var i ferd med å gi opp. Vi designet en spesialtilpasset progresjon over åtte måneder. Hun vant klubbmesterskapet i sin klasse våren 2026.",
    stats: [
      { label: "HCP", value: "14,2", subline: "fra 21,8 etter pause" },
      { label: "Klubbmester", value: "2026", subline: "senior-klasse" },
      { label: "Smerte-fri", value: "100 %", subline: "siden september" },
    ],
    imageHue: 30,
    coach: "Tom Andersen",
    duration: "Februar 2025 – pågående",
  },
];

export default function SuksessDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" strokeWidth={1.5} />
            Suksesshistorier
          </span>
          <h1 className="mt-6 max-w-4xl font-display text-[48px] font-semibold leading-[1.05] tracking-tight md:text-[68px]">
            Folk som ble{" "}
            <em className="font-display font-normal italic [font-family:var(--font-instrument-serif),serif]">
              bedre
            </em>{" "}
            — med metode, ikke flaks
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground">
            Fire historier som viser hva som faktisk skjer når en spiller får
            riktig struktur. Tallene er ekte, navnene er ekte, og resultatene
            har holdt seg.
          </p>

          {/* Aggregat-stats */}
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            <Aggregate value="200+" label="Aktive spillere" />
            <Aggregate value="−6,8" label="HCP-snitt på 12 mnd" />
            <Aggregate value="14" label="Junior-spillere i NM" />
            <Aggregate value="92 %" label="Fornyer abonnementet" />
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-6">
          <span className="mr-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Aldersgruppe
          </span>
          {FILTERS.map((f, i) => (
            <button
              key={f}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Case-kort */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {CASES.map((c) => (
              <CaseCard key={c.slug} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA-strip */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-[32px] font-semibold leading-[1.15] tracking-tight md:text-[40px]">
                Hva er din neste historie?
              </h2>
              <p className="mt-3 text-[16px] leading-[1.6] text-muted-foreground">
                Vi har plass for 8 nye spillere på Mulligan og GFGK fra og med
                juni. Start med en intro-økt, så ser vi hva neste sesong bør se
                ut som.
              </p>
            </div>
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Book introøkt
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Aggregate({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display font-mono text-[40px] font-semibold tabular-nums leading-none tracking-tight md:text-[52px]">
        {value}
      </div>
      <div className="mt-2 text-[13px] text-muted-foreground">{label}</div>
    </div>
  );
}

function CaseCard({ c }: { c: Case }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div
        className="relative h-64 w-full"
        style={{
          background: `linear-gradient(135deg, hsl(${c.imageHue} 28% 86%) 0%, hsl(${c.imageHue} 18% 70%) 100%)`,
        }}
      >
        <div className="absolute left-6 top-6 flex items-center gap-2">
          <span className="rounded-full bg-card/90 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground backdrop-blur">
            {c.ageGroup}
          </span>
        </div>
        <div className="absolute inset-0 grid place-items-center opacity-30">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
            AK Golf · portrett
          </span>
        </div>
      </div>

      <div className="p-8">
        <h3 className="font-display text-[26px] font-semibold leading-[1.15] tracking-tight">
          {c.name}
        </h3>
        <p className="mt-2 font-display text-[17px] italic [font-family:var(--font-instrument-serif),serif] text-primary">
          {c.tagline}
        </p>

        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-secondary p-5">
          <Quote
            className="mt-1 h-5 w-5 shrink-0 text-primary opacity-60"
            strokeWidth={1.5}
          />
          <p className="text-[15px] leading-[1.6] text-foreground">
            &ldquo;{c.quote}&rdquo;
          </p>
        </div>

        <p className="mt-5 text-[14px] leading-[1.65] text-muted-foreground">
          {c.description}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6">
          {c.stats.map((s) => (
            <div key={s.label}>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-1 font-mono text-[22px] font-semibold tabular-nums leading-none">
                {s.value}
              </div>
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                {s.subline}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-5 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" strokeWidth={1.5} />
            Coach: <b className="font-medium text-foreground">{c.coach}</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
            {c.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5" strokeWidth={1.5} />
            HCP-trend ned
          </span>
        </div>

        <Link
          href="#"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          Les hele historien
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    </article>
  );
}
