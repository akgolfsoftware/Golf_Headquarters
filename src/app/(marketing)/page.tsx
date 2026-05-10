import Link from "next/link";

const FEATURES = [
  {
    label: "AI-coach",
    tittel: "24/7 personlig analyse",
    tekst:
      "Claude kjenner HCP, ambisjon og siste runder. Spør hva du vil — få konkrete råd basert på dataene dine.",
  },
  {
    label: "Treningsplan",
    tittel: "Pyramidesystemet i praksis",
    tekst:
      "FYS, TEK, SLAG, SPILL, TURN. Coachen din eller AI-en bygger en plan som balanserer alle fem områder.",
  },
  {
    label: "SG-tracking",
    tittel: "Strokes Gained, ferdig regnet",
    tekst:
      "Registrer runden, se OTT/APP/ARG/PUTT-fordeling i sanntid. Spider-chart viser sterke og svake områder.",
  },
  {
    label: "Live Session",
    tittel: "Tapper-mode for hver økt",
    tekst:
      "Fullscreen-flyt på iPad eller mobil. CS-rating per drill, vurdering på slutten, automatisk logging.",
  },
  {
    label: "Agent-forslag",
    tittel: "Plan justerer seg selv",
    tekst:
      "Mandag morgen får du forslag basert på forrige uke. Godkjenn eller avvis — planen oppdateres automatisk.",
  },
  {
    label: "Coach + booking",
    tittel: "Direkte kontakt med proffen",
    tekst:
      "Pro-medlemmer kan booke timer, sende meldinger og få coach-laget plan. Alt i samme app.",
  },
];

export default function Hjem() {
  return (
    <div>
      <section className="bg-gradient-to-b from-background to-secondary/40 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            AK Golf-plattformen
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            <em className="font-normal text-primary md:italic">Coaching</em>, plan og fremgang
            <br />
            i én app.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Personlig AI-coach, periodiserte treningsplaner, SG-tracking og
            booking — bygget for golfere som vil bli bedre raskere.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Prøv gratis
            </Link>
            <Link
              href="/funksjoner"
              className="rounded-md border border-input bg-card px-6 py-3 text-base font-medium text-foreground hover:border-border"
            >
              Se hva som er inkludert →
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Ingen kredittkort. Pro koster 300 kr/mnd om du oppgraderer.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-card px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Funksjoner
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              <em className="font-normal text-primary md:italic">Alt</em> du trenger
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.label}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                  {f.label}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold leading-tight">
                  {f.tittel}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.tekst}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Pyramide-systemet
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Fem områder. <em className="font-normal text-primary md:italic">Én balansert plan.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            AK Golf-pyramiden er kjernen i hver eneste plan. Vi sørger for at
            tiden din fordeles riktig mellom fysikk, teknikk, slag, spill og
            turneringserfaring.
          </p>

          <div className="mt-10 space-y-2 text-left">
            {[
              { kort: "FYS", lang: "Fysisk — kjernemuskulatur, balanse, mobilitet", w: 100 },
              { kort: "TEK", lang: "Teknisk — sving, grep, impact-posisjon", w: 82 },
              { kort: "SLAG", lang: "Slag — pitch, putt, korthold, bunker", w: 64 },
              { kort: "SPILL", lang: "Spill — banetilpasning, beslutninger", w: 46 },
              { kort: "TURN", lang: "Turnering — press, pre-shot rutine, match-play", w: 28 },
            ].map((p) => (
              <div
                key={p.kort}
                className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3"
              >
                <span className="w-12 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                  {p.kort}
                </span>
                <span className="flex-1 text-sm text-foreground">{p.lang}</span>
                <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-border sm:block">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${p.w}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary/5 px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            <em className="font-normal text-primary md:italic">Klar</em> for første økt?
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Lag konto på 30 sekunder. Du får full tilgang til Hjem, Mål og Tren
            med en gang. Oppgrader til Pro når du er klar.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground"
          >
            Kom i gang →
          </Link>
        </div>
      </section>
    </div>
  );
}
