import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  Clock,
  Mail,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { KontaktForm } from "./form";

export const metadata: Metadata = {
  title: "Kontakt AK Golf Academy",
  description:
    "Ta kontakt med AK Golf Academy. Personlig coaching, booking og spørsmål. Vi svarer innen 1 virkedag.",
};

type Hours = { day: string; coaching: string; mulligan: string };

const HOURS: Hours[] = [
  { day: "Mandag", coaching: "09–20", mulligan: "07–00" },
  { day: "Tirsdag", coaching: "09–20", mulligan: "07–00" },
  { day: "Onsdag", coaching: "09–20", mulligan: "07–00" },
  { day: "Torsdag", coaching: "09–20", mulligan: "07–00" },
  { day: "Fredag", coaching: "09–17", mulligan: "07–00" },
  { day: "Lørdag", coaching: "10–14", mulligan: "07–00" },
  { day: "Søndag", coaching: "Stengt", mulligan: "07–00" },
];

const FAQ = [
  {
    q: "Hvor raskt får jeg svar?",
    a: "Vi svarer på alle henvendelser innen 1 virkedag. Coaching-forespørsler prioriteres.",
  },
  {
    q: "Trenger jeg medlemskap for å booke?",
    a: "Nei. Du kan booke enkelttimer eller en gratis kartleggings-økt uten medlemskap. Abonnement gir bedre pris per time.",
  },
  {
    q: "Hvor holder dere til?",
    a: "Innendørs på Mulligan Indoor Golf i Fredrikstad og Sarpsborg, og utendørs på Gamle Fredrikstad Golfklubb fra mai til oktober.",
  },
  {
    q: "Tar dere bedriftsevent?",
    a: "Ja. Send oss en melding med dato og antall deltakere, så lager vi et tilpasset opplegg.",
  },
];

export default function KontaktSide() {
  return (
    <div className="bg-background text-foreground">
      {/* ========== HERO ========== */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(168 72% 11%) 60%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[120px] right-[-80px] h-[420px] w-[420px] rounded-full bg-accent opacity-[0.10] blur-[6px]"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-16 md:px-8 md:pb-20 md:pt-24">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Kontakt
          </span>
          <h1 className="mt-4 max-w-[16ch] text-balance font-display text-[clamp(44px,6vw,80px)] font-semibold leading-[0.98] tracking-[-0.03em]">
            Vi vil gjerne{" "}
            <em className="font-display font-normal italic text-accent">
              høre fra deg
            </em>
            .
          </h1>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.55] text-white/70">
            Spørsmål om coaching, junior-program eller bedriftsevent? Skriv noen
            ord under, eller ring oss direkte. Vi svarer innen 1 virkedag.
          </p>
        </div>
      </section>

      {/* ========== SKJEMA + SIDEBAR ========== */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div className="rounded-[20px] border border-border bg-card p-6 sm:p-8 md:p-10">
            <SectionEyebrow>Skjema · Svar innen 1 virkedag</SectionEyebrow>
            <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em]">
              Send oss en melding
            </h2>
            <p className="mt-4 text-[15px] leading-[1.6] text-muted-foreground">
              Vi leser hver melding personlig. Ingen automat-svar, ingen
              ventelister.
            </p>
            <div className="mt-8">
              <KontaktForm />
            </div>
          </div>

          <aside className="space-y-4">
            <div>
              <h3 className="font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em]">
                Om <Em>AK Golf</Em>
              </h3>
              <p className="mt-3 text-[15px] leading-[1.65] text-muted-foreground">
                AK Golf Academy driver datadrevet coaching innendørs hos
                Mulligan Indoor Golf og utendørs på Gamle Fredrikstad
                Golfklubb. Vi hjelper spillere fra nybegynner til elite-nivå.
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-card p-6 sm:p-8">
              <h3 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.015em]">
                Foretrekker du å ringe?
              </h3>
              <p className="mt-3 text-sm leading-[1.55] text-muted-foreground">
                Ring eller send en SMS. Du kan også booke direkte på akgolf.no.
              </p>
              <div className="mt-6">
                <Quick label="Anders Kristiansen" value="+47 482 16 540" first />
                <Quick label="Bedriftshenvendelser" value="post@akgolf.no" />
                <Quick label="E-post · alt annet" value="post@akgolf.no" />
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-[20px] p-6 text-white sm:p-8"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(168 72% 11%) 100%)",
              }}
            >
              <div
                aria-hidden
                className="absolute -top-[80px] right-[-60px] h-[260px] w-[260px] rounded-full bg-accent opacity-[0.12] blur-[4px]"
              />
              <span className="relative z-10 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                Tips
              </span>
              <p className="relative z-10 mt-3 max-w-[24ch] font-display text-[22px] font-bold leading-[1.2] tracking-[-0.015em]">
                Vil du heller bare booke en{" "}
                <em className="font-normal italic text-accent">prøve-time</em>?
              </p>
              <Link
                href="/booking"
                className="relative z-10 mt-6 inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-accent px-5 font-display text-sm font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Book direkte
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ========== 3 KONTAKT-KORT ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <SectionEyebrow>Kontaktinfo</SectionEyebrow>
        <SectionH2>
          Tre måter å <Em>nå oss</Em> på.
        </SectionH2>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoCard
            Icon={Mail}
            label="E-post"
            value="post@akgolf.no"
            note="Vi svarer innen 1 virkedag."
            href="mailto:post@akgolf.no"
          />
          <InfoCard
            Icon={Phone}
            label="Telefon"
            value="+47 482 16 540"
            note="Anders Kristiansen · hverdager 09–17"
            href="tel:+4748216540"
          />
          <InfoCard
            Icon={Building2}
            label="Selskap"
            value="AK Golf Group AS"
            note="Org.nr 927 248 581 · Fredrikstad"
          />
        </div>
      </section>

      {/* ========== ÅPNINGSTIDER · hairline-strip ========== */}
      <section>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-24 md:grid-cols-2 md:px-8">
          <div>
            <SectionEyebrow>Åpningstider</SectionEyebrow>
            <SectionH2>
              Når kan du <Em>komme</Em>?
            </SectionH2>
            <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.6] text-muted-foreground">
              Mulligan Indoor Golf er åpent 07–00 alle dager i Fredrikstad og
              Sarpsborg. Coaching-timer må bookes innenfor coachenes arbeidstid.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] text-foreground">
              <Clock className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <span>Helligdager: se oppdatert info i appen</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-border bg-card">
            <table className="w-full min-w-[480px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Dag
                  </th>
                  <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Coaching
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Mulligan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HOURS.map((h) => {
                  const closed = h.coaching === "Stengt";
                  return (
                    <tr key={h.day}>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {h.day}
                      </td>
                      <td
                        className={`px-6 py-4 font-mono tabular-nums ${
                          closed ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {h.coaching}
                      </td>
                      <td className="px-6 py-4 text-right font-mono tabular-nums text-foreground">
                        {h.mulligan}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========== KART ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <SectionEyebrow>Anlegg · Øst</SectionEyebrow>
        <SectionH2>
          Finn <Em>frem</Em> til oss.
        </SectionH2>
        <p className="mt-4 max-w-[56ch] text-[15px] leading-[1.6] text-muted-foreground">
          Vi holder til på tre anlegg: Mulligan Indoor Golf i Fredrikstad og
          Sarpsborg for innendørs trening hele året, og Gamle Fredrikstad
          Golfklubb for utendørs sesong.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MapCard
            place="Mulligan Indoor Golf Fredrikstad"
            address="Produksjonsveien 21, 1618 Fredrikstad"
            note="Innendørs · 4× TrackMan 4 · Åpent 07–00"
          />
          <MapCard
            place="Mulligan Indoor Golf Sarpsborg"
            address="Bjørnstadveien 12, 1712 Sarpsborg"
            note="Innendørs · 2× TrackMan iO · Åpent 07–00"
          />
          <MapCard
            place="Gamle Fredrikstad Golfklubb"
            address="Torsnesveien 16, 1630 Gamle Fredrikstad"
            note="Utendørs · Mai–oktober · 18 hull"
          />
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section>
        <div className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <SectionH2>
            Korte svar på <Em>vanlige spørsmål</Em>.
          </SectionH2>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {FAQ.map((f) => (
              <div
                key={f.q}
                className="rounded-[20px] border border-border bg-card p-8"
              >
                <h3 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.015em]">
                  {f.q}
                </h3>
                <p className="mt-3 text-sm leading-[1.6] text-muted-foreground">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CLOSING CTA ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-16 text-center text-white sm:px-12 lg:px-16 lg:py-20"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(168 72% 11%) 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute -top-[120px] left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent opacity-[0.12] blur-[4px]"
          />
          <span className="relative z-10 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Klar når du er
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Heller bare <Em dark>komme i gang</Em>?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Du trenger ikke vente på svar. Book en økt direkte, eller send oss
            en e-post om du vil ta det skriftlig først.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Book en økt
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
            <a
              href="mailto:post@akgolf.no"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-xl px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-secondary ring-1 ring-inset ring-secondary/45 transition hover:bg-secondary/10 hover:ring-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Send oss en e-post
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Seksjonsbyggesteiner (samme anatomi som forsiden) ---------- */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </span>
  );
}

function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-4 max-w-[22ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
      {children}
    </h2>
  );
}

function Em({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <em
      className={`font-display font-normal italic ${dark ? "text-accent" : "text-primary"}`}
    >
      {children}
    </em>
  );
}

function Quick({
  label,
  value,
  first = false,
}: {
  label: string;
  value: string;
  first?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-baseline justify-between gap-2 py-3 ${
        first ? "" : "border-t border-border"
      }`}
    >
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[14px] font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

function InfoCard({
  Icon,
  label,
  value,
  note,
  href,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  note: string;
  href?: string;
}) {
  const Body = (
    <>
      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        {label}
      </span>
      <span className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.015em] text-foreground">
        {value}
      </span>
      <span className="text-sm leading-[1.55] text-muted-foreground">
        {note}
      </span>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-7 transition hover:-translate-y-px hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {Body}
      </a>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-7">
      {Body}
    </div>
  );
}

function MapCard({
  place,
  address,
  note,
}: {
  place: string;
  address: string;
  note: string;
}) {
  return (
    <article className="overflow-hidden rounded-[20px] border border-border bg-card">
      <div
        aria-hidden
        className="relative grid h-48 place-items-center bg-primary"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 35%, hsl(var(--accent) / 0.16) 0%, transparent 32%), linear-gradient(180deg, transparent 55%, hsl(var(--foreground) / 0.35) 100%)",
          }}
        />
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-background/95 shadow-lg">
          <MapPin className="h-6 w-6 text-primary" strokeWidth={1.5} />
        </span>
      </div>
      <div className="flex flex-col gap-3 p-7">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          {note}
        </span>
        <h3 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.015em]">
          {place}
        </h3>
        <p className="text-sm leading-[1.55] text-muted-foreground">
          {address}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex h-10 w-fit items-center gap-2 rounded-xl px-4 font-display text-[13px] font-semibold tracking-[-0.005em] text-primary ring-1 ring-inset ring-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Navigation className="h-4 w-4" strokeWidth={1.5} />
          Vis i kart
        </a>
      </div>
    </article>
  );
}
