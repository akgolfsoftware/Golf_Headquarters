import Link from "next/link";

const FORDELER = [
  {
    tittel: "Hele klubben i én plattform",
    tekst:
      "Booking, treningsplaner, AI-coaching og SG-tracking for alle medlemmer. Egne fasiliteter, lokasjoner og tjenester per klubb.",
  },
  {
    tittel: "Coach-team-administrasjon",
    tekst:
      "Tildel coacher til spillere, administrer tilgjengelighet, og se aggregert statistikk på tvers av klubbens medlemmer.",
  },
  {
    tittel: "Egen branding",
    tickst:
      "Custom domene (din-klubb.no), egne farger, logo i e-postmaler — alt under klubbens identitet.",
    tekst:
      "Custom domene (din-klubb.no), egne farger, logo i e-postmaler — alt under klubbens identitet.",
  },
  {
    tittel: "Revenue-share",
    tekst:
      "Klubben betaler en flat månedskostnad. Spiller-abonnementer går direkte til klubbens Stripe-konto.",
  },
];

export default function ForKlubber() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            For klubber
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">AK Golf</em> som plattform for din klubb
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            White-label-versjon av plattformen. Din klubb får sitt eget domene,
            sin egen branding og sine egne abonnement-priser.
          </p>
        </header>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FORDELER.map((f) => (
            <article
              key={f.tittel}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="font-display text-xl font-semibold leading-tight">
                {f.tittel}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">{f.tekst}</p>
            </article>
          ))}
        </div>

        <section className="mt-16 rounded-2xl bg-primary/5 p-10">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              <em className="font-normal text-primary md:italic">Pris</em> & oppstart
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Plattformkostnad fra 5 000 kr/mnd. Inkluderer egen klubb-instans,
              support og revenue-share-oppsett.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Step n={1} tittel="Demo-samtale">
              30 minutter — vi viser plattformen og svarer på spørsmål.
            </Step>
            <Step n={2} tittel="Onboarding">
              Vi setter opp klubb-instansen, custom domene, og branding sammen.
            </Step>
            <Step n={3} tittel="Trening + lansering">
              Coachene dine får opplæring. Spillerne inviteres når dere er klare.
            </Step>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/book-demo"
              className="inline-block rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground"
            >
              Book demo →
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              Ingen forpliktelser. Vi viser plattformen og du bestemmer.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Step({
  n,
  tittel,
  children,
}: {
  n: number;
  tittel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-display text-base font-semibold text-primary-foreground">
        {n}
      </span>
      <div>
        <h3 className="font-display text-base font-semibold">{tittel}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
