import Image from "next/image";
import Link from "next/link";

const TILBUD = [
  {
    label: "Performance",
    tittel: "2 økter per måned",
    pris: "1 200 kr/mnd",
    tekst:
      "To 20-minutters treningsøkter med Anders hver måned. PlayerHQ inkludert. Perfekt for jevn oppfølging.",
    href: "/coaching",
  },
  {
    label: "Performance Pro",
    tittel: "4 økter per måned",
    pris: "2 220 kr/mnd",
    tekst:
      "Fire 20-minutters økter per måned. PlayerHQ inkludert. For spillere med høye mål — klubb, elite, turnering.",
    href: "/coaching",
  },
  {
    label: "Drop-in",
    tittel: "Enkelttimer",
    pris: "Fra 500 kr",
    tekst:
      "Ikke klar for abonnement? Book en enkelttime når det passer deg.",
    href: "/booking",
  },
];

const PYRAMIDE = [
  { kort: "FYS", lang: "Fysisk — kjernemuskulatur, balanse, mobilitet", w: 100 },
  { kort: "TEK", lang: "Teknisk — sving, grep, impact-posisjon", w: 82 },
  { kort: "SLAG", lang: "Slag — pitch, putt, korthold, bunker", w: 64 },
  { kort: "SPILL", lang: "Spill — banetilpasning, beslutninger", w: 46 },
  { kort: "TURN", lang: "Turnering — press, pre-shot rutine, match-play", w: 28 },
];

export default function Hjem() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/40 px-6 py-20 sm:py-28">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            AK Golf Academy
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            <em className="font-normal text-primary md:italic">Personlig</em> golf-coaching
            <br />
            som gir fremgang.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Strukturert trening med Anders Kristiansen. Du får en plan basert på
            målene dine, data fra hver økt, og en coach som kjenner spillet
            ditt.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/booking"
              className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Book time
            </Link>
            <Link
              href="/coaching"
              className="rounded-md border border-input bg-card px-6 py-3 text-base font-medium text-foreground hover:border-border"
            >
              Se coaching-pakker →
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Performance fra 1 200 kr/mnd · PlayerHQ inkludert for alle Academy-kunder
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-card px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Tjenester
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              <em className="font-normal text-primary md:italic">Hva</em> tilbyr vi
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TILBUD.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className="group rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/40"
              >
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                  {t.label}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold leading-tight">
                  {t.tittel}
                </h3>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
                  {t.pris}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{t.tekst}</p>
                <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
                  Les mer →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Slik trener vi
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Fem områder. <em className="font-normal text-primary md:italic">Én balansert plan.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            AK Golf-pyramiden er kjernen i hvordan vi jobber. Vi sørger for at
            tiden din fordeles riktig mellom fysikk, teknikk, slag, spill og
            turneringserfaring.
          </p>

          <div className="mt-10 space-y-2 text-left">
            {PYRAMIDE.map((p) => (
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

          <div className="mt-10">
            <Link
              href="/treningsfilosofi"
              className="text-sm font-medium text-primary hover:underline"
            >
              Les mer om treningsfilosofien →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary-foreground">
                Inkludert
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                BETA
              </span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight">
              PlayerHQ —{" "}
              <em className="font-normal text-primary md:italic">
                spillerportalen
              </em>{" "}
              du får på kjøpet
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Treningsplaner, statistikk, runde-registrering og AI-coach i én
              app. Gratis for alle Academy-kunder. Ikke-kunder kan prøve gratis
              i beta-perioden — første betaling 1. juni 2026.
            </p>
            <Link
              href="/playerhq"
              className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
            >
              Se hva PlayerHQ inneholder →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary/5 px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            <em className="font-normal text-primary md:italic">Klar</em> for første økt?
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Book en time, eller velg en av coaching-pakkene våre. Ingen
            bindingstid — du kan avslutte når du vil.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/booking"
              className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground"
            >
              Book time
            </Link>
            <Link
              href="/coaching"
              className="rounded-md border border-input bg-card px-6 py-3 text-base font-medium text-foreground hover:border-border"
            >
              Se pakker →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
