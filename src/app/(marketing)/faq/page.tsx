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
        a: "Vi holder til på Mulligan Indoor Golf i Fredrikstad (Produksjonsveien 21) og Sarpsborg (Bjørnstadveien 12), samt Gamle Fredrikstad Golfklubb (Torsnesveien 16) fra mai til oktober. Alle anlegg er fullt utstyrt for coaching.",
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
    <div className="bg-background text-foreground">
      {/* ========== HERO ========== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 md:px-8 md:pt-24">
          <SectionEyebrow>FAQ · Før du starter</SectionEyebrow>
          <h1 className="mt-4 max-w-[16ch] text-balance font-display text-[clamp(44px,6vw,80px)] font-semibold leading-[0.98] tracking-[-0.03em]">
            Ofte <Em>stilte</Em> spørsmål.
          </h1>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.55] text-muted-foreground">
            Korte, ærlige svar på det folk lurer på før de starter hos oss.
          </p>
        </div>
      </section>

      {/* ========== SPØRSMÅL · set-group + accordion ========== */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-8">
        <div className="max-w-[680px] space-y-10">
          {FAQ.map((kat) => (
            <div key={kat.kategori}>
              <SectionEyebrow>{kat.kategori}</SectionEyebrow>
              <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
                {kat.punkter.map((p) => (
                  <details
                    key={p.q}
                    name={`faq-${kat.kategori.toLowerCase()}`}
                    className="group border-b border-border last:border-b-0"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-[15px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-[18px] [&::-webkit-details-marker]:hidden">
                      <span className="flex-1 text-[14.5px] font-semibold tracking-[-0.005em] text-foreground">
                        {p.q}
                      </span>
                      <ChevronDown
                        className="h-[18px] w-[18px] shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="-mt-[5px] px-4 pb-[15px] text-[13.5px] leading-[1.55] text-muted-foreground sm:px-[18px]">
                      {p.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
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
            Fortsatt usikker?
          </span>
          <h2 className="relative z-10 mx-auto mt-4 max-w-[20ch] text-balance font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Fant du ikke <Em dark>svar</Em>?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-white/85">
            Skriv til oss — vi svarer som regel samme dag.
          </p>
          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:post@akgolf.no"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Mail className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
              post@akgolf.no
            </a>
            <Link
              href="/kontakt"
              className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-xl px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-secondary ring-1 ring-inset ring-secondary/45 transition hover:bg-secondary/10 hover:ring-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Kontaktskjema
            </Link>
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
