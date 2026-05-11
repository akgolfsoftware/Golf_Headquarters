/**
 * Booking — Velg tjeneste (steg 1 av 5)
 * Bygd fra wireframe/design-files-v2/screens/booking/02-booking-tjenester.html
 * URL: /booking-tjenester-demo
 *
 * Tjeneste-katalog forbruker. 8 tjenester. Filter-chips på topp.
 */

import { Check, ChevronDown } from "lucide-react";

const STEPS = [
  { num: "1", label: "Tjeneste", state: "active" as const },
  { num: "2", label: "Tid", state: "todo" as const },
  { num: "3", label: "Info", state: "todo" as const },
  { num: "4", label: "Betaling", state: "todo" as const },
  { num: "5", label: "Bekreftelse", state: "todo" as const },
];

const FILTERS = ["Type: Alle", "Varighet: Alle", "Pris: Alle", "Anlegg: Alle"];

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  location: string;
  desc: string;
  included: string[];
}

const SERVICES: Service[] = [
  {
    id: "coaching-60",
    name: "Personlig coaching",
    duration: "60 min",
    price: "1 500 kr",
    location: "Mulligan / GFGK Bossum",
    desc: "Én-til-én med PGA-coach. Video-opptak, swing-analyse og personlig oppfølging.",
    included: ["Video-opptak av swing", "Personlig oppfølgings-plan", "Range-baller"],
  },
  {
    id: "coaching-90",
    name: "Personlig coaching XL",
    duration: "90 min",
    price: "2 200 kr",
    location: "Mulligan / GFGK Bossum",
    desc: "Utvidet økt for dyp gjennomgang. Inkluderer korthåndsspill og putte-analyse.",
    included: [
      "Alt fra Personlig coaching",
      "Kort spill + putte-økt",
      "Skriftlig oppsummering",
    ],
  },
  {
    id: "studio",
    name: "TrackMan-økt selvspill",
    duration: "60 min",
    price: "300 kr",
    location: "Mulligan Indoor Borre",
    desc: "Bruk TrackMan-simulator selvstendig. Spill virkelige baner eller tren med data.",
    included: ["TrackMan-bay 60 min", "Tilgang til 200+ baner", "Data eksportert som PDF"],
  },
  {
    id: "studio-coach",
    name: "TrackMan-økt med coach",
    duration: "60 min",
    price: "1 800 kr",
    location: "Mulligan Indoor Borre",
    desc: "TrackMan-bay sammen med PGA-coach. Datadrevet feedback per slag.",
    included: ["TrackMan-bay 60 min", "Coach hele økten", "Tall-rapport etter"],
  },
  {
    id: "video",
    name: "Video-analyse",
    duration: "45 min",
    price: "1 200 kr",
    location: "Mulligan Indoor Borre",
    desc: "Detaljert swing-analyse med slow-motion og pose-tracking.",
    included: ["6 kameravinkler", "Slow-motion gjennomgang", "Sendes til PlayerHQ"],
  },
  {
    id: "junior",
    name: "Junior-time",
    duration: "45 min",
    price: "600 kr",
    location: "GFGK Bossum",
    desc: "For spillere under 16 år. Spesialisert coach. Lekent og strukturert.",
    included: ["Sertifisert junior-coach", "Tilpasset alder", "Foreldre-rapport"],
  },
  {
    id: "junior-pakke",
    name: "Junior-pakke 5 timer",
    duration: "5 × 45 min",
    price: "2 500 kr",
    location: "GFGK Bossum",
    desc: "Spar 500 kr. 5 junior-timer som kan brukes innen 8 uker.",
    included: ["5 timer på klippekort", "Progresjons-plan", "Spar 500 kr"],
  },
  {
    id: "gruppe",
    name: "Gruppetrening",
    duration: "60 min · 2–4 pers",
    price: "800 kr",
    location: "per person · Mulligan / GFGK Bossum",
    desc: "2 til 4 spillere på samme nivå. Mer sosialt, fortsatt fokusert.",
    included: ["Coach hele økten", "Range-baller", "Konkurranse-elementer"],
  },
];

export default function BookingTjenesterDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <ProgressBar />

      <div className="mx-auto max-w-[1100px] px-12 pb-16 pt-12">
        <div className="text-center">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Steg 1 av 5
          </div>
          <h1 className="mt-3 font-display text-[44px] font-normal leading-tight tracking-tight">
            Velg <em className="italic text-primary">tjeneste</em>
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            8 tjenester tilgjengelig. Filtrér for å finne det som passer.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Filter:
          </span>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-foreground hover:border-foreground"
            >
              {f}
              <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {SERVICES.map((s) => (
            <ServiceCard key={s.id} svc={s} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function TopNav() {
  return (
    <nav className="flex h-16 items-center justify-between border-b border-border px-12">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span>AK Golf</span>
        <span className="text-border">·</span>
        <span className="text-muted-foreground">Booking</span>
      </div>
      <a href="#" className="text-[13px] font-medium hover:text-primary">
        Min side →
      </a>
    </nav>
  );
}

function ProgressBar() {
  return (
    <div className="flex items-center justify-center gap-3 border-b border-border bg-secondary/40 px-12 py-4">
      {STEPS.map((step, i) => (
        <div key={step.num} className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium ${
              step.state === "active"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] ${
                step.state === "active"
                  ? "bg-primary-foreground/20"
                  : "bg-secondary"
              }`}
            >
              {step.num}
            </span>
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <span className="text-border">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ServiceCard({ svc }: { svc: Service }) {
  return (
    <button
      type="button"
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-primary"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[24px] font-normal italic leading-tight tracking-tight">
            {svc.name}
          </h3>
          <span className="mt-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground">
            {svc.duration}
          </span>
        </div>
        <div className="text-right">
          <div className="font-mono text-[18px] font-semibold text-foreground">
            {svc.price}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {svc.location}
          </div>
        </div>
      </div>
      <p className="text-[13.5px] leading-[1.55] text-muted-foreground">
        {svc.desc}
      </p>
      <div className="border-t border-border pt-4">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Inkludert
        </div>
        <ul className="mt-3 space-y-2">
          {svc.included.map((item) => (
            <li key={item} className="flex items-center gap-2 text-[13px]">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-primary/10 text-primary">
                <Check className="h-2.5 w-2.5" strokeWidth={2} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}

function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-border px-12 py-5">
      <button
        type="button"
        className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium hover:bg-secondary"
      >
        ← Tilbake til forside
      </button>
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        Klikk en tjeneste for å fortsette
      </span>
    </footer>
  );
}
