import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Users, Phone, Mail, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ──────────────────────────────────────────────────
// Per-anlegg statisk innhold
// ──────────────────────────────────────────────────

type AnleggData = {
  heroImage: string;
  heroAlt: string;
  beskrivelse: string;
  apningstider: { dag: string; tid: string }[];
  kontakt?: { telefon?: string; epost?: string };
  fasilitetBeskrivelser: Record<string, string>;
};

const ANLEGG_DATA: Record<string, AnleggData> = {
  "gamle-fredrikstad-gk": {
    heroImage: "/images/anlegg/gfgk-hero2.jpg",
    heroAlt: "Utsikt over Gamle Fredrikstad Golfklubb — flaggåpning på banen",
    beskrivelse:
      "Gamle Fredrikstad GK (GFGK Bossum) ligger vakkert til ved Torsnes utenfor Fredrikstad. Banen byr på en 18-hulls mesterskaps­bane samt en 9-hulls shortcourse — og er AK Golf Academys utendørs­hjemmebane i sommersesongen.",
    apningstider: [
      { dag: "Mandag–fredag", tid: "07:00–21:00" },
      { dag: "Lørdag", tid: "07:00–19:00" },
      { dag: "Søndag", tid: "08:00–19:00" },
    ],
    kontakt: {
      telefon: "+47 406 97 598",
      epost: "njo@gfgk.no",
    },
    fasilitetBeskrivelser: {
      "Performance Studio":
        "Innendørs coaching-studio med Trackman og video-analyse. Brukes til analyse­økter og teknisk arbeid uavhengig av vær.",
      "Driving Range 1. etg":
        "Overdekket drivingrange i 1. etasje med matutslagsplasser og direkte sikt til målene på banen.",
      "Driving Range 2. etg":
        "Overdekket drivingrange i 2. etasje — samme matutslagsplasser som 1. etg, men med høyere utsiktspunkt.",
      "Nærspillsområde":
        "Dedikert areal for chip, pitch og bunkerspill inntil 50 meter fra flagget. Brukes aktivt i AK Golf-programmer.",
      Puttinggreen:
        "Full­størrelses puttinggreen med varierende kurvatur. Perfekt for putting-rutiner og distanse­kontroll.",
      "9-hullsbane":
        "Shortcourse med 9 hull — kortere distanser, men full opplevelse. Ideell for spill­trening og beslutnings­treningøkter.",
    },
  },

  "miklagard-golfklubb": {
    heroImage: "/images/anlegg/miklagard-hero.jpg",
    heroAlt: "Luftfoto over Miklagard Golf — 18-hullsbanen fra drone",
    beskrivelse:
      "Miklagard Golf ligger 25 minutter nord for Oslo i Ullensaker, og er en av Norges fremste mesterskaps­baner. Designet av Robert Trent Jones Jr. byr banen på utfordrende rough, moderne layout og Trackman-utstyrt driving range. AK Golf Academy er representert her gjennom trener Anders Kristiansen.",
    apningstider: [
      { dag: "Mandag–fredag", tid: "07:00–21:00" },
      { dag: "Lørdag", tid: "07:00–19:00" },
      { dag: "Søndag", tid: "08:00–18:00" },
    ],
    kontakt: {
      telefon: "+47 63 94 31 00",
      epost: "elias@miklagardgolf.no",
    },
    fasilitetBeskrivelser: {
      "18-hullsbane":
        "Mesterskaps­bane designet av Robert Trent Jones Jr. med 18 hull og par 72. Seks hull ble renovert 2018–2020. Halvveis­stopp tilgjengelig fra tre punkter på banen.",
      "Trackman Driving Range":
        "Trackman Range med gressutslagsplasser, 5 kunstgress­greener og 7 overdekkede plasser. Brukes til all teknisk coaching og data­innsamling.",
      Puttinggreen:
        "To separate puttinggreener med ulike fall og teksturer — dedikert til putting­trening og distanse­kalibrering.",
      "Nærspillsområde":
        "Komplett nærspillsareal med chip-sone, pitching-areal, bunkere og kortholdsgreener. Blant de beste nærspillsanleggene i Norge.",
      "Clubhouse & Restaurant":
        "Særpreget klubbhus med golfshop, administrasjon, møterom og restaurant. Totalt arrangement­kapasitet ca. 130 personer.",
    },
  },
};

const STANDARD_APNINGSTIDER = [
  { dag: "Mandag–fredag", tid: "07:00–22:00" },
  { dag: "Lørdag", tid: "08:00–20:00" },
  { dag: "Søndag", tid: "09:00–20:00" },
];

// ──────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locations = await prisma.location.findMany({ where: { active: true } });
  const loc = locations.find((l) => slugify(l.name) === slug);
  if (!loc) return { title: "Anlegg ikke funnet" };
  return {
    title: `${loc.name} — AK Golf Academy`,
    description: `Tren hos AK Golf Academy på ${loc.name}, ${loc.address}.`,
  };
}

export default async function AnleggDetalj({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locations = await prisma.location.findMany({
    where: { active: true },
    include: { facilities: { where: { active: true } } },
  });
  const loc = locations.find((l) => slugify(l.name) === slug);
  if (!loc) notFound();

  const data = ANLEGG_DATA[slug];
  const heroImage = data?.heroImage ?? "/images/akademy/walking-bag.jpg";
  const heroAlt = data?.heroAlt ?? `Hero-bilde fra ${loc.name}`;
  const apningstider = data?.apningstider ?? STANDARD_APNINGSTIDER;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative">
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-secondary">
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        </div>
        <div className="relative mx-auto -mt-24 max-w-5xl px-6">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Anlegg
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              <em className="font-normal italic text-primary">{loc.name}</em>
            </h1>
            <p className="mt-4 flex items-center gap-2 text-base text-muted-foreground">
              <MapPin className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {loc.address}
            </p>
            {data?.beskrivelse && (
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                {data.beskrivelse}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Åpningstider + kontakt ── */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="flex items-center gap-3 font-display text-2xl font-semibold tracking-tight">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
              Åpningstider
            </h2>
            <ul className="mt-6 space-y-4 text-sm">
              {apningstider.map((a) => (
                <li
                  key={a.dag}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <span className="text-foreground">{a.dag}</span>
                  <span className="font-mono text-muted-foreground">
                    {a.tid}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted-foreground">
              Tider kan variere ved arrangementer og helligdager.
            </p>

            {data?.kontakt && (
              <div className="mt-6 space-y-2 border-t border-border pt-6">
                {data.kontakt.telefon && (
                  <a
                    href={`tel:${data.kontakt.telefon.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {data.kontakt.telefon}
                  </a>
                )}
                {data.kontakt.epost && (
                  <a
                    href={`mailto:${data.kontakt.epost}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {data.kontakt.epost}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-primary/10 via-accent/10 to-secondary">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin
                    className="mx-auto h-10 w-10 text-primary"
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Kart
                  </p>
                  <p className="mt-2 max-w-xs px-6 text-sm text-foreground">
                    {loc.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fasiliteter ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            <em className="font-normal italic text-primary">Fasiliteter</em>
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Hver fasilitet på {loc.name} kan bookes individuelt — fra korte
            øvelsesøkter til lengre coachingøkter.
          </p>

          {loc.facilities.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
              Ingen fasiliteter er publisert på dette anlegget ennå.
            </div>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loc.facilities.map((f) => {
                const beskrivelse =
                  data?.fasilitetBeskrivelser?.[f.name] ?? null;
                return (
                  <div
                    key={f.id}
                    className="flex flex-col rounded-2xl border border-border bg-card p-6"
                  >
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      {f.name}
                    </h3>
                    {beskrivelse && (
                      <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                        {beskrivelse}
                      </p>
                    )}
                    <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                      Kapasitet: {f.capacity}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-secondary/40 p-12 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Klar for å trene hos oss?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Book en time på {loc.name} eller ta kontakt for å høre hva som
            passer best for deg.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Book på dette anlegget
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/anlegg"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-6 py-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              Se alle anlegg
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
