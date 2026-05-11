/**
 * Marketing-demo — Priser
 * Server component. Tailwind v4 + semantiske tokens.
 */
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleDot,
  Minus,
  Sparkles,
} from "lucide-react";
import { MarketingFooter, MarketingNav } from "../_marketing-demo/chrome";

export default function AkgolfPriserDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav active="Priser" />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Priser
          </span>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Enkle priser, ingen{" "}
            <em className="font-normal italic text-primary [font-family:var(--font-instrument-serif),Georgia,serif]">
              overraskelser.
            </em>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
            Velg gratis-tilgangen for å komme i gang, eller PRO for full app, rabatter
            og forhåndsbooking. Betal månedlig eller årlig — du bestemmer.
          </p>
        </div>
      </section>

      {/* Tier-sammenligning */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <TierCard
            tag="Gratis"
            name="FREE"
            price="0 kr"
            unit="for alltid"
            description="Kom i gang uten kort. Book enkelt-økter, se priser, og prøv plattformen."
            features={[
              { label: "Booke enkelt-økter", on: true },
              { label: "Se egen statistikk", on: true },
              { label: "Forhåndsbooking 7 dager", on: false },
              { label: "30 % rabatt på simulator", on: false },
              { label: "Treningsplan i app", on: false },
              { label: "Coach-meldinger", on: false },
            ]}
            cta="Kom i gang"
          />
          <TierCard
            tag="Anbefalt"
            name="PRO månedlig"
            price="300 kr"
            unit="/ mnd"
            description="Full tilgang til alt — treningsplan, app, rabatter og prioritet. Avslutt når som helst."
            features={[
              { label: "Booke enkelt-økter", on: true },
              { label: "Se egen statistikk", on: true },
              { label: "Forhåndsbooking 14 dager", on: true },
              { label: "30 % rabatt på simulator", on: true },
              { label: "Treningsplan i app", on: true },
              { label: "Coach-meldinger", on: true },
            ]}
            cta="Velg PRO månedlig"
            featured
          />
          <TierCard
            tag="Spar 17 %"
            name="PRO årlig"
            price="3 000 kr"
            unit="/ år"
            description="Samme som PRO månedlig, men betal én gang og spar 600 kr. Best for de som vil committe seg."
            features={[
              { label: "Booke enkelt-økter", on: true },
              { label: "Se egen statistikk", on: true },
              { label: "Forhåndsbooking 14 dager", on: true },
              { label: "30 % rabatt på simulator", on: true },
              { label: "Treningsplan i app", on: true },
              { label: "Coach-meldinger", on: true },
              { label: "1 gratis 1:1-time / år", on: true },
            ]}
            cta="Velg PRO årlig"
            ribbon="600 kr spart"
          />
        </div>

        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          Alle priser inkluderer 25 % mva. Vi godtar kort, Vipps og faktura.
        </p>
      </section>

      {/* Tjenestepriser-tabell */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
              Tjenestepriser
            </div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Hva koster én økt?
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground md:text-[18px]">
              Alle priser er per økt eller per måned. PRO-medlemmer får 30 % rabatt
              på simulator-tid og 10 % på coaching.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-background">
            <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Tjeneste
                  </th>
                  <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Varighet
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    FREE
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    PRO
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <PriceRow
                  service="1:1 Coaching"
                  duration="60 min"
                  free="1 500 kr"
                  pro="1 350 kr"
                />
                <PriceRow
                  service="Trackman-simulator"
                  duration="60 min"
                  free="300 kr"
                  pro="210 kr"
                />
                <PriceRow
                  service="Greenfee GFGK Bossum"
                  duration="18 hull"
                  free="800 kr"
                  pro="560 kr"
                />
                <PriceRow
                  service="Gruppetrening"
                  duration="60 min"
                  free="450 kr"
                  pro="405 kr"
                />
                <PriceRow
                  service="Junior-akademi"
                  duration="1 mnd"
                  free="2 400 kr"
                  pro="2 160 kr"
                />
                <PriceRow
                  service="Bedriftsevent · 4 t"
                  duration="10–20 pers."
                  free="12 000 kr"
                  pro="—"
                  highlight
                />
                <PriceRow
                  service="Fysisk test"
                  duration="90 min"
                  free="950 kr"
                  pro="Inkludert"
                  highlight
                />
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Note title="Familie-rabatt" text="3+ familiemedlemmer i junior-program: 15 % rabatt på alle medlemskap." />
            <Note title="Bedriftsavtale" text="Egen pris og fakturering for bedrifter med 5+ ansatte." />
            <Note title="Pakker" text="Klippekort 10 timer: 10 % rabatt. Klippekort 20 timer: 18 % rabatt." />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
            Spørsmål om priser
          </div>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Vanlige spørsmål om priser
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <FaqItem
            q="Hva er forskjellen på FREE og PRO?"
            a="FREE er gratis og lar deg booke enkelt-økter. PRO gir 30 % rabatt på simulator, 10 % på coaching, forhåndsbooking 14 dager før, og full app-tilgang med treningsplan og coach-meldinger."
          />
          <FaqItem
            q="Lønner det seg å bytte til PRO årlig?"
            a="Hvis du bruker simulator mer enn 2 ganger i måneden eller har minst én coaching-time, ja. Du sparer typisk 1 500–4 000 kr i året med PRO på rabattene alene."
          />
          <FaqItem
            q="Kan jeg bytte fra månedlig til årlig senere?"
            a="Ja. Forskuddsbetalt månedlig refunderes proporsjonalt når du oppgraderer til årlig."
          />
          <FaqItem
            q="Får jeg refusjon hvis jeg sier opp PRO?"
            a="Månedlig: ingen refusjon for inneværende måned, men du beholder tilgang ut perioden. Årlig: refusjon for ubrukte måneder minus 10 % administrasjon."
          />
          <FaqItem
            q="Inkluderer prisene utstyr og baller?"
            a="Ja. Simulator-tid inkluderer alle baller. 1:1-coaching inkluderer leie-køller og baller hvis du ikke har eget."
          />
          <FaqItem
            q="Er det rabatt for juniorer?"
            a="Juniorer under 18 år får 20 % rabatt på simulator-tid utenom akademi-medlemskap. Akademiet er priset spesifikt for unge spillere."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-primary-foreground md:px-16 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full"
            style={{ background: "rgba(209,248,67,0.18)" }}
          />
          <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-[1.5fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em]">
                <Sparkles className="h-3 w-3" strokeWidth={2} />
                Anbefalt
              </span>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
                Prøv PRO i{" "}
                <em className="font-normal italic [font-family:var(--font-instrument-serif),Georgia,serif]">
                  14 dager
                </em>{" "}
                gratis
              </h2>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.6] opacity-90 md:text-[18px]">
                Ingen kort, ingen binding. Få full app, treningsplan og rabatter
                i to uker — så bestemmer du.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Start gratis PRO-prøve
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                href="/akgolf-kontakt-demo"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-[15px] font-semibold transition-colors hover:bg-white/10"
              >
                Spør en coach
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function TierCard({
  tag,
  name,
  price,
  unit,
  description,
  features,
  cta,
  featured = false,
  ribbon,
}: {
  tag: string;
  name: string;
  price: string;
  unit: string;
  description: string;
  features: { label: string; on: boolean }[];
  cta: string;
  featured?: boolean;
  ribbon?: string;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-8 ${
        featured
          ? "border-primary bg-card shadow-md md:scale-[1.02]"
          : "border-border bg-card"
      }`}
    >
      {ribbon && (
        <span className="absolute -top-3 right-8 inline-flex items-center rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
          {ribbon}
        </span>
      )}
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {tag}
      </span>
      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {name}
      </h3>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-5xl font-semibold tabular-nums tracking-tight">
          {price}
        </span>
        <span className="text-[14px] text-muted-foreground">{unit}</span>
      </div>
      <p className="mt-4 text-[14px] leading-[1.6] text-muted-foreground">
        {description}
      </p>

      <ul className="mt-8 space-y-3 border-t border-border pt-6">
        {features.map((f) => (
          <li
            key={f.label}
            className={`flex items-start gap-3 text-[14px] ${
              f.on ? "text-foreground" : "text-muted-foreground line-through"
            }`}
          >
            {f.on ? (
              <Check
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
                strokeWidth={2}
              />
            ) : (
              <Minus
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"
                strokeWidth={2}
              />
            )}
            {f.label}
          </li>
        ))}
      </ul>

      <Link
        href="#"
        className={`mt-10 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-opacity ${
          featured
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border border-border bg-background text-foreground hover:bg-secondary"
        }`}
      >
        {cta}
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </article>
  );
}

function PriceRow({
  service,
  duration,
  free,
  pro,
  highlight = false,
}: {
  service: string;
  duration: string;
  free: string;
  pro: string;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-accent/10" : undefined}>
      <td className="px-6 py-4 font-semibold text-foreground">{service}</td>
      <td className="px-6 py-4 text-muted-foreground">{duration}</td>
      <td className="px-6 py-4 text-right font-mono tabular-nums text-foreground">
        {free}
      </td>
      <td className="px-6 py-4 text-right font-mono tabular-nums font-semibold text-primary">
        {pro}
      </td>
    </tr>
  );
}

function Note({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <h4 className="font-display text-lg font-semibold tracking-tight">
        {title}
      </h4>
      <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          {q}
        </span>
        <ChevronDown
          className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          strokeWidth={1.5}
        />
      </summary>
      <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
        {a}
      </p>
    </details>
  );
}
