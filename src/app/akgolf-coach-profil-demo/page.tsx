/**
 * Marketing — Coach-profil (public-side)
 * URL: /akgolf-coach-profil-demo
 *
 * Anders Kristiansen public-profil. Hero med foto-placeholder og bio,
 * CV/sertifiseringer, statistikk, testimonials, kalender-snippet og CTA.
 */

import {
  ArrowRight,
  Award,
  Calendar,
  Check,
  MapPin,
  Quote,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

interface Sertifisering {
  kode: string;
  navn: string;
  ar: string;
}

const SERTIFISERINGER: Sertifisering[] = [
  { kode: "PGA", navn: "PGA Class A Professional", ar: "2018" },
  { kode: "NGF", navn: "NGF Trener 3 — Eliteutvikling", ar: "2020" },
  { kode: "TPI", navn: "TPI Certified — Level 2 (Golf + Power)", ar: "2021" },
  { kode: "MORAD", navn: "MORAD-instruktør (Mac O'Grady)", ar: "2023" },
];

const SPESIALITETER = [
  "Scoring innenfor 100 meter",
  "Mental tilnærming under press",
  "Junior- og elite-utvikling",
  "TrackMan-analyse og long game",
  "Sesongplanlegging og periodisering",
];

interface Testimonial {
  tekst: string;
  navn: string;
  rolle: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    tekst:
      "Anders snur ikke bare swingen — han snur måten jeg tenker på under runden. Mitt hcp gikk fra 11 til 6 på halvannen sesong.",
    navn: "Markus Roinås Pedersen",
    rolle: "Junior · WANG Toppidrett · hcp 6",
  },
  {
    tekst:
      "Tålmodig, målrettet og ærlig. Datteren min på 11 år gledet seg til hver eneste time gjennom hele vinteren.",
    navn: "Lena Berg",
    rolle: "Forelder · Mulligan Indoor Borre",
  },
  {
    tekst:
      "Endelig en coach som ser hele bildet — teknikk, kropp, hode. Jeg spilte mitt beste år som senior etter ett semester med Anders.",
    navn: "Petter Solli",
    rolle: "Voksen amatør · hcp 4",
  },
];

interface DaySlot {
  time: string;
  busy?: boolean;
}

interface Day {
  wd: string;
  d: string;
  today?: boolean;
  slots: DaySlot[];
}

const WEEK: Day[] = [
  {
    wd: "Man",
    d: "11",
    today: true,
    slots: [
      { time: "08:00" },
      { time: "14:00" },
      { time: "15:00", busy: true },
    ],
  },
  {
    wd: "Tirs",
    d: "12",
    slots: [{ time: "09:00" }, { time: "10:00" }, { time: "14:00" }],
  },
  {
    wd: "Ons",
    d: "13",
    slots: [{ time: "11:00" }, { time: "14:00", busy: true }],
  },
  { wd: "Tors", d: "14", slots: [] },
  {
    wd: "Fre",
    d: "15",
    slots: [{ time: "08:00" }, { time: "10:00" }, { time: "13:00" }],
  },
];

export default function AkgolfCoachProfilDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[420px_1fr]">
            {/* Foto-placeholder */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary to-muted">
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid h-40 w-40 place-items-center rounded-full bg-primary/10 font-mono text-[56px] font-bold text-primary">
                  AK
                </div>
              </div>
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[11px] font-medium">
                  Ledig denne uka
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col justify-center">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                PGA Class A · Hovedcoach · Mulligan Indoor Borre
              </div>
              <h1 className="mt-4 font-display text-[56px] font-medium leading-[1.05] tracking-tight">
                Anders{" "}
                <em className="italic text-primary">Kristiansen</em>
              </h1>
              <p className="mt-6 max-w-2xl text-[16px] leading-[1.7]">
                Jeg har coachet golfere på alle nivåer i 8 år — fra første
                ballen treffes til kvalifisering for norgesfinale. Spesialiserer
                meg på scoring-spill, mental tilnærming under press, og hele
                spillerutviklingen sett i sammenheng.
              </p>
              <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-muted-foreground">
                MORAD-trent (Mac O&apos;Grady) og PGA Class A. Jeg tror på data,
                men enda mer på følelse. Tar imot alle aldre — junior fra 8 år
                til senior, hcp 36 til scratch.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/booking-coach-detalj-demo"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-medium text-primary-foreground hover:opacity-90"
                >
                  Book økt med Anders
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
                <a
                  href="/akgolf-coacher-demo"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-[14px] font-medium hover:border-primary"
                >
                  Andre coacher
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistikk */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-8 py-12 md:grid-cols-4">
          <Stat
            icon={<Users className="h-5 w-5" strokeWidth={1.5} />}
            tall="200+"
            label="Elever siden 2018"
          />
          <Stat
            icon={<Star className="h-5 w-5" strokeWidth={1.5} />}
            tall="4,9"
            label="Snitt av 142 anmeldelser"
          />
          <Stat
            icon={<Award className="h-5 w-5" strokeWidth={1.5} />}
            tall="8 år"
            label="PGA-erfaring"
          />
          <Stat
            icon={<TrendingUp className="h-5 w-5" strokeWidth={1.5} />}
            tall="−4,2"
            label="Snitt hcp-reduksjon per sesong"
          />
        </div>
      </section>

      {/* CV + spesialitet */}
      <section className="mx-auto max-w-7xl px-8 py-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[32px] font-medium tracking-tight">
              <em className="italic">Sertifiseringer</em> og CV
            </h2>
            <p className="mt-3 text-[14px] text-muted-foreground">
              Formell utdanning og kontinuerlig videreutvikling.
            </p>

            <ul className="mt-8 space-y-3">
              {SERTIFISERINGER.map((s) => (
                <li
                  key={s.kode}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-[12px] font-bold text-primary">
                    {s.kode}
                  </span>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium">{s.navn}</div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      Sertifisert {s.ar}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-[32px] font-medium tracking-tight">
              <em className="italic">Spesialitet</em>
            </h2>
            <p className="mt-3 text-[14px] text-muted-foreground">
              Det jeg er sterkest på, og hva du kan forvente.
            </p>

            <ul className="mt-8 space-y-4">
              {SPESIALITETER.map((s) => (
                <li key={s} className="flex items-start gap-3 text-[15px]">
                  <span className="mt-1 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3 w-3" strokeWidth={2} />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="mb-12 max-w-2xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Anbefalinger
            </div>
            <h2 className="mt-4 font-display text-[40px] font-medium leading-tight tracking-tight">
              Det <em className="italic">elever sier</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.navn}
                className="flex flex-col rounded-2xl border border-border bg-card p-6"
              >
                <Quote
                  className="h-6 w-6 text-primary"
                  strokeWidth={1.5}
                />
                <blockquote className="mt-4 flex-1 font-display text-[18px] italic leading-[1.5]">
                  &ldquo;{t.tekst}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <div className="text-[14px] font-medium">{t.navn}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {t.rolle}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Kalender-snippet */}
      <section className="mx-auto max-w-7xl px-8 py-16">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Ledige tider · uke 19 · mai 2026
              </div>
              <h2 className="mt-3 font-display text-[28px] font-medium tracking-tight">
                Book direkte i kalenderen
              </h2>
            </div>
            <a
              href="/booking-coach-detalj-demo"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-primary hover:underline"
            >
              <Calendar className="h-4 w-4" strokeWidth={1.5} />
              Se hele kalenderen
            </a>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {WEEK.map((day) => (
              <div
                key={day.d}
                className="flex min-h-[200px] flex-col gap-2 rounded-xl bg-secondary/50 p-4"
              >
                <div className="border-b border-border pb-3 text-center">
                  <div
                    className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
                      day.today ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {day.wd}
                  </div>
                  <div
                    className={`mt-1 font-display text-[24px] italic leading-tight ${
                      day.today ? "text-primary" : ""
                    }`}
                  >
                    {day.d}
                  </div>
                </div>
                {day.slots.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    Ingen tider
                  </div>
                ) : (
                  day.slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={slot.busy}
                      className={`grid h-9 place-items-center rounded-md border font-mono text-[12px] transition-colors ${
                        slot.busy
                          ? "cursor-not-allowed border-dashed border-border text-muted-foreground line-through"
                          : "border-border bg-card hover:border-primary hover:text-primary"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA-stripe */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-8 py-12">
          <div className="max-w-xl">
            <h2 className="font-display text-[32px] font-medium leading-tight">
              Klar for første <em className="italic">økt</em>?
            </h2>
            <p className="mt-2 text-[14px] opacity-80">
              Mulligan Indoor Borre · 1 500 kr / time · 60 minutter med
              TrackMan og videoanalyse.
            </p>
          </div>
          <a
            href="/booking-coach-detalj-demo"
            className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-[14px] font-medium text-primary hover:opacity-90"
          >
            Book økt nå
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({
  icon,
  tall,
  label,
}: {
  icon: React.ReactNode;
  tall: string;
  label: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-primary">{icon}</div>
      <div className="mt-3 font-mono text-[36px] font-medium leading-none tabular">
        {tall}
      </div>
      <div className="mt-2 text-[12px] text-muted-foreground">{label}</div>
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
          <a href="/akgolf-coacher-demo" className="font-medium text-primary">
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
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
            akgolf.no
          </span>
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
