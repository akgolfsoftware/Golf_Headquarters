/**
 * Marketing-demo — Tjenestekatalog
 * Server component. Tailwind v4 + semantiske tokens.
 */
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Check,
  ChevronDown,
  CircleDot,
  GraduationCap,
  LineChart,
  Minus,
  Target,
  Users2,
} from "lucide-react";
import { MarketingFooter, MarketingNav } from "../_marketing-demo/chrome";

export default function AkgolfTjenesterDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav active="Tjenester" />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Tjenester
          </span>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Fem måter å bli{" "}
            <em className="font-normal italic text-primary [font-family:var(--font-instrument-serif),Georgia,serif]">
              bedre på.
            </em>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
            Alle tjenestene bygger på samme metodikk og samme plattform. Velg det
            formatet som passer deg nå — du kan alltid bytte når sesongen
            endrer seg.
          </p>
        </div>
      </section>

      {/* 5 tjeneste-kort */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            Icon={Target}
            tag="1:1 Coaching"
            title="Personlig coaching"
            description="Privat-økter med en av AK Golf-coachene. Video-analyse, slag-data og en konkret hjemmeoppgave til neste gang."
            bullets={[
              "60 minutter, 1-til-1",
              "Trackman 4 hvis ønsket",
              "Skriftlig oppsummering",
            ]}
            price="1 500 kr"
            unit="/ time"
          />
          <ServiceCard
            Icon={LineChart}
            tag="Trackman"
            title="Trackman-sesjon"
            description="Selvbetjent simulator-tid på Mulligan Borre. Bruk til trening, banespill, eller måling — alene eller med venner."
            bullets={[
              "Trackman 4 + lounge",
              "1–4 spillere per simulator",
              "Booking 06–24",
            ]}
            price="300 kr"
            unit="/ time"
            featured
          />
          <ServiceCard
            Icon={GraduationCap}
            tag="Junior 8–18 år"
            title="Junior-akademi"
            description="Periodisert utvikling i grupper, med pyramide-modellen som ramme. Faste tider gjennom hele sesongen."
            bullets={[
              "1–2 økter per uke",
              "Foreldre-rapport månedlig",
              "Test-protokoll 2 ganger / år",
            ]}
            price="2 400 kr"
            unit="/ mnd"
          />
          <ServiceCard
            Icon={Users2}
            tag="Voksen"
            title="Gruppetrening"
            description="Små grupper på 4–6 spillere med samme nivå. Perfekt for sosial trening med struktur — uten privat-pris."
            bullets={[
              "60 minutter, 4–6 spillere",
              "Faste makker hele sesongen",
              "Lavere terskel enn privat",
            ]}
            price="450 kr"
            unit="/ time"
          />
          <ServiceCard
            Icon={Briefcase}
            tag="Bedrift"
            title="Bedriftsevent"
            description="Skreddersydd opplegg for bedrifter — fra after-work til kunde-events og kick-offs. Vi tar oss av alt."
            bullets={[
              "10–40 deltakere",
              "Mat og drikke kan bestilles",
              "Pakker fra 4 til 8 timer",
            ]}
            price="Fra 12 000 kr"
            unit="/ event"
          />
          <BookCard />
        </div>
      </section>

      {/* Pris-strip */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-8">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Pris-snitt
            </span>
            <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
              Fra 300 kr til 2 400 kr / mnd
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px] text-muted-foreground">
            <span>✓ Ingen bindingstid</span>
            <span>✓ Avbestill 24 t i forkant</span>
            <span>✓ Faktura per måned</span>
          </div>
          <Link
            href="/akgolf-priser-demo"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Se alle priser
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Sammenligning */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
            Sammenligning
          </div>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Hva får du i hver tjeneste?
          </h2>
        </div>

        <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[760px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Funksjon
                </th>
                <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  1:1 Coaching
                </th>
                <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Trackman
                </th>
                <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Junior
                </th>
                <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Gruppe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <Row label="Personlig plan" v={[true, false, true, false]} />
              <Row label="Trackman-data" v={[true, true, "Av og til", false]} />
              <Row label="Video-analyse" v={[true, false, true, true]} />
              <Row label="Fysisk test" v={[true, false, true, false]} />
              <Row label="Foreldre-rapport" v={[false, false, true, false]} />
              <Row label="Sosial setting" v={[false, true, true, true]} />
              <Row
                label="Tilgang via app"
                v={["PRO inkludert", "Krever PRO", "Inkludert", "FREE"]}
              />
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
            Vanlige spørsmål
          </div>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Det folk lurer på først
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <FaqItem
            q="Trenger jeg eget utstyr for å komme i gang?"
            a="Nei. Vi har leie-sett av køller og baller på alle anlegg. For 1:1 anbefaler vi å bringe egne køller etter første time."
          />
          <FaqItem
            q="Hvor lang bindingstid har dere?"
            a="Ingen. Du kan avslutte når som helst. Forskuddsbetalte måneder refunderes dersom du ikke har brukt dem."
          />
          <FaqItem
            q="Kan jeg booke time uten å være medlem?"
            a="Ja. Du kan booke enkelt-økter uten medlemskap. PRO-medlemskap (300 kr / mnd) gir 30 % rabatt og forhåndsbooking."
          />
          <FaqItem
            q="Hvor møtes vi for økten?"
            a="Innendørs hele året: Mulligan Borre. Utendørs mai–oktober: GFGK Bossum. Du velger selv ved booking."
          />
          <FaqItem
            q="Hvilke trenere får jeg?"
            a="Anders for elite og voksne ambisjons-spillere. Sara for junior under 16. Tom for fysisk del. Du kan ønske spesifikk coach."
          />
          <FaqItem
            q="Får jeg refusjon ved sykdom?"
            a="Ja. Avbestilling senest 24 timer i forkant er gratis. Akutt sykdom samme dag dokumentert med legeerklæring refunderes også."
          />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-8 md:flex-row md:items-center">
          <p className="text-[15px] text-muted-foreground">
            Fant du ikke svaret du leter etter?
          </p>
          <Link
            href="/akgolf-kontakt-demo"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Spør en coach
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function ServiceCard({
  Icon,
  tag,
  title,
  description,
  bullets,
  price,
  unit,
  featured = false,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  price: string;
  unit: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-2xl border bg-card p-8 ${
        featured ? "border-primary shadow-sm" : "border-border"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 inline-flex items-center rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
          Mest fleksibel
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
      <p className="mt-3 text-[15px] leading-[1.6] text-muted-foreground">
        {description}
      </p>

      <ul className="mt-6 space-y-2">
        {bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 text-[14px] text-foreground"
          >
            <Check
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
              strokeWidth={2}
            />
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-end justify-between border-t border-border pt-5">
        <div>
          <span className="font-display text-3xl font-semibold tabular-nums tracking-tight">
            {price}
          </span>
          <span className="ml-1 text-[13px] text-muted-foreground">{unit}</span>
        </div>
        <Link
          href="#"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:gap-2"
        >
          Book nå
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    </article>
  );
}

function BookCard() {
  return (
    <article className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full"
        style={{ background: "rgba(209,248,67,0.18)" }}
      />
      <div className="relative">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] opacity-80">
          Usikker?
        </span>
        <h3 className="mt-3 font-display text-3xl font-semibold leading-[1.15] tracking-tight">
          Book{" "}
          <em className="font-normal italic [font-family:var(--font-instrument-serif),Georgia,serif]">
            gratis
          </em>{" "}
          kartlegging
        </h3>
        <p className="mt-4 text-[15px] leading-[1.6] opacity-90">
          30 minutter med en coach for å finne riktig tjeneste for deg. Ingen
          binding, ingen salg.
        </p>
      </div>
      <Link
        href="#"
        className="relative mt-6 inline-flex items-center gap-2 self-start rounded-full bg-accent px-5 py-2.5 text-[14px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        Book 30 min
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </article>
  );
}

function Row({ label, v }: { label: string; v: (string | boolean)[] }) {
  return (
    <tr>
      <td className="px-6 py-4 font-medium text-foreground">{label}</td>
      {v.map((cell, i) => (
        <td key={i} className="px-6 py-4 text-muted-foreground">
          {cell === true ? (
            <Check className="h-4 w-4 text-primary" strokeWidth={2} />
          ) : cell === false ? (
            <Minus className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          ) : (
            <span className="text-[13px]">{cell}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          {q}
        </span>
        <ChevronDown
          className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          strokeWidth={1.5}
        />
      </summary>
      <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
        {a}
      </p>
    </details>
  );
}
