import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CircleDot,
  Flag,
  GraduationCap,
  LineChart,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const TJENESTER = [
  {
    Icon: Target,
    tag: "Performance",
    title: "2 økter per måned",
    description:
      "To 20-minutters treningsøkter med Anders hver måned. PlayerHQ inkludert. Perfekt for jevn oppfølging og gradvis fremgang.",
    price: "1 200 kr / mnd",
    href: "/coaching",
  },
  {
    Icon: LineChart,
    tag: "Performance Pro",
    title: "4 økter per måned",
    description:
      "Fire 20-minutters økter per måned. PlayerHQ inkludert. For spillere med høye mål — klubb, elite, turnering.",
    price: "2 220 kr / mnd",
    href: "/coaching",
    featured: true,
  },
  {
    Icon: GraduationCap,
    tag: "Drop-in",
    title: "Flex timer",
    description:
      "Ikke klar for abonnement? Book en enkelttime når det passer deg. Full tilgang til Trackman og analyse.",
    price: "300 kr / 20 min",
    href: "/booking",
  },
];

export default function Hjem() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(209,248,67,0.18) 0%, rgba(209,248,67,0) 60%), radial-gradient(40% 40% at 90% 30%, rgba(0,88,64,0.10) 0%, rgba(0,88,64,0) 70%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] font-medium text-muted-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-foreground">
              <Sparkles className="h-3 w-3" strokeWidth={2} />
            </span>
            Ny sesong · Plasser åpne fra 1. mai
          </div>

          <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Bli en bedre golfspiller.{" "}
            <em className="font-display font-normal italic text-primary">
              Sammen.
            </em>
          </h1>

          <p className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
            Personlig coaching, periodiserte treningsplaner og målbar fremgang —
            for spillere som vil mer enn å bare slå baller.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Book gratis kartleggings-økt
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/coaching"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-4 text-[15px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Se tjenestene
            </Link>
          </div>

          {/* Hero-bilde */}
          <div className="mt-16 overflow-hidden rounded-2xl border border-border shadow-sm">
            <Image
              src="/images/akademy/utslag-fairway.jpg"
              alt="To golfere på utslag på fairway i solskinn"
              width={1920}
              height={1280}
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="h-auto w-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* Tjenester */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          tag="Tjenester"
          title={
            <>
              Tre veier til{" "}
              <em className="font-display font-normal italic text-primary">
                neste nivå
              </em>
            </>
          }
          intro="Velg det formatet som passer deg — alt henger sammen via samme app, samme plan, og samme coach."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {TJENESTER.map((t) => (
            <ServiceCard key={t.tag} {...t} />
          ))}
        </div>
      </section>

      {/* PlayerHQ-strip */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-8 rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-12 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary-foreground">
                Inkludert
              </span>
              <span className="rounded-full bg-secondary px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Beta
              </span>
            </div>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight">
              PlayerHQ —{" "}
              <em className="font-display font-normal italic text-primary">
                spillerportalen
              </em>{" "}
              du får på kjøpet
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground">
              Treningsplaner, statistikk, runde-registrering og AI-coach i én
              app. Gratis for alle Academy-kunder. Ikke-kunder kan prøve gratis
              i beta-perioden — første betaling 1. juni 2026.
            </p>
            <Link
              href="/playerhq"
              className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:gap-4"
            >
              Se hva PlayerHQ inneholder
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/akademy/putting-data.jpg"
              alt="Putting med målepinner og data-instrumenter på grønnen"
              width={1920}
              height={1280}
              sizes="(max-width: 768px) 100vw, 600px"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Anlegg + partnere */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          tag="Anlegg og partnere"
          title={
            <>
              To anlegg,{" "}
              <em className="font-display font-normal italic text-primary">
                hele året
              </em>
            </>
          }
          intro="Innendørs på Mulligan Borre med Trackman 4, og utendørs på GFGK Bossum gjennom sesong."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <FacilityCard
            tag="Innendørs · Borre"
            title="Mulligan Indoor Golf Simulators"
            description="Tre Trackman 4-simulatorer, kafé og lounge. Åpent 06–24 alle dager med medlemskort."
            cta="Se Mulligan Borre"
            href="https://www.mulligangolf.no"
          />
          <FacilityCard
            tag="Utendørs · Fredrikstad"
            title="Gamle Fredrikstad Golfklubb"
            description="18-hulls bane, range og kort-spillsområde. Hjemmebanen for AK Golf Academy fra mai til oktober."
            cta="Les mer"
            href="https://www.gfgk.no"
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-card px-8 py-6">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Samarbeid og partnere
          </span>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-[14px] font-medium text-foreground">
            <Partner
              label="WANG Toppidrett Fredrikstad"
              logoSrc=""
            />
            <Partner
              label="Mulligan Indoor Golf"
              logoSrc=""
            />
            <Partner
              label="Gamle Fredrikstad Golfklubb"
              logoSrc=""
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-primary-foreground md:px-16 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
            style={{ background: "rgba(209,248,67,0.18)" }}
          />
          <div className="relative max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] opacity-80">
              Neste sesong
            </span>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
              Klar for{" "}
              <em className="font-display font-normal italic">
                neste steg
              </em>
              ?
            </h2>
            <p className="mt-6 max-w-xl text-[16px] leading-[1.6] opacity-90 md:text-[18px]">
              Vi har plass til 20 nye spillere i 2026-sesongen. Book en gratis
              30-minutters kartleggings-økt så finner vi ut om vi er rett match.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-4 text-[15px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                <CalendarCheck className="h-4 w-4" strokeWidth={2} />
                Book kartleggings-økt
              </Link>
              <Link
                href="/coaching"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-4 text-[15px] font-semibold transition-colors hover:bg-white/10"
              >
                Se priser
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  tag,
  title,
  intro,
}: {
  tag: string;
  title: React.ReactNode;
  intro?: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
        {tag}
      </div>
      <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
        {title}
      </h2>
      {intro && (
        <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground md:text-[18px]">
          {intro}
        </p>
      )}
    </div>
  );
}

function ServiceCard({
  Icon,
  tag,
  title,
  description,
  price,
  href,
  featured = false,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tag: string;
  title: string;
  description: string;
  price: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col rounded-2xl border p-8 transition-all hover:-translate-y-0.5 ${
        featured
          ? "border-primary bg-card shadow-sm"
          : "border-border bg-card hover:border-foreground/20"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
          Mest populær
        </span>
      )}
      <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-foreground">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <span className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {tag}
      </span>
      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-4 flex-1 text-[15px] leading-[1.6] text-muted-foreground">
        {description}
      </p>
      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <span className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
          {price}
        </span>
        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-primary group-hover:gap-2">
          Les mer
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
    </Link>
  );
}

function FacilityCard({
  tag,
  title,
  description,
  cta,
  href = "/anlegg",
}: {
  tag: string;
  title: string;
  description: string;
  cta: string;
  href?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div
        aria-hidden
        className="grid h-48 place-items-center bg-primary"
      >
        <Flag
          className="h-16 w-16 text-primary-foreground/90"
          strokeWidth={1.25}
        />
      </div>
      <div className="p-8">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {tag}
        </span>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mt-4 text-[15px] leading-[1.6] text-muted-foreground">
          {description}
        </p>
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-1 text-[14px] font-medium text-primary"
          {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
        >
          {cta}
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}

function Partner({ label, logoSrc }: { label: string; logoSrc?: string }) {
  if (logoSrc) {
    return (
      <Image
        src={logoSrc}
        alt={label}
        width={120}
        height={32}
        className="h-8 w-auto object-contain opacity-80"
      />
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      {label}
    </span>
  );
}
