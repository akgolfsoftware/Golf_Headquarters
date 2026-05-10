import Link from "next/link";

const SEKSJONER = [
  {
    eyebrow: "Hjem",
    tittel: "Dashboard som faktisk hjelper",
    tekst:
      "Dagens fokus i toppen, KPI-er du faktisk bruker (HCP, SG, streak, pyramide-uke), og en aktivitets-feed som holder deg oppdatert.",
    bullets: [
      "DashHero med personlig hilsen",
      "4 KPI-cards med tabular-nums",
      "«Dagens fokus»-card med Start-økt-knapp",
      "Pyramide-bar over siste 14 dager",
      "Streak-bars siste 14 dager",
      "SG-fordeling som mini-bars",
      "Sist registrert-feed",
      "Coach-melding-card",
    ],
  },
  {
    eyebrow: "Tren",
    tittel: "Plan, kalender, øvelser, tester",
    tekst:
      "Din komplette treningsmodul. Uke-stripe med 7 dag-kort, månedskalender med aktivitetsprikker, øvelsesbibliotek med filter, og tester med historikk-graf.",
    bullets: [
      "Uke-stripe med pyramide-prikker per dag",
      "Sesjon-detalj med drills, CS-target, L-fase",
      "Månedskalender på tvers av trening, runder, tester",
      "Øvelsesbibliotek med filter på område + L-fase",
      "Test-bibliotek med scoring-regel og siste resultat",
      "Test-detalj med SVG linje-graf",
    ],
  },
  {
    eyebrow: "Live Session",
    tittel: "Tapper-mode for hver økt",
    tekst:
      "Fullscreen-flyt på iPad eller mobil. CS-rating per drill, vurdering på slutten, automatisk logging i bakgrunnen.",
    bullets: [
      "4-fase tapper: intro → aktiv → drill-done → summary",
      "Tastatur-snarvei (mellomrom = start)",
      "Slider 0–100 for CS",
      "1–5 stjerne-vurdering på slutt",
      "Sluttnotat lagres i TrainingPlanSessionLog",
      "Status oppdaterer seg automatisk på Tren/Plan",
    ],
  },
  {
    eyebrow: "Mål",
    tittel: "SG-tracking + leaderboard",
    tekst:
      "Registrer runder med eller uten SG-data, importer TrackMan via CSV, sett personlige mål, og sammenlign deg med andre Pro-spillere.",
    bullets: [
      "SG-spider på 30-dagers snitt",
      "Runder med per-bane-statistikk",
      "TrackMan CSV-import + dispersion-plot",
      "Personlige mål (HCP, runder/mnd, SG-mål, fritekst)",
      "Mål-detalj med fremgangs-bar",
      "Pro leaderboard med 30-dagers SG-rangering",
    ],
  },
  {
    eyebrow: "Coach",
    tittel: "AI 24/7 + direkte coach",
    tekst:
      "Pro-medlemmer får AI-coach som kjenner profilen din, samt direkte kontakt med tilknyttet menneskelig coach.",
    bullets: [
      "AI-coach med Claude Sonnet 4.6",
      "System-prompt inkluderer HCP, ambisjon, siste runder, aktiv plan",
      "Streaming-respons (du ser AI-en tenke)",
      "Direkte coach-meldinger lagres som tråd",
      "Coach-laget treningsplaner",
      "Coach-notater på spilleren",
    ],
  },
  {
    eyebrow: "Agent-pipeline",
    tittel: "Plan justerer seg selv",
    tekst:
      "Mandag morgen analyserer plan-watcher forrige uke. Hvis pyramiden er ute av balanse, får du forslag du kan godkjenne eller avvise.",
    bullets: [
      "5 agenter: round, test, trackman, plan-watcher, periodisering",
      "Achievement-agent låser opp milepæler (STREAK_7, FIRST_ROUND, etc.)",
      "PlanActions med Godkjenn/Avvis på hjem-dashboard",
      "Audit-log over alle agent-kjøringer",
      "Cron mandag 06:00 (Vercel)",
    ],
  },
];

export default function Funksjoner() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Funksjoner
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">Komplett</em> golf-plattform
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Fra første runde til Pro-tour-prep — bygget for golfere på alle
            nivåer. Her er hva som er inkludert.
          </p>
        </header>

        <div className="mt-16 space-y-16">
          {SEKSJONER.map((s) => (
            <section
              key={s.tittel}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                {s.eyebrow}
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                {s.tittel}
              </h2>
              <p className="mt-4 text-base text-muted-foreground">{s.tekst}</p>
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-primary/5 p-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            <em className="font-normal text-primary md:italic">Prøv alt</em> gratis i 14 dager
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Pro-funksjoner med full AI-coach, Live Session og direkte coach. Ingen kredittkort.
          </p>
          <Link
            href="/auth/signup"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground"
          >
            Start prøveperioden →
          </Link>
        </div>
      </div>
    </div>
  );
}
