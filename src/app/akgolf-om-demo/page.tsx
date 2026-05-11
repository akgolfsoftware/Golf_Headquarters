/**
 * Marketing-demo — Om AK Golf Group
 * Server component. Tailwind v4 + semantiske tokens.
 */
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CircleDot,
  Compass,
  Handshake,
  Heart,
  Mail,
  Target,
} from "lucide-react";
import { MarketingFooter, MarketingNav } from "../_marketing-demo/chrome";

export default function AkgolfOmDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav active="Om" />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(50% 50% at 30% 0%, rgba(0,88,64,0.10) 0%, rgba(0,88,64,0) 60%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-20 md:pt-28 md:pb-28">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Om AK Golf Group
              </span>
              <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
                Vi bygger spillere som{" "}
                <em className="font-normal italic text-primary [font-family:var(--font-instrument-serif),Georgia,serif]">
                  varer.
                </em>
              </h1>
              <p className="mt-6 max-w-xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
                AK Golf Group er ikke en treningsserie — det er et utviklings-økosystem
                for golfere som vil mer enn å bare ha det gøy en time i uka.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="/akgolf-kontakt-demo"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Snakk med oss
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div
                aria-hidden
                className="grid aspect-[4/5] place-items-center overflow-hidden rounded-2xl"
                style={{
                  background:
                    "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 55%, hsl(var(--accent)) 100%)",
                }}
              >
                <div className="text-center text-primary-foreground/95">
                  <div className="font-display text-[110px] font-semibold leading-none">
                    AK
                  </div>
                  <div className="mt-2 font-mono text-[12px] uppercase tracking-[0.25em]">
                    Est. 2018 · Fredrikstad
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 w-44 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="font-display text-3xl font-semibold tabular-nums">
                  200+
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  Aktive spillere
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission statement */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
            Vår misjon
          </div>
          <p className="mt-8 font-display text-3xl font-medium leading-[1.3] tracking-tight md:text-5xl md:leading-[1.2]">
            Vi vil at flere skal{" "}
            <em className="font-normal italic text-primary [font-family:var(--font-instrument-serif),Georgia,serif]">
              elske
            </em>{" "}
            golf, og at de som elsker den{" "}
            <em className="font-normal italic text-primary [font-family:var(--font-instrument-serif),Georgia,serif]">
              skal bli bedre på den.
            </em>
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-[16px] leading-[1.7] text-muted-foreground md:text-[18px]">
            Vi tror ikke på 90-minutters timer som glemmes dagen etter. Vi tror på
            periodisering, måling, og at hver spiller fortjener en plan som er bygget
            for dem — ikke for et magasin.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
              Teamet
            </div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Folkene bak hver økt
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground md:text-[18px]">
              Tre coacher med klare roller. Ingen overlapp, ingen forvirring — du
              vet alltid hvem som har ansvar for hva.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <TeamCard
              initials="AK"
              name="Anders Kristiansen"
              role="Founder · Head Coach"
              cred="PGA Class A Pro · 8 år"
              bio="Sertifisert PGA-pro med Trackman Master-status. Tidligere trener for WANG Toppidrett. Jobber med elite-juniorer og voksne ambisjons-spillere."
              tags={["1:1 Coaching", "Trackman", "Junior elite"]}
            />
            <TeamCard
              initials="SP"
              name="Sara Pedersen"
              role="Junior Coach · Akademi-ansvarlig"
              cred="PGA Trainee · 5 år"
              bio="Driver junior-akademiet med pyramide-modellen. Tidligere konkurransespiller på toppnivå, nå spesialist på utvikling 8–16 år."
              tags={["Junior 8–14", "Gruppetrening", "Foreldre-dialog"]}
              featured
            />
            <TeamCard
              initials="TA"
              name="Tom Andresen"
              role="Fitness · Performance Coach"
              cred="Cand.scient. idrett · NIH"
              bio="Idrettsfysiolog med fokus på golf-spesifikk styrke og rotasjon. Bygger fysisk fundament for både junior- og senior-spillere."
              tags={["Fysisk fundament", "Skadeforebygging", "Tester"]}
            />
          </div>
        </div>
      </section>

      {/* Historie / tidslinje */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[1fr_2fr] md:gap-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
              Historikk
            </div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              <em className="font-normal italic [font-family:var(--font-instrument-serif),Georgia,serif]">
                Åtte år
              </em>{" "}
              fra første time
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground">
              Fra én pro med en TaylorMade-bag og en idé, til et team med to anlegg,
              200+ aktive spillere og et partnerskap med Norges fremste toppidrettsskole.
            </p>
          </div>

          <ol className="relative border-l border-border">
            <TimelineRow
              year="2018"
              title="AK Golf Academy startet"
              text="Anders Kristiansen starter solo, med utgangspunkt i drivingrange og en mobil Trackman."
            />
            <TimelineRow
              year="2021"
              title="Partnerskap med GFGK Bossum"
              text="Inngår hovedcoach-avtale med Gamle Fredrikstad Golfklubb. Hjemmebane for utendørs sesong."
            />
            <TimelineRow
              year="2023"
              title="Mulligan Indoor åpner i Borre"
              text="Tre Trackman 4-simulatorer og lounge — innendørs trening blir mulig 12 måneder i året."
            />
            <TimelineRow
              year="2024"
              title="WANG Toppidrett-partnerskap"
              text="AK Golf blir leverandør av all golf-coaching for WANG-elevene i Fredrikstad."
            />
            <TimelineRow
              year="2026"
              title="AK Golf HQ-plattformen"
              text="Lanseringer egen digital plattform — booking, treningsplaner og spillerportal."
              last
            />
          </ol>
        </div>
      </section>

      {/* Verdier */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
            Verdiene våre
          </div>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Fire ting vi ikke kompromisser på
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ValueCard
            Icon={Target}
            title="Målbart"
            text="Hvis vi ikke kan måle det, kan vi heller ikke love det. Hver spiller har KPI-er og en plan som henger sammen."
          />
          <ValueCard
            Icon={Heart}
            title="Helhetlig"
            text="Fysisk fundament, teknikk, slag, banespill og turnerings-puls — alle fem lagene i pyramiden, alltid."
          />
          <ValueCard
            Icon={Compass}
            title="Langsiktig"
            text="Vi planlegger i sesonger, ikke i timer. Mål neste sesong, mål neste fem år — så jobber vi bakover."
          />
          <ValueCard
            Icon={Handshake}
            title="Ærlig"
            text="Vi sier ifra hvis du ikke er klar for en turnering, en handicap-justering eller en plan-endring."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card p-10 md:flex-row md:items-center md:p-16">
          <div>
            <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Vil du snakke med en coach?
            </h3>
            <p className="mt-3 max-w-xl text-[16px] leading-[1.6] text-muted-foreground">
              Vi tar oss alltid 20 minutter til en uforpliktende samtale før du
              bestemmer deg for noe.
            </p>
          </div>
          <Link
            href="/akgolf-kontakt-demo"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Mail className="h-4 w-4" strokeWidth={2} />
            Ta kontakt
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function TeamCard({
  initials,
  name,
  role,
  cred,
  bio,
  tags,
  featured = false,
}: {
  initials: string;
  name: string;
  role: string;
  cred: string;
  bio: string;
  tags: string[];
  featured?: boolean;
}) {
  return (
    <article
      className={`flex flex-col rounded-2xl border bg-background p-8 ${
        featured ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className="grid h-16 w-16 place-items-center rounded-full text-primary-foreground"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 60%, hsl(var(--accent)) 130%)",
          }}
        >
          <span className="font-display text-[20px] font-semibold">
            {initials}
          </span>
        </span>
        <div>
          <h3 className="font-display text-xl font-semibold tracking-tight">
            {name}
          </h3>
          <p className="text-[13px] text-muted-foreground">{role}</p>
        </div>
      </div>
      <p className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        <Award className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
        {cred}
      </p>
      <p className="mt-4 flex-1 text-[15px] leading-[1.6] text-muted-foreground">
        {bio}
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {tags.map((t) => (
          <li
            key={t}
            className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[12px] font-medium text-foreground"
          >
            {t}
          </li>
        ))}
      </ul>
    </article>
  );
}

function TimelineRow({
  year,
  title,
  text,
  last = false,
}: {
  year: string;
  title: string;
  text: string;
  last?: boolean;
}) {
  return (
    <li className={`ml-6 ${last ? "pb-0" : "pb-10"}`}>
      <span className="absolute -left-2 grid h-4 w-4 place-items-center rounded-full bg-primary ring-4 ring-background">
        <span className="block h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.10em] text-primary">
        {year}
      </div>
      <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">
        {text}
      </p>
    </li>
  );
}

function ValueCard({
  Icon,
  title,
  text,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-foreground">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
        {text}
      </p>
      <span className="mt-6 inline-flex items-center gap-1 text-[13px] font-medium text-primary">
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        Mer om dette
      </span>
    </div>
  );
}
