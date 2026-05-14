import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Ofte stilte spørsmål — AK Golf Academy",
  description:
    "Svar på de vanligste spørsmålene om coaching, booking, PlayerHQ og praktisk informasjon.",
};

type Sporsmal = {
  q: string;
  a: string;
};

const FAQ: { kategori: string; punkter: Sporsmal[] }[] = [
  {
    kategori: "Coaching",
    punkter: [
      {
        q: "Hva er forskjellen på en vanlig time og et coachingforløp?",
        a: "En vanlig time er én økt på 50 minutter. Et coachingforløp er et personlig opplegg med treningsplan, oppfølging mellom timer, og tilgang til PlayerHQ. Forløp er bygd for spillere som vil ha målbar fremgang over tid.",
      },
      {
        q: "Hvem passer Academy for?",
        a: "Spillere som er klare for tett oppfølging — typisk fra HCP 36 og oppover. Vi tar imot juniorer, voksne mosjonister og turneringsspillere. Felles for alle er at de vil ha struktur og fremgang.",
      },
      {
        q: "Hvor mange timer trenger jeg?",
        a: "De fleste begynner med 4–8 timer over en sesong. Vi tilpasser frekvens etter mål, tilgjengelig tid og treningsvilje. Pro-abonnementet inkluderer 4 credits per måned.",
      },
    ],
  },
  {
    kategori: "Booking",
    punkter: [
      {
        q: "Hvordan booker jeg time?",
        a: "Via /booking eller direkte fra PlayerHQ-profilen din. Du velger coach, tjeneste, dato og tid. Bekreftelse kommer på e-post umiddelbart.",
      },
      {
        q: "Kan jeg avbestille?",
        a: "Ja. Avbestilling senest 24 timer før oppmøte gir full refusjon eller credit-tilbakeføring. Senere avbestilling kan flyttes etter avtale, men refunderes ikke.",
      },
      {
        q: "Betaler jeg per time eller med abonnement?",
        a: "Begge deler er mulig. Enkelttimer betales via Stripe ved booking. Pro-abonnement (kr 300/mnd) gir 4 credits som kan brukes som du vil.",
      },
    ],
  },
  {
    kategori: "PlayerHQ",
    punkter: [
      {
        q: "Hva er PlayerHQ?",
        a: "Din digitale spillerportal. Her finner du treningsplaner, runder, tester, AI-coach og fremdriftsdata. Gratis å bruke på basisnivå, Pro gir full tilgang.",
      },
      {
        q: "Trenger jeg å være kunde for å bruke PlayerHQ?",
        a: "Nei. Du kan opprette en gratis konto og bruke verktøyene uten å være Academy-kunde. Coaching låses opp når du booker første time.",
      },
    ],
  },
  {
    kategori: "Praktisk",
    punkter: [
      {
        q: "Hvor er dere lokalisert?",
        a: "Vi holder til på Gamle Fredrikstad Golfklubb (Bossumveien 6) og Mulligan Indoor Golf Simulators i Fredrikstad sentrum. Begge anlegg er fullt utstyrt for coaching året rundt.",
      },
      {
        q: "Hva med utstyr — må jeg ha eget?",
        a: "Vi har leieutstyr tilgjengelig for nybegynnere. For coachingforløp anbefaler vi at du etter hvert investerer i tilpassede køller — vi hjelper deg med valget når tiden er moden.",
      },
    ],
  },
];

export default function FaqSide() {
  return (
    <div>
      <section className="bg-gradient-to-b from-background to-secondary/40 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            FAQ
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Ofte{" "}
            <em className="font-normal italic text-primary">stilte</em>{" "}
            spørsmål
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Korte, ærlige svar på det folk lurer på før de starter hos oss.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-12">
          {FAQ.map((kat) => (
            <div key={kat.kategori}>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                {kat.kategori}
              </h2>
              <div className="mt-4 space-y-4">
                {kat.punkter.map((p) => (
                  <details
                    key={p.q}
                    className="group rounded-2xl border border-border bg-card p-6"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold tracking-tight">
                      <span>{p.q}</span>
                      <ChevronDown
                        className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                      {p.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-secondary/40 p-12 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Fant du ikke svar?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Skriv til oss — vi svarer som regel samme dag.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:post@akgolf.no"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              post@akgolf.no
            </a>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-6 py-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              Kontaktskjema
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
