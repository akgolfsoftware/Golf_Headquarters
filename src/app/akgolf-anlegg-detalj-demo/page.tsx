/**
 * Marketing — Anlegg-detalj (Mulligan Indoor Borre)
 * URL: /akgolf-anlegg-detalj-demo
 *
 * Detaljside for hovedanlegget. Hero med stort bilde-placeholder,
 * beskrivelse, fasiliteter-grid, åpningstider-tabell, kart-snippet,
 * anmeldelser og CTA "Book studio".
 */

import {
  ArrowRight,
  Coffee,
  Cpu,
  Map as MapIcon,
  MapPin,
  Phone,
  Quote,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Users,
  Wifi,
} from "lucide-react";

interface Fasilitet {
  ikon: React.ReactNode;
  navn: string;
  beskrivelse: string;
}

const FASILITETER: Fasilitet[] = [
  {
    ikon: <Cpu className="h-5 w-5" strokeWidth={1.5} />,
    navn: "4 × TrackMan 4",
    beskrivelse:
      "Verdens mest presise launch monitor. Full club- og ball-data, video og 30+ baner.",
  },
  {
    ikon: <Target className="h-5 w-5" strokeWidth={1.5} />,
    navn: "Puttegreen 80 m²",
    beskrivelse:
      "Egen puttegreen med varierende undulasjoner — speedinnstilling 9–11.",
  },
  {
    ikon: <Coffee className="h-5 w-5" strokeWidth={1.5} />,
    navn: "Café og lounge",
    beskrivelse:
      "Kaffe, snacks og lett lunsj. Wifi og storskjerm for å se turneringer.",
  },
  {
    ikon: <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />,
    navn: "Klubbetilpasning",
    beskrivelse:
      "Full bag-fitting på TrackMan med PGA-coach. Time bookes separat.",
  },
  {
    ikon: <Users className="h-5 w-5" strokeWidth={1.5} />,
    navn: "Junior-akademi",
    beskrivelse:
      "Faste juniorgrupper hver lørdag. Aldersinndelte økter 8–16 år.",
  },
  {
    ikon: <Wifi className="h-5 w-5" strokeWidth={1.5} />,
    navn: "Gratis wifi + parkering",
    beskrivelse:
      "30 parkeringsplasser rett utenfor inngangen. Ladestasjoner for elbil.",
  },
];

interface Apningstid {
  dag: string;
  tid: string;
  notat?: string;
}

const APNINGSTIDER: Apningstid[] = [
  { dag: "Mandag", tid: "07:00 – 22:00" },
  { dag: "Tirsdag", tid: "07:00 – 22:00" },
  { dag: "Onsdag", tid: "07:00 – 22:00" },
  { dag: "Torsdag", tid: "07:00 – 22:00" },
  { dag: "Fredag", tid: "07:00 – 22:00" },
  { dag: "Lørdag", tid: "09:00 – 20:00", notat: "Junior-akademi 10:00 – 12:00" },
  { dag: "Søndag", tid: "09:00 – 20:00" },
];

interface Anmeldelse {
  navn: string;
  stjerner: number;
  dato: string;
  tekst: string;
}

const ANMELDELSER: Anmeldelse[] = [
  {
    navn: "Markus Roinås Pedersen",
    stjerner: 5,
    dato: "april 2026",
    tekst:
      "Trackman-utstyret er topp og temperaturen er perfekt selv i mars. Booking-systemet bare fungerer.",
  },
  {
    navn: "Lena Berg",
    stjerner: 5,
    dato: "mars 2026",
    tekst:
      "Tok med datteren min på junior-akademi — fantastisk opplegg. Sara er en strålende coach.",
  },
  {
    navn: "Petter Solli",
    stjerner: 4,
    dato: "februar 2026",
    tekst:
      "Solid sted å trene gjennom vinteren. Kunne ønsket meg litt flere puttingsspor, men ellers topp.",
  },
];

export default function AkgolfAnleggDetaljDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-8 py-3 text-[12px] text-muted-foreground">
          <a href="/akgolf-anlegg-demo" className="hover:text-primary">
            Anlegg
          </a>
          <span>/</span>
          <span className="text-foreground">Mulligan Indoor Borre</span>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-8 pt-12">
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/30 via-secondary to-muted">
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-primary/15 font-mono text-[40px] font-bold text-primary">
                MI
              </div>
              <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Foto kommer · innendørs simulator-senter
              </div>
            </div>
          </div>
          <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-[12px] font-medium backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Åpent nå · stenger 22:00
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Innendørs simulator-senter · Horten
            </div>
            <h1 className="mt-4 font-display text-[56px] font-medium leading-[1.05] tracking-tight">
              Mulligan{" "}
              <em className="italic text-primary">Indoor Borre</em>
            </h1>
            <p className="mt-6 text-[16px] leading-[1.7]">
              Hovedanlegget vårt — 600 m² simulator-senter rett ved E18 i
              Horten. Åpent året rundt med fire TrackMan 4-utstyrte studio,
              dedikert puttegreen og café. Bookes minuttpresist gjennom AK Golf,
              eller drop-in når det er ledig.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-[13px]">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />
                Industriveien 12, 3186 Horten
              </span>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" strokeWidth={1.5} />
                +47 400 12 345
              </span>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Book studio
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-[36px] font-medium tabular">
                650
              </span>
              <span className="text-[14px] text-muted-foreground">
                kr / time
              </span>
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">
              Inkludert TrackMan, ballautomat og café-tilgang. Maks 4 spillere
              per studio.
            </p>

            <a
              href="/booking-anlegg-demo"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[14px] font-medium text-primary-foreground hover:opacity-90"
            >
              Book studio nå
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a
              href="/akgolf-coacher-demo"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-[14px] font-medium hover:border-primary"
            >
              Book med coach
            </a>

            <div className="mt-6 border-t border-border pt-4 text-[12px] text-muted-foreground">
              Gratis avbestilling inntil 6 timer før timen.
            </div>
          </aside>
        </div>
      </section>

      {/* Fasiliteter */}
      <section className="mx-auto max-w-7xl px-8 py-16">
        <div className="mb-10 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Hva du får
          </div>
          <h2 className="mt-3 font-display text-[40px] font-medium leading-tight tracking-tight">
            Alt du <em className="italic">trenger</em> — og litt til
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FASILITETER.map((f) => (
            <div
              key={f.navn}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {f.ikon}
              </div>
              <h3 className="mt-4 font-display text-[18px] font-medium">
                {f.navn}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.6] text-muted-foreground">
                {f.beskrivelse}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Åpningstider + kart */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 py-16 lg:grid-cols-2">
          {/* Åpningstider-tabell */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Åpningstider
            </div>
            <h2 className="mt-3 font-display text-[28px] font-medium tracking-tight">
              Når du <em className="italic">kan komme</em>
            </h2>

            <table className="mt-6 w-full">
              <tbody>
                {APNINGSTIDER.map((a) => (
                  <tr
                    key={a.dag}
                    className="border-b border-dashed border-border last:border-0"
                  >
                    <td className="py-3 text-[14px]">{a.dag}</td>
                    <td className="py-3 text-right">
                      <div className="font-mono text-[14px] tabular">
                        {a.tid}
                      </div>
                      {a.notat && (
                        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                          {a.notat}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 rounded-lg bg-accent/30 p-4 text-[12px] text-foreground">
              <strong>Påske og jul:</strong> avvikende åpningstider.
              Se forsiden for oppdatert kalender.
            </div>
          </div>

          {/* Kart-placeholder */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary via-muted to-secondary">
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-card shadow-lg">
                    <MapIcon
                      className="h-7 w-7 text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Interaktivt kart kommer
                  </span>
                </div>
              </div>
              <div className="absolute right-1/2 top-1/2 -translate-y-12 translate-x-1/2">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                  <div className="relative grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <MapPin className="h-3 w-3" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-border p-6">
              <div className="text-[14px] font-medium">
                Industriveien 12, 3186 Horten
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">
                12 min fra Tønsberg sentrum · 35 min fra Drammen
              </div>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-primary hover:underline"
              >
                Åpne i Kart
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Anmeldelser */}
      <section className="mx-auto max-w-7xl px-8 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div className="max-w-2xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Anmeldelser
            </div>
            <h2 className="mt-3 font-display text-[40px] font-medium leading-tight tracking-tight">
              4,8 av <em className="italic">5</em>
            </h2>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Basert på 142 verifiserte anmeldelser fra siste 12 måneder.
            </p>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-6 w-6 text-primary"
                strokeWidth={1.5}
                fill="currentColor"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ANMELDELSER.map((a) => (
            <figure
              key={a.navn}
              className="flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: a.stjerner }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-primary"
                    strokeWidth={1.5}
                    fill="currentColor"
                  />
                ))}
              </div>
              <Quote
                className="mt-4 h-5 w-5 text-muted-foreground"
                strokeWidth={1.5}
              />
              <blockquote className="mt-3 flex-1 text-[14px] leading-[1.6]">
                &ldquo;{a.tekst}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4 text-[13px]">
                <div className="font-medium">{a.navn}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {a.dato}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA-stripe */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-8 py-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] opacity-80">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              Drop-in eller booking
            </div>
            <h2 className="mt-3 font-display text-[32px] font-medium leading-tight">
              Klar for en <em className="italic">runde</em>?
            </h2>
          </div>
          <a
            href="/booking-anlegg-demo"
            className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-[14px] font-medium text-primary hover:opacity-90"
          >
            Book studio
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TopNav() {
  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        <a href="/" className="flex items-center gap-2 text-[14px] font-medium">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>AK Golf</span>
        </a>
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
