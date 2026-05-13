import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, User } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Book økt — AK Golf",
  description: "Book Pro-time, Trackman-analyse eller gruppe-økt online.",
};

type SearchParams = Promise<{ lokasjon?: string; trener?: string }>;

// Coach-mapping basert på slug-prefiks. Når ServiceType får coachUserId-FK
// (planlagt M5+), hentes dette fra DB i stedet.
const COACH_PER_PREFIX: Record<string, string> = {
  "anders-": "anders",
  "markus-": "markus",
};

// Tjenester uten coach-prefiks tilbys av begge / alle.
function getCoachForService(slug: string): string | null {
  for (const [prefix, coach] of Object.entries(COACH_PER_PREFIX)) {
    if (slug.startsWith(prefix)) return coach;
  }
  return null; // Gruppe-økter etc.
}

// Lokasjon-mapping. Trackman-tjenester foregår på Mulligan, alt annet på GFGK.
function getLocationForService(slug: string): string {
  if (slug.includes("trackman") || slug.includes("mulligan")) return "mulligan";
  return "gfgk";
}

const COACHES: Record<string, { id: string; navn: string; tittel: string }> = {
  anders: {
    id: "anders",
    navn: "Anders Kristiansen",
    tittel: "Head Coach · 15+ år erfaring · WANG Toppidrett",
  },
  markus: {
    id: "markus",
    navn: "Markus R. Pedersen",
    tittel: "Assistent-coach · spillerutvikling",
  },
};

const LOCATIONS: Record<string, { id: string; navn: string; sted: string }> = {
  gfgk: {
    id: "gfgk",
    navn: "Gamle Fredrikstad Golfklubb",
    sted: "Bossumveien 6, 1605 Fredrikstad",
  },
  mulligan: {
    id: "mulligan",
    navn: "Mulligan Indoor Golf",
    sted: "Innendørs simulator-fasilitet",
  },
};

function formaterPris(ore: number): string {
  if (ore === 0) return "Gratis";
  return `${ore / 100} kr`;
}

export default async function BookingLanding({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { lokasjon, trener } = await searchParams;

  const services = await prisma.serviceType.findMany({
    where: { active: true, priceOre: { gt: 0 } },
    orderBy: { priceOre: "asc" },
  });

  // Hvilke lokasjoner finnes representert?
  const aktiveLokasjoner = Array.from(
    new Set(services.map((s) => getLocationForService(s.slug))),
  );
  const lokasjonValg = aktiveLokasjoner
    .map((id) => LOCATIONS[id])
    .filter(Boolean);

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Booking
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">Book</em> en økt
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Velg lokasjon, trener og tjeneste — finn ledig tid og betal trygt
            via Stripe. Avbestilling senest 24 timer før gir full refusjon.
          </p>
        </header>

        {/* Steg-indikator */}
        <div className="mt-12">
          <StegIndikator
            stegNo={lokasjon ? (trener ? 3 : 2) : 1}
            lokasjon={lokasjon ? LOCATIONS[lokasjon]?.navn : null}
            trener={trener ? COACHES[trener]?.navn : null}
          />
        </div>

        {/* Steg 1: Velg lokasjon */}
        {!lokasjon && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              1. Velg lokasjon
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {lokasjonValg.map((l) => (
                <Link
                  key={l.id}
                  href={`/booking?lokasjon=${l.id}`}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
                >
                  <span className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-tight tracking-tight group-hover:text-primary">
                      {l.navn}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {l.sted}
                    </p>
                    <span className="mt-3 inline-block text-sm font-medium text-primary group-hover:underline">
                      Velg →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Steg 2: Velg trener */}
        {lokasjon && !trener && (
          <section className="mt-10">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                2. Velg trener
              </h2>
              <Link
                href="/booking"
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                ← Endre lokasjon
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Object.values(COACHES).map((c) => {
                // Sjekk at coachen har tjenester på valgt lokasjon
                const harTjenester = services.some(
                  (s) =>
                    getCoachForService(s.slug) === c.id &&
                    getLocationForService(s.slug) === lokasjon,
                );
                if (!harTjenester) return null;
                return (
                  <Link
                    key={c.id}
                    href={`/booking?lokasjon=${lokasjon}&trener=${c.id}`}
                    className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
                  >
                    <span className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <User className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-tight tracking-tight group-hover:text-primary">
                        {c.navn}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.tittel}
                      </p>
                      <span className="mt-3 inline-block text-sm font-medium text-primary group-hover:underline">
                        Se tjenester →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Felles tjenester (gruppe, WANG) — vis hvis lokasjonen har dem */}
            {services.some(
              (s) =>
                getCoachForService(s.slug) === null &&
                getLocationForService(s.slug) === lokasjon,
            ) && (
              <div className="mt-6">
                <Link
                  href={`/booking?lokasjon=${lokasjon}&trener=alle`}
                  className="group flex items-start gap-4 rounded-2xl border border-dashed border-border bg-background p-6 transition-colors hover:border-primary/40"
                >
                  <span className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <User className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-tight tracking-tight group-hover:text-primary">
                      Gruppe-økt
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Felles økter med flere spillere — uten valg av spesifikk
                      trener.
                    </p>
                    <span className="mt-3 inline-block text-sm font-medium text-primary group-hover:underline">
                      Se gruppe-tilbud →
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Steg 3: Velg tjeneste */}
        {lokasjon && trener && (
          <section className="mt-10">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                3. Velg tjeneste
              </h2>
              <Link
                href={`/booking?lokasjon=${lokasjon}`}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                ← Endre trener
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services
                .filter((s) => {
                  if (getLocationForService(s.slug) !== lokasjon) return false;
                  const coach = getCoachForService(s.slug);
                  if (trener === "alle") return coach === null;
                  return coach === trener;
                })
                .map((s) => (
                  <Link
                    key={s.id}
                    href={`/booking/${s.slug}`}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
                  >
                    <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary">
                      {s.name}
                    </h3>
                    {s.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {s.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-end justify-between pt-6">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          Pris
                        </div>
                        <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
                          {formaterPris(s.priceOre)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          Varighet
                        </div>
                        <div className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
                          {s.durationMin} min
                        </div>
                      </div>
                    </div>
                    <span className="mt-6 inline-block text-sm font-semibold text-primary">
                      Velg tid →
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {services.length === 0 && (
          <div className="mt-12 rounded-lg border border-dashed border-border bg-muted/40 p-12 text-center text-sm text-muted-foreground">
            Ingen tjenester er tilgjengelig akkurat nå.
            <br />
            <a
              href="mailto:hei@akgolf.no"
              className="mt-2 inline-block text-primary underline"
            >
              Ta kontakt
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function StegIndikator({
  stegNo,
  lokasjon,
  trener,
}: {
  stegNo: 1 | 2 | 3;
  lokasjon: string | null;
  trener: string | null;
}) {
  const steg = [
    { nr: 1, navn: "Lokasjon", verdi: lokasjon },
    { nr: 2, navn: "Trener", verdi: trener },
    { nr: 3, navn: "Tjeneste", verdi: null },
  ];
  return (
    <ol className="flex flex-wrap items-center gap-3 text-sm">
      {steg.map((s, i) => {
        const aktiv = s.nr === stegNo;
        const ferdig = s.nr < stegNo;
        return (
          <li key={s.nr} className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.10em] ${
                aktiv
                  ? "border-primary bg-primary text-primary-foreground"
                  : ferdig
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span className="tabular-nums">{s.nr}</span>
              <span>{s.navn}</span>
              {ferdig && s.verdi && (
                <span className="hidden font-sans normal-case tracking-normal opacity-90 sm:inline">
                  · {s.verdi}
                </span>
              )}
            </div>
            {i < steg.length - 1 && (
              <span className="text-muted-foreground">→</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
