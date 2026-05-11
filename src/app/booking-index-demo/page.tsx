/**
 * Booking forside — forbruker
 * Bygd fra wireframe/design-files-v2/screens/booking/01-booking-index.html
 * URL: /booking-index-demo
 *
 * Forside for booking.akgolf.no. Tre kategorier: Coaching, TrackMan, Junior.
 * Public, ingen auth. Lyst tema (default).
 */

import { User, MonitorPlay, Sparkles, ChevronRight, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Category {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  iconFg: string;
  title: string;
  emphasis: string;
  desc: string;
  priceFrom: string;
  priceUnit: string;
  cta: string;
}

const CATEGORIES: Category[] = [
  {
    id: "coaching",
    icon: User,
    iconBg: "bg-primary/10",
    iconFg: "text-primary",
    title: "Personlig",
    emphasis: "coaching",
    desc: "Én-til-én med PGA-coach. 60 eller 90 min. Indoor eller utendørs.",
    priceFrom: "1 500 kr",
    priceUnit: "per time",
    cta: "Velg coach",
  },
  {
    id: "trackman",
    icon: MonitorPlay,
    iconBg: "bg-accent/40",
    iconFg: "text-primary",
    title: "TrackMan-",
    emphasis: "økt",
    desc: "Selvspill med data, eller med coach. Mulligan Indoor Borre.",
    priceFrom: "300 kr",
    priceUnit: "per time",
    cta: "Velg anlegg",
  },
  {
    id: "junior",
    icon: Sparkles,
    iconBg: "bg-secondary",
    iconFg: "text-foreground",
    title: "Junior-",
    emphasis: "time",
    desc: "Under 16 år. Spesialisert coach. Egne tider på GFGK Bossum.",
    priceFrom: "600 kr",
    priceUnit: "per 45 min",
    cta: "Velg coach",
  },
];

const FAQ: Array<{ q: string; a?: string; open?: boolean }> = [
  {
    q: "Hvor mye koster en time?",
    a: "Personlig coaching koster fra 1 500 kr per time. TrackMan-økter med selvspill starter på 300 kr per time, mens junior-timer (under 16 år) er fra 600 kr per 45 min. Faste priser — ingen overraskelser ved booking.",
    open: true,
  },
  { q: "Kan jeg avbestille?" },
  { q: "Hva inngår i en TrackMan-økt?" },
  { q: "Trenger jeg eget utstyr?" },
];

export default function BookingIndexDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      <section className="relative bg-gradient-to-b from-background to-secondary/50 px-12 pb-24 pt-24 text-center">
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Vår 2026 · ledige tider neste 4 uker
        </div>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-[56px] font-normal leading-[1.05] tracking-tight">
          Book din neste <em className="italic text-primary">økt</em>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.55] text-muted-foreground">
          Personlig coaching, TrackMan-økt eller junior-time. Velg hva du vil
          bestille — vi finner ledig tid sammen med en av våre coacher.
        </p>
      </section>

      <div className="relative z-10 -mt-14 px-12">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-6 md:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-[1100px] flex-wrap items-center justify-center gap-8 px-12 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        <span>PGA-coacher</span>
        <span className="text-border">·</span>
        <span>Sikker betaling — Stripe &amp; Vipps</span>
        <span className="text-border">·</span>
        <span>Fri avbestilling 24 t før</span>
      </div>

      <section className="mx-auto mt-24 max-w-[800px] px-12 pb-24">
        <h2 className="mb-8 font-display text-[40px] font-normal leading-tight tracking-tight">
          Ofte stilte <em className="italic text-primary">spørsmål</em>
        </h2>
        <div className="border-t border-border">
          {FAQ.map((item) => (
            <FaqItem key={item.q} item={item} />
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-12 py-8">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          <span>AK Golf Group · Org.nr 919 234 567</span>
          <span>booking@akgolf.no · +47 69 30 12 00</span>
        </div>
      </footer>
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
      <a
        href="#"
        className="text-[13px] font-medium text-foreground hover:text-primary"
      >
        Min side →
      </a>
    </nav>
  );
}

function CategoryCard({ cat }: { cat: Category }) {
  const Icon = cat.icon;
  return (
    <a
      href="#"
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary"
    >
      <div className="flex items-center justify-between">
        <span
          className={`grid h-14 w-14 place-items-center rounded-xl ${cat.iconBg} ${cat.iconFg}`}
        >
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-[11px] font-semibold text-[#16A34A]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
          Ledig nå
        </span>
      </div>
      <div>
        <h3 className="font-display text-[30px] font-normal leading-[1.05] tracking-tight">
          {cat.title}
          <em className="italic text-primary">{cat.emphasis}</em>
        </h3>
        <p className="mt-2 text-[14px] leading-[1.5] text-muted-foreground">
          {cat.desc}
        </p>
        <p className="mt-3 font-mono text-[12px] text-muted-foreground">
          fra{" "}
          <em className="mr-1.5 font-display text-[22px] not-italic text-primary">
            {cat.priceFrom}
          </em>
          · {cat.priceUnit}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-[13px] font-medium">
        <span>{cat.cta} →</span>
        <ChevronRight
          className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5"
          strokeWidth={1.5}
        />
      </div>
    </a>
  );
}

function FaqItem({ item }: { item: { q: string; a?: string; open?: boolean } }) {
  return (
    <div className="border-b border-border py-5">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left text-[16px] font-medium text-foreground"
      >
        <span>{item.q}</span>
        <span
          className={`grid h-7 w-7 place-items-center rounded-full ${
            item.open ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
          }`}
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${
              item.open ? "rotate-180" : ""
            }`}
            strokeWidth={1.5}
          />
        </span>
      </button>
      {item.open && item.a && (
        <p className="mt-4 max-w-[620px] text-[14px] leading-[1.6] text-muted-foreground">
          {item.a}
        </p>
      )}
    </div>
  );
}
