import Link from "next/link";

const PLANER = [
  {
    navn: "Gratis",
    pris: "0 kr",
    periode: "Ingen kostnad",
    beskrivelse: "Alt du trenger for å komme i gang.",
    funksjoner: [
      "Hjem-dashboard med KPI-er",
      "Treningsplan-visning",
      "Øvelses- og test-bibliotek",
      "Registrere runder + SG-spider",
      "Personlige mål",
      "Streak + achievements",
      "Mobile-app (iOS + Android — kommer)",
    ],
    cta: "Start gratis",
    ctaHref: "/auth/signup",
    sekundær: false,
  },
  {
    navn: "Pro",
    pris: "300 kr",
    periode: "per måned",
    beskrivelse: "Hele plattformen — for golfere som vil bli bedre.",
    funksjoner: [
      "Alt i Gratis",
      "Live Session tapper-mode",
      "Egendefinerte økter (Ny økt-wizard)",
      "AI-coach med Claude (24/7)",
      "Direkte coach-meldinger",
      "Coach-laget treningsplaner",
      "TrackMan CSV-import",
      "Pro leaderboard",
      "Agent-pipeline (PlanActions)",
      "Sesjon-opptak med transkripsjon (kommer)",
    ],
    cta: "Oppgrader til Pro",
    ctaHref: "/auth/signup",
    sekundær: true,
  },
];

export default function Priser() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Priser
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">Enkelt</em> & forutsigbart
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            To planer. Ingen overraskelser. Avbryt når du vil.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {PLANER.map((p) => (
            <article
              key={p.navn}
              className={`flex flex-col rounded-2xl border p-8 ${
                p.sekundær
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-card"
              }`}
            >
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {p.navn}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.beskrivelse}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold tabular-nums">
                  {p.pris}
                </span>
                <span className="text-sm text-muted-foreground">{p.periode}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-2.5">
                {p.funksjoner.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={p.ctaHref}
                className={`mt-8 rounded-md px-5 py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
                  p.sekundær
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-card text-foreground"
                }`}
              >
                {p.cta}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-card p-8">
          <h3 className="font-display text-xl font-semibold tracking-tight">
            Spørsmål?
          </h3>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-foreground">Kan jeg bytte plan senere?</dt>
              <dd className="mt-1 text-muted-foreground">
                Ja. Du kan oppgradere eller nedgradere når du vil. Endringer
                gjelder fra neste fakturadato.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Hvordan kansellerer jeg?</dt>
              <dd className="mt-1 text-muted-foreground">
                Inne i appen — Meg → Abonnement → Administrer. Du beholder
                Pro-tilgang ut perioden du allerede har betalt for.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Får jeg refusjon?</dt>
              <dd className="mt-1 text-muted-foreground">
                Innen 14 dager fra første betaling, ja — full refusjon. Etter
                det refunderer vi pro rata for ubrukt tid hvis du har en god grunn.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Min klubb vil bruke AK Golf — er det mulig?</dt>
              <dd className="mt-1 text-muted-foreground">
                Ja, vi tilbyr klubb-pakker.{" "}
                <Link href="/for-klubber" className="text-primary hover:underline">
                  Les mer for klubber →
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
