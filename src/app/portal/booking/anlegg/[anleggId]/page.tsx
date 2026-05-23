/**
 * PlayerHQ · Anlegg/bane-detalj (sesjon 2 · pixel-perfect)
 *
 * Spec: BATCH PR3 · Skjerm 3.3
 * - Hero med cover-bilde
 * - Specs (hull, par, lengde, slope)
 * - Sub-fasiliteter (range, putting, TrackMan)
 * - Booking-tilgjengelighet-grid
 * - Tournament-historikk
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Flag,
  MapPin,
  Mountain,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";

type Props = {
  params: Promise<{ anleggId: string }>;
};

type AnleggData = {
  navn: string;
  by: string;
  type: string;
  bio: string;
  hull: number;
  par: number;
  lengdeM: number;
  slope: number;
  rating: string;
  apent: string;
  fasiliteter: {
    navn: string;
    type: string;
    pill?: string;
  }[];
  turneringer: {
    navn: string;
    aar: string;
    plassering: string;
  }[];
};

const ANLEGG: Record<string, AnleggData> = {
  gfgk: {
    navn: "Gamle Fredrikstad Golfklubb",
    by: "Fredrikstad",
    type: "Hjemmebane · 9-hulls par 3",
    bio: "Hjemmebanen til AK Golf Academy. Par 3-bane med 9 hull designet for teknisk arbeid og spill-trening. Performance Studio med Trackman 4 og to-kamera-system gir ideelle forhold for målbar progresjon.",
    hull: 9,
    par: 27,
    lengdeM: 980,
    slope: 102,
    rating: "4,8",
    apent: "07–22",
    fasiliteter: [
      {
        navn: "Performance Studio",
        type: "Innendørs · TrackMan 4 · 2-kamera",
        pill: "TrackMan",
      },
      { navn: "Driving range (2.etg)", type: "30 baier · 220 m · TopTracer" },
      { navn: "Putting green", type: "1200 m² · 12 hull" },
      {
        navn: "Nærspillsgreen",
        type: "Bunkers, ruff og fri-spill",
      },
      { navn: "9-hulls par 3-bane", type: "Par 27 · 980 m fra hvit tee" },
    ],
    turneringer: [
      { navn: "AK Spring Open", aar: "2026", plassering: "1. · M. R.-Pedersen" },
      { navn: "GFGK Klubbmesterskap", aar: "2025", plassering: "Topp 5: 3 av våre" },
      { navn: "Junior Tour 9-hulls", aar: "2025", plassering: "Vinner: AK-spiller" },
    ],
  },
  miklagard: {
    navn: "Miklagard Golfklubb",
    by: "Kløfta",
    type: "Mesterskap · 18 hull",
    bio: "Vårt sekundære anlegg — Norges mest prestisjetunge mesterskapsbane. Best for spill-trening på en utfordrende layout, med 2 Performance Studio og state-of-the-art wedge-område.",
    hull: 18,
    par: 72,
    lengdeM: 6230,
    slope: 134,
    rating: "4,9",
    apent: "06–22",
    fasiliteter: [
      {
        navn: "Studio A & B",
        type: "Innendørs · 2 × TrackMan 4",
        pill: "TrackMan",
      },
      { navn: "TrackMan range", type: "26 baier · 280 m" },
      { navn: "Stor putting green", type: "1800 m²" },
      { navn: "Wedge-område", type: "Egen kortspill-bane" },
    ],
    turneringer: [
      { navn: "Olyo Tour 2026", aar: "2026", plassering: "Stop #3" },
      { navn: "Srixon Norges Cup", aar: "2025", plassering: "Cut: 4 av våre" },
    ],
  },
  mulligan: {
    navn: "Mulligan Indoor Golf Simulators",
    by: "Fredrikstad sentrum",
    type: "Innendørs · 6 simulatorer",
    bio: "Innendørs fasilitet med 6 TrackMan-simulatorer. Drop-in 07–23, bar og klubbhus. Perfekt for off-season-trening og kvelds-økter.",
    hull: 0,
    par: 0,
    lengdeM: 0,
    slope: 0,
    rating: "4,7",
    apent: "07–23",
    fasiliteter: [
      { navn: "6 × TrackMan 4 sim", type: "Innendørs", pill: "TrackMan" },
      { navn: "Bar & klubbhus", type: "Lett servering" },
      { navn: "Privat-rom", type: "Bookbart for grupper" },
    ],
    turneringer: [
      { navn: "Mulligan Winter League", aar: "2025/26", plassering: "Pågående" },
    ],
  },
  range: {
    navn: "GFGK Range only",
    by: "Fredrikstad",
    type: "Range-pass · korter økt",
    bio: "Drop-in range-pass for korter teknisk-økt eller oppvarming før banen. Klippekort tilgjengelig.",
    hull: 0,
    par: 0,
    lengdeM: 0,
    slope: 0,
    rating: "4,5",
    apent: "07–22",
    fasiliteter: [
      { navn: "Driving range", type: "30 baier · 2.etg." },
      { navn: "Klippekort", type: "Mengderabatt" },
    ],
    turneringer: [],
  },
};

const TIME_SLOTS = [
  "07:00",
  "08:30",
  "10:00",
  "11:30",
  "13:00",
  "14:30",
  "16:00",
  "17:30",
  "19:00",
];

function getWeek() {
  const dager = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  const base = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dagIdx = (d.getDay() + 6) % 7;
    return { dag: dager[dagIdx], dato: d.getDate() };
  });
}

export default async function AnleggDetaljPage({ params }: Props) {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { anleggId } = await params;
  const anlegg = ANLEGG[anleggId];
  if (!anlegg) notFound();

  const uke = getWeek();

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/portal/booking"
        className="inline-flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tilbake til booking
      </Link>

      {/* HERO med cover */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className="relative h-56 sm:h-72 lg:h-80"
          style={{
            background:
              "linear-gradient(135deg, #003A2A 0%, #005840 40%, #1A7D56 80%, #2C7D52 100%)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(209,248,67,0.18),transparent_60%)]" />
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
            <Flag className="h-3 w-3" strokeWidth={2} />
            {anlegg.type}
          </div>
          <div className="absolute bottom-6 left-5 right-5 sm:bottom-8 sm:left-8">
            <h1 className="font-display text-[30px] font-medium leading-[1.05] -tracking-[0.02em] text-white sm:text-[42px]">
              {anlegg.navn}
            </h1>
            <div className="mt-1.5 flex items-center gap-3 font-mono text-[12px] text-white/80">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                {anlegg.by}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Star
                  className="h-3.5 w-3.5 fill-current text-accent"
                  strokeWidth={0}
                />
                {anlegg.rating}
              </span>
              <span>·</span>
              <span>Åpent {anlegg.apent}</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border p-5 sm:p-6">
          <p className="max-w-[820px] font-sans text-[14px] leading-[1.6] text-muted-foreground sm:text-[15px]">
            {anlegg.bio}
          </p>
        </div>
      </section>

      {/* SPECS */}
      {anlegg.hull > 0 && (
        <section>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Spec
              label="Hull"
              value={String(anlegg.hull)}
              icon={<Flag className="h-3.5 w-3.5" strokeWidth={1.75} />}
            />
            <Spec
              label="Par"
              value={String(anlegg.par)}
              icon={<Target className="h-3.5 w-3.5" strokeWidth={1.75} />}
            />
            <Spec
              label="Lengde"
              value={`${anlegg.lengdeM.toLocaleString("nb-NO")} m`}
              icon={<ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />}
            />
            <Spec
              label="Slope"
              value={String(anlegg.slope)}
              icon={<Mountain className="h-3.5 w-3.5" strokeWidth={1.75} />}
            />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* SUB-FASILITETER */}
        <section>
          <h2 className="mb-3 font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
            Fasiliteter
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {anlegg.fasiliteter.map((f) => (
              <div
                key={f.navn}
                className="relative flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                {f.pill && (
                  <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-accent-foreground">
                    {f.pill}
                  </span>
                )}
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-secondary">
                  <Target
                    className="h-4 w-4 text-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-[14px] font-semibold -tracking-[0.005em] text-foreground">
                    {f.navn}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {f.type}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BOOKING-TILGJENGELIGHET */}
          <div className="mt-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
                Tilgjengelighet
              </h2>
              <span className="font-mono text-[11px] text-muted-foreground">
                Neste 7 dager
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-[80px_repeat(7,_1fr)] border-b border-border bg-secondary/40 text-center">
                <div className="border-r border-border p-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Tid
                </div>
                {uke.map((d) => (
                  <div
                    key={`${d.dag}-${d.dato}`}
                    className="p-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    {d.dag}
                    <div className="mt-0.5 font-display text-[13px] font-semibold normal-case tracking-normal text-foreground">
                      {d.dato}
                    </div>
                  </div>
                ))}
              </div>
              {TIME_SLOTS.map((tid, ti) => (
                <div
                  key={tid}
                  className="grid grid-cols-[80px_repeat(7,_1fr)] border-b border-border last:border-b-0"
                >
                  <div className="border-r border-border p-2 text-center font-mono text-[11px] font-semibold text-foreground tabular-nums">
                    {tid}
                  </div>
                  {uke.map((_, di) => {
                    const ledig = (ti + di) % 4 !== 0;
                    const valgt = ti === 3 && di === 1;
                    return (
                      <button
                        key={`${tid}-${di}`}
                        disabled={!ledig}
                        className={`m-0.5 rounded-md p-2 transition-colors ${
                          valgt
                            ? "bg-primary"
                            : ledig
                              ? "bg-[rgba(209,248,67,0.18)] hover:bg-[rgba(209,248,67,0.35)]"
                              : "bg-secondary/30"
                        }`}
                      >
                        <span
                          className={`block text-center font-mono text-[9.5px] font-bold ${
                            valgt
                              ? "text-primary-foreground"
                              : ledig
                                ? "text-primary"
                                : "text-muted-foreground/30"
                          }`}
                        >
                          {valgt ? "✓" : ledig ? "Book" : "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HØYRE: Tournament + CTA */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-foreground" strokeWidth={1.75} />
              <h3 className="font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
                Book på dette anlegget
              </h3>
            </div>
            <p className="mb-3 font-sans text-[12.5px] leading-[1.5] text-muted-foreground">
              Velg coach, type økt og tid. Du kan også booke drop-in på range
              eller TrackMan-bay.
            </p>
            <Link
              href="/portal/booking/coach/anders"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-sans text-[14px] font-semibold text-primary-foreground hover:opacity-90"
            >
              Book coach
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 font-sans text-[12.5px] font-medium text-foreground hover:border-foreground/30">
              Drop-in TrackMan-bay
            </button>
          </div>

          {anlegg.turneringer.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Trophy
                  className="h-4 w-4 text-foreground"
                  strokeWidth={1.75}
                />
                <h3 className="font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
                  Turneringer her
                </h3>
              </div>
              <ul className="space-y-2.5">
                {anlegg.turneringer.map((t) => (
                  <li
                    key={`${t.navn}-${t.aar}`}
                    className="flex items-start justify-between gap-3 border-b border-border pb-2.5 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="font-display text-[13px] font-semibold -tracking-[0.005em] text-foreground">
                        {t.navn}
                      </div>
                      <div className="font-mono text-[10.5px] text-muted-foreground">
                        {t.aar} · {t.plassering}
                      </div>
                    </div>
                    <ArrowRight
                      className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground"
                      strokeWidth={2}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-foreground" strokeWidth={1.75} />
              <h3 className="font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
                Coacher her
              </h3>
            </div>
            <ul className="space-y-2">
              {["Anders Kristiansen", "Markus R. Pedersen", "Junior-teamet"].map(
                (n) => (
                  <li key={n} className="flex items-center justify-between">
                    <span className="font-sans text-[13px] text-foreground">
                      {n}
                    </span>
                    <Link
                      href={`/portal/booking/coach/${n.split(" ")[0].toLowerCase()}`}
                      className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-primary hover:underline"
                    >
                      Book →
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Spec({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        <span className="text-muted-foreground/70">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 font-display text-[24px] font-semibold -tracking-[0.01em] text-foreground tabular-nums">
        {value}
      </div>
    </div>
  );
}
