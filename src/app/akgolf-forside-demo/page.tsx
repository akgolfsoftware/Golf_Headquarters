/**
 * Marketing-demo — Forside (akgolf.no)
 * Server component. Tailwind v4 + semantiske tokens.
 */
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CircleDot,
  Flag,
  GraduationCap,
  LineChart,
  Quote,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { MarketingFooter, MarketingNav } from "../_marketing-demo/chrome";

export default function AkgolfForsideDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav active="Forside" />

      {/* Hero — full bredde */}
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-foreground">
              <Sparkles className="h-3 w-3" strokeWidth={2} />
            </span>
            Ny sesong · Plasser åpne fra 1. mai
          </div>

          <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Bli en bedre golfspiller.{" "}
            <em className="font-display font-normal italic text-primary [font-family:var(--font-instrument-serif),Georgia,serif]">
              Sammen.
            </em>
          </h1>

          <p className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
            Personlig coaching, periodiserte treningsplaner og målbar fremgang —
            for spillere som vil mer enn å bare slå baller. Drevet av PGA Class
            A Pro Anders Kristiansen og AK Golf Academy.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Book gratis kartleggings-økt
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/akgolf-tjenester-demo"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Se tjenestene
            </Link>
          </div>

          {/* Stats-strip */}
          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-border pt-10 md:grid-cols-4 md:gap-8">
            <Stat number="200+" label="Aktive spillere" />
            <Stat number="8 år" label="Erfaring som PGA-pro" />
            <Stat number="4,9★" label="Snitt på 130 vurderinger" />
            <Stat number="92 %" label="Forbedret HCP i 2025" />
          </div>
        </div>
      </section>

      {/* Tjenester — 3 kolonner */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          tag="Tjenester"
          title="Tre veier til neste nivå"
          intro="Velg det formatet som passer deg — alt henger sammen via samme app, samme plan, og samme coach."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <ServiceCard
            Icon={Target}
            tag="1:1 Coaching"
            title="Personlig coaching"
            description="Skreddersydde økter med Anders eller en av AK Golf-coachene. Video-analyse, Trackman-data og en plan du kan følge mellom timene."
            price="Fra 1 500 kr / time"
            href="/akgolf-tjenester-demo"
          />
          <ServiceCard
            Icon={LineChart}
            tag="Trackman"
            title="Trackman-sesjon"
            description="Innendørs simulator-økter på Mulligan Borre. Slag-analyse, banespill og test-protokoll for spillere som vil ha tall på alt."
            price="Fra 300 kr / time"
            href="/akgolf-tjenester-demo"
            featured
          />
          <ServiceCard
            Icon={GraduationCap}
            tag="Junior"
            title="Junior-akademi"
            description="Periodisert utvikling for spillere 8–18 år. Pyramide-basert tilnærming med fysisk fundament, teknikk og turnerings-spill."
            price="Fra 2 400 kr / mnd"
            href="/akgolf-tjenester-demo"
          />
        </div>
      </section>

      {/* Social proof — testimonials */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeader
            tag="Spillerne våre"
            title={
              <>
                <em className="font-display font-normal italic text-primary [font-family:var(--font-instrument-serif),Georgia,serif]">
                  Ekte
                </em>{" "}
                fremgang, ekte ord
              </>
            }
            intro="Et utvalg fra de 130+ vurderingene fra spillere som har vært gjennom et sesongprogram."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Testimonial
              name="Markus Roinås Pedersen"
              initials="MP"
              role="Junior · WANG Toppidrett · HCP +2,4"
              quote="Strukturen er på et helt annet nivå enn jeg hadde før. Jeg vet hva jeg skal jobbe med, hvorfor — og jeg ser det på tallene."
              rating={5}
            />
            <Testimonial
              name="Henrik Solberg"
              initials="HS"
              role="Amatør · 38 år · HCP 8,2 → 4,1"
              quote="Jeg trodde jeg hadde nådd toppen. Etter ett år med plan og månedlig coaching gikk jeg fra 8 til 4 i handicap."
              rating={5}
            />
            <Testimonial
              name="Ida Kristoffersen"
              initials="IK"
              role="Junior · 14 år · NM-finalist 2025"
              quote="Anders behandler meg som en utøver, ikke et barn. Det betyr alt når man satser på golf."
              rating={5}
            />
            <Testimonial
              name="Tor-Erik Bjørnson"
              initials="TB"
              role="Senior · 62 år · HCP 18 → 12"
              quote="Jeg startet ‘bare for moro skyld’. Nå er jeg fast på Mulligan to ganger i uken og slår lengre enn da jeg var 40."
              rating={5}
            />
            <Testimonial
              name="Sofie Andersen"
              initials="SA"
              role="Bedriftsleder · Fredrikstad"
              quote="Vi har hatt to bedriftsevents på Mulligan. Profesjonelt, gøy og noe alle snakker om i ettertid."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Anlegg + partnere */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          tag="Anlegg og partnere"
          title="To anlegg, hele året"
          intro="Innendørs på Mulligan Borre med Trackman 4, og utendørs på GFGK Bossum gjennom sesong."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <FacilityCard
            tag="Innendørs · Borre"
            title="Mulligan Indoor Golf Simulators"
            description="Tre Trackman 4-simulatorer, kafé og lounge. Åpent 06–24 alle dager med medlemskort."
            cta="Se Mulligan Borre"
          />
          <FacilityCard
            tag="Utendørs · Fredrikstad"
            title="GFGK Bossum"
            description="18-hulls bane, range og kort-spillsområde. Hjemmebanen for AK Golf Academy fra mai til oktober."
            cta="Se GFGK Bossum"
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-card px-8 py-6">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Samarbeid og partnere
          </span>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-[14px] font-medium text-foreground">
            <Partner label="WANG Toppidrett Fredrikstad" />
            <Partner label="Mulligan Indoor Golf" />
            <Partner label="Skarpnord Golf Products" />
            <Partner label="GFGK Bossum" />
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
              <em className="font-normal italic [font-family:var(--font-instrument-serif),Georgia,serif]">
                neste steg
              </em>
              ?
            </h2>
            <p className="mt-6 max-w-xl text-[16px] leading-[1.6] opacity-90 md:text-[18px]">
              Vi har plass til 20 nye spillere i 2026-sesongen. Book en gratis
              30-minutters kartleggings-økt så finner vi ut om vi er rett match.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                <CalendarCheck className="h-4 w-4" strokeWidth={2} />
                Book kartleggings-økt
              </Link>
              <Link
                href="/akgolf-priser-demo"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3.5 text-[15px] font-semibold transition-colors hover:bg-white/10"
              >
                Se priser
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="font-display text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
        {number}
      </div>
      <div className="mt-2 text-[13px] text-muted-foreground">{label}</div>
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
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
        {tag}
      </div>
      <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
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
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <span className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {tag}
      </span>
      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-[15px] leading-[1.6] text-muted-foreground">
        {description}
      </p>
      <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
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

function Testimonial({
  name,
  initials,
  role,
  quote,
  rating,
}: {
  name: string;
  initials: string;
  role: string;
  quote: string;
  rating: number;
}) {
  return (
    <figure className="flex flex-col rounded-2xl border border-border bg-background p-8">
      <Quote
        className="h-5 w-5 text-primary"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <blockquote className="mt-4 flex-1 text-[16px] leading-[1.6] text-foreground">
        “{quote}”
      </blockquote>
      <div className="mt-6 flex items-center gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-accent text-accent"
            strokeWidth={0}
          />
        ))}
      </div>
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
          <span className="font-display text-[14px] font-semibold">
            {initials}
          </span>
        </span>
        <span>
          <span className="block text-[14px] font-semibold text-foreground">
            {name}
          </span>
          <span className="block text-[12px] text-muted-foreground">
            {role}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function FacilityCard({
  tag,
  title,
  description,
  cta,
}: {
  tag: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div
        aria-hidden
        className="grid h-48 place-items-center"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 60%, hsl(var(--accent)) 100%)",
        }}
      >
        <Flag
          className="h-14 w-14 text-primary-foreground/90"
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
        <p className="mt-3 text-[15px] leading-[1.6] text-muted-foreground">
          {description}
        </p>
        <span className="mt-6 inline-flex items-center gap-1 text-[14px] font-medium text-primary">
          {cta}
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
    </div>
  );
}

function Partner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      {label}
    </span>
  );
}
