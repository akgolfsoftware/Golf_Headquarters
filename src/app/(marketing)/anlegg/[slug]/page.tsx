import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Trophy,
  Crosshair,
  Building2,
  Wind,
  Flag,
  Landmark,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";

type Highlight = {
  Icon: LucideIcon;
  title: string;
  description: string;
};

type AnleggData = {
  name: string;
  adresse: string;
  heroImage: string;
  heroAlt: string;
  beskrivelse: string;
  highlights: Highlight[];
  gallery: { src: string; alt: string };
  kontakt?: { telefon?: string; epost?: string };
};

const ANLEGG_DATA: Record<string, AnleggData> = {
  "miklagard-golfklubb": {
    name: "Miklagard Golf",
    adresse: "Væringvegen 24, 2040 Kløfta",
    heroImage: "/images/anlegg/miklagard-hero.jpg",
    heroAlt: "Luftfoto over Miklagard Golf — 18-hullsbanen fra drone",
    beskrivelse:
      "25 minutter nord for Oslo — mesterskaps­bane designet av Robert Trent Jones Jr. med 18 hull, Trackman Range og fullservice-anlegg.",
    highlights: [
      {
        Icon: Trophy,
        title: "Mesterskapsdesign",
        description:
          "18-hullsbane av Robert Trent Jones Jr. med par 72 og utfordrende rough.",
      },
      {
        Icon: Crosshair,
        title: "Trackman Range",
        description:
          "Treningsteknologi på toppnivå — gressutslagsplasser og data på alle slag.",
      },
      {
        Icon: Building2,
        title: "Komplett anlegg",
        description:
          "Restaurant, golfshop, nærspillsareal og to puttinggreener.",
      },
    ],
    gallery: {
      src: "/images/anlegg/miklagard-hero2.jpg",
      alt: "Utsikt fra fairway på Miklagard Golf",
    },
    kontakt: {
      telefon: "+47 63 94 31 00",
      epost: "elias@miklagardgolf.no",
    },
  },

  "gamle-fredrikstad-gk": {
    name: "Gamle Fredrikstad GK",
    adresse: "Torsnesveien 16, 1630 Gamle Fredrikstad",
    heroImage: "/images/anlegg/gfgk-hero2.jpg",
    heroAlt: "Utsikt over Gamle Fredrikstad Golfklubb — flaggåpning på banen",
    beskrivelse:
      "Links-bane med skotsk inspirasjon, vakkert plassert ved Gamlebyen og Kongsten fort utenfor Fredrikstad.",
    highlights: [
      {
        Icon: Wind,
        title: "Links-design",
        description:
          "Inspirert av Kingsbarns i Skottland, designet av Paal Midtvaage (2012).",
      },
      {
        Icon: Flag,
        title: "18 + 9 hull",
        description:
          "Mesterskaps­bane og komplett shortcourse — ideell for spill- og beslutningstrening.",
      },
      {
        Icon: Landmark,
        title: "Historisk beliggenhet",
        description:
          "Spill golf med Kongsten fort og Gamlebyen som kulisse.",
      },
    ],
    gallery: {
      src: "/images/anlegg/gfgk-hero.jpg",
      alt: "Banebilder fra Gamle Fredrikstad GK",
    },
    kontakt: {
      telefon: "+47 406 97 598",
      epost: "njo@gfgk.no",
    },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = ANLEGG_DATA[slug];
  if (!data) return { title: "Anlegg ikke funnet" };
  return {
    title: `${data.name} — AK Golf Academy`,
    description: `Tren hos AK Golf Academy på ${data.name}, ${data.adresse}.`,
  };
}

export default async function AnleggDetalj({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = ANLEGG_DATA[slug];
  if (!data) notFound();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative">
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-secondary">
          <Image
            src={data.heroImage}
            alt={data.heroAlt}
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
              Anlegg · Samarbeidsklubb
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              <em className="font-normal italic text-primary">{data.name}</em>
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {data.adresse}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {data.beskrivelse}
            </p>
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {data.highlights.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 font-display text-lg font-semibold tracking-tight">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Galleri + Kontakt ── */}
      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
            <Image
              src={data.gallery.src}
              alt={data.gallery.alt}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Kontakt
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
              Spørsmål om banen?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ta kontakt med {data.name} direkte for spørsmål om
              medlemskap, greenavgift og arrangementer.
            </p>

            {data.kontakt && (
              <div className="mt-6 space-y-3">
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

            <Link
              href="/booking"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Book coaching her
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA-banner ── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl rounded-2xl bg-primary px-12 py-16 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            AK Golf Academy
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-primary-foreground">
            Vi trener her.{" "}
            <em className="font-normal italic text-accent">Bli med.</em>
          </h2>
          <p className="mt-4 text-sm text-primary-foreground/70">
            AK Golf Academy holder til på {data.name} — book en
            coachingøkt direkte i bookingsystemet.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Se tilgjengelige tider
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/anlegg"
              className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
            >
              Se alle anlegg
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
