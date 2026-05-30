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
  ExternalLink,
  Ticket,
  UserPlus,
  Map,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  tagline: string;
  highlights: Highlight[];
  gallery: { src: string; alt: string; label: string };
  logo: { src: string; alt: string; width: number; height: number };
  kontakt: { telefon: string; epost: string };
  ctaBlurb: string;
  websiteUrl: string;
  websiteHost: string;
  greenfeeUrl: string;
  greenfeeFrom: string;
  membershipUrl: string;
  membershipFrom: string;
  membershipBlurb: string;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const ANLEGG_DATA: Record<string, AnleggData> = {
  "miklagard-golfklubb": {
    name: "Miklagard Golf",
    adresse: "Sigurd Hagens vei 50, 2040 Kløfta",
    heroImage: "/images/anlegg/miklagard-hero.jpg",
    heroAlt: "Luftfoto over Miklagard Golf — mesterskapsbanen fra drone",
    tagline:
      "En av Nordens mest prestisjetunge mesterskapsbaner — designet for utfordring og data-drevet trening året rundt.",
    highlights: [
      {
        Icon: Trophy,
        title: "Mesterskapsdesign",
        description:
          "Internasjonal mesterskapsbane med utfordrende greener og strategisk bunker-plassering.",
      },
      {
        Icon: Crosshair,
        title: "Trackman Range",
        description:
          "2. etg. driving range med Trackman på alle utslag — data fra første ball.",
      },
      {
        Icon: Building2,
        title: "Komplett anlegg",
        description:
          "To Performance Studio, stor putting green og state-of-the-art wedge-område.",
      },
    ],
    gallery: {
      src: "/images/anlegg/miklagard-2.jpg",
      alt: "Solnedgang over bunkere og fairway på Miklagard Golf",
      label: "Solnedgang · 18. green",
    },
    logo: {
      src: "/images/logos/miklagard-logo.png",
      alt: "Miklagard Golf logo",
      width: 200,
      height: 97,
    },
    kontakt: {
      telefon: "+47 63 94 80 00",
      epost: "post@miklagardgolf.no",
    },
    ctaBlurb:
      "AK Golf Academy holder til på Miklagard. Book privat coaching med våre trenere — alt på ett av Nordens mest spektakulære anlegg.",
    websiteUrl: "https://miklagardgolf.no",
    websiteHost: "miklagardgolf.no",
    greenfeeUrl: "https://miklagardgolf.no/greenfee",
    greenfeeFrom: "1 050",
    membershipUrl: "https://miklagardgolf.no/medlemskap",
    membershipFrom: "14 900",
    membershipBlurb:
      "Fritt spill, rabatterte greenfee for venner og familie, og full tilgang til alle anlegg.",
  },

  "gamle-fredrikstad-gk": {
    name: "Gamle Fredrikstad GK",
    adresse: "Vesterelvveien 100, 1605 Fredrikstad",
    heroImage: "/images/anlegg/gfgk-hero2.jpg",
    heroAlt: "Utsikt over Gamle Fredrikstad Golfklubb — flaggstang på green",
    tagline:
      "Klassisk links-inspirert design med 18+9 hull, kort fra historisk Gamlebyen — hjemmebanen til AK Golf Academy.",
    highlights: [
      {
        Icon: Wind,
        title: "Links-design",
        description:
          "Værutsatt parkland-links med faste, raske greener og naturlige formasjoner.",
      },
      {
        Icon: Flag,
        title: "18 + 9 hull",
        description:
          "Full 18-hulls mesterskapsbane pluss 9-hulls par 3-bane for trening og rask runde.",
      },
      {
        Icon: Landmark,
        title: "Historisk beliggenhet",
        description:
          "Få minutters kjøring fra Gamlebyen i Fredrikstad — Nordens best bevarte festningsby.",
      },
    ],
    gallery: {
      src: "/images/anlegg/gfgk-2.jpg",
      alt: "Kongsten fort og golfbane — Gamle Fredrikstad GK",
      label: "Kongsten fort · Hull 14",
    },
    logo: {
      src: "/images/logos/gfgk-logo.png",
      alt: "Gamle Fredrikstad GK logo",
      width: 80,
      height: 65,
    },
    kontakt: {
      telefon: "+47 69 36 14 00",
      epost: "post@gfgk.no",
    },
    ctaBlurb:
      "AK Golf Academy holder til på Gamle Fredrikstad Golfklubb. Book privat coaching med våre trenere — i et anlegg med 100 års historie.",
    websiteUrl: "https://gfgk.no",
    websiteHost: "gfgk.no",
    greenfeeUrl: "https://gfgk.no/greenfee",
    greenfeeFrom: "650",
    membershipUrl: "https://gfgk.no/medlemskap",
    membershipFrom: "11 400",
    membershipBlurb:
      "Hovedmedlemskap inkluderer fritt spill på 18-hulls og 9-hulls bane, og rabatt på coaching.",
  },
};

// ─── Metadata ────────────────────────────────────────────────────────────────

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

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AnleggDetalj({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = ANLEGG_DATA[slug];
  if (!data) notFound();

  const clubLinks = [
    {
      Icon: ExternalLink,
      eyebrow: "Offisiell side",
      title: "Klubbens nettside",
      description: "Banekart, restaurant, åpningstider og klubb-info.",
      cta: data.websiteHost,
      href: data.websiteUrl,
    },
    {
      Icon: Ticket,
      eyebrow: "Greenfee",
      title: "Book greenfee",
      description: "Spill banen som gjest. Bestill starttid direkte hos klubben.",
      cta: `Fra ${data.greenfeeFrom} kr`,
      href: data.greenfeeUrl,
    },
    {
      Icon: UserPlus,
      eyebrow: "Medlemskap",
      title: "Bli medlem",
      description: data.membershipBlurb,
      cta: `Fra ${data.membershipFrom} kr / år`,
      href: data.membershipUrl,
    },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative">
        {/* Image */}
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-secondary">
          <Image
            src={data.heroImage}
            alt={data.heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,40,28,0.10) 0%, rgba(0,40,28,0.20) 55%, rgba(0,40,28,0.85) 100%)",
            }}
          />
          {/* Lime eyebrow label inside image */}
          <div className="absolute bottom-28 left-8 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent sm:bottom-36 sm:left-10">
            <span className="h-px w-6 bg-accent" />
            AK Golf Academy · Samarbeidsklubb
          </div>
        </div>

        {/* Overlapping card */}
        <div className="relative mx-auto -mt-24 max-w-5xl px-6">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-[0_24px_60px_rgba(10,31,23,0.18)] sm:p-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Anlegg
            </span>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.025em] sm:text-5xl">
              <em className="font-normal italic text-primary">{data.name}</em>
            </h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin
                className="h-4 w-4 flex-shrink-0 text-primary"
                aria-hidden="true"
              />
              {data.adresse}
            </p>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground sm:text-[16.5px]">
              {data.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {data.highlights.map(({ Icon, title, description }, index) => (
            <div
              key={title}
              className="flex min-h-[220px] flex-col gap-4 rounded-2xl border border-border bg-card p-8"
            >
              {/* Icon in bg-background square */}
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-background text-primary">
                <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
                  0{index + 1} / 0{data.highlights.length}
                </span>
                <h2 className="mt-1.5 font-display text-[19px] font-bold leading-[1.15] tracking-[-0.015em] sm:text-[22px]">
                  {title}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground sm:text-sm">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Galleri + Kontakt ── */}
      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-[1.1fr_0.9fr]">
          {/* Gallery */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-secondary">
            <Image
              src={data.gallery.src}
              alt={data.gallery.alt}
              fill
              sizes="(max-width: 640px) 100vw, 55vw"
              className="object-cover"
            />
            {/* Label overlay */}
            <div className="absolute bottom-4 left-4 rounded-lg px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm" style={{ background: "rgba(0,40,28,0.55)" }}>
              {data.gallery.label}
            </div>
          </div>

          {/* Contact card */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Kontakt
              </span>
              <h2 className="mt-2 font-display text-[26px] font-semibold italic leading-[1.05] tracking-[-0.02em] text-primary sm:text-[32px]">
                Snakk med klubben
              </h2>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-border pt-4">
              {/* Phone */}
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                  <Phone className="h-[14px] w-[14px]" aria-hidden="true" />
                </span>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground/60">
                    Telefon
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-foreground">
                    {data.kontakt.telefon}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                  <Mail className="h-[14px] w-[14px]" aria-hidden="true" />
                </span>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground/60">
                    E-post
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-foreground">
                    {data.kontakt.epost}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                  <Map className="h-[14px] w-[14px]" aria-hidden="true" />
                </span>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground/60">
                    Adresse
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-foreground">
                    {data.adresse}
                  </div>
                </div>
              </div>
            </div>

            <a
              href={`tel:${data.kontakt.telefon.replace(/\s/g, "")}`}
              className="mt-1 inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ring klubben
              <ArrowRight className="h-[14px] w-[14px]" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Tre veier inn ── */}
      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              For gjester og medlemmer
            </span>
            <h2 className="font-display text-[24px] font-semibold italic leading-[1.05] tracking-[-0.02em] text-primary sm:text-[30px]">
              Tre veier inn
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {clubLinks.map(({ Icon, eyebrow, title, description, cta, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 no-underline transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-background text-primary">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
                    {eyebrow}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-[20px] font-bold leading-[1.15] tracking-[-0.015em] sm:text-[22px]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground sm:text-sm">
                    {description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                  <span className="font-mono text-[12px] font-bold tracking-[0.02em] text-foreground">
                    {cta}
                  </span>
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <ArrowRight className="h-[14px] w-[14px]" aria-hidden="true" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA-banner ── */}
      <section className="px-6 pb-24">
        <div
          className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-primary px-8 py-14 text-center sm:px-14 sm:py-16"
        >
          {/* Radial lime glow */}
          <div
            className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(209,248,67,0.14) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col items-center gap-6 sm:gap-6">
            {/* Club logo */}
            <Image
              src={data.logo.src}
              alt={data.logo.alt}
              width={data.logo.width}
              height={data.logo.height}
              className="opacity-85"
            />

            <div className="max-w-[640px]">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent/70">
                AK Golf Academy
              </span>
              <h2 className="mt-2.5 font-display text-[32px] font-semibold leading-[1.05] tracking-[-0.025em] text-white sm:text-[44px]">
                Vi trener her.{" "}
                <em className="font-normal italic text-accent">Bli med.</em>
              </h2>
              <p className="mx-auto mt-4 max-w-[540px] text-[14.5px] leading-[1.55] text-white/75 sm:text-base">
                {data.ctaBlurb}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2.5 rounded-md bg-accent px-8 py-4 text-sm font-bold text-accent-foreground shadow-[0_8px_24px_rgba(209,248,67,0.35)] hover:opacity-90 sm:text-base"
              >
                Se tilgjengelige tider
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/anlegg"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 hover:text-white"
              >
                Se alle anlegg
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
