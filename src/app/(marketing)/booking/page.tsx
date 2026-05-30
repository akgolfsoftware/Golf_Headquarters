import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, User, CalendarDays, CreditCard, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const metadata: Metadata = {
  title: "Book økt — AK Golf",
  description: "Book Pro-time, Trackman-analyse eller gruppe-økt online.",
};

type SearchParams = Promise<{ lokasjon?: string; trener?: string }>;

// Lokasjon-mapping. Trackman-tjenester foregår på Mulligan, alt annet på GFGK.
// Når ServiceType får locationId-FK (V1.5+), leses dette fra DB.
function getLocationForService(slug: string): string {
  if (slug.includes("trackman") || slug.includes("mulligan")) return "mulligan";
  return "gfgk";
}

// Coach-display-info per User-ID. Brukes for tittel/beskrivelse i UI.
// Navn hentes fra DB via ServiceType.coach.
const COACH_BIOS: Record<string, { tittel: string }> = {
  "anders@akgolf.no": {
    tittel: "Head Coach · 15+ år erfaring · WANG Toppidrett",
  },
  "markus@akgolf.no": {
    tittel: "Assistent-coach · spillerutvikling",
  },
};

const LOCATIONS: Record<string, { id: string; navn: string; sted: string }> = {
  gfgk: {
    id: "gfgk",
    navn: "Gamle Fredrikstad Golfklubb",
    sted: "Torsnesveien 16, 1630 Gamle Fredrikstad",
  },
  mulligan: {
    id: "mulligan",
    navn: "Mulligan Indoor Golf Fredrikstad",
    sted: "Produksjonsveien 21, 1618 Fredrikstad",
  },
};

function formaterPris(ore: number): string {
  if (ore === 0) return "Gratis";
  return `${ore / 100} kr`;
}

// Feature-flag: skru av offentlig booking inntil Google Calendar 2-way sync
// er på plass. Forhindrer dobbel-booking mot Anders sin private kalender.
// Sett BOOKING_ACTIVE=true i Vercel når sync er live.
const BOOKING_ACTIVE = process.env.BOOKING_ACTIVE === "true";

export default async function BookingLanding({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { lokasjon, trener } = await searchParams;

  if (!BOOKING_ACTIVE) {
    return <BookingPaused />;
  }

  const services = await prisma.serviceType.findMany({
    where: { active: true, priceOre: { gt: 0 } },
    orderBy: { priceOre: "asc" },
    include: {
      coach: { select: { id: true, name: true, email: true } },
    },
  });

  // Hvilke lokasjoner finnes representert?
  const aktiveLokasjoner = Array.from(
    new Set(services.map((s) => getLocationForService(s.slug))),
  );
  const lokasjonValg = aktiveLokasjoner
    .map((id) => LOCATIONS[id])
    .filter(Boolean);

  // Hvilke trenere har minst én aktiv tjeneste? (deduplisert)
  const treneresMap = new Map<
    string,
    { id: string; navn: string; tittel: string }
  >();
  for (const s of services) {
    if (s.coach && !treneresMap.has(s.coach.id)) {
      treneresMap.set(s.coach.id, {
        id: s.coach.id,
        navn: s.coach.name,
        tittel: COACH_BIOS[s.coach.email]?.tittel ?? "Coach",
      });
    }
  }
  const trenere = Array.from(treneresMap.values()).sort((a, b) =>
    a.navn.localeCompare(b.navn),
  );

  return (
    <div className="px-4 sm:px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <AthleticEyebrow tone="lime">Booking</AthleticEyebrow>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
            <em className="font-normal italic text-primary">Book</em> en økt
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
            trener={
              trener === "alle"
                ? "Gruppe"
                : trener
                  ? (trenere.find((t) => t.id === trener)?.navn ?? null)
                  : null
            }
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
                    <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
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
            <div className="flex items-baseline justify-between gap-4">
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
              {trenere.map((c) => {
                // Sjekk at coachen har tjenester på valgt lokasjon
                const harTjenester = services.some(
                  (s) =>
                    s.coach?.id === c.id &&
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
                      <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
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
                s.coach === null &&
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
                    <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
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
            <div className="flex items-baseline justify-between gap-4">
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
                  if (trener === "alle") return s.coach === null;
                  return s.coach?.id === trener;
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
              href="mailto:post@akgolf.no"
              className="mt-2 inline-block text-primary underline"
            >
              Ta kontakt
            </a>
          </div>
        )}

        {/* Slik fungerer det */}
        <SlikFungererDet />
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
    <ol className="flex flex-wrap items-center gap-4 text-sm">
      {steg.map((s, i) => {
        const aktiv = s.nr === stegNo;
        const ferdig = s.nr < stegNo;
        return (
          <li key={s.nr} className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.10em] ${
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

function BookingPaused() {
  return (
    <div className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <AthleticEyebrow tone="lime">Booking</AthleticEyebrow>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
            Booking er midlertidig{" "}
            <em className="font-normal italic text-primary">pauset</em>
          </h1>
          <p className="mt-6 text-base text-muted-foreground">
            Vi gjør klar Google Calendar-integrasjon slik at du aldri risikerer
            å booke en time som ikke er ledig. Bookingen åpner igjen om kort
            tid.
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            Vil du booke en time akkurat nå? Send oss en e-post:
          </p>
          <a
            href="mailto:post@akgolf.no?subject=Booking-foresp%C3%B8rsel"
            className="font-display mt-6 inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-accent px-6 text-sm font-bold tracking-[-0.005em] text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Skriv til post@akgolf.no
          </a>
        </div>
        <SlikFungererDet />
      </div>
    </div>
  );
}

function SlikFungererDet() {
  const steg = [
    {
      nr: 1,
      ikon: CalendarDays,
      tittel: "Velg tid",
      beskrivelse:
        "Finn ledig tid hos din coach. Se tilgjengelighet i sanntid — ingen venteliste.",
    },
    {
      nr: 2,
      ikon: CreditCard,
      tittel: "Betal trygt",
      beskrivelse:
        "Betal via Stripe med kort. For Academy-kunder trekkes én coaching-credit automatisk.",
    },
    {
      nr: 3,
      ikon: UserCheck,
      tittel: "Møt din coach",
      beskrivelse:
        "Få en bekreftelse på e-post med alle detaljer. Avbestilling gratis frem til 24 timer før.",
    },
  ];

  return (
    <section className="mt-16 border-t border-border pt-16">
      <div className="text-center">
        <AthleticEyebrow tone="lime">Enkelt og trygt</AthleticEyebrow>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Slik fungerer det
        </h2>
      </div>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {steg.map((s) => {
          const Ikon = s.ikon;
          return (
            <div key={s.nr} className="flex flex-col items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Ikon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <AthleticEyebrow>Steg {s.nr}</AthleticEyebrow>
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
                  {s.tittel}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.beskrivelse}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
