import Link from "next/link";

const STEG = [
  {
    n: 1,
    tittel: "Lag konto på 30 sekunder",
    tekst:
      "Du velger Gratis eller Pro. Onboarding tar 4 steg — kontaktinfo, HCP, ambisjon, hjemmeklubb.",
    ramme: "Prøv gratis først. Du kan oppgradere til Pro når som helst.",
  },
  {
    n: 2,
    tittel: "Få første treningsplan",
    tekst:
      "Bruk «Ny økt»-wizard for å bygge din første økt, eller bli tildelt plan av en coach. Periodiseringsagenten foreslår automatisk uke-allokering.",
    ramme: "Plan-bygging tar 5 minutter. Du kan dupliser og justere når som helst.",
  },
  {
    n: 3,
    tittel: "Start Live Session",
    tekst:
      "Klikk «Start økt» fra hjem-dashboardet — fullscreen tapper-mode tar deg gjennom drill-for-drill. CS-rating per drill, vurdering på slutten.",
    ramme: "Krever Pro for ad-hoc-økter. Planlagte økter er åpne for alle.",
  },
  {
    n: 4,
    tittel: "Registrer runder + se SG",
    tekst:
      "Etter hver runde — registrer skår og valgfri SG-data. Etter 5 runder ser du SG-spider med trendene dine.",
    ramme: "Round-agent kjører automatisk og oppdaterer SG_TOTAL-signalet.",
  },
  {
    n: 5,
    tittel: "Spør AI-coach",
    tekst:
      "Pro-medlemmer får 24/7 AI-coach (Claude Sonnet). Den kjenner profilen din og kan analysere runder, foreslå drills, og motivere.",
    ramme: "10 meldinger per minutt — i praksis ubegrenset.",
  },
  {
    n: 6,
    tittel: "Få plan-forslag automatisk",
    tekst:
      "Mandag morgen sjekker plan-watcher forrige uke. Hvis pyramiden er ute av balanse får du PYRAMID_ADJUST-forslag du kan godkjenne med ett klikk.",
    ramme: "Du har full kontroll. Forslag er forslag — ikke automatiske endringer.",
  },
];

export const metadata = {
  title: "Slik fungerer plattformen — AK Golf",
  description: "6 steg fra signup til full AI-drevet treningsflyt.",
};

export default function Forsta() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Slik fungerer det
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">Fra signup</em>
            <br />
            til AI-drevet trening
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            6 steg på rundt 10 minutter. Etter det går alt på autopilot — du
            trener, vi sporer, AI-en gir innsikt.
          </p>
        </header>

        <ol className="mt-16 space-y-6">
          {STEG.map((s) => (
            <li
              key={s.n}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
                {s.n}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-semibold leading-tight">
                  {s.tittel}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{s.tekst}</p>
                <p className="mt-3 rounded-md border-l-2 border-primary bg-primary/5 px-3 py-2 text-xs text-foreground">
                  <span className="font-mono uppercase tracking-[0.10em] text-primary">
                    Tips:{" "}
                  </span>
                  {s.ramme}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 rounded-2xl bg-primary/5 p-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            <em className="font-normal text-primary md:italic">Klar</em>?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Lag konto gratis. Steg 1 tar 30 sekunder.
          </p>
          <Link
            href="/auth/signup"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground"
          >
            Start →
          </Link>
        </div>
      </div>
    </div>
  );
}
