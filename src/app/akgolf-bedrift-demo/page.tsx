/**
 * Marketing demo — Bedrift-tjenester landingsside (akgolf.no/bedrift)
 * Hero, 3 pakker, referansekunder, customisation, prisestimat, kontakt-skjema.
 */
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Users,
  Trophy,
  CheckCircle2,
  Sparkles,
  Coffee,
  Utensils,
  Award,
  Send,
  Briefcase,
  Calendar,
} from "lucide-react";
import { MarketingNav, MarketingFooter } from "../_marketing-demo/chrome";

type Pakke = {
  name: string;
  duration: string;
  size: string;
  price: string;
  description: string;
  features: string[];
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  highlight?: boolean;
};

const PAKKER: Pakke[] = [
  {
    name: "Halvdag",
    duration: "3 timer",
    size: "6–16 personer",
    price: "fra 15 000 kr",
    description:
      "Trackman-konkurranse, lett servering og premieutdeling. Perfekt for kortere lagsamlinger.",
    features: [
      "TrackMan-simulatorer i 3 timer",
      "Velkomstdrikke og lett mat",
      "Coach-vert hele økten",
      "Lagkonkurranse med premie",
      "Tilpasset bedriftens logo",
    ],
    Icon: Coffee,
  },
  {
    name: "Heldag",
    duration: "6 timer",
    size: "8–24 personer",
    price: "fra 32 000 kr",
    description:
      "Trening, konkurranse, lunsj og prisutdeling. Vår mest populære pakke for lagbygging.",
    features: [
      "Morgentrening med PGA-coach",
      "TrackMan-turnering (Texas Scramble)",
      "3-retters lunsj fra lokal kokk",
      "Premiering med vandrepokal",
      "Profesjonell fotograf gjennom dagen",
      "Branded gjenstander til hver deltaker",
    ],
    Icon: Utensils,
    highlight: true,
  },
  {
    name: "Premium-event",
    duration: "Hele dagen + middag",
    size: "12–60 personer",
    price: "fra 65 000 kr",
    description:
      "Full produksjon med live-leaderboard, mediedekning og kveldsmiddag. For 20-årsdager og store kunder.",
    features: [
      "Profesjonell event-manager",
      "Live-leaderboard på storskjerm",
      "Hovedcoach + 2 assisterende coacher",
      "5-retters kveldsmiddag på Bossum",
      "Personlig velkomstvideo per deltaker",
      "Etterrapport med video-høydepunkter",
      "Reisetilrettelegging for tilreisende",
    ],
    Icon: Award,
  },
];

const REFERENCES = [
  "Sparebank 1 Østfold",
  "Stormberg",
  "Sportshuset Fredrikstad",
  "Borg Bryggerier",
  "Onninen Norge",
  "Borg Havn",
  "Glomma Industriservice",
  "Fredrikstad Energi",
];

export default function BedriftDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav active="Tjenester" />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" strokeWidth={1.5} />
                AK Golf · Bedrift
              </span>
              <h1 className="mt-6 font-display text-[48px] font-semibold leading-[1.02] tracking-tight md:text-[72px]">
                <em className="font-display font-normal italic [font-family:var(--font-instrument-serif),serif]">
                  Skap bånd
                </em>
                . Bedre. Sammen.
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-muted-foreground">
                Golfdager, lagbygging og kundeevents på Mulligan Indoor og GFGK
                Bossum. Vi tar oss av alt — fra første velkomst til siste
                premieutdeling. Du fokuserer på menneskene.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#kontakt"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Be om tilbud
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
                <Link
                  href="#pakker"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Se pakkene
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <HeroStat Icon={Building2} value="40+" label="Bedriftsevents siste 2 år" />
              <HeroStat Icon={Users} value="1 200+" label="Deltakere totalt" />
              <HeroStat Icon={Trophy} value="100 %" label="Vil booke igjen" />
              <HeroStat Icon={Calendar} value="6 uker" label="Snitt-planlegging" />
            </div>
          </div>
        </div>
      </section>

      {/* Hvorfor */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Hvorfor golf for lagbygging
              </span>
              <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] tracking-tight md:text-[44px]">
                Golf{" "}
                <em className="font-display font-normal italic [font-family:var(--font-instrument-serif),serif]">
                  avslører
                </em>{" "}
                folk på en vakker måte
              </h2>
              <p className="mt-5 text-[16px] leading-[1.65] text-muted-foreground">
                I løpet av en TrackMan-runde ser du tålmodighet, humor under
                press og hvordan folk håndterer feil. Det er de samme egenskapene
                som driver et team. Vi har designet våre events nettopp for å
                gjøre disse øyeblikkene gode — uten at det blir konkurranse-tungt.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                "Ingen forkunnskaper kreves — coacher er med hele dagen",
                "Innendørs simulator gjør oss værsikker hele året",
                "Maks 24 personer per økt sikrer høy involvering",
                "Lokal mat og drikke fra Bossum eller lokalt partnerhotell",
                "Vi tilpasser tonen — fra avslappet til formell premieutdeling",
                "Alt i én pris — ingen skjulte tillegg etterpå",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5"
                >
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    strokeWidth={1.75}
                  />
                  <span className="text-[15px] leading-[1.5]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pakker */}
      <section id="pakker" className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Tre pakker
            </span>
            <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] tracking-tight md:text-[44px]">
              Velg startpunkt — vi tilpasser resten
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground">
              Prisene er veiledende for standardpakkene. Hver bedrift har egne
              ønsker — vi skreddersyr alt fra menyen til premiene.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PAKKER.map((p) => (
              <PakkeCard key={p.name} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Referansekunder */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Referansekunder
            </span>
            <h2 className="mt-3 font-display text-[28px] font-semibold tracking-tight md:text-[32px]">
              Bedrifter vi har holdt event for
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
            {REFERENCES.map((r) => (
              <div
                key={r}
                className="grid h-20 place-items-center rounded-2xl border border-border bg-card px-4 text-center"
              >
                <span className="font-display text-[15px] font-medium text-muted-foreground">
                  {r}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customisation */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Customisation
              </span>
              <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] tracking-tight md:text-[40px]">
                Hver event er{" "}
                <em className="font-display font-normal italic [font-family:var(--font-instrument-serif),serif]">
                  helt deres
                </em>
              </h2>
              <p className="mt-5 text-[15px] leading-[1.65] text-muted-foreground">
                Vi tar over så mye eller så lite du vil. Mange bedrifter har egne
                tradisjoner — vi tilpasser oss dem. Andre vil ha en helt
                ferdiglagd opplevelse. Begge deler funker for oss.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { title: "Logo og branding", body: "På flagg, scorekort, mat-emballasje og digital leaderboard." },
                { title: "Spesialmeny", body: "Vi jobber med lokale leverandører — vegan, glutenfri, alt går." },
                { title: "Premier", body: "Fra vandrepokal til personaliserte gaver til hver deltaker." },
                { title: "Innledende tale", body: "Vi inkluderer egnet ramme for keynote, prisutdeling eller pitch." },
                { title: "Reisetilrettelegging", body: "Hotell, transport mellom Oslo/Sandefjord og Mulligan." },
                { title: "Etter-event-rapport", body: "Statistikk, høydepunkter og video-klipp leveres innen 5 dager." },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-border bg-background p-6"
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <Sparkles
                      className="h-4 w-4 text-foreground"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h4 className="mt-4 font-display text-[15px] font-semibold tracking-tight">
                    {c.title}
                  </h4>
                  <p className="mt-1 text-[13px] leading-[1.5] text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prisestimat */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-2xl border border-border bg-card p-10 md:p-16">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Prisestimat
                </span>
                <h2 className="mt-3 font-display text-[32px] font-semibold leading-[1.1] tracking-tight md:text-[40px]">
                  Hva koster det egentlig?
                </h2>
                <p className="mt-4 text-[15px] leading-[1.65] text-muted-foreground">
                  Pris per deltaker faller med gruppestørrelse. Her er reelle
                  eksempler fra siste sesong — alt inkludert.
                </p>
              </div>
              <div className="space-y-3">
                <EstimatRow
                  size="8 personer"
                  pkg="Halvdag"
                  per="2 100 kr"
                  total="16 800 kr"
                />
                <EstimatRow
                  size="16 personer"
                  pkg="Heldag"
                  per="2 250 kr"
                  total="36 000 kr"
                />
                <EstimatRow
                  size="32 personer"
                  pkg="Premium"
                  per="2 100 kr"
                  total="67 200 kr"
                />
                <EstimatRow
                  size="60 personer"
                  pkg="Premium"
                  per="1 950 kr"
                  total="117 000 kr"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kontakt-skjema */}
      <section id="kontakt" className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-2xl border border-border bg-card p-10 md:p-12">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Forespørsel
            </span>
            <h2 className="mt-3 font-display text-[32px] font-semibold leading-[1.1] tracking-tight md:text-[40px]">
              Be om et konkret tilbud
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-muted-foreground">
              Fyll inn skjemaet — vi svarer med detaljert tilbud innen 24 timer.
              Du er ikke forpliktet til noe.
            </p>

            <form className="mt-8 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Bedrift" placeholder="Sparebank 1 Østfold" />
                <FormField label="Kontaktperson" placeholder="Navn" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  label="E-post"
                  type="email"
                  placeholder="navn@bedrift.no"
                />
                <FormField label="Telefon" placeholder="+47 ..." />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormSelect
                  label="Pakke"
                  options={[
                    "Halvdag",
                    "Heldag",
                    "Premium-event",
                    "Vet ikke ennå",
                  ]}
                />
                <FormSelect
                  label="Antall deltakere"
                  options={[
                    "8–12",
                    "13–24",
                    "25–40",
                    "40+",
                  ]}
                />
              </div>
              <FormField
                label="Ønsket dato (kan være cirka)"
                placeholder="Juni–august 2026"
              />
              <div>
                <label className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Anledning eller spesielle ønsker
                </label>
                <textarea
                  rows={4}
                  placeholder="Kort beskrivelse av hva dere ønsker — anledning, ønsket tone, særskilte hensyn."
                  className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-[14px] outline-none transition-colors focus:border-foreground"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] text-muted-foreground">
                  Vi svarer normalt innen 24 timer på hverdager.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Send forespørsel
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function HeroStat({
  Icon,
  value,
  label,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
      <div className="mt-3 font-display font-mono text-[28px] font-semibold tabular-nums leading-none tracking-tight">
        {value}
      </div>
      <div className="mt-2 text-[12px] leading-[1.4] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function PakkeCard({ p }: { p: Pakke }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 ${
        p.highlight
          ? "border-2 border-primary bg-background"
          : "border border-border bg-background"
      }`}
    >
      {p.highlight && (
        <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-foreground">
          Mest populær
        </span>
      )}
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <p.Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 font-display text-[24px] font-semibold tracking-tight">
        {p.name}
      </h3>
      <div className="mt-2 flex gap-3 text-[12px] text-muted-foreground">
        <span>{p.duration}</span>
        <span>·</span>
        <span>{p.size}</span>
      </div>
      <div className="mt-5 font-display font-mono text-[28px] font-semibold tabular-nums leading-none tracking-tight">
        {p.price}
      </div>
      <p className="mt-4 text-[14px] leading-[1.6] text-muted-foreground">
        {p.description}
      </p>
      <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
        {p.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-[13px] leading-[1.5]"
          >
            <CheckCircle2
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
              strokeWidth={1.75}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="#kontakt"
        className={`mt-6 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90 ${
          p.highlight
            ? "bg-primary text-primary-foreground"
            : "bg-foreground text-background"
        }`}
      >
        Be om tilbud på {p.name}
        <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
      </Link>
    </div>
  );
}

function EstimatRow({
  size,
  pkg,
  per,
  total,
}: {
  size: string;
  pkg: string;
  per: string;
  total: string;
}) {
  return (
    <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center gap-4 rounded-2xl border border-border bg-background px-5 py-4">
      <div>
        <div className="text-[14px] font-semibold">{size}</div>
        <div className="text-[11px] text-muted-foreground">{pkg}-pakke</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Per pers
        </div>
        <div className="mt-1 font-mono text-[14px] font-semibold tabular-nums">
          {per}
        </div>
      </div>
      <div className="text-center">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Totalt
        </div>
        <div className="mt-1 font-mono text-[16px] font-semibold tabular-nums">
          {total}
        </div>
      </div>
      <div className="text-right">
        <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Eks. mva
        </span>
      </div>
    </div>
  );
}

function FormField({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-[14px] outline-none transition-colors focus:border-foreground"
      />
    </div>
  );
}

function FormSelect({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div>
      <label className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </label>
      <select className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-[14px] outline-none transition-colors focus:border-foreground">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
