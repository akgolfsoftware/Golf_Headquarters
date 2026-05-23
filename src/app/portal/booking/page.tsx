/**
 * PlayerHQ · Booking — landingsside (sesjon 2 · pixel-perfect)
 *
 * Spec: BATCH PR3 · Skjerm 3.1
 * - Hero "Book *neste økt*"
 * - Filter-strip: type (Privat/Gruppe/Test/Trackman) + dato + coach
 * - Coach-cards-grid (3 cards: Anders, Markus, Junior)
 * - Bane-cards-grid (4 cards)
 * - "Anbefalt for deg"-strip (AI-basert basert på aktiv plan)
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  Calendar,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Book økt · AK Golf",
};

type CoachCard = {
  id: string;
  navn: string;
  initialer: string;
  rolle: string;
  spesialitet: string;
  rating: string;
  elever: number;
  nesteLedig: string;
  fraPris: string;
  ribbon?: string;
  tags: string[];
};

type AnleggCard = {
  id: string;
  navn: string;
  by: string;
  type: string;
  fasiliteter: string[];
  ledig: string;
  pill?: string;
};

const COACHES: CoachCard[] = [
  {
    id: "anders",
    navn: "Anders Kristiansen",
    initialer: "AK",
    rolle: "Head Coach · AK Golf Academy",
    spesialitet:
      "TrackMan-tall, scoring og mental struktur. For deg som vil ha en plan å jobbe ut fra.",
    rating: "4,9",
    elever: 38,
    nesteLedig: "I morgen · 14:00",
    fraPris: "600",
    ribbon: "Mest brukt",
    tags: ["Tek", "Slag", "Spill", "Turn"],
  },
  {
    id: "markus",
    navn: "Markus Røinås Pedersen",
    initialer: "MR",
    rolle: "Sportslig leder junior · GFGK",
    spesialitet:
      "Tålmodig fokus på grunnleggende mekanikk. Ideelt for nybegynnere og høyt handicap.",
    rating: "4,8",
    elever: 18,
    nesteLedig: "I dag · 17:30",
    fraPris: "300",
    tags: ["Tek", "Fys", "Spill"],
  },
  {
    id: "junior",
    navn: "Junior-teamet",
    initialer: "JR",
    rolle: "Junior coaches · GFGK",
    spesialitet:
      "Felles-økter for utviklingsspillere 12–17 år. Sosialt og strukturert under kyndig veiledning.",
    rating: "4,7",
    elever: 24,
    nesteLedig: "Torsdag · 16:00",
    fraPris: "249",
    tags: ["Junior", "Gruppe", "Tek"],
  },
];

const ANLEGG: AnleggCard[] = [
  {
    id: "gfgk",
    navn: "Gamle Fredrikstad GK",
    by: "Fredrikstad",
    type: "Hjemmebane · 9-hull par 3",
    fasiliteter: ["Performance Studio", "TrackMan 4", "2.etg. range", "Putting"],
    ledig: "12 slot ledig denne uka",
    pill: "Hjemmebane",
  },
  {
    id: "miklagard",
    navn: "Miklagard Golfklubb",
    by: "Kløfta",
    type: "Mesterskap · 18 hull",
    fasiliteter: ["2 × Studio", "TrackMan range", "Wedge-område"],
    ledig: "8 slot ledig denne uka",
  },
  {
    id: "mulligan",
    navn: "Mulligan Indoor",
    by: "Fredrikstad sentrum",
    type: "Innendørs · 6 simulatorer",
    fasiliteter: ["TrackMan 4", "Drop-in 07–23", "Bar & klubbhus"],
    ledig: "Mange ledige tider",
    pill: "Innendørs",
  },
  {
    id: "range",
    navn: "GFGK Range only",
    by: "Fredrikstad",
    type: "Range-pass · Korter økt",
    fasiliteter: ["Drop-in", "Egne baller", "Klippekort"],
    ledig: "Drop-in 07–22",
  },
];

const COACHING_TYPER = [
  { id: "alle", label: "Alle" },
  { id: "privat", label: "Privat" },
  { id: "gruppe", label: "Gruppe" },
  { id: "test", label: "Test" },
  { id: "trackman", label: "TrackMan" },
];

export default async function BookingLandingsside() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Hent kommende bookinger for å si "neste økt" i hero
  const nesteBooking = await prisma.booking
    .findFirst({
      where: { userId: user.id, startAt: { gte: new Date() }, status: "CONFIRMED" },
      orderBy: { startAt: "asc" },
      include: { serviceType: true, location: true },
    })
    .catch(() => null);

  const dbLokasjoner = await prisma.location
    .findMany({ where: { active: true }, orderBy: { name: "asc" }, take: 4 })
    .catch(() => []);

  const visAnlegg: AnleggCard[] =
    dbLokasjoner.length > 0
      ? dbLokasjoner.map((l) => ({
          id: l.id,
          navn: l.name,
          by: l.address,
          type: "AK Golf-anlegg",
          fasiliteter: ["Booking åpen"],
          ledig: "Sjekk tider",
        }))
      : ANLEGG;

  return (
    <div className="mx-auto max-w-[1240px] space-y-10 px-4 py-8 sm:px-6 sm:py-10">
      {/* HERO */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-10">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              style={{ boxShadow: "0 0 0 3px rgba(0,88,64,0.12)" }}
            />
            PLAYERHQ · BOOKING
          </div>
          <h1 className="font-display text-[34px] font-medium leading-[1.05] -tracking-[0.02em] text-foreground sm:text-[46px]">
            Book{" "}
            <em className="font-normal italic text-muted-foreground">
              neste økt
            </em>
          </h1>
          <p className="max-w-[640px] font-sans text-[15px] leading-[1.55] text-muted-foreground sm:text-[16px]">
            Velg coach, anlegg eller en av AI-anbefalingene basert på din aktive
            plan. Privattime, gruppe, test eller TrackMan-økt — alt på ett sted.
          </p>

          {nesteBooking && (
            <div className="mt-2 inline-flex w-fit items-center gap-3 rounded-full border border-border bg-secondary px-3.5 py-1.5">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Neste økt
              </span>
              <span className="font-sans text-[13px] font-medium text-foreground">
                {nesteBooking.serviceType.name} ·{" "}
                {new Date(nesteBooking.startAt).toLocaleDateString("nb-NO", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* FILTER-STRIP */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Filter className="h-3 w-3" strokeWidth={2} />
              Type
            </span>
            {COACHING_TYPER.map((t, i) => (
              <button
                key={t.id}
                className={`rounded-full border px-3 py-1.5 font-sans text-[12px] font-medium transition-colors ${
                  i === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-foreground/30"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 font-sans text-[12px] font-medium text-foreground hover:border-foreground/30">
              <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
              Velg dato
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 font-sans text-[12px] font-medium text-foreground hover:border-foreground/30">
              <Users className="h-3.5 w-3.5" strokeWidth={2} />
              Alle coacher
            </button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Søk…"
                className="h-8 w-44 rounded-full border border-border bg-background pl-7.5 pr-3 font-sans text-[12px] text-foreground placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ANBEFALT FOR DEG */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent">
              <Sparkles
                className="h-3.5 w-3.5 text-accent-foreground"
                strokeWidth={2}
              />
            </span>
            <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
              Anbefalt for deg
            </h2>
          </div>
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            AI · BASERT PÅ AKTIV PLAN
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              tittel: "Wedge-presisjon 50–80m",
              coach: "Med Anders · 60 min",
              tag: "TEK · L3",
              tagBg: "bg-[rgba(26,125,86,0.13)] text-[#1A7D56]",
              tider: "I morgen 14:00 · 16:00",
            },
            {
              tittel: "TrackMan diagnose iron",
              coach: "Med Anders · 45 min",
              tag: "TEST",
              tagBg: "bg-[rgba(184,133,42,0.13)] text-[#B8852A]",
              tider: "Torsdag 09:30",
            },
            {
              tittel: "Putt-trening 4–8 fot",
              coach: "Med Markus · 60 min",
              tag: "SLAG",
              tagBg: "bg-[rgba(209,248,67,0.55)] text-[#0A1F17]",
              tider: "Fredag 17:00",
            },
          ].map((rec) => (
            <Link
              key={rec.tittel}
              href="/portal/booking/coach/anders"
              className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
            >
              <span
                className={`w-fit rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.06em] ${rec.tagBg}`}
              >
                {rec.tag}
              </span>
              <h3 className="font-display text-[15px] font-semibold leading-[1.2] -tracking-[0.005em] text-foreground">
                {rec.tittel}
              </h3>
              <div className="font-sans text-[12.5px] text-muted-foreground">
                {rec.coach}
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-border pt-2.5">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {rec.tider}
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                  strokeWidth={2}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* COACH-GRID */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-[20px] font-semibold -tracking-[0.01em] text-foreground">
            Book direkte med coach
          </h2>
          <Link
            href="/portal/coach"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
          >
            Se alle →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COACHES.map((c) => (
            <Link
              key={c.id}
              href={`/portal/booking/coach/${c.id}`}
              className="group relative flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-lg"
            >
              {c.ribbon && (
                <span className="absolute right-4 top-4 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.06em] text-accent-foreground">
                  {c.ribbon}
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-full bg-primary font-display text-[18px] font-semibold text-primary-foreground">
                  {c.initialer}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-[16px] font-semibold -tracking-[0.005em] text-foreground">
                    {c.navn}
                  </h3>
                  <div className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {c.rolle}
                  </div>
                </div>
              </div>
              <p className="font-sans text-[13px] leading-[1.5] text-muted-foreground">
                {c.spesialitet}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                <div>
                  <div className="flex items-center justify-center gap-0.5 font-mono text-[13px] font-semibold text-foreground tabular-nums">
                    <Star
                      className="h-3 w-3 fill-current text-[#B8852A]"
                      strokeWidth={0}
                    />
                    {c.rating}
                  </div>
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">
                    Rating
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[13px] font-semibold text-foreground tabular-nums">
                    {c.elever}
                  </div>
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">
                    Elever
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[13px] font-semibold text-foreground tabular-nums">
                    {c.fraPris}
                  </div>
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">
                    Fra-pris
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2">
                <span className="font-mono text-[11px] text-muted-foreground">
                  Neste ledig
                </span>
                <span className="font-sans text-[12.5px] font-semibold text-foreground">
                  {c.nesteLedig}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BANE-GRID */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-[20px] font-semibold -tracking-[0.01em] text-foreground">
            Anlegg & baner
          </h2>
          <span className="font-mono text-[11px] text-muted-foreground">
            {visAnlegg.length} anlegg
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visAnlegg.map((a) => (
            <Link
              key={a.id}
              href={`/portal/booking/anlegg/${a.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-lg"
            >
              <div
                className="relative h-32 bg-primary"
                style={{
                  background:
                    "linear-gradient(135deg, #003A2A 0%, #005840 50%, #1A7D56 100%)",
                }}
              >
                {a.pill && (
                  <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.06em] text-accent-foreground">
                    {a.pill}
                  </span>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display text-[16px] font-semibold -tracking-[0.005em] text-white">
                    {a.navn}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1 font-mono text-[10.5px] text-white/75">
                    <MapPin className="h-3 w-3" strokeWidth={2} />
                    {a.by}
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-4">
                <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {a.type}
                </div>
                <ul className="space-y-1">
                  {a.fasiliteter.slice(0, 3).map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-1.5 font-sans text-[12px] text-foreground"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-2.5">
                  <span className="font-mono text-[10.5px] text-muted-foreground">
                    {a.ledig}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                    strokeWidth={2}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
