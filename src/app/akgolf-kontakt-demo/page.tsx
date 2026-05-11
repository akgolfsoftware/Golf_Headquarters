/**
 * Marketing-demo — Kontakt
 * Server component. Tailwind v4 + semantiske tokens.
 *
 * Skjema-feltene er rene stubs (ingen onChange / Server Action) — server-component-vennlig.
 */
import {
  ArrowRight,
  Clock,
  MapPin,
  Navigation,
  Send,
} from "lucide-react";
import {
  MarketingContactBlocks,
  MarketingFooter,
  MarketingNav,
} from "../_marketing-demo/chrome";

export default function AkgolfKontaktDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav active="Kontakt" />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Kontakt
          </span>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Vi vil gjerne{" "}
            <em className="font-normal italic text-primary [font-family:var(--font-instrument-serif),Georgia,serif]">
              høre fra deg.
            </em>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
            Spørsmål om coaching, junior-program eller bedriftsevent? Skriv noen
            ord under, eller ring oss direkte. Vi svarer innen 24 timer.
          </p>
        </div>
      </section>

      {/* Skjema + kontaktblokker */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr] lg:gap-16">
          {/* Form */}
          <form
            className="rounded-2xl border border-border bg-card p-8 md:p-10"
            action="#"
            method="post"
          >
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Send oss en melding
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-muted-foreground">
              Vi leser hver melding personlig. Ingen automat-svar, ingen ventelister.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                id="name"
                label="Navn"
                placeholder="Fornavn og etternavn"
                required
              />
              <Field
                id="email"
                label="E-post"
                type="email"
                placeholder="navn@epost.no"
                required
              />
            </div>

            <div className="mt-4">
              <Field
                id="phone"
                label="Telefon (valgfritt)"
                type="tel"
                placeholder="+47 ..."
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="topic"
                className="block font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
              >
                Hva gjelder det?
              </label>
              <select
                id="topic"
                name="topic"
                defaultValue="coaching"
                className="mt-2 block w-full rounded-md border border-input bg-background px-4 py-3 text-[14px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="coaching">1:1 Coaching</option>
                <option value="junior">Junior-akademi</option>
                <option value="trackman">Trackman-sesjon</option>
                <option value="gruppe">Gruppetrening</option>
                <option value="bedrift">Bedriftsevent</option>
                <option value="annet">Noe annet</option>
              </select>
            </div>

            <div className="mt-4">
              <label
                htmlFor="message"
                className="block font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
              >
                Melding <span className="text-destructive">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="Fortell oss litt om hva du ser etter — handicap, mål, eller bare en hilsen."
                className="mt-2 block w-full resize-y rounded-md border border-input bg-background px-4 py-3 text-[14px] leading-[1.6] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <input
                id="consent"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring/40"
                required
              />
              <label
                htmlFor="consent"
                className="text-[13px] text-muted-foreground"
              >
                Jeg samtykker til at AK Golf lagrer informasjonen min for å
                kunne svare på henvendelsen.
              </label>
            </div>

            <button
              type="submit"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
              Send melding
            </button>
          </form>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                Foretrekker du å ringe?
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
                Ring eller send en SMS — du kan også booke direkte på akgolf.no.
              </p>
              <div className="mt-6 space-y-4">
                <Quick label="Anders Kristiansen" value="+47 482 16 540" />
                <Quick label="Sara Pedersen · junior" value="+47 481 22 110" />
                <Quick label="Bedriftshenvendelser" value="bedrift@akgolf.no" />
              </div>
            </div>

            <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] opacity-80">
                Tips
              </span>
              <p className="mt-3 font-display text-xl font-semibold leading-[1.3] tracking-tight">
                Vil du heller bare booke en{" "}
                <em className="font-normal italic [font-family:var(--font-instrument-serif),Georgia,serif]">
                  prøve-time
                </em>
                ?
              </p>
              <a
                href="#"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[14px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Book direkte
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* 3 kontakt-kort */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="max-w-3xl">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Kontaktinfo
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Tre måter å nå oss på
          </h2>
        </div>
        <div className="mt-10">
          <MarketingContactBlocks />
        </div>
      </section>

      {/* Åpningstider */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-2">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Åpningstider
            </span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Når kan du{" "}
              <em className="font-normal italic [font-family:var(--font-instrument-serif),Georgia,serif]">
                komme?
              </em>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-[1.6] text-muted-foreground">
              Mulligan Borre er åpent med medlemskort 06–24 hele uka. Coaching-timer
              må bookes innenfor coachenes arbeidstid.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-[13px] text-foreground">
              <Clock className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <span>Helligdager: se oppdatert info i appen</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Dag
                  </th>
                  <th className="px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Coaching
                  </th>
                  <th className="px-6 py-3 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Mulligan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <HoursRow day="Mandag" coaching="09–20" mulligan="06–24" />
                <HoursRow day="Tirsdag" coaching="09–20" mulligan="06–24" />
                <HoursRow day="Onsdag" coaching="09–20" mulligan="06–24" />
                <HoursRow day="Torsdag" coaching="09–20" mulligan="06–24" />
                <HoursRow day="Fredag" coaching="09–17" mulligan="06–24" />
                <HoursRow day="Lørdag" coaching="10–14" mulligan="08–22" />
                <HoursRow day="Søndag" coaching="Stengt" mulligan="08–22" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Kart-placeholder */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Anlegg
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Finn frem til oss
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.6] text-muted-foreground">
            Vi holder til på to anlegg — Mulligan Indoor på Borre for innendørs
            trening, og GFGK Bossum for utendørs sesong.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <MapCard
            place="Mulligan Indoor Borre"
            address="Borreveien 12, 3186 Horten"
            note="Innendørs · Trackman 4 · Åpent 06–24"
          />
          <MapCard
            place="GFGK Bossum"
            address="Bossumveien 200, 1638 Gamle Fredrikstad"
            note="Utendørs · Mai–oktober · 18 hull"
          />
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  required = false,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
      >
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-2 block w-full rounded-md border border-input bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
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

function HoursRow({
  day,
  coaching,
  mulligan,
}: {
  day: string;
  coaching: string;
  mulligan: string;
}) {
  const closed = coaching === "Stengt";
  return (
    <tr>
      <td className="px-6 py-3 font-medium text-foreground">{day}</td>
      <td
        className={`px-6 py-3 font-mono tabular-nums ${
          closed ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {coaching}
      </td>
      <td className="px-6 py-3 text-right font-mono tabular-nums text-foreground">
        {mulligan}
      </td>
    </tr>
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
        className="relative grid h-56 place-items-center"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 65%, hsl(var(--accent)) 130%)",
        }}
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
        <p className="mt-3 text-[15px] text-muted-foreground">{address}</p>
        <p className="mt-2 text-[13px] text-muted-foreground">{note}</p>
        <a
          href="#"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Navigation className="h-3.5 w-3.5" strokeWidth={1.75} />
          Vis i kart
        </a>
      </div>
    </article>
  );
}
