/**
 * Marketing — Coacher (forbruker-syn)
 * URL: /akgolf-coacher-demo
 *
 * Liste over PGA-coacher tilknyttet AK Golf Group. Filter-bar (sted,
 * spesialitet, pris) og 4 coach-kort med foto-placeholder, tittel,
 * spesialiteter (pills) og pris.
 */

import Link from "next/link";
import {
  ArrowRight,
  Award,
  Filter,
  MapPin,
  Search,
  Star,
} from "lucide-react";

interface Coach {
  id: string;
  initials: string;
  navn: string;
  tittel: string;
  sted: string;
  spesialiteter: string[];
  prisPerTime: number;
  stjerner: number;
  antallAnmeldelser: number;
  erfaringAr: number;
  badge?: string;
}

const COACHES: Coach[] = [
  {
    id: "anders-kristiansen",
    initials: "AK",
    navn: "Anders Kristiansen",
    tittel: "PGA Class A · Hovedcoach",
    sted: "Mulligan Indoor Borre",
    spesialiteter: ["Scoring", "Junior 8–16 år", "Mental"],
    prisPerTime: 1500,
    stjerner: 4.9,
    antallAnmeldelser: 142,
    erfaringAr: 8,
    badge: "Anbefalt",
  },
  {
    id: "sara-pedersen",
    initials: "SP",
    navn: "Sara Pedersen",
    tittel: "Junior-spesialist",
    sted: "GFGK Bossum",
    spesialiteter: ["Junior 6–12 år", "Putting", "Foreldreoppfølging"],
    prisPerTime: 1200,
    stjerner: 4.8,
    antallAnmeldelser: 89,
    erfaringAr: 5,
  },
  {
    id: "tom-andersen",
    initials: "TA",
    navn: "Tom Andersen",
    tittel: "TrackMan Master · Long game",
    sted: "Mulligan Indoor Borre",
    spesialiteter: ["TrackMan-analyse", "Driver", "Klubbetilpasning"],
    prisPerTime: 1400,
    stjerner: 4,
    antallAnmeldelser: 67,
    erfaringAr: 11,
  },
  {
    id: "markus-karlsen",
    initials: "MK",
    navn: "Markus Karlsen",
    tittel: "PGA · Voksenutvikling",
    sted: "GFGK Bossum",
    spesialiteter: ["Voksne nybegynnere", "Banespill", "Course management"],
    prisPerTime: 1300,
    stjerner: 4.7,
    antallAnmeldelser: 54,
    erfaringAr: 9,
  },
  {
    id: "anders-kristiansen-elite",
    initials: "AK",
    navn: "Anders Kristiansen",
    tittel: "Elite-coaching · Pakke",
    sted: "Mulligan Indoor Borre",
    spesialiteter: ["Norgesfinalister", "MORAD", "Sesongplan"],
    prisPerTime: 2500,
    stjerner: 4.9,
    antallAnmeldelser: 38,
    erfaringAr: 8,
  },
  {
    id: "sara-pedersen-foreldre",
    initials: "SP",
    navn: "Sara Pedersen",
    tittel: "Foreldre + barn (2-pakke)",
    sted: "GFGK Bossum",
    spesialiteter: ["Familieøkter", "Onboarding", "Junior-camp"],
    prisPerTime: 1100,
    stjerner: 4.6,
    antallAnmeldelser: 31,
    erfaringAr: 5,
  },
];

const STEDER = ["Alle steder", "Mulligan Indoor Borre", "GFGK Bossum"];
const SPESIALITETER = [
  "Alle spesialiteter",
  "Scoring",
  "Junior",
  "TrackMan",
  "Mental",
  "Voksne nybegynnere",
];
const PRISER = [
  "Alle prisklasser",
  "Under 1 200 kr",
  "1 200 – 1 500 kr",
  "Over 1 500 kr",
];

function formatNok(amount: number): string {
  return amount.toLocaleString("nb-NO").replace(/ /g, " ");
}

export default function AkgolfCoacherDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      {/* Hero */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Coacher · AK Golf Group
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-[56px] font-medium leading-[1.05] tracking-tight">
            Møt coachene som{" "}
            <em className="italic text-primary">
              tar deg fra ord til handling
            </em>
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.65] text-muted-foreground">
            PGA-utdannede coacher med erfaring fra hele spennvidden — fra
            første runde til norgesfinalist. Velg sted, spesialitet og pris som
            passer deg.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" strokeWidth={1.5} />
              4 PGA-coacher
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />2
              anlegg i Vestfold og Østfold
            </span>
            <span className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" strokeWidth={1.5} />
              4,8 gjennomsnitt — 421 anmeldelser
            </span>
          </div>
        </div>
      </section>

      {/* Filter-bar */}
      <section className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-8 py-4">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <Filter className="h-4 w-4" strokeWidth={1.5} />
            Filtrer
          </div>
          <FilterDropdown label="Sted" options={STEDER} />
          <FilterDropdown label="Spesialitet" options={SPESIALITETER} />
          <FilterDropdown label="Pris" options={PRISER} />
          <div className="ml-auto inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2">
            <Search
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
            />
            <input
              type="search"
              placeholder="Søk på navn eller spesialitet"
              className="w-56 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      {/* Coach-kort */}
      <section className="mx-auto max-w-7xl px-8 py-16">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-display text-[28px] font-medium tracking-tight">
            <em className="italic">{COACHES.length}</em> coacher tilgjengelig
          </h2>
          <span className="text-[13px] text-muted-foreground">
            Sortert etter anbefaling
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COACHES.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function CoachCard({ coach }: { coach: Coach }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
      {/* Foto-placeholder */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary to-muted">
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-primary/10 font-mono text-[28px] font-bold text-primary">
            {coach.initials}
          </div>
        </div>
        {coach.badge && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
            <Star className="h-3 w-3" strokeWidth={2} />
            {coach.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {coach.tittel}
        </div>
        <h3 className="mt-2 font-display text-[22px] font-medium tracking-tight">
          {coach.navn}
        </h3>

        <div className="mt-3 flex items-center gap-3 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
            {coach.sted}
          </span>
          <span className="text-border">·</span>
          <span>{coach.erfaringAr} år</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {coach.spesialiteter.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Fra
          </span>
          <span className="font-mono text-[22px] font-medium tabular">
            {formatNok(coach.prisPerTime)}
          </span>
          <span className="text-[12px] text-muted-foreground">kr / time</span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Star
            className="h-3.5 w-3.5 text-primary"
            strokeWidth={1.5}
            fill="currentColor"
          />
          <span className="font-medium text-foreground tabular">
            {coach.stjerner.toString().replace(".", ",")}
          </span>
          <span>({coach.antallAnmeldelser} anmeldelser)</span>
        </div>

        <a
          href="/akgolf-coach-profil-demo"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-[13px] font-medium transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
        >
          Se profil
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </a>
      </div>
    </article>
  );
}

function FilterDropdown({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-[13px]">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <select
        className="bg-transparent text-[13px] outline-none"
        defaultValue={options[0]}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function TopNav() {
  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 text-[14px] font-medium">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>AK Golf</span>
        </Link>
        <div className="hidden items-center gap-8 text-[13px] md:flex">
          <a href="/akgolf-tjenester-demo" className="hover:text-primary">
            Tjenester
          </a>
          <a href="/akgolf-om-demo" className="hover:text-primary">
            Om
          </a>
          <a
            href="/akgolf-coacher-demo"
            className="font-medium text-primary"
          >
            Coacher
          </a>
          <a href="/akgolf-kontakt-demo" className="hover:text-primary">
            Kontakt
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/auth-login-demo"
            className="hidden text-[13px] hover:text-primary md:inline"
          >
            Logg inn
          </a>
          <a
            href="/booking-index-demo"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
          >
            Book økt
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-[14px] font-medium">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>AK Golf</span>
            </div>
            <p className="mt-4 max-w-xs text-[12px] leading-[1.6] text-muted-foreground">
              Coaching, plan og fremgang. PGA-coacher i Vestfold og Østfold.
            </p>
          </div>
          <FooterCol
            title="Tjenester"
            links={["Privat coaching", "Junior", "Bedrift", "Camps"]}
          />
          <FooterCol
            title="Selskap"
            links={["Om oss", "Coacher", "Anlegg", "Kontakt"]}
          />
          <FooterCol
            title="Hjelp"
            links={["FAQ", "Personvern", "Vilkår", "Logg inn"]}
          />
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[12px] text-muted-foreground">
          <span>© 2026 AK Golf Group AS</span>
          <span>akgolf.no</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-4 space-y-2 text-[13px]">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-primary">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
