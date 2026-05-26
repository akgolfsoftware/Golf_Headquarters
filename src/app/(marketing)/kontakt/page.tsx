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
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const metadata: Metadata = {
  title: "Kontakt — AK Golf Academy",
  description:
    "Ta kontakt med AK Golf Academy. Personlig coaching, booking og spørsmål — vi svarer som regel samme dag.",
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
    a: "Vi svarer på alle henvendelser innen 1 virkedag, ofte samme dag. Coaching-forespørsler prioriteres.",
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
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-20">
          <AthleticEyebrow>Kontakt</AthleticEyebrow>
          <h1 className="mt-4 max-w-4xl font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Vi vil gjerne{" "}
            <em className="font-display font-normal italic text-primary">
              høre fra deg.
            </em>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
            Spørsmål om coaching, junior-program eller bedriftsevent? Skriv noen
            ord under, eller ring oss direkte. Vi svarer innen 24 timer.
          </p>
        </div>
      </section>

      {/* Skjema + sidebar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 md:p-10">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
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

          <aside className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                Foretrekker du å ringe?
              </h3>
              <p className="mt-4 text-[14px] leading-[1.6] text-muted-foreground">
                Ring eller send en SMS — du kan også booke direkte på akgolf.no.
              </p>
              <div className="mt-8 space-y-4">
                <Quick label="Anders Kristiansen" value="+47 482 16 540" />
                <Quick label="Bedriftshenvendelser" value="bedrift@akgolf.no" />
                <Quick label="E-post · alt annet" value="post@akgolf.no" />
              </div>
            </div>

            <div className="rounded-2xl bg-primary p-6 sm:p-8 text-primary-foreground">
              <AthleticEyebrow tone="light">Tips</AthleticEyebrow>
              <p className="mt-4 font-display text-xl font-semibold leading-[1.3] tracking-tight">
                Vil du heller bare booke en{" "}
                <em className="font-display font-normal italic">prøve-time</em>?
              </p>
              <Link
                href="/booking"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-4 text-[14px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Book direkte
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* 3 kontakt-kort */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl">
          <AthleticEyebrow>Kontaktinfo</AthleticEyebrow>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Tre måter å nå oss på
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <InfoCard
            Icon={Mail}
            label="E-post"
            value="post@akgolf.no"
            note="Vi svarer innen 24 timer."
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

      {/* Åpningstider */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 py-12 sm:py-16 md:py-24 md:grid-cols-2">
          <div>
            <AthleticEyebrow>Åpningstider</AthleticEyebrow>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Når kan du{" "}
              <em className="font-display font-normal italic text-primary">
                komme?
              </em>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-[1.6] text-muted-foreground">
              Mulligan Indoor Golf er åpent 07–00 alle dager i Fredrikstad og
              Sarpsborg. Coaching-timer må bookes innenfor coachenes arbeidstid.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-[13px] text-foreground">
              <Clock className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <span>Helligdager: se oppdatert info i appen</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-background">
            <table className="w-full min-w-[480px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Dag
                  </th>
                  <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Coaching
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
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

      {/* Kart-stub */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="max-w-3xl">
          <AthleticEyebrow>Anlegg</AthleticEyebrow>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Finn frem til oss
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.6] text-muted-foreground">
            Vi holder til på tre anlegg — Mulligan Indoor Golf i Fredrikstad og
            Sarpsborg for innendørs trening hele året, og Gamle Fredrikstad
            Golfklubb for utendørs sesong.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
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

      {/* FAQ */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="max-w-3xl">
            <AthleticEyebrow>FAQ</AthleticEyebrow>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Korte svar på{" "}
              <em className="font-display font-normal italic text-primary">
                vanlige spørsmål
              </em>
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {FAQ.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-border bg-background p-8"
              >
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {f.q}
                </h3>
                <p className="mt-4 text-[14px] leading-[1.6] text-muted-foreground">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Quick({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-border pt-4 first:border-t-0 first:pt-0">
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
      <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-foreground">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <AthleticEyebrow className="mt-6">{label}</AthleticEyebrow>
      <span className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </span>
      <span className="mt-4 text-[13px] text-muted-foreground">{note}</span>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        className="flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-8 transition-colors hover:border-foreground/30"
      >
        {Body}
      </a>
    );
  }
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-8">
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
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div
        aria-hidden
        className="relative grid h-56 place-items-center bg-primary"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.18) 0%, transparent 25%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.18) 0%, transparent 30%)",
          }}
        />
        <span className="relative grid h-16 w-16 place-items-center rounded-full bg-background/95 text-foreground shadow-lg">
          <MapPin className="h-6 w-6 text-primary" strokeWidth={1.75} />
        </span>
      </div>
      <div className="p-8">
        <h3 className="font-display text-2xl font-semibold tracking-tight">
          {place}
        </h3>
        <p className="mt-4 text-[15px] text-muted-foreground">{address}</p>
        <p className="mt-2 text-[13px] text-muted-foreground">{note}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Navigation className="h-4 w-4" strokeWidth={1.75} />
          Vis i kart
        </a>
      </div>
    </article>
  );
}
