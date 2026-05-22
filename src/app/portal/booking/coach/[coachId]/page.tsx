/**
 * PlayerHQ · Book direkte med coach
 *
 * Implementert fra Book direkte med coach.html (Bundle 3).
 * Tre-kolonne layout: coach-profil + kalender + booking-panel.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  ChevronLeft,
  Clock,
  MapPin,
  Star,
  Shield,
  ChevronRight,
  ChevronLeft as ChevLeft,
} from "lucide-react";
import "@/components/booking/booking.css";

type Props = {
  params: Promise<{ coachId: string }>;
};

// ---------------------------------------------------------------------------
// Statisk data for kjente coach-IDer (stub til coach-profiler er i DB)
// ---------------------------------------------------------------------------

const COACH_STUB: Record<
  string,
  {
    navn: string;
    initialer: string;
    rolle: string;
    bio: string;
    rating: string;
    elever: number;
    erfaring: string;
    tags: string[];
    fraPrisOre: number;
    lokasjoner: string[];
  }
> = {
  anders: {
    navn: "Anders Kristiansen",
    initialer: "AK",
    rolle: "Head Coach · AK Golf Academy",
    bio: "Spesialitet: TrackMan-tall + scoring + mental struktur som holder under press. Passer best for golfere som er klare for målbar progresjon og vil ha en plan å jobbe ut fra. 15 år som hoved-coach på GFGK og Miklagard.",
    rating: "4,9",
    elever: 38,
    erfaring: "15 år",
    tags: ["Teknikk", "Slagspill", "Spillestrategi", "Turnering"],
    fraPrisOre: 60000,
    lokasjoner: ["GFGK Performance Studio", "Miklagard Golf Studio"],
  },
  markus: {
    navn: "Markus Røinås Pedersen",
    initialer: "MR",
    rolle: "Sportslig leder junior · GFGK",
    bio: "Tålmodig og lekent fokus på grunnleggende mekanikk. Den ideelle starten hvis du er ny til golfen eller har høyt handicap og vil bygge fundamentet riktig. Spesialisert på junior- og begynneropplæring.",
    rating: "4,8",
    elever: 18,
    erfaring: "4 år",
    tags: ["Teknikk", "Fysikk", "Spillestrategi"],
    fraPrisOre: 30000,
    lokasjoner: ["GFGK Performance Studio"],
  },
};

// Generer ukedager for neste 7 dager (statisk stub)
function getWeekDays(): { dag: string; dato: number; maaned: string; erDag: boolean }[] {
  const dager = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
  const maaneder = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
  const base = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dagIdx = (d.getDay() + 6) % 7;
    return {
      dag: dager[dagIdx],
      dato: d.getDate(),
      maaned: maaneder[d.getMonth()],
      erDag: i === 0,
    };
  });
}

// Statiske slots (stub)
const SLOTS_AM = ["08:00", "08:20", "08:40", "09:00", "09:20", "10:00", "10:20", "11:00"];
const SLOTS_PM = ["13:00", "13:20", "14:00", "14:20", "15:00", "15:20", "16:00", "16:20", "17:00"];

export default async function BookCoachPage({ params }: Props) {
  const { coachId } = await params;
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Prøv å finne coach i DB
  const dbCoach = await prisma.user.findFirst({
    where: {
      role: "COACH",
      OR: [
        { id: coachId },
        { name: { contains: coachId, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true },
  });

  const stub = COACH_STUB[coachId.toLowerCase()];
  if (!stub && !dbCoach) notFound();

  const coach = stub ?? {
    navn: dbCoach!.name,
    initialer: dbCoach!.name.slice(0, 2).toUpperCase(),
    rolle: "Coach · AK Golf",
    bio: "Profesjonell golf-coach.",
    rating: "5,0",
    elever: 0,
    erfaring: "–",
    tags: [],
    fraPrisOre: 60000,
    lokasjoner: [],
  };

  const ukedager = getWeekDays();

  return (
    <div className="bk-scope">
      {/* ── Topnav ── */}
      <nav className="bk-topnav">
        <Link href="/portal/booking" className="bk-back-link">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Tilbake
        </Link>
        <span className="bk-brand">AK Golf · PlayerHQ</span>
        <div className="bk-crumbs">
          Booking /{" "}
          <span className="current">Book med {coach.navn.split(" ")[0]}</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="border-b border-border bg-gradient-to-b from-[#FBFAF5] to-[#FAFAF7] px-8 py-6">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
          Book direkte
        </div>
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
          Book time med <em className="font-serif font-normal italic text-primary">{coach.navn.split(" ")[0]}</em>
        </h1>
        <p className="mt-2 font-mono text-[11.5px] text-muted-foreground tracking-[0.04em]">
          Velg coaching-type · Finn en tid som passer · Bekreft på under 2 minutter
        </p>
      </div>

      {/* ── 3-kolonne shell ── */}
      <div className="grid grid-cols-1 gap-6 p-8 pb-24 lg:grid-cols-[300px_1fr_340px] lg:items-start">

        {/* Kolonne 1: Coach + filtre */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          {/* Coach-kort */}
          <div className="bk-card rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground font-display">
              {coach.initialer}
            </div>
            <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
              {coach.navn}
            </h2>
            <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
              {coach.rolle}
            </div>
            <div className="bk-coach-specs mt-3">
              {coach.tags.map((t) => (
                <span key={t} className="bk-spec-chip">
                  {t}
                </span>
              ))}
            </div>
            <p className="bk-coach-bio mt-3">{coach.bio}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/50 pt-3">
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.10em] text-muted-foreground">
                  Rating
                </div>
                <div className="mt-1 flex items-center gap-1 font-mono text-sm font-semibold">
                  <Star className="h-3 w-3 fill-current" strokeWidth={0} />
                  {coach.rating}
                </div>
              </div>
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.10em] text-muted-foreground">
                  Elever
                </div>
                <div className="mt-1 font-mono text-sm font-semibold">
                  {coach.elever}
                </div>
              </div>
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.10em] text-muted-foreground">
                  Erfaring
                </div>
                <div className="mt-1 font-mono text-sm font-semibold">
                  {coach.erfaring}
                </div>
              </div>
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.10em] text-muted-foreground">
                  Fra pris
                </div>
                <div className="mt-1 font-mono text-sm font-semibold">
                  {coach.fraPrisOre / 100} kr
                </div>
              </div>
            </div>
          </div>

          {/* Filtre */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
              Filtre
            </h3>

            {/* Varighet */}
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <Clock className="h-3 w-3" strokeWidth={1.75} />
                Varighet
              </div>
              <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
                {["20 min", "45 min", "60 min"].map((v, i) => (
                  <button
                    key={v}
                    className={`flex-1 rounded-lg py-2 text-center font-display text-xs font-semibold transition-colors ${
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Lokasjon */}
            <div>
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <MapPin className="h-3 w-3" strokeWidth={1.75} />
                Lokasjon
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-muted/30 p-1">
                {(coach.lokasjoner.length > 0
                  ? coach.lokasjoner
                  : ["GFGK Performance Studio"]
                ).map((loc, i) => (
                  <button
                    key={loc}
                    className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kolonne 2: Uke-kalender */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="font-display text-xl font-semibold tracking-tight">
                Velg dato
              </div>
              <div className="mt-1 font-mono text-xs text-muted-foreground tracking-[0.06em]">
                Uke 21 · mai 2026
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white hover:bg-muted/30">
                <ChevLeft className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <button className="rounded-lg border border-border bg-white px-3 h-8 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] hover:bg-muted/30">
                I dag
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white hover:bg-muted/30">
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Uke-grid */}
          <div className="overflow-x-auto">
            <div className="grid min-w-[480px]" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
              {/* Header */}
              <div className="border-b border-border/50 border-r border-border/50 bg-white" />
              {ukedager.map((d, i) => (
                <div
                  key={i}
                  className={`border-b border-border/50 border-r border-border/50 px-2 py-2 text-center font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground ${
                    d.erDag ? "bg-accent/25 font-bold text-foreground" : "bg-white"
                  } ${i >= 5 ? "bg-muted/10" : ""}`}
                >
                  <span className="block">{d.dag}</span>
                  <span className="mt-1 block font-display text-lg font-bold text-foreground leading-none">
                    {d.dato}
                  </span>
                </div>
              ))}

              {/* Slots */}
              {SLOTS_AM.concat(SLOTS_PM).map((tid) => (
                <>
                  <div
                    key={`tid-${tid}`}
                    className="border-b border-r border-border/50 bg-white px-2 pt-2 text-right font-mono text-[10px] text-muted-foreground leading-none"
                  >
                    {tid}
                  </div>
                  {ukedager.map((d, ci) => {
                    const available =
                      !d.erDag &&
                      ci < 5 &&
                      (tid === "09:00" || tid === "10:00" || tid === "14:00" || tid === "16:00");
                    const selected = d.erDag && tid === "10:00";
                    return (
                      <div
                        key={`cell-${tid}-${ci}`}
                        className={`min-h-[36px] border-b border-r border-border/50 p-1 ${
                          ci >= 5 ? "bg-muted/10" : d.erDag ? "bg-accent/10" : "bg-white"
                        }`}
                      >
                        {available ? (
                          <button className="flex h-[30px] w-full items-center justify-center rounded-md border border-accent bg-white font-mono text-[10.5px] font-semibold text-primary hover:bg-accent/20">
                            {tid}
                          </button>
                        ) : selected ? (
                          <button className="flex h-[30px] w-full items-center justify-center rounded-md bg-primary font-mono text-[10.5px] font-semibold text-primary-foreground">
                            {tid}
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* Kolonne 3: Booking-panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Din bestilling
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Coach
                </div>
                <div className="font-display text-sm font-semibold">
                  {coach.navn.split(" ")[0]}
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Varighet
                </div>
                <div className="font-display text-sm font-semibold">
                  20 min
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Sted
                </div>
                <div className="font-display text-sm font-semibold">
                  GFGK Studio
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Dato/tid
                </div>
                <div className="font-mono text-sm font-bold text-muted-foreground">
                  Ikke valgt
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-muted/30 p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
                    Fra pris
                  </div>
                  <div className="mt-1 font-display text-3xl font-bold tracking-tight">
                    {coach.fraPrisOre / 100}
                    <span className="font-mono text-sm font-normal text-muted-foreground">
                      {" "}
                      kr
                    </span>
                  </div>
                </div>
                <div className="font-mono text-[10.5px] text-muted-foreground">
                  per 20 min
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/portal/booking/ny"
            className="bk-btn-lime w-full justify-center"
          >
            Gå til betalingssteg
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </Link>

          <div className="bk-trust-strip">
            <Shield className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
            <span>
              <strong>Trygg booking.</strong> Avbestilling gratis inntil 24t
              før økt.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
