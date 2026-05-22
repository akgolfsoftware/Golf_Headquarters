/**
 * Marketing — Anlegg (liste)
 * URL: /akgolf-anlegg-demo
 *
 * Oversikt over de to fysiske anleggene AK Golf Group opererer på:
 * Mulligan Indoor Golf Simulators Borre og GFGK Bossum.
 */

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";

interface AnleggApning {
  dag: string;
  tid: string;
}

interface Anlegg {
  id: string;
  initials: string;
  navn: string;
  type: string;
  adresse: string;
  postnr: string;
  telefon: string;
  beskrivelse: string;
  fasiliteter: string[];
  apningstider: AnleggApning[];
  badge?: string;
}

const ANLEGG: Anlegg[] = [
  {
    id: "mulligan-borre",
    initials: "MI",
    navn: "Mulligan Indoor Borre",
    type: "Innendørs simulator-senter",
    adresse: "Industriveien 12",
    postnr: "3186 Horten",
    telefon: "+47 400 12 345",
    beskrivelse:
      "Trackman-utstyrte simulatorer, full bag-test, dedikert puttegreen og café. Åpent året rundt — spill 30+ baner uavhengig av vær.",
    fasiliteter: [
      "4 × TrackMan 4",
      "Puttegreen 80 m²",
      "Café og lounge",
      "Klubbetilpasning",
      "PGA-coaching",
      "Parkering",
    ],
    apningstider: [
      { dag: "Man – fre", tid: "07:00 – 22:00" },
      { dag: "Lør – søn", tid: "09:00 – 20:00" },
    ],
    badge: "Hovedanlegg",
  },
  {
    id: "gfgk-bossum",
    initials: "GF",
    navn: "GFGK Bossum",
    type: "18-hulls bane + range",
    adresse: "Bossumveien 41",
    postnr: "1626 Manstad",
    telefon: "+47 400 67 890",
    beskrivelse:
      "Gamle Fredrikstad Golfklubb på Bossum. 18-hulls par 72, oppvarmet driving range, kortspill-områder og PGA-coaching. Sommersesong april til oktober.",
    fasiliteter: [
      "18-hulls bane",
      "Driving range 30 plasser",
      "Kortspill-område",
      "Klubbhus og restaurant",
      "Pro shop",
      "Junior-akademi",
    ],
    apningstider: [
      { dag: "Man – fre", tid: "07:00 – 21:00" },
      { dag: "Lør – søn", tid: "07:00 – 20:00" },
      { dag: "Sesong", tid: "april – oktober" },
    ],
  },
];

export default function AkgolfAnleggDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      {/* Hero */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Anlegg · AK Golf Group
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-[56px] font-medium leading-[1.05] tracking-tight">
            To anlegg —{" "}
            <em className="italic text-primary">året rundt</em>
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.65] text-muted-foreground">
            Innendørs på Mulligan i Horten når været ikke samarbeider, utendørs
            på GFGK Bossum i sesongen. Samme coacher, samme plan, sømløs
            booking.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />
              Horten + Manstad
            </span>
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" strokeWidth={1.5} />
              Booking åpen 24/7
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" strokeWidth={1.5} />
              Fra 07:00 hver morgen
            </span>
          </div>
        </div>
      </section>

      {/* Anlegg-kort */}
      <section className="mx-auto max-w-7xl px-8 py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {ANLEGG.map((a) => (
            <AnleggKort key={a.id} anlegg={a} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function AnleggKort({ anlegg }: { anlegg: Anlegg }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* Bilde-placeholder */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/20 via-secondary to-muted">
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-primary/10 font-mono text-[28px] font-bold text-primary">
            {anlegg.initials}
          </div>
        </div>
        {anlegg.badge && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
            {anlegg.badge}
          </span>
        )}
        {/* Kart-pin placeholder */}
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 backdrop-blur">
          <Navigation
            className="h-3.5 w-3.5 text-primary"
            strokeWidth={1.5}
          />
          <span className="font-mono text-[11px]">Vis kart</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {anlegg.type}
        </div>
        <h2 className="mt-2 font-display text-[28px] font-medium tracking-tight">
          {anlegg.navn}
        </h2>

        <div className="mt-4 flex flex-col gap-2 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" strokeWidth={1.5} />
            {anlegg.adresse}, {anlegg.postnr}
          </span>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4" strokeWidth={1.5} />
            {anlegg.telefon}
          </span>
        </div>

        <p className="mt-6 text-[14px] leading-[1.65]">{anlegg.beskrivelse}</p>

        {/* Fasiliteter */}
        <div className="mt-6">
          <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Fasiliteter
          </h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {anlegg.fasiliteter.map((f) => (
              <span
                key={f}
                className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Åpningstider */}
        <div className="mt-6">
          <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Åpningstider
          </h3>
          <div className="mt-3 space-y-1.5">
            {anlegg.apningstider.map((t) => (
              <div
                key={t.dag}
                className="flex items-center justify-between border-b border-dashed border-border pb-1.5 text-[13px] last:border-0"
              >
                <span className="text-muted-foreground">{t.dag}</span>
                <span className="font-mono tabular">{t.tid}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/akgolf-anlegg-detalj-demo"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground hover:opacity-90"
          >
            Se anlegg
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </a>
          <a
            href="/booking-anlegg-demo"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-[13px] font-medium hover:border-primary"
          >
            Book studio
          </a>
        </div>
      </div>
    </article>
  );
}

function TopNav() {
  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 text-[14px] font-medium">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>AK Golf</span>
        </Link>
        <div className="hidden items-center gap-8 text-[13px] md:flex">
          <a href="/akgolf-tjenester-demo" className="hover:text-primary">
            Tjenester
          </a>
          <a href="/akgolf-om-demo" className="hover:text-primary">
            Om
          </a>
          <a href="/akgolf-coacher-demo" className="hover:text-primary">
            Coacher
          </a>
          <a href="/akgolf-kontakt-demo" className="hover:text-primary">
            Kontakt
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/auth-login-demo"
            className="hidden text-[13px] hover:text-primary md:inline"
          >
            Logg inn
          </a>
          <a
            href="/booking-index-demo"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
          >
            Book økt
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-[14px] font-medium">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>AK Golf</span>
            </div>
            <p className="mt-4 max-w-xs text-[12px] leading-[1.6] text-muted-foreground">
              Coaching, plan og fremgang. PGA-coacher i Vestfold og Østfold.
            </p>
          </div>
          <FooterCol
            title="Tjenester"
            links={["Privat coaching", "Junior", "Bedrift", "Camps"]}
          />
          <FooterCol
            title="Selskap"
            links={["Om oss", "Coacher", "Anlegg", "Kontakt"]}
          />
          <FooterCol
            title="Hjelp"
            links={["FAQ", "Personvern", "Vilkår", "Logg inn"]}
          />
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[12px] text-muted-foreground">
          <span>© 2026 AK Golf Group AS</span>
          <span>akgolf.no</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-4 space-y-2 text-[13px]">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-primary">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
