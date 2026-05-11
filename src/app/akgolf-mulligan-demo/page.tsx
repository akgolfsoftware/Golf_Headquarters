/**
 * AK Golf x Mulligan Indoor Golf Simulators — partnerskap-side.
 * URL: /akgolf-mulligan-demo
 *
 * Marketing-side for Mulligan-anlegget i Borre. 3 Trackman-studioer,
 * cafe, bar og helårs-golf.
 */
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Coffee,
  MapPin,
  Monitor,
  Sparkles,
  Wine,
} from "lucide-react";
import {
  MarketingFooter,
  MarketingNav,
} from "@/app/_marketing-demo/chrome";

type Facility = {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
};

const FACILITIES: Facility[] = [
  {
    Icon: Monitor,
    title: "Trackman 4 — 3 bayer",
    desc: "Premium dual-radar med kamera. Slag-data, video og baner i samme system. Sertifisert kalibrert hver måned.",
  },
  {
    Icon: Sparkles,
    title: "Simulator-baner",
    desc: "200+ verdensbaner — Pebble Beach, St. Andrews, Augusta og hjemlige favoritter. Spill 18 hull på 90 minutter.",
  },
  {
    Icon: Coffee,
    title: "Cafe — frokost til lunsj",
    desc: "Espresso, smoothies og lett lunsj. Egen lounge for ventere og medspillere — Wi-Fi og strømuttak.",
  },
  {
    Icon: Wine,
    title: "Bar — fredag til søndag",
    desc: "Lokale øl på fat, vin og enklere mat. Perfekt for selskap, runder med venner eller etter en lang dag på range.",
  },
];

type Hour = {
  day: string;
  time: string;
};

const HOURS: Hour[] = [
  { day: "Mandag–torsdag", time: "08:00–22:00" },
  { day: "Fredag", time: "08:00–23:00" },
  { day: "Lørdag", time: "09:00–23:00" },
  { day: "Søndag", time: "10:00–20:00" },
];

type Price = {
  name: string;
  price: string;
  unit: string;
  desc: string;
  highlight?: boolean;
};

const PRICES: Price[] = [
  {
    name: "Drop-in studio",
    price: "300",
    unit: "kr / time",
    desc: "Per studio, opptil 4 spillere. Inkluderer Trackman-data og bane-spill.",
  },
  {
    name: "10-klipp",
    price: "2 700",
    unit: "kr / pakke",
    desc: "10 timer studio. Gyldig 12 måneder. 10 % rabatt mot drop-in.",
  },
  {
    name: "Sesongkort",
    price: "4 000",
    unit: "kr / kvartal",
    desc: "Ubegrenset studiotid hverdager 08–17. Ideelt for pensjonister og fleksible.",
    highlight: true,
  },
  {
    name: "Coaching m/ Trackman",
    price: "1 600",
    unit: "kr / time",
    desc: "1:1 økt med AK Golf-coach. Studio og data inkludert. Bestilles via akgolf.no.",
  },
];

export default function AkgolfMulliganDemo() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-[1.2fr_1fr] md:py-32">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
              Borre · Vestfold
            </span>
            <h1 className="mt-6 font-display text-[56px] font-semibold leading-[1.05] tracking-tight md:text-[72px]">
              <em className="font-medium italic text-primary">
                Spille golf hele året
              </em>
              <span className="block text-foreground">
                Mulligan Indoor Borre.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[18px] leading-[1.6] text-muted-foreground">
              Tre Trackman-studioer, simulator-baner fra hele verden, cafe og
              bar. Mulligan er fritt tilgjengelig året rundt — uavhengig av
              vær, lys eller årstid.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#book"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Book studio
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
              <Link
                href="#priser"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-6 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Se priser
              </Link>
            </div>
          </div>

          {/* Hero panel — kart-placeholder */}
          <div className="relative">
            <div className="aspect-[5/4] overflow-hidden rounded-2xl border border-border bg-secondary">
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/15 via-secondary to-accent/20">
                <div className="text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground mx-auto">
                    <MapPin className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <div className="mt-4 font-display text-[18px] font-semibold tracking-tight text-foreground">
                    Mulligan Indoor
                  </div>
                  <div className="mt-1 text-[13px] text-muted-foreground">
                    Storgata 12, 3186 Horten
                  </div>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    59,40° N · 10,48° Ø
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Om anlegget */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Om anlegget
          </span>
          <h2 className="mt-3 font-display text-[40px] font-semibold leading-tight tracking-tight md:text-[48px]">
            <em className="font-medium italic">600 m²</em> indoor golf i Borre
          </h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground">
            Mulligan ble åpnet i 2022 som en del av AK Golf Group sin satsing på
            tilgjengelig golf hele året. Anlegget brukes av juniorer fra GFGK
            og WANG, voksne hobbyspillere og bedrifter for events og kurs.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FACILITIES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-6 rounded-2xl border border-border bg-card p-8"
            >
              <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="font-display text-[20px] font-semibold leading-snug tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Åpningstider + priser */}
      <section id="priser" className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-[1fr_1.4fr]">
          {/* Åpningstider */}
          <div className="rounded-2xl border border-border bg-background p-10">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary">
              <Clock className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </span>
            <h2 className="mt-6 font-display text-[28px] font-semibold leading-tight tracking-tight">
              Åpningstider
            </h2>
            <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
              Gjelder hele året, også jul og påske. Røde dager kan ha avvik —
              sjekk booking-systemet.
            </p>
            <ul className="mt-6 divide-y divide-border">
              {HOURS.map((h) => (
                <li
                  key={h.day}
                  className="flex items-center justify-between py-4 text-[14px]"
                >
                  <span className="text-foreground">{h.day}</span>
                  <span className="font-mono tabular-nums text-foreground">
                    {h.time}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-md bg-secondary p-4 text-[13px] leading-[1.5] text-muted-foreground">
              Medlemmer med sesongkort kan booke døgnet rundt via app — alle
                andre via web innenfor åpningstid.
            </div>
          </div>

          {/* Priser */}
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Priser
            </span>
            <h2 className="mt-3 font-display text-[40px] font-semibold leading-tight tracking-tight md:text-[48px]">
              <em className="font-medium italic">Enkelt</em> og fleksibelt
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-[1.6] text-muted-foreground">
              Alle priser inkluderer MVA. Avbestilling senest 24 timer før.
              Studio bookes per time — opptil 4 spillere per bay.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PRICES.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-2xl border p-6 ${
                    p.highlight
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-[17px] font-semibold leading-snug tracking-tight">
                      {p.name}
                    </h3>
                    {p.highlight && (
                      <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.10em] text-primary-foreground">
                        Populær
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-mono text-[28px] font-semibold tabular-nums leading-none -tracking-tight">
                      {p.price}
                    </span>
                    <span className="text-[12px] text-muted-foreground">
                      {p.unit}
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.5] text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Book CTA */}
      <section id="book" className="mx-auto max-w-7xl px-6 py-24">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-1 items-center gap-10 p-12 md:grid-cols-[1.4fr_1fr] md:p-16">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Klar til å booke?
              </span>
              <h2 className="mt-3 font-display text-[40px] font-semibold leading-tight tracking-tight md:text-[48px]">
                <em className="font-medium italic">Slå</em> i kveld
              </h2>
              <p className="mt-4 max-w-xl text-[16px] leading-[1.6] text-muted-foreground">
                Tre studioer, 14 timer åpent og kort kø de fleste kvelder.
                Bookingen er live — du kan velge studio og tid akkurat når du
                vil.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/booking-index-demo"
                className="inline-flex items-center justify-between gap-2 rounded-full bg-primary px-6 py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Book studio nå
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
              <Link
                href="mailto:akgolfgroup@gmail.com"
                className="inline-flex items-center justify-between gap-2 rounded-full border border-border bg-background px-6 py-4 text-[15px] font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Spør om bedriftsevent
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
